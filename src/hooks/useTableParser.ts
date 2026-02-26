import { useState, useCallback } from 'react';
import { ParsedTable, ParserResult } from '@/types/table';
import { parseTable, parseTableFromFile } from '@/services/tableParserService';

interface UseTableParserReturn {
  parsedTable: ParsedTable | null;
  isLoading: boolean;
  error: string | null;
  parseFromText: (text: string) => void;
  parseFromFile: (file: File) => Promise<void>;
  clearTable: () => void;
}

export function useTableParser(): UseTableParserReturn {
  const [parsedTable, setParsedTable] = useState<ParsedTable | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFromText = useCallback((text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: ParserResult = parseTable(text);

      if (result.success && result.table) {
        setParsedTable(result.table);
        setError(null);
      } else {
        setParsedTable(null);
        setError(result.error || 'Failed to parse table');
      }
    } catch (err) {
      setParsedTable(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: ParserResult = await parseTableFromFile(file);

      if (result.success && result.table) {
        setParsedTable(result.table);
        setError(null);
      } else {
        setParsedTable(null);
        setError(result.error || 'Failed to parse file');
      }
    } catch (err) {
      setParsedTable(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearTable = useCallback(() => {
    setParsedTable(null);
    setError(null);
  }, []);

  return {
    parsedTable,
    isLoading,
    error,
    parseFromText,
    parseFromFile,
    clearTable,
  };
}
