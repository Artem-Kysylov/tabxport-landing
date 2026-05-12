import { TableData, TableDataSchema, ParserResult, ParsedTable } from '@/types/table';

// ─── Stage 2: Standard delimited formats ──────────────────────────────────────

function parseDelimitedText(text: string): TableData | null {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) return null;

  const firstLine = lines[0];
  const delimiterCandidates = ['\t', ';', ',', '|'] as const;
  const delimiter = delimiterCandidates
    .map((d) => ({ d, count: firstLine.split(d).length - 1 }))
    .sort((a, b) => b.count - a.count)[0].d;

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
  return /^[\s\u2500-\u257F]+$/.test(trimmed) && !trimmed.includes('│');
}

function isBoxDrawingRowLine(line: string): boolean {
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
    while (i < rawLines.length && !isBoxDrawingRowLine(rawLines[i]) && !isBoxDrawingBorderLine(rawLines[i])) {
      i++;
    }
    if (i >= rawLines.length) break;

    const segment: string[] = [];
    let j = i;
    while (j < rawLines.length) {
      const line = rawLines[j];
      if (!line.trim()) break;
      if (!isBoxDrawingRowLine(line) && !isBoxDrawingBorderLine(line)) break;
      segment.push(line);
      j++;
    }

    const parsed = parseBoxDrawingTableSegment(segment);
    if (parsed) tables.push(parsed);
    i = Math.max(j, i + 1);
  }

  return tables;
}

// ─── Stage 1: HTML parser ─────────────────────────────────────────────────────

function parseHTMLTableElement(table: HTMLTableElement): TableData | null {
  const headerCells = Array.from(table.querySelectorAll('thead th, thead td'));
  let headers: string[] = [];

  if (headerCells.length > 0) {
    headers = headerCells.map((cell) => cell.textContent?.trim() || '');
  } else {
    const firstRow = table.querySelector('tbody tr, tr');
    if (!firstRow) return null;
    const cells = Array.from(firstRow.querySelectorAll('th, td'));
    headers = cells.map((cell) => cell.textContent?.trim() || '');
  }

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

// ─── Markdown parser ──────────────────────────────────────────────────────────

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

// ─── Stage 3: Fuzzy / "glued-text" heuristics ────────────────────────────────

/**
 * Attempts to split a single line into columns using:
 * 1. Two-or-more consecutive spaces (most reliable for AI tool pastes)
 * 2. Domain-boundary regex (email end → phone/name)
 * 3. Year/number → uppercase-letter boundary
 */
function splitGluedLine(line: string): string[] {
  const trimmed = line.trim();

  // Multi-space split — highest confidence
  const bySpaces = trimmed.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
  if (bySpaces.length >= 2) return bySpaces;

  // Regex boundary markers: use null byte as temporary separator
  const marked = trimmed
    // .com/.net/.org/.io/.edu followed by non-dot char (email end)
    .replace(/(\.com|\.net|\.org|\.io|\.edu)(?=[+\d\sA-Z@])/gi, '$1\x00')
    // 4-digit year/number followed by capital letter (date boundary)
    .replace(/(\d{4})(?=[A-Z][a-z])/g, '$1\x00')
    // phone-like pattern followed by uppercase (phone end → name)
    .replace(/(\d{3}[-.\s]?\d{3,4})(?=[A-Z])/g, '$1\x00');

  const byBoundaries = marked.split('\x00').map((s) => s.trim()).filter(Boolean);
  if (byBoundaries.length >= 2) return byBoundaries;

  return [trimmed];
}

/**
 * Fuzzy table reconstruction for plain-text pastes from AI tools.
 * Works best when cells are separated by 2+ spaces or have detectable boundaries.
 */
function parseFuzzyText(text: string): TableData | null {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return null;

  const splitLines = lines.map(splitGluedLine);
  const maxCols = Math.max(...splitLines.map((r) => r.length));

  if (maxCols < 2) return null;

  // Require at least half the lines to produce multiple columns
  const multiColCount = splitLines.filter((r) => r.length >= 2).length;
  if (multiColCount < Math.ceil(lines.length * 0.5)) return null;

  // Use the median column count as the expected width (robust against outliers)
  const sortedCounts = [...splitLines.map((r) => r.length)].sort((a, b) => a - b);
  const expectedCols = sortedCounts[Math.floor(sortedCounts.length / 2)];

  if (expectedCols < 2) return null;

  const padRow = (row: string[], target: number): string[] => {
    if (row.length === target) return row;
    if (row.length > target) return row.slice(0, target);
    return [...row, ...Array.from({ length: target - row.length }, () => '')];
  };

  const rawHeaders = splitLines[0];
  const headers = padRow(
    rawHeaders,
    Math.max(rawHeaders.length, expectedCols)
  ).map((h, i) => h || `Column ${i + 1}`);

  const rows = splitLines.slice(1).map((row) => padRow(row, headers.length));

  return { headers, rows };
}

// ─── Smart title detection ────────────────────────────────────────────────────

/**
 * Checks whether the first non-empty line looks like a caption/title
 * (e.g. "Table 3: Customers") rather than a data row.
 * Returns the title and the remaining lines if detected.
 */
function detectTitle(lines: string[]): { title: string | null; tableLines: string[] } {
  if (lines.length < 2) return { title: null, tableLines: lines };

  const firstLine = lines[0].trim();
  const secondLine = lines[1].trim();

  // First line is a title if it has no table delimiters and is short
  const firstHasDelimiters =
    firstLine.includes('|') ||
    firstLine.includes('\t') ||
    firstLine.split(',').length > 2;

  const firstLooksLikeTitle =
    !firstHasDelimiters && firstLine.length > 0 && firstLine.length < 120;

  // Second line should look like actual table data
  const secondLooksLikeTableRow =
    secondLine.includes('|') ||
    secondLine.includes('\t') ||
    /\s{2,}/.test(secondLine) ||
    secondLine.split(',').length >= 3;

  if (firstLooksLikeTitle && secondLooksLikeTableRow) {
    return { title: firstLine, tableLines: lines.slice(1) };
  }

  return { title: null, tableLines: lines };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function toParsedTables(tables: TableData[]): ParsedTable[] {
  return tables.map((t, index) => {
    const id = `tbl_${Date.now()}_${index}`;
    return {
      id,
      name: `Table ${index + 1}`,
      data: t,
      rowCount: t.rows.length,
      columnCount: t.headers.length,
    };
  });
}

function runStandardParsing(text: string): TableData[] {
  const blocks = text
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
    if (delimited) {
      collected.push(delimited);
      continue;
    }

    // Stage 3 fuzzy — last resort per block
    const fuzzy = parseFuzzyText(block);
    if (fuzzy) collected.push(fuzzy);
  }

  return collected;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseTable(input: string): ParserResult {
  if (!input || input.trim().length === 0) {
    return { success: false, error: 'Input is empty' };
  }

  const trimmedInput = input.trim();

  // Stage 1 — HTML (clipboard or drag-and-drop rich text)
  if (trimmedInput.includes('<table')) {
    const htmlTables = parseHTMLTables(trimmedInput);
    if (htmlTables.length > 0) {
      try {
        const validated = htmlTables.map((t) => TableDataSchema.parse(t));
        return { success: true, tables: toParsedTables(validated) };
      } catch {
        return { success: false, error: 'Invalid table structure' };
      }
    }
  }

  // Smart title detection — runs before standard/fuzzy stages
  const allLines = trimmedInput.split(/\r?\n/).filter((l) => l.trim());
  const { title, tableLines } = detectTitle(allLines);
  const tableText = tableLines.join('\n');

  // Stage 2 + Stage 3 — standard formats then fuzzy fallback
  const collected = runStandardParsing(tableText);

  if (collected.length > 0) {
    try {
      const validated = collected.map((t) => TableDataSchema.parse(t));
      return {
        success: true,
        tables: toParsedTables(validated),
        suggestedName: title ?? undefined,
      };
    } catch {
      return { success: false, error: 'Invalid table structure' };
    }
  }

  return {
    success: false,
    error:
      "Structure not recognized. Try using the 'Copy' button in your AI tool for better results, or check for missing delimiters.",
  };
}

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
