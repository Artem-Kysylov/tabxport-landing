import { useState, useCallback } from 'react';
import { ParsedTable, ParserResult } from '@/types/table';
import { parseTable, parseTableFromFile } from '@/services/tableParserService';

interface UseTableParserReturn {
  parsedTables: ParsedTable[] | null;
  isLoading: boolean;
  error: string | null;
  parseFromText: (text: string) => void;
  appendFromText: (text: string) => void;
  parseFromFile: (file: File) => Promise<void>;
  appendFromFile: (file: File) => Promise<void>;
  clearTable: () => void;
}

export function useTableParser(): UseTableParserReturn {
  const [parsedTables, setParsedTables] = useState<ParsedTable[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeMergedTables = useCallback((tables: ParsedTable[]): ParsedTable[] => {
    const usedIds = new Set<string>();
    const base = String(Date.now());

    return tables.map((t, index) => {
      let id = t.id;
      if (usedIds.has(id)) {
        id = `tbl_${base}_${index}`;
      }
      usedIds.add(id);

      return {
        ...t,
        id,
        name: `Table ${index + 1}`,
        rowCount: t.data.rows.length,
        columnCount: t.data.headers.length,
      };
    });
  }, []);

  const parseFromText = useCallback((text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: ParserResult = parseTable(text);

      if (result.success && result.tables && result.tables.length > 0) {
        setParsedTables(normalizeMergedTables(result.tables));
        setError(null);
      } else {
        setParsedTables(null);
        setError(result.error || 'Failed to parse table');
      }
    } catch (err) {
      setParsedTables(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, [normalizeMergedTables]);

  const appendFromText = useCallback(
    (text: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result: ParserResult = parseTable(text);

        const incoming = result.tables;
        if (result.success && incoming && incoming.length > 0) {
          setParsedTables((prev) => normalizeMergedTables([...(prev ?? []), ...incoming]));
          setError(null);
        } else {
          setError(result.error || 'Failed to parse table');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    },
    [normalizeMergedTables]
  );

  const parseFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: ParserResult = await parseTableFromFile(file);

      if (result.success && result.tables && result.tables.length > 0) {
        setParsedTables(normalizeMergedTables(result.tables));
        setError(null);
      } else {
        setParsedTables(null);
        setError(result.error || 'Failed to parse file');
      }
    } catch (err) {
      setParsedTables(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, [normalizeMergedTables]);

  const appendFromFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const result: ParserResult = await parseTableFromFile(file);
        const incoming = result.tables;

        if (result.success && incoming && incoming.length > 0) {
          setParsedTables((prev) => normalizeMergedTables([...(prev ?? []), ...incoming]));
          setError(null);
        } else {
          setError(result.error || 'Failed to parse file');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    },
    [normalizeMergedTables]
  );

  const clearTable = useCallback(() => {
    setParsedTables(null);
    setError(null);
  }, []);

  return {
    parsedTables,
    isLoading,
    error,
    parseFromText,
    appendFromText,
    parseFromFile,
    appendFromFile,
    clearTable,
  };
}
