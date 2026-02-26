import * as XLSX from 'xlsx';
import { Document, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { TableData, ExportFormat, ExportResult } from '@/types/table';

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
