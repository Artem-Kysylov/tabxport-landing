'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParsedTable, ExportFormat } from '@/types/table';
import { exportTable, downloadBlob } from '@/services/exportService';
import { ExcelIcon, CSVIcon, DocxIcon } from '@/components/icons/FormatIcons';
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
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const result = await exportTable(table.data, format);

      if (result.success && result.blob) {
        downloadBlob(result.blob, 'table_export', format);
      } else {
        console.error('Export failed:', result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
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
          <h4 className="text-lg font-bold text-secondary mb-4">Export as:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formatOptions.map((option) => (
              <motion.button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
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
