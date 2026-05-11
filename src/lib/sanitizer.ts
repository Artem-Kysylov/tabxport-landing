export interface FixStats {
  markdown: number;
  spaces: number;
  numeric: number;
  links: number;
}

export interface SanitizedTableData {
  headers: string[];
  rows: string[][];
  fixStats: FixStats;
}

const createFixStats = (): FixStats => ({ markdown: 0, spaces: 0, numeric: 0, links: 0 });

// Matches currency/approximate values like "$1,200", "~500€", "€12.50", "1,234 USD"
const NUMERIC_CELL_RE = /^~?\s*[$€£¥₽₴]?\s*[\d,]+(\.\d+)?\s*[$€£¥₽₴]?(%|USD|EUR|GBP|UAH|RUB)?$/i;

// Matches Markdown inline links: [text](url)
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\([^)]*\)/g;

// Matches mailto: URIs
const MAILTO_RE = /mailto:([^\s,>)]+)/g;

// Matches bold (**), italic (*), underscore italic (_word_), strikethrough (~~), inline code (`)
const MARKDOWN_FORMAT_RE = /(\*\*|~~|`|\*(?!\s)|(?<!\w)_(?!\s)(?=[^_]*_(?!\w)))/g;

const stripLinks = (value: string, stats: FixStats): string => {
  let changed = false;

  const withoutMdLinks = value.replace(MARKDOWN_LINK_RE, (_, text: string) => {
    changed = true;
    return text;
  });

  const withoutMailto = withoutMdLinks.replace(MAILTO_RE, (_, addr: string) => {
    changed = true;
    return addr;
  });

  if (changed) stats.links++;
  return withoutMailto;
};

const stripMarkdownFormatting = (value: string, stats: FixStats): string => {
  const stripped = value.replace(MARKDOWN_FORMAT_RE, '');
  if (stripped !== value) stats.markdown++;
  return stripped;
};

const cleanNoise = (value: string, stats: FixStats): string => {
  // Replace HTML non-breaking spaces and zero-width characters
  const withoutEntities = value.replace(/&nbsp;/g, ' ');
  const withoutZeroWidth = withoutEntities.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
  // Collapse runs of spaces/tabs into a single space
  const collapsed = withoutZeroWidth.replace(/[ \t]{2,}/g, ' ');

  if (collapsed !== value) stats.spaces++;
  return collapsed;
};

const trackNumericCell = (value: string, stats: FixStats): string => {
  if (NUMERIC_CELL_RE.test(value.trim())) stats.numeric++;
  return value;
};

const sanitizeCell = (raw: string, stats: FixStats): string => {
  let cell = stripLinks(raw, stats);
  cell = stripMarkdownFormatting(cell, stats);
  cell = cleanNoise(cell, stats);
  cell = trackNumericCell(cell, stats);
  return cell.trim();
};

export const sanitizeTableData = (
  headers: string[],
  rows: string[][]
): SanitizedTableData => {
  const fixStats = createFixStats();
  const cleanedHeaders = headers.map((h) => sanitizeCell(h, fixStats));
  const cleanedRows = rows.map((row) => row.map((cell) => sanitizeCell(cell, fixStats)));
  return { headers: cleanedHeaders, rows: cleanedRows, fixStats };
};

export const sumFixStats = (stats: FixStats): number =>
  stats.markdown + stats.spaces + stats.numeric + stats.links;

// Converts table data to plain tab-separated text (with full sanitization applied)
export const tableToCopyText = (headers: string[], rows: string[][]): string => {
  const { headers: cleanHeaders, rows: cleanRows } = sanitizeTableData(headers, rows);
  return [cleanHeaders, ...cleanRows].map((row) => row.join('\t')).join('\n');
};
