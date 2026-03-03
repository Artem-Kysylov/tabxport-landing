'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ParsedTable, ExportFormat } from '@/types/table';
import {
  exportTable,
  downloadBlob,
  downloadZipBlob,
  exportTablesToXlsxMultiSheet,
  exportTablesToZip,
} from '@/services/exportService';
import { ExcelIcon, CSVIcon, DocxIcon, PDFIcon, JSONIcon, MarkdownIcon, SQLIcon } from '@/components/icons/FormatIcons';
import { Button } from '@/components/ui/button';

interface TablePreviewProps {
  tables: ParsedTable[];
  onClear: () => void;
  onAppend?: (text: string) => void;
}

interface FormatOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const TablePreview: React.FC<TablePreviewProps> = ({ tables, onClear, onAppend }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [autoSumEnabled, setAutoSumEnabled] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());
  const [appendText, setAppendText] = useState('');

  const [batchFormat, setBatchFormat] = useState<ExportFormat>('xlsx');
  const [batchMode, setBatchMode] = useState<'separate' | 'xlsx_tabs' | 'zip'>('separate');

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

  useEffect(() => {
    if (tables.length === 0) return;
    setActiveTableId((prev) => prev ?? tables[0].id);
    setSelectedTableIds(new Set(tables.map((t) => t.id)));
  }, [tables]);

  const activeTable = tables.find((t) => t.id === activeTableId) ?? tables[0];

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

  const handleExportSingle = async (format: ExportFormat) => {
    if (!activeTable) return;
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const result = await exportTable(
        activeTable.data,
        format,
        format === 'xlsx' ? { autoSum: autoSumEnabled } : undefined
      );

      if (result.success && result.blob) {
        downloadBlob(result.blob, `${activeTable.name.replace(/\s+/g, '_').toLowerCase()}`, format);
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

  const toggleTableSelection = (id: string) => {
    setSelectedTableIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedTableIds((prev) => {
      if (prev.size === tables.length) return new Set();
      return new Set(tables.map((t) => t.id));
    });
  };

  const handleBatchExport = async () => {
    const selectedTables = tables.filter((t) => selectedTableIds.has(t.id));
    if (selectedTables.length === 0) {
      toast.error('Select at least one table');
      return;
    }

    setIsExporting(true);
    try {
      if (batchMode === 'separate') {
        toast.message(`Exporting ${selectedTables.length} tables...`, { duration: 2000 });
        for (const t of selectedTables) {
          const result = await exportTable(t.data, batchFormat, batchFormat === 'xlsx' ? { autoSum: autoSumEnabled } : undefined);
          if (result.success && result.blob) {
            downloadBlob(result.blob, `${t.name.replace(/\s+/g, '_').toLowerCase()}`, batchFormat);
          } else {
            toast.error(`Failed to export ${t.name}: ${result.error}`);
          }
          await new Promise((r) => setTimeout(r, 200));
        }
        toast.success(`Exported ${selectedTables.length} tables ✨`, { duration: 2500 });
        return;
      }

      if (batchMode === 'xlsx_tabs') {
        if (batchFormat !== 'xlsx') {
          toast.error('Multi-tab export is available only for Excel');
          return;
        }

        toast.message(`Combining ${selectedTables.length} tables into one XLSX...`, { duration: 2500 });
        const blob = await exportTablesToXlsxMultiSheet(
          selectedTables.map((t) => ({ name: t.name, data: t.data })),
          { autoSum: autoSumEnabled }
        );
        downloadBlob(blob, `tables_${selectedTables.length}_combined`, 'xlsx');
        toast.success('Combined XLSX exported ✨', { duration: 2500 });
        return;
      }

      toast.message(`Zipping ${selectedTables.length} tables...`, { duration: 2500 });
      const zipBlob = await exportTablesToZip(
        selectedTables.map((t) => ({ name: t.name, data: t.data })),
        batchFormat,
        batchFormat === 'xlsx' ? { autoSum: autoSumEnabled } : undefined
      );
      downloadZipBlob(zipBlob, `tables_${selectedTables.length}`);
      toast.success('ZIP archive exported ✨', { duration: 2500 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Batch export failed';
      toast.error(message);
    } finally {
      setIsExporting(false);
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

  const handleAppendTable = () => {
    if (!onAppend) return;
    const text = appendText.trim();
    if (!text) {
      toast.error('Paste a table first');
      return;
    }

    onAppend(text);
    setAppendText('');
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
              {tables.length} tables detected
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

        <div className="mb-6 rounded-xl border-2 border-primary-light overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary-light/30">
            <div className="text-sm font-semibold text-secondary">Tables</div>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              disabled={isExporting}
              className="text-xs text-secondary/70 hover:text-secondary transition-colors"
            >
              {selectedTableIds.size === tables.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {tables.map((t) => {
              const isActive = t.id === activeTableId;
              const isSelected = selectedTableIds.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setActiveTableId(t.id)}
                  className={
                    `w-full flex items-center justify-between px-4 py-3 border-t border-primary-light/50 text-left transition-colors ` +
                    (isActive
                      ? 'bg-primary/20 border-l-4 border-l-primary'
                      : 'bg-white hover:bg-primary-light/10 border-l-4 border-l-transparent') +
                    (isExporting ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
                  }
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTableSelection(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <div className="text-sm font-semibold text-secondary">{t.name}</div>
                      <div className="text-xs text-secondary/60">{t.rowCount} rows × {t.columnCount} cols</div>
                    </div>
                  </div>
                  <div className="text-xs text-secondary/60">Preview</div>
                </button>
              );
            })}
          </div>

          {tables.length > 1 && onAppend && (
            <div className="border-t border-primary-light/50 bg-white px-4 py-3">
              <div className="text-xs font-semibold text-secondary mb-2">Add another table</div>
              <div className="flex items-center gap-2">
                <textarea
                  value={appendText}
                  onChange={(e) => setAppendText(e.target.value)}
                  placeholder="Paste another table..."
                  disabled={isExporting}
                  rows={1}
                  className="flex-1 h-10 min-h-10 max-h-10 rounded-md border border-primary-light bg-white px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button
                  onClick={handleAppendTable}
                  disabled={isExporting || !appendText.trim()}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white"
                >
                  Add table
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto mb-8 rounded-xl border-2 border-primary-light">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-light">
                {activeTable.data.headers.map((header, index) => (
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
              {activeTable.data.rows.slice(0, 10).map((row, rowIndex) => (
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
          {activeTable.rowCount > 10 && (
            <div className="bg-primary-light/20 px-4 py-2 text-center text-sm text-secondary/60">
              Showing 10 of {activeTable.rowCount} rows
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 gap-4">
            {tables.length === 1 ? (
              <h4 className="text-lg font-bold text-secondary">Export as:</h4>
            ) : (
              <div />
            )}
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
          {tables.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formatOptions.map((option) => (
                <motion.button
                  key={option.format}
                  onClick={() => handleExportSingle(option.format)}
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
          )}

          {tables.length > 1 && (
            <div className="mt-6 rounded-xl border-2 border-primary-light p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm font-semibold text-secondary">Bulk Export</div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <select
                    value={batchFormat}
                    onChange={(e) => setBatchFormat(e.target.value as ExportFormat)}
                    disabled={isExporting}
                    className="h-9 rounded-md border border-primary-light bg-white px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="xlsx">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="docx">Word</option>
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                    <option value="md">Markdown</option>
                    <option value="sql">SQL</option>
                  </select>

                  <select
                    value={batchMode}
                    onChange={(e) => setBatchMode(e.target.value as 'separate' | 'xlsx_tabs' | 'zip')}
                    disabled={isExporting}
                    className="h-9 rounded-md border border-primary-light bg-white px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="separate">Individual files</option>
                    <option value="xlsx_tabs">Single XLSX (tabs)</option>
                    <option value="zip">ZIP archive</option>
                  </select>

                  <Button
                    onClick={handleBatchExport}
                    disabled={isExporting}
                    className="h-9 px-4 bg-primary hover:bg-primary/90 text-white"
                  >
                    Bulk Export
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-xs text-secondary/60">
                Selected: {selectedTableIds.size} / {tables.length}
              </div>
            </div>
          )}
        </div>
      </div>
  </motion.div>
);

};
