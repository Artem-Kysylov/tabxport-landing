import type { TableData } from '@/types/table';

/**
 * Strips common Markdown noise from a single table cell (or a pasted blob before parsing).
 * Applied to all import paths: paste, file, and HTML.
 */
export function sanitizeCellMarkdown(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/```[\w-]*\s*\n?[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`{3,}/g, '');
  // Mailto links: [label](mailto:...) -> label (regex literal each call avoids /g lastIndex on shared RegExp)
  cleaned = cleaned.replace(/\[([^\]]+)]\(\s*mailto:[^)]+\)/gi, '$1');
  cleaned = cleaned.replace(/\*\*([\s\S]+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*\n]+?)\*/g, '$1');
  return cleaned.trim();
}

export function sanitizeTableData(data: TableData): TableData {
  return {
    headers: data.headers.map(sanitizeCellMarkdown),
    rows: data.rows.map((row) => row.map(sanitizeCellMarkdown)),
  };
}
