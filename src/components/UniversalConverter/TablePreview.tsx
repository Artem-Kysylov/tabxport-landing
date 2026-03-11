'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { Sparkles, Plus } from 'lucide-react';
import { ParsedTable, ExportFormat, ExportDestination } from '@/types/table';
import {
  exportTable,
  downloadBlob,
  downloadZipBlob,
  exportTablesToXlsxMultiSheet,
  exportTablesToZip,
} from '@/services/exportService';
import { ExcelIcon, CSVIcon, DocxIcon, PDFIcon, JSONIcon, MarkdownIcon, SQLIcon, GoogleSheetsIcon } from '@/components/icons/FormatIcons';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { GoogleAuthPopup } from '@/components/auth/GoogleAuthPopup';
import { exportTableToGoogleSheets } from '@/services/googleSheetsService';
import { getOrCreateTableXportFolder, uploadFileToDrive, getFolderLink } from '@/services/googleDriveService';

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
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const [batchFormat, setBatchFormat] = useState<ExportFormat>('xlsx');
  const [batchMode, setBatchMode] = useState<'separate' | 'xlsx_tabs' | 'zip'>('separate');
  const [exportDestination, setExportDestination] = useState<ExportDestination>('local');
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const { isAuthenticated, hasRequiredScopes, getAccessToken } = useGoogleAuth();

  const persistTablesSnapshot = () => {
    try {
      localStorage.setItem('tx_parsed_tables_cache', JSON.stringify(tables));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthPopup(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      const savedAutoSum = localStorage.getItem('tx_auto_sum_enabled');
      if (savedAutoSum === 'true' || savedAutoSum === 'false') {
        setAutoSumEnabled(savedAutoSum === 'true');
      }

      const savedDestination = localStorage.getItem('tx_export_destination');
      if (savedDestination === 'local' || savedDestination === 'google_drive') {
        setExportDestination(savedDestination);
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

  // Status badge detection utility
  const detectStatusBadge = (cellValue: string): { type: 'success' | 'warning' | 'error' | 'neutral' | null; text: string } => {
    const value = cellValue.trim().toLowerCase();
    
    const successKeywords = ['active', 'success', 'completed', 'done', 'approved', 'confirmed', 'verified', 'enabled', 'live', 'published', 'paid', 'delivered'];
    const warningKeywords = ['pending', 'in progress', 'processing', 'review', 'draft', 'scheduled', 'awaiting', 'on hold'];
    const errorKeywords = ['inactive', 'suspended', 'cancelled', 'rejected', 'failed', 'error', 'blocked', 'disabled', 'expired', 'overdue'];
    const neutralKeywords = ['new', 'unknown', 'n/a', 'tbd'];
    
    if (successKeywords.includes(value)) return { type: 'success', text: cellValue };
    if (warningKeywords.includes(value)) return { type: 'warning', text: cellValue };
    if (errorKeywords.includes(value)) return { type: 'error', text: cellValue };
    if (neutralKeywords.includes(value)) return { type: 'neutral', text: cellValue };
    
    return { type: null, text: cellValue };
  };

  // Render cell with status badge if applicable
  const renderCellContent = (cellValue: string) => {
    const badge = detectStatusBadge(cellValue);
    
    if (!badge.type) {
      return cellValue;
    }

    const badgeStyles = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      neutral: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[badge.type]}`}>
        {badge.text}
      </span>
    );
  };

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
      format: 'google_sheets',
      label: 'Google Sheets',
      icon: <GoogleSheetsIcon size={32} />,
      description: 'Cloud spreadsheet',
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

    // Handle Google Sheets export
    if (format === 'google_sheets') {
      if (!isAuthenticated || !hasRequiredScopes) {
        toast.message('Sign in with Google to export to Google Sheets', { duration: 2000 });
        persistTablesSnapshot();
        setShowAuthPopup(true);
        return;
      }

      toast.message('Preparing Google Sheets export...', { duration: 1500 });
      setIsExporting(true);
      setExportingFormat(format);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          toast.message('Please sign in again to continue', { duration: 2000 });
          persistTablesSnapshot();
          setShowAuthPopup(true);
          return;
        }

        const folderId = await getOrCreateTableXportFolder(accessToken);
        const folderUrl = await getFolderLink(accessToken, folderId);
        const result = await exportTableToGoogleSheets(accessToken, activeTable, folderId);

        if (result.success && result.spreadsheetUrl) {
          toast.success(
            <div>
              <span>Exported to Google Sheets ✨</span>
              <br />
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
              >
                Open Folder
              </a>
              <br />
              <a
                href={result.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
              >
                Open Spreadsheet
              </a>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(result.error || 'Failed to export to Google Sheets');
        }
      } catch (error) {
        console.error('Google Sheets export error:', error);
        toast.error('Failed to export to Google Sheets');
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
      return;
    }

    // Handle local exports
    setIsExporting(true);
    setExportingFormat(format);

    try {
      const result = await exportTable(
        activeTable.data,
        format,
        format === 'xlsx' ? { autoSum: autoSumEnabled } : undefined
      );

      if (result.success && result.blob) {
        if (exportDestination === 'google_drive') {
          if (!isAuthenticated || !hasRequiredScopes) {
            persistTablesSnapshot();
            setShowAuthPopup(true);
            return;
          }

          const accessToken = await getAccessToken();
          if (!accessToken) {
            toast.error('Failed to get access token');
            return;
          }

          const folderId = await getOrCreateTableXportFolder(accessToken);
          const folderUrl = await getFolderLink(accessToken, folderId);
          const baseName = activeTable.name.replace(/\s+/g, '_').toLowerCase();

          const mimeTypes: Record<string, string> = {
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            csv: 'text/csv',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            pdf: 'application/pdf',
            json: 'application/json',
            md: 'text/markdown',
            sql: 'text/plain',
          };

          const uploadResult = await uploadFileToDrive(accessToken, result.blob, {
            filename: `${baseName}.${format}`,
            mimeType: mimeTypes[format] || 'application/octet-stream',
            folderId,
          });

          if (uploadResult.success && uploadResult.fileUrl) {
            toast.success(
              <div>
                <span>Uploaded to Google Drive ✨</span>
                <br />
                <a
                  href={folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
                >
                  Open Folder
                </a>
                <br />
                <a
                  href={uploadResult.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
                >
                  Open File
                </a>
              </div>,
              { duration: 5000 }
            );
          } else {
            toast.error(uploadResult.error || 'Failed to upload to Google Drive');
          }
        } else {
          downloadBlob(result.blob, `${activeTable.name.replace(/\s+/g, '_').toLowerCase()}`, format);
          toast.success(`Successfully exported to ${format.toUpperCase()} ✨`, {
            duration: 2500,
          });
        }
      } else {
        toast.error(result.error || 'Export failed');
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

    // Check if exporting to Google Drive
    if (exportDestination === 'google_drive') {
      if (!isAuthenticated || !hasRequiredScopes) {
        persistTablesSnapshot();
        setShowAuthPopup(true);
        return;
      }

      setIsExporting(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          toast.error('Failed to get access token');
          return;
        }

        // Handle multi-sheet Google Sheets export
        if (batchMode === 'xlsx_tabs' || batchFormat === 'google_sheets') {
          const { createMultiSheetSpreadsheet } = await import('@/services/googleSheetsService');
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const title = `Tables_${selectedTables.length}_${timestamp}`;
          
          toast.message(`Creating multi-sheet Google Spreadsheet...`, { duration: 2500 });
          const folderId = await getOrCreateTableXportFolder(accessToken);
          const result = await createMultiSheetSpreadsheet(accessToken, selectedTables, title, folderId);

          if (result.success && result.spreadsheetUrl) {
            toast.success(
              <div>
                <span>Exported to Google Sheets ✨</span>
                <br />
                <a
                  href={result.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
                >
                  Open Spreadsheet
                </a>
              </div>,
              { duration: 5000 }
            );
          } else {
            toast.error(result.error || 'Failed to create multi-sheet spreadsheet');
          }
          return;
        }

        // Handle batch upload to Google Drive folder
        const { createBatchFolder, uploadFileToDrive, getFolderLink } = await import('@/services/googleDriveService');
        const mainFolderId = await getOrCreateTableXportFolder(accessToken);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const batchFolderId = await createBatchFolder(accessToken, mainFolderId, timestamp);

        toast.message(`Uploading ${selectedTables.length} files to Google Drive...`, { duration: 2000 });
        
        let successCount = 0;
        for (let i = 0; i < selectedTables.length; i++) {
          const t = selectedTables[i];
          const result = await exportTable(t.data, batchFormat, batchFormat === 'xlsx' ? { autoSum: autoSumEnabled } : undefined);
          
          if (result.success && result.blob) {
            const mimeTypes: Record<string, string> = {
              xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              csv: 'text/csv',
              docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              pdf: 'application/pdf',
              json: 'application/json',
              md: 'text/markdown',
              sql: 'text/plain',
            };

            const uploadResult = await uploadFileToDrive(accessToken, result.blob, {
              filename: `${t.name.replace(/\s+/g, '_').toLowerCase()}.${batchFormat}`,
              mimeType: mimeTypes[batchFormat] || 'application/octet-stream',
              folderId: batchFolderId,
            });

            if (uploadResult.success) {
              successCount++;
              toast.message(`Uploaded ${successCount}/${selectedTables.length} files...`, { duration: 1000 });
            }
          }
          await new Promise((r) => setTimeout(r, 300));
        }

        const folderUrl = await getFolderLink(accessToken, batchFolderId);
        toast.success(
          <div>
            <span>Uploaded {successCount} files to Google Drive ✨</span>
            <br />
            <a
              href={folderUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}
            >
              Open Folder
            </a>
          </div>,
          { duration: 5000 }
        );
      } catch (error) {
        console.error('Google Drive batch export error:', error);
        toast.error('Failed to export to Google Drive');
      } finally {
        setIsExporting(false);
      }
      return;
    }

    // Handle local batch export
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

          {tables.length >= 1 && onAppend && (
            <div className="border-t border-primary-light/50 bg-gray-50 px-4 py-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <div className="text-xs font-semibold text-secondary mb-2">Add another table</div>
                <div className="flex items-center gap-2">
                  <textarea
                    value={appendText}
                    onChange={(e) => setAppendText(e.target.value)}
                    placeholder="Paste another table..."
                    disabled={isExporting}
                    rows={1}
                    className="flex-1 h-10 min-h-10 max-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <Button
                    onClick={handleAppendTable}
                    disabled={isExporting || !appendText.trim()}
                    className="h-10 px-4 bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add table
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto mb-8 rounded-xl border-2 border-gray-200">
          {/* Claude-style header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <input
              type="text"
              value={editingTableId === activeTable.id ? editedName : activeTable.name}
              onChange={(e) => {
                setEditedName(e.target.value);
                setEditingTableId(activeTable.id);
              }}
              onBlur={() => {
                if (editingTableId && editedName.trim()) {
                  // Update table name in parent component if needed
                  // For now, just reset editing state
                }
                setEditingTableId(null);
              }}
              className="text-sm font-semibold text-secondary bg-transparent border-none focus:outline-none focus:ring-0 px-0"
            />
            <Button
              variant="outline"
              onClick={onClear}
              className="h-7 py-1 px-3 text-xs hover:bg-destructive hover:text-white hover:border-destructive"
            >
              Clear
            </Button>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="bg-primary">
                {activeTable.data.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-sm font-bold text-white border border-gray-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTable.data.rows.slice(0, 3).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-secondary border border-gray-200"
                    >
                      {renderCellContent(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {activeTable.rowCount > 3 && (
            <div className="bg-primary-light/20 px-4 py-2 text-center text-sm text-secondary/60">
              Showing 3 of {activeTable.rowCount} rows
            </div>
          )}
        </div>

        <div>
          {/* Export Destination Switcher */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 bg-primary-light/30 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setExportDestination('local');
                  try {
                    localStorage.setItem('tx_export_destination', 'local');
                  } catch {
                    // ignore
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold transition-all cursor-pointer border-2 ${
                  exportDestination === 'local'
                    ? 'bg-white text-secondary border-primary'
                    : 'text-secondary/60 hover:text-secondary border-transparent'
                }`}
              >
                <Image src="/icons/icon-device.svg" alt="Local" width={20} height={20} />
                Local Download
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportDestination('google_drive');
                  try {
                    localStorage.setItem('tx_export_destination', 'google_drive');
                  } catch {
                    // ignore
                  }

                  if (!isAuthenticated || !hasRequiredScopes) {
                    persistTablesSnapshot();
                    setShowAuthPopup(true);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold transition-all cursor-pointer border-2 ${
                  exportDestination === 'google_drive'
                    ? 'bg-white text-secondary border-primary'
                    : 'text-secondary/60 hover:text-secondary border-transparent'
                }`}
              >
                <Image src="/icons/icon-google-drive.svg" alt="Google Drive" width={20} height={20} />
                Google Drive
              </button>
            </div>
            {exportDestination === 'google_drive' && !isAuthenticated && (
              <p className="text-xs text-secondary/60 mt-2 text-center">
                Sign in with Google to export to Drive
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 gap-4">
            {tables.length === 1 ? (
              <h4 className="text-lg font-bold text-secondary">Export as:</h4>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-secondary/60">
                <Sparkles size={14} className="text-primary" />
                Auto-sum (Excel)
              </span>
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

      {/* Google Auth Popup */}
      <GoogleAuthPopup 
        trigger={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
      />
    </motion.div>
  );
};
