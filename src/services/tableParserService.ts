import { TableData, TableDataSchema, ParserResult, ParsedTable } from '@/types/table';

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

function isBoxDrawingBorderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Border lines are typically composed only of box drawing chars and whitespace.
  // Examples: "├────┼────┤", "└────┴────┘", "┌────┬────┐"
  return /^[\s\u2500-\u257F]+$/.test(trimmed) && !trimmed.includes('│');
}

function isBoxDrawingRowLine(line: string): boolean {
  // Data/header rows use vertical separators.
  const count = (line.match(/│/g) || []).length;
  return count >= 2;
}

function parseBoxDrawingTableSegment(lines: string[]): TableData | null {
  const rowLines = lines
    .filter((l) => l.trim())
    .filter((l) => !isBoxDrawingBorderLine(l))
    .filter((l) => isBoxDrawingRowLine(l));

  if (rowLines.length < 2) return null;

  const parsedRows = rowLines.map((line) =>
    line
      .trim()
      .replace(/^│/, '')
      .replace(/│$/, '')
      .split('│')
      .map((cell) => cell.trim())
  );

  const maxColumnCount = Math.max(...parsedRows.map((r) => r.length));
  if (maxColumnCount < 2) return null;

  const normalized = parsedRows.map((row) => {
    if (row.length === maxColumnCount) return row;
    if (row.length > maxColumnCount) return row.slice(0, maxColumnCount);
    return [...row, ...Array.from({ length: maxColumnCount - row.length }, () => '')];
  });

  const headers = normalized[0];
  const rows = normalized.slice(1);
  if (headers.length === 0 || rows.length === 0) return null;

  return { headers, rows };
}

function parseBoxDrawingTables(text: string): TableData[] {
  const rawLines = text.split(/\r?\n/);
  const tables: TableData[] = [];

  let i = 0;
  while (i < rawLines.length) {
    // Find start of a box table segment.
    while (i < rawLines.length && !isBoxDrawingRowLine(rawLines[i]) && !isBoxDrawingBorderLine(rawLines[i])) {
      i++;
    }
    if (i >= rawLines.length) break;

    const segment: string[] = [];
    let j = i;
    while (j < rawLines.length) {
      const line = rawLines[j];
      if (!line.trim()) break;

      if (!isBoxDrawingRowLine(line) && !isBoxDrawingBorderLine(line)) {
        break;
      }

      segment.push(line);
      j++;
    }

    const parsed = parseBoxDrawingTableSegment(segment);
    if (parsed) tables.push(parsed);

    i = Math.max(j, i + 1);
  }

  return tables;
}

function parseDelimitedTables(text: string): TableData[] {
  const blocks = text
    .trim()
    .split(/\r?\n\s*\r?\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const tables: TableData[] = [];
  for (const block of blocks) {
    const parsed = parseDelimitedText(block);
    if (parsed) tables.push(parsed);
  }
  return tables;
}

/**
 * Парсит HTML таблицу
 */
function parseHTMLTableElement(table: HTMLTableElement): TableData | null {
  // Извлекаем заголовки
  const headerCells = Array.from(table.querySelectorAll('thead th, thead td'));
  let headers: string[] = [];

  if (headerCells.length > 0) {
    headers = headerCells.map((cell) => cell.textContent?.trim() || '');
  } else {
    // Если нет thead, берем первую строку tbody
    const firstRow = table.querySelector('tbody tr, tr');
    if (!firstRow) return null;

    const cells = Array.from(firstRow.querySelectorAll('th, td'));
    headers = cells.map((cell) => cell.textContent?.trim() || '');
  }

  // Извлекаем строки данных
  const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
  const rows = bodyRows.slice(headerCells.length > 0 ? 0 : 1).map((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    return cells.map((cell) => cell.textContent?.trim() || '');
  });

  if (headers.length === 0 || rows.length === 0) return null;

  return { headers, rows };
}

function parseHTMLTables(html: string): TableData[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    const results: TableData[] = [];
    for (const t of tables) {
      const parsed = parseHTMLTableElement(t);
      if (parsed) results.push(parsed);
    }
    return results;
  } catch (error) {
    console.error('HTML parsing error:', error);
    return [];
  }
}

/**
 * Парсит Markdown таблицу
 */
function parseMarkdownTableBlock(lines: string[]): TableData | null {
  const separatorIndex = lines.findIndex((line) => /^[\s|:-]+$/.test(line));
  if (separatorIndex === -1) return null;

  const headerLine = lines[separatorIndex - 1];
  const dataLines = lines.slice(separatorIndex + 1);

  if (!headerLine || dataLines.length === 0) return null;

  const headers = headerLine
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

  const rows = dataLines
    .filter((l) => l.trim())
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())
    );

  const columnCount = headers.length;
  if (columnCount === 0 || rows.length === 0) return null;

  const normalizedRows = rows.map((row) => {
    if (row.length === columnCount) return row;
    if (row.length > columnCount) return row.slice(0, columnCount);
    return [...row, ...Array.from({ length: columnCount - row.length }, () => '')];
  });

  return { headers, rows: normalizedRows };
}

function parseMarkdownTables(text: string): TableData[] {
  const rawLines = text.split(/\r?\n/);
  const tables: TableData[] = [];

  // Scan for table blocks: [header] + [separator] + [rows...]
  for (let i = 1; i < rawLines.length; i++) {
    const separatorLine = rawLines[i];
    if (!/^[\s|:-]+$/.test(separatorLine)) continue;

    const headerLine = rawLines[i - 1] ?? '';
    if (!headerLine.includes('|')) continue;

    const blockLines: string[] = [headerLine, separatorLine];
    let j = i + 1;
    while (j < rawLines.length) {
      const line = rawLines[j];
      if (!line.trim()) break;
      if (!line.includes('|')) break;

      // If we see a new [header] + [separator] pair starting, stop current table.
      // This handles ChatGPT-style back-to-back tables without an empty line.
      const possibleSeparator = rawLines[j + 1];
      if (
        blockLines.length >= 3 &&
        possibleSeparator &&
        /^[\s|:-]+$/.test(possibleSeparator) &&
        line.includes('|')
      ) {
        break;
      }

      blockLines.push(line);
      j++;
    }

    const parsed = parseMarkdownTableBlock(blockLines);
    if (parsed) {
      tables.push(parsed);
      i = j;
    }
  }

  return tables;
}

function toParsedTables(tables: TableData[]): ParsedTable[] {
  return tables.map((t, index) => {
    const id = `tbl_${Date.now()}_${index}`;
    const name = `Table ${index + 1}`;
    return {
      id,
      name,
      data: t,
      rowCount: t.rows.length,
      columnCount: t.headers.length,
    };
  });
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
    const htmlTables = parseHTMLTables(trimmedInput);
    if (htmlTables.length > 0) {
      try {
        const validated = htmlTables.map((t) => TableDataSchema.parse(t));
        return {
          success: true,
          tables: toParsedTables(validated),
        };
      } catch {
        return {
          success: false,
          error: 'Invalid table structure',
        };
      }
    }
  }

  // Mixed parsing for ChatGPT pastes: split by empty lines and parse block-by-block
  const blocks = trimmedInput
    .split(/\r?\n\s*\r?\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const collected: TableData[] = [];
  for (const block of blocks) {
    const boxTables = parseBoxDrawingTables(block);
    if (boxTables.length > 0) {
      collected.push(...boxTables);
      continue;
    }

    if (block.includes('|') && /^[\s|:-]+$/m.test(block)) {
      collected.push(...parseMarkdownTables(block));
      continue;
    }

    const delimited = parseDelimitedText(block);
    if (delimited) collected.push(delimited);
  }

  if (collected.length > 0) {
    try {
      const validated = collected.map((t) => TableDataSchema.parse(t));
      return {
        success: true,
        tables: toParsedTables(validated),
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
