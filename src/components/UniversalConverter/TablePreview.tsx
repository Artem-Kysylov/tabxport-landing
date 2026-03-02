'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ParsedTable, ExportFormat } from '@/types/table';
import { exportTable, downloadBlob } from '@/services/exportService';
import { ExcelIcon, CSVIcon, DocxIcon, PDFIcon, JSONIcon, MarkdownIcon, SQLIcon } from '@/components/icons/FormatIcons';
import { Button } from '@/components/ui/button';

interface TablePreviewProps {
  table: ParsedTable;
  onClear: () => void;
}

interface FormatOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const TablePreview: React.FC<TablePreviewProps> = ({ table, onClear }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [autoSumEnabled, setAutoSumEnabled] = useState(false);

  useEffect(() => {
    try {
      const savedAutoSum = localStorage.getItem('tx_auto_sum_enabled');

      if (savedAutoSum === 'true' || savedAutoSum === 'false') {
        setAutoSumEnabled(savedAutoSum === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const formatOptions: FormatOption[] = [
    {
      format: 'xlsx',
      label: 'Excel',
      icon: <ExcelIcon size={32} />,
      description: 'Best for spreadsheets',
    },
    {
      format: 'csv',
      label: 'CSV',
      icon: <CSVIcon size={32} />,
      description: 'Universal format',
    },
    {
      format: 'docx',
      label: 'Word',
      icon: <DocxIcon size={32} />,
      description: 'For documents',
    },
    {
      format: 'pdf',
      label: 'PDF',
      icon: <PDFIcon size={32} />,
      description: 'Portable document',
    },
    {
      format: 'json',
      label: 'JSON',
      icon: <JSONIcon size={32} />,
      description: 'Data interchange',
    },
    {
      format: 'md',
      label: 'Markdown',
      icon: <MarkdownIcon size={32} />,
      description: 'Lightweight markup',
    },
    {
      format: 'sql',
      label: 'SQL',
      icon: <SQLIcon size={32} />,
      description: 'Database inserts',
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const result = await exportTable(
        table.data,
        format,
        format === 'xlsx' ? { autoSum: autoSumEnabled } : undefined
      );

      if (result.success && result.blob) {
        downloadBlob(result.blob, 'table_export', format);
        toast.success(`Successfully exported to ${format.toUpperCase()} ✨`, {
          duration: 3000,
        });
      } else {
        console.error('Export failed:', result.error);
        toast.error(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred during export';
      toast.error(message);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const handleToggleAutoSum = () => {
    setAutoSumEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tx_auto_sum_enabled', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-light p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-secondary">Table Preview</h3>
            <p className="text-sm text-secondary/60 mt-1">
              {table.rowCount} rows × {table.columnCount} columns
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClear}
            className="h-8 py-1 px-3 text-sm hover:bg-destructive hover:text-white hover:border-destructive"
          >
            Clear
          </Button>
        </div>

        <div className="overflow-x-auto mb-8 rounded-xl border-2 border-primary-light">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-light">
                {table.data.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-sm font-bold text-secondary border-b-2 border-primary"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.data.rows.slice(0, 10).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-primary-light/30'}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-secondary border-b border-primary-light/50"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.rowCount > 10 && (
            <div className="bg-primary-light/20 px-4 py-2 text-center text-sm text-secondary/60">
              Showing 10 of {table.rowCount} rows
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h4 className="text-lg font-bold text-secondary">Export as:</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary/60">Auto-sum (Excel)</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSumEnabled}
                onClick={handleToggleAutoSum}
                disabled={isExporting}
                className={
                  `relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ` +
                  (autoSumEnabled ? 'bg-primary border-primary' : 'bg-white border-primary-light') +
                  (isExporting ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
                }
              >
                <span
                  className={
                    `inline-block h-4 w-4 transform rounded-full shadow transition-transform ` +
                    (autoSumEnabled ? 'bg-white translate-x-4' : 'bg-primary translate-x-0.5')
                  }
                />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formatOptions.map((option) => (
              <motion.button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative p-2 rounded-xl border-2 transition-all duration-200
                  ${
                    exportingFormat === option.format
                      ? 'border-primary bg-primary-light/30'
                      : 'border-primary-light bg-white hover:border-primary hover:bg-primary-light/10'
                  }
                  ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="text-primary">{option.icon}</div>
                  <div className="text-center">
                    <p className="font-bold text-secondary">{option.label}</p>
                    <p className="text-xs text-secondary/60 mt-1">{option.description}</p>
                  </div>
                </div>

                {exportingFormat === option.format && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                    />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
