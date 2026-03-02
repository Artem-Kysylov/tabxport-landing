import * as XLSX from 'xlsx';
import { Document, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableData, ExportFormat, ExportResult } from '@/types/table';

export interface ExportTableOptions {
  autoSum?: boolean;
}

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
function extractNumericValue(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed.toLowerCase() === 'n/a') {
    return null;
  }

  const cleaned = trimmed
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ')
    .replace(/[\s]/g, '')
    .replace(/[$€£¥₽₴]/g, '')
    .replace(/(USD|EUR|GBP|UAH|RUB)$/i, '');

  const withoutPercent = cleaned.endsWith('%') ? cleaned.slice(0, -1) : cleaned;

  const lastComma = withoutPercent.lastIndexOf(',');
  const lastDot = withoutPercent.lastIndexOf('.');

  let normalized = withoutPercent;

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = withoutPercent.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = withoutPercent.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    normalized = /,\d{1,2}$/.test(withoutPercent)
      ? withoutPercent.replace(',', '.')
      : withoutPercent.replace(/,/g, '');
  }

  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
}

function getNumericColumnIndices(data: TableData): number[] {
  const colCount = data.headers.length;
  const numericCols: number[] = [];

  for (let c = 0; c < colCount; c++) {
    const values = data.rows.map((r) => r[c] ?? '');
    const nonEmpty = values.filter((v) => v.trim() !== '');

    if (nonEmpty.length === 0) continue;

    const numericCount = nonEmpty.reduce((acc, v) => (extractNumericValue(v) === null ? acc : acc + 1), 0);
    if (numericCount / nonEmpty.length >= 0.8) {
      numericCols.push(c);
    }
  }

  return numericCols;
}

function exportToExcel(data: TableData, options?: ExportTableOptions): Blob {
  const shouldAutoSum = Boolean(options?.autoSum);
  const numericColumnIndices = shouldAutoSum ? getNumericColumnIndices(data) : [];
  const hasAutoSum = numericColumnIndices.length > 0 && data.rows.length > 0;

  const aoa: Array<Array<string>> = [data.headers, ...data.rows];
  if (hasAutoSum) {
    aoa.push(new Array(data.headers.length).fill(''));
  }

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  if (hasAutoSum) {
    // Convert numeric columns values from strings to actual numeric cells,
    // otherwise Excel treats them as text and SUM() results in 0.
    for (let r = 0; r < data.rows.length; r++) {
      const sheetRowIndex0 = r + 1; // +1 for header row
      for (const c of numericColumnIndices) {
        const raw = data.rows[r]?.[c] ?? '';
        const parsed = extractNumericValue(raw);
        if (parsed === null) continue;
        const cellAddress = XLSX.utils.encode_cell({ r: sheetRowIndex0, c });
        worksheet[cellAddress] = { t: 'n', v: parsed };
      }
    }

    const dataStartRowNumber = 2;
    const dataEndRowNumber = data.rows.length + 1;
    const totalsRowIndex0 = data.rows.length + 1;

    const labelCellAddress = XLSX.utils.encode_cell({ r: totalsRowIndex0, c: 0 });
    worksheet[labelCellAddress] = { t: 's', v: 'Total' };

    for (const c of numericColumnIndices) {
      const colLetter = XLSX.utils.encode_col(c);
      const cellAddress = XLSX.utils.encode_cell({ r: totalsRowIndex0, c });
      const formula = `SUM(${colLetter}${dataStartRowNumber}:${colLetter}${dataEndRowNumber})`;

      const sumValue = data.rows.reduce((acc, row) => {
        const parsed = extractNumericValue(row[c] ?? '');
        return parsed === null ? acc : acc + parsed;
      }, 0);

      worksheet[cellAddress] = { t: 'n', f: formula, v: sumValue };
    }
  }

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
  format: ExportFormat,
  options?: ExportTableOptions
): Promise<ExportResult> {
  try {
    let blob: Blob;

    switch (format) {
      case 'xlsx':
        blob = exportToExcel(data, options);
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
