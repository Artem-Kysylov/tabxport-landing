import { TableData, TableDataSchema, ParserResult } from '@/types/table';

/**
 * Парсит таблицу из текста с разделителями (табуляция, запятая, пайп)
 */
function parseDelimitedText(text: string): TableData | null {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) return null;

  // Определяем разделитель (приоритет: табуляция > пайп > запятая)
  const firstLine = lines[0];
  const delimiterCandidates = ['\t', ';', ',', '|'] as const;
  const delimiter = delimiterCandidates
    .map((d) => ({ d, count: firstLine.split(d).length - 1 }))
    .sort((a, b) => b.count - a.count)[0].d;

  // Парсим строки
  const parsedLines = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));

  const maxColumnCount = Math.max(...parsedLines.map((row) => row.length));
  if (maxColumnCount < 2) return null;

  const normalized = parsedLines.map((row) => {
    if (row.length >= maxColumnCount) return row;
    return [...row, ...Array.from({ length: maxColumnCount - row.length }, () => '')];
  });

  if (normalized.length < 2) return null;

  return {
    headers: normalized[0],
    rows: normalized.slice(1),
  };
}

/**
 * Парсит HTML таблицу
 */
function parseHTMLTable(html: string): TableData | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');

    if (!table) return null;

    // Извлекаем заголовки
    const headerCells = Array.from(table.querySelectorAll('thead th, thead td'));
    let headers: string[] = [];

    if (headerCells.length > 0) {
      headers = headerCells.map(cell => cell.textContent?.trim() || '');
    } else {
      // Если нет thead, берем первую строку tbody
      const firstRow = table.querySelector('tbody tr, tr');
      if (!firstRow) return null;
      
      const cells = Array.from(firstRow.querySelectorAll('th, td'));
      headers = cells.map(cell => cell.textContent?.trim() || '');
    }

    // Извлекаем строки данных
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    const rows = bodyRows.slice(headerCells.length > 0 ? 0 : 1).map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map(cell => cell.textContent?.trim() || '');
    });

    if (headers.length === 0 || rows.length === 0) return null;

    return { headers, rows };
  } catch (error) {
    console.error('HTML parsing error:', error);
    return null;
  }
}

/**
 * Парсит Markdown таблицу
 */
function parseMarkdownTable(text: string): TableData | null {
  const lines = text.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 3) return null;

  // Проверяем наличие разделителя (строка с дефисами)
  const separatorIndex = lines.findIndex(line => /^[\s|:-]+$/.test(line));
  if (separatorIndex === -1) return null;

  const headerLine = lines[separatorIndex - 1];
  const dataLines = lines.slice(separatorIndex + 1);

  if (!headerLine || dataLines.length === 0) return null;

  // Парсим заголовки
  const headers = headerLine
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());

  // Парсим строки данных
  const rows = dataLines.map((line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())
  );

  // Проверяем консистентность
  const columnCount = headers.length;

  if (columnCount === 0) return null;

  const normalizedRows = rows.map((row) => {
    if (row.length === columnCount) return row;
    if (row.length > columnCount) return row.slice(0, columnCount);
    return [...row, ...Array.from({ length: columnCount - row.length }, () => '')];
  });

  return { headers, rows: normalizedRows };
}

/**
 * Основная функция парсинга таблицы
 */
export function parseTable(input: string): ParserResult {
  if (!input || input.trim().length === 0) {
    return {
      success: false,
      error: 'Input is empty',
    };
  }

  const trimmedInput = input.trim();

  // Пробуем парсить как HTML
  if (trimmedInput.includes('<table')) {
    const htmlResult = parseHTMLTable(trimmedInput);
    if (htmlResult) {
      try {
        const validatedData = TableDataSchema.parse(htmlResult);
        return {
          success: true,
          table: {
            data: validatedData,
            rowCount: validatedData.rows.length,
            columnCount: validatedData.headers.length,
          },
        };
      } catch {
        return {
          success: false,
          error: 'Invalid table structure',
        };
      }
    }
  }

  // Пробуем парсить как Markdown
  if (trimmedInput.includes('|') && /^[\s|:-]+$/m.test(trimmedInput)) {
    const markdownResult = parseMarkdownTable(trimmedInput);
    if (markdownResult) {
      try {
        const validatedData = TableDataSchema.parse(markdownResult);
        return {
          success: true,
          table: {
            data: validatedData,
            rowCount: validatedData.rows.length,
            columnCount: validatedData.headers.length,
          },
        };
      } catch {
        return {
          success: false,
          error: 'Invalid table structure',
        };
      }
    }
  }

  // Пробуем парсить как текст с разделителями
  const delimitedResult = parseDelimitedText(trimmedInput);
  if (delimitedResult) {
    try {
      const validatedData = TableDataSchema.parse(delimitedResult);
      return {
        success: true,
        table: {
          data: validatedData,
          rowCount: validatedData.rows.length,
          columnCount: validatedData.headers.length,
        },
      };
    } catch {
      return {
        success: false,
        error: 'Invalid table structure',
      };
    }
  }

  return {
    success: false,
    error: 'Unable to parse table. Supported formats: HTML, Markdown, TSV, CSV',
  };
}

/**
 * Парсит таблицу из файла
 */
export async function parseTableFromFile(file: File): Promise<ParserResult> {
  try {
    const text = await file.text();
    return parseTable(text);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    };
  }
}
