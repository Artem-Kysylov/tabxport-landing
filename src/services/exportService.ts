import * as XLSX from 'xlsx';
import { Document, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableData, ExportFormat, ExportResult } from '@/types/table';

let notoSansRegularBase64: string | null = null;
let notoSansBoldBase64: string | null = null;

async function fetchArrayBufferAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function ensureNotoSansFontsLoaded(): Promise<void> {
  if (!notoSansRegularBase64) {
    try {
      notoSansRegularBase64 = await fetchArrayBufferAsBase64('/fonts/NotoSans-Regular.ttf');
    } catch {
      notoSansRegularBase64 = null;
    }
  }

  if (!notoSansBoldBase64) {
    try {
      notoSansBoldBase64 = await fetchArrayBufferAsBase64('/fonts/NotoSans-Bold.ttf');
    } catch {
      notoSansBoldBase64 = null;
    }
  }
}

/**
 * Экспортирует таблицу в Excel формат
 */
function exportToExcel(data: TableData): Blob {
  const worksheet = XLSX.utils.aoa_to_sheet([
    data.headers,
    ...data.rows,
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Экспортирует таблицу в CSV формат
 */
function exportToCSV(data: TableData): Blob {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.join(',')),
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Экспортирует таблицу в Docx формат
 */
async function exportToDocx(data: TableData): Promise<Blob> {
  const tableRows = [
    new TableRow({
      children: data.headers.map(
        header =>
          new TableCell({
            children: [new Paragraph({ text: header })],
            width: { size: 100 / data.headers.length, type: WidthType.PERCENTAGE },
          })
      ),
    }),
    ...data.rows.map(
      row =>
        new TableRow({
          children: row.map(
            cell =>
              new TableCell({
                children: [new Paragraph({ text: cell })],
                width: { size: 100 / data.headers.length, type: WidthType.PERCENTAGE },
              })
          ),
        })
    ),
  ];

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [
      {
        children: [table],
      },
    ],
  });

  const { Packer } = await import('docx');
  const buffer = await Packer.toBlob(doc);
  return buffer;
}

/**
 * Экспортирует таблицу в PDF формат с поддержкой кириллицы
 */
async function exportToPDF(data: TableData): Promise<Blob> {
  const doc = new jsPDF();

  // IMPORTANT: jsPDF built-in fonts don't support Cyrillic.
  // We load and embed Noto Sans from /public/fonts to ensure Cyrillic renders correctly.
  await ensureNotoSansFontsLoaded();

  const containsCyrillic = /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/.test(
    [data.headers.join(' '), ...data.rows.map((r) => r.join(' '))].join(' ')
  );

  if (containsCyrillic && !notoSansRegularBase64) {
    throw new Error(
      'PDF export with Cyrillic requires a Unicode font. Add public/fonts/NotoSans-Regular.ttf (and optionally NotoSans-Bold.ttf).'
    );
  }

  if (notoSansRegularBase64) {
    doc.addFileToVFS('NotoSans-Regular.ttf', notoSansRegularBase64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  }

  if (notoSansBoldBase64) {
    doc.addFileToVFS('NotoSans-Bold.ttf', notoSansBoldBase64);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  }

  const fontName = notoSansRegularBase64 ? 'NotoSans' : 'helvetica';
  doc.setFont(fontName, 'normal');

  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    styles: {
      font: fontName,
      fontStyle: 'normal',
    },
    headStyles: {
      fillColor: [27, 147, 88],
      textColor: [255, 255, 255],
      font: fontName,
      fontStyle: notoSansBoldBase64 ? 'bold' : 'normal',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  return doc.output('blob');
}

/**
 * Экспортирует таблицу в JSON формат (Array of Objects)
 */
function exportToJSON(data: TableData): Blob {
  const jsonData = data.rows.map(row => {
    const obj: Record<string, string> = {};
    data.headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  const jsonString = JSON.stringify(jsonData, null, 2);
  return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
}

/**
 * Экспортирует таблицу в Markdown формат
 */
function exportToMarkdown(data: TableData): Blob {
  const headerRow = `| ${data.headers.join(' | ')} |`;
  const separatorRow = `| ${data.headers.map(() => '---').join(' | ')} |`;
  const dataRows = data.rows.map(row => `| ${row.join(' | ')} |`);

  const markdown = [headerRow, separatorRow, ...dataRows].join('\n');
  return new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
}

/**
 * Экспортирует таблицу в SQL формат (INSERT INTO)
 */
function exportToSQL(data: TableData): Blob {
  const tableName = 'exported_table';
  const columns = data.headers.join(', ');
  
  const insertStatements = data.rows.map(row => {
    const values = row.map(cell => {
      // Экранируем одинарные кавычки и оборачиваем значения
      const escaped = cell.replace(/'/g, "''");
      return `'${escaped}'`;
    }).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
  });

  const sql = [
    `-- Table: ${tableName}`,
    `-- Generated: ${new Date().toISOString()}`,
    '',
    ...insertStatements,
  ].join('\n');

  return new Blob([sql], { type: 'text/plain;charset=utf-8;' });
}

/**
 * Основная функция экспорта таблицы
 */
export async function exportTable(
  data: TableData,
  format: ExportFormat
): Promise<ExportResult> {
  try {
    let blob: Blob;

    switch (format) {
      case 'xlsx':
        blob = exportToExcel(data);
        break;
      case 'csv':
        blob = exportToCSV(data);
        break;
      case 'docx':
        blob = await exportToDocx(data);
        break;
      case 'pdf':
        blob = await exportToPDF(data);
        break;
      case 'json':
        blob = exportToJSON(data);
        break;
      case 'md':
        blob = exportToMarkdown(data);
        break;
      case 'sql':
        blob = exportToSQL(data);
        break;
      default:
        return {
          success: false,
          error: `Unsupported format: ${format}`,
        };
    }

    return {
      success: true,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Скачивает blob как файл
 */
export function downloadBlob(blob: Blob, filename: string, format: ExportFormat): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
