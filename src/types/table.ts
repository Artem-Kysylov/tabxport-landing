import { z } from 'zod';

export const TableCellSchema = z.string();

export const TableRowSchema = z.array(TableCellSchema);

export const TableDataSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(TableRowSchema),
});

export type TableCell = z.infer<typeof TableCellSchema>;
export type TableRow = z.infer<typeof TableRowSchema>;
export type TableData = z.infer<typeof TableDataSchema>;

export type ExportFormat = 'xlsx' | 'csv' | 'docx' | 'pdf' | 'json' | 'md' | 'sql';

export interface ParsedTable {
  id: string;
  name: string;
  data: TableData;
  rowCount: number;
  columnCount: number;
}

export interface ParserResult {
  success: boolean;
  tables?: ParsedTable[];
  error?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}
