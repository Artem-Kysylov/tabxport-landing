'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { Sparkles, Plus, Upload, X, ChevronDown } from 'lucide-react';
import { ParsedTable, ExportFormat, ExportDestination, PDFBrandingSettings } from '@/types/table';
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
import { useGoogleAuthUi } from '@/contexts/GoogleAuthUiContext';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { exportTableToGoogleSheets } from '@/services/googleSheetsService';
import { getOrCreateTableXportFolder, uploadFileToDrive, getFolderLink } from '@/services/googleDriveService';
import { usePro } from '@/contexts/ProContext';
import { ProBadge } from '@/components/ui/ProBadge';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { useUpgradeAutoResume } from '@/hooks/useUpgradeAutoResume';
import { useUpgradeAction } from '@/hooks/useUpgradeAction';

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

type PostAuthIntent = 'signin' | 'locked_feature' | null;

const triggerHaptic = () => {
  if (typeof window === 'undefined') return;
  const nav = window.navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
  nav.vibrate?.(10);
};

export const TablePreview: React.FC<TablePreviewProps> = ({ tables, onClear, onAppend }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [autoSumEnabled, setAutoSumEnabled] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('xlsx');
  const [localTables, setLocalTables] = useState<ParsedTable[]>(tables);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());
  const [appendText, setAppendText] = useState('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const [batchFormat, setBatchFormat] = useState<ExportFormat>('xlsx');
  const [batchMode, setBatchMode] = useState<'separate' | 'xlsx_tabs' | 'zip'>('separate');
  const [exportDestination, setExportDestination] = useState<ExportDestination>('local');
  const [pdfBranding, setPdfBranding] = useState<PDFBrandingSettings>({});
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');
  const [postAuthIntent, setPostAuthIntent] = useState<PostAuthIntent>(null);
  const [showAllFormats, setShowAllFormats] = useState(false);

  const { isAuthenticated, hasRequiredScopes, getAccessToken } = useGoogleAuth();
  const { openGoogleAuthPopup } = useGoogleAuthUi();
  const { isPro, isLoading: isProLoading } = usePro();
  const { startUpgrade } = useUpgradeAction();
  const isProLocked = !isProLoading && !isPro;

  const persistTablesSnapshot = () => {
    try {
      localStorage.setItem('tx_parsed_tables_cache', JSON.stringify(localTables));
    } catch {
      // ignore
    }
  };

  const trackFirstExport = () => {
    try {
      const hasExported = localStorage.getItem('tx_first_export_completed');
      if (!hasExported) {
        localStorage.setItem('tx_first_export_completed', 'true');
        setShowPwaPrompt(true);
      }
    } catch {
      // ignore
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProLoading) {
      e.target.value = '';
      return;
    }

    if (!isPro) {
      showUpgradePrompt('Upgrade to Pro to add custom PDF branding.');
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_PDF_LOGO_INPUT_BYTES = 5 * 1024 * 1024;
    const MAX_PDF_LOGO_STORED_BYTES = 1024 * 1024;
    const allowedMimeTypes = new Set<string>(['image/png', 'image/jpeg']);
    const hasAllowedExtension = /\.(png|jpe?g)$/i.test(file.name);
    const isAllowedType = allowedMimeTypes.has(file.type) || (file.type === '' && hasAllowedExtension);

    if (!isAllowedType) {
      toast.error('Unsupported file type. Please upload PNG or JPG.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_PDF_LOGO_INPUT_BYTES) {
      toast.error('Logo is too large to process. Max upload size is 5 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const originalDataUrl = reader.result as string;

        const dataUrlByteSize = (dataUrl: string): number => {
          const commaIndex = dataUrl.indexOf(',');
          if (commaIndex === -1) return dataUrl.length;
          const base64 = dataUrl.slice(commaIndex + 1);
          let padding = 0;
          if (base64.endsWith('==')) padding = 2;
          else if (base64.endsWith('=')) padding = 1;
          return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
        };

        const image = new window.Image();
        const optimizedDataUrl: string = await new Promise((resolve, reject) => {
          image.onload = () => {
            try {
              const maxDim = 600;
              const ratio = Math.min(1, maxDim / Math.max(image.width, image.height));
              const targetW = Math.max(1, Math.round(image.width * ratio));
              const targetH = Math.max(1, Math.round(image.height * ratio));

              const canvas = document.createElement('canvas');
              canvas.width = targetW;
              canvas.height = targetH;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Canvas context is not available'));
                return;
              }

              ctx.clearRect(0, 0, targetW, targetH);
              ctx.drawImage(image, 0, 0, targetW, targetH);

              const originalIsPng = /^data:image\/png;base64,/i.test(originalDataUrl);

              if (!originalIsPng) {
                let quality = 0.9;
                let out = canvas.toDataURL('image/jpeg', quality);
                while (dataUrlByteSize(out) > MAX_PDF_LOGO_STORED_BYTES && quality > 0.6) {
                  quality -= 0.1;
                  out = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(out);
                return;
              }

              const outPng = canvas.toDataURL('image/png');
              if (dataUrlByteSize(outPng) <= MAX_PDF_LOGO_STORED_BYTES) {
                resolve(outPng);
                return;
              }

              let quality = 0.9;
              let outJpeg = canvas.toDataURL('image/jpeg', quality);
              while (dataUrlByteSize(outJpeg) > MAX_PDF_LOGO_STORED_BYTES && quality > 0.6) {
                quality -= 0.1;
                outJpeg = canvas.toDataURL('image/jpeg', quality);
              }
              resolve(outJpeg);
            } catch (err) {
              reject(err);
            }
          };

          image.onerror = () => reject(new Error('Failed to load image'));
          image.src = originalDataUrl;
        });

        if (dataUrlByteSize(optimizedDataUrl) > MAX_PDF_LOGO_STORED_BYTES) {
          toast.error('Logo is still too large after optimization. Please use a smaller image.');
          return;
        }

        const updatedBranding = { ...pdfBranding, logo: optimizedDataUrl };
        setPdfBranding(updatedBranding);
        try {
          localStorage.setItem('tx_pdf_branding', JSON.stringify(updatedBranding));
          toast.success('Logo uploaded');
        } catch {
          toast.error('Failed to save logo');
        }
      } catch (error) {
        console.error('Logo upload error:', error);
        toast.error('Failed to process logo');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleColorChange = (color: string) => {
    if (isProLoading) {
      return;
    }

    if (!isPro) {
      showUpgradePrompt('Upgrade to Pro to customize PDF colors.');
      return;
    }

    const updatedBranding = { ...pdfBranding, brandColor: color };
    setPdfBranding(updatedBranding);
    try {
      localStorage.setItem('tx_pdf_branding', JSON.stringify(updatedBranding));
    } catch {
      // ignore
    }
  };

  const handleRemoveLogo = () => {
    const updatedBranding = { ...pdfBranding, logo: undefined };
    setPdfBranding(updatedBranding);
    try {
      localStorage.setItem('tx_pdf_branding', JSON.stringify(updatedBranding));
      toast.success('Logo removed');
    } catch {
      // ignore
    }
  };

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  }, []);

  const openAuthPopup = useCallback((intent: PostAuthIntent = 'signin') => {
    setPostAuthIntent(intent);
    openGoogleAuthPopup();
  }, [openGoogleAuthPopup]);

  const { isResumingUpgrade } = useUpgradeAutoResume({
    enabled: localTables.length > 0,
    onResume: () => {
      void startUpgrade({
        onError: (message) => {
          toast.error(message);
          showUpgradePrompt('Continue upgrading to unlock the Pro features you selected.');
        },
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (postAuthIntent === 'locked_feature' && !isProLoading && !isPro) {
      showUpgradePrompt('Unlock Google Drive and premium exports with Pro.');
    }

    setPostAuthIntent(null);
  }, [isAuthenticated, isPro, isProLoading, postAuthIntent, showUpgradePrompt]);

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

      const savedPdfBranding = localStorage.getItem('tx_pdf_branding');
      if (savedPdfBranding) {
        try {
          setPdfBranding(JSON.parse(savedPdfBranding));
        } catch {
          // ignore invalid JSON
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  const tableIdsKey = localTables.map((t) => t.id).join('|');

  useEffect(() => {
    if (localTables.length === 0) return;
    setActiveTableId((prev) => {
      if (prev && localTables.some((t) => t.id === prev)) return prev;
      return localTables[0].id;
    });
    setSelectedTableIds((prev) => {
      if (prev.size === 0) return new Set(localTables.map((t) => t.id));
      const next = new Set<string>();
      localTables.forEach((t) => {
        if (prev.has(t.id)) next.add(t.id);
      });
      localTables.forEach((t) => {
        if (!prev.has(t.id)) next.add(t.id);
      });
      return next;
    });
  }, [tableIdsKey, localTables]);

  useEffect(() => {
    if (exportDestination === 'local' && activeFormat === 'google_sheets') {
      setActiveFormat('xlsx');
    }
  }, [exportDestination, activeFormat]);

  const activeTable = localTables.find((t) => t.id === activeTableId) ?? localTables[0];
  const effectiveFormat: ExportFormat = localTables.length > 1 ? batchFormat : activeFormat;

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

    if (isProLoading) {
      return;
    }

    if ((format === 'pdf' || format === 'google_sheets') && isProLocked) {
      persistTablesSnapshot();
      showUpgradePrompt(format === 'pdf'
        ? 'Upgrade to Pro to export branded PDF files.'
        : 'Upgrade to Pro to export directly to Google Sheets.');
      return;
    }

    // Handle Google Sheets export
    if (format === 'google_sheets') {
      if (!isAuthenticated || !hasRequiredScopes) {
        persistTablesSnapshot();
        openGoogleAuthPopup();
        return;
      }

      toast.message('Preparing Google Sheets export...', { duration: 1500 });
      setIsExporting(true);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          toast.message('Please sign in again to continue', { duration: 2000 });
          persistTablesSnapshot();
          openGoogleAuthPopup();
          return;
        }

        const folderId = await getOrCreateTableXportFolder(accessToken);
        const folderUrl = await getFolderLink(accessToken, folderId);
        const result = await exportTableToGoogleSheets(accessToken, activeTable, folderId);

        if (result.success && result.spreadsheetUrl) {
          trackFirstExport();
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
      }
      return;
    }

    // Handle local exports
    setIsExporting(true);

    try {
      const result = await exportTable(
        activeTable.data,
        format,
        format === 'xlsx' ? { autoSum: autoSumEnabled } : format === 'pdf' ? { pdfBranding } : undefined
      );

      if (result.success && result.blob) {
        if (exportDestination === 'google_drive') {
          if (isProLocked) {
            persistTablesSnapshot();
            showUpgradePrompt('Upgrade to Pro to export files to Google Drive.');
            return;
          }

          if (!isAuthenticated || !hasRequiredScopes) {
            persistTablesSnapshot();
            openAuthPopup('signin');
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
            trackFirstExport();
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
          trackFirstExport();
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
      if (prev.size === localTables.length) return new Set();
      return new Set(localTables.map((t) => t.id));
    });
  };

  const handleBatchExport = async () => {
    const selectedTables = localTables.filter((t) => selectedTableIds.has(t.id));
    if (selectedTables.length === 0) {
      toast.error('Select at least one table');
      return;
    }

    if (isProLoading) {
      return;
    }

    if (isProLocked && (batchFormat === 'pdf' || exportDestination === 'google_drive')) {
      persistTablesSnapshot();
      showUpgradePrompt(batchFormat === 'pdf'
        ? 'Upgrade to Pro to batch export PDF files.'
        : 'Upgrade to Pro to batch export to Google Drive.');
      return;
    }

    // Check if exporting to Google Drive
    if (exportDestination === 'google_drive') {
      if (!isAuthenticated || !hasRequiredScopes) {
        persistTablesSnapshot();
        openAuthPopup('signin');
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
            trackFirstExport();
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
          const result = await exportTable(
            t.data,
            batchFormat,
            batchFormat === 'xlsx'
              ? { autoSum: autoSumEnabled }
              : batchFormat === 'pdf'
                ? { pdfBranding }
                : undefined
          );
          
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
        if (successCount > 0) {
          trackFirstExport();
        }
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
          const result = await exportTable(
            t.data,
            batchFormat,
            batchFormat === 'xlsx'
              ? { autoSum: autoSumEnabled }
              : batchFormat === 'pdf'
                ? { pdfBranding }
                : undefined
          );
          if (result.success && result.blob) {
            downloadBlob(result.blob, `${t.name.replace(/\s+/g, '_').toLowerCase()}`, batchFormat);
          } else {
            toast.error(`Failed to export ${t.name}: ${result.error}`);
          }
          await new Promise((r) => setTimeout(r, 200));
        }
        trackFirstExport();
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
        trackFirstExport();
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
      trackFirstExport();
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
    
    if (isProLoading) return;

    if (isProLocked && localTables.length >= 3) {
      showUpgradePrompt('Batch limit reached. Upgrade to Pro to process unlimited tables at once and unlock bulk exports.');
      return;
    }
    
    const text = appendText.trim();
    if (!text) {
      toast.error('Paste a table first');
      return;
    }

    onAppend(text);
    setAppendText('');
  };

  const buildJsonPreview = (): string => {
    const jsonData = activeTable.data.rows.map((row) => {
      const obj: Record<string, string> = {};
      activeTable.data.headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    return JSON.stringify(jsonData, null, 2);
  };

  const buildMarkdownPreview = (): string => {
    const headerRow = `| ${activeTable.data.headers.join(' | ')} |`;
    const separatorRow = `| ${activeTable.data.headers.map(() => '---').join(' | ')} |`;
    const dataRows = activeTable.data.rows.map((row) => `| ${row.join(' | ')} |`);
    return [headerRow, separatorRow, ...dataRows].join('\n');
  };

  const buildSqlPreview = (): string => {
    const tableName = 'exported_table';
    const columns = activeTable.data.headers.join(', ');
    const insertStatements = activeTable.data.rows.map((row) => {
      const values = row
        .map((cell) => {
          const escaped = cell.replace(/'/g, "''");
          return `'${escaped}'`;
        })
        .join(', ');
      return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
    });

    return [`-- Table: ${tableName}`, `-- Generated: ${new Date().toISOString()}`, '', ...insertStatements].join('\n');
  };

  const getFormatLabel = (format: ExportFormat): string => {
    const labels: Record<ExportFormat, string> = {
      xlsx: 'Excel',
      csv: 'CSV',
      google_sheets: 'Google Sheets',
      docx: 'Word',
      pdf: 'PDF',
      json: 'JSON',
      md: 'Markdown',
      sql: 'SQL',
    };
    return labels[format];
  };

  const renderPreviewBody = (format: ExportFormat) => {
    if (format === 'json' || format === 'sql' || format === 'md') {
      const content =
        format === 'json'
          ? buildJsonPreview()
          : format === 'sql'
            ? buildSqlPreview()
            : buildMarkdownPreview();

      const whitespaceClass = format === 'md' ? 'whitespace-pre-wrap' : 'whitespace-pre';

      return (
        <div className="bg-white max-h-[360px] overflow-y-auto">
          <pre className={`px-4 py-4 text-xs leading-relaxed text-secondary bg-white ${whitespaceClass}`}>
            {content}
          </pre>
        </div>
      );
    }

    if (format === 'pdf') {
      const brandColor = pdfBranding.brandColor || '#1B9358';
      return (
        <div className="p-6 bg-gray-100 max-h-[360px] overflow-y-auto">
          <div className="mx-auto max-w-[720px] bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            {pdfBranding.logo && (
              <div className="mb-6">
                <img src={pdfBranding.logo} alt="Logo" className="h-10 w-auto object-contain" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: brandColor }}>
                    {activeTable.data.headers.map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-bold text-white border border-gray-200 whitespace-nowrap" style={{ backgroundColor: brandColor }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTable.data.rows.slice(0, 12).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3 py-2 text-xs text-secondary border border-gray-200"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent || '';
                            if (newValue === cell) return;
                            setLocalTables((prev) =>
                              prev.map((t) => {
                                if (t.id !== activeTable.id) return t;
                                const nextRows = t.data.rows.map((r, ri) => {
                                  if (ri !== rowIndex) return r;
                                  return r.map((c, ci) => (ci === cellIndex ? newValue : c));
                                });
                                return { ...t, data: { ...t.data, rows: nextRows } };
                              })
                            );
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (format === 'docx') {
      return (
        <div className="p-6 bg-gray-100 max-h-[360px] overflow-y-auto">
          <div className="mx-auto max-w-[720px] bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <div className="mb-6">
              <div className="text-sm font-bold text-secondary">{activeTable.name}</div>
              <div className="text-xs text-secondary/60">Word document preview</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white">
                    {activeTable.data.headers.map((header, index) => (
                      <th key={index} className="bg-white px-3 py-2 text-left text-xs font-bold text-secondary border-b-2 border-gray-200 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTable.data.rows.slice(0, 12).map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-white">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-xs text-secondary border-b border-gray-100">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <table className="w-full min-w-full table-auto">
        <thead>
          <tr className="bg-primary">
            {activeTable.data.headers.map((header, index) => (
              <th key={index} className="bg-primary px-4 py-3 text-left text-sm font-bold text-white border border-gray-200 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeTable.data.rows.slice(0, 3).map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-sm text-secondary border border-gray-200">
                  {renderCellContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="standalone-preview-card bg-white rounded-2xl shadow-lg border-2 border-primary-light p-5 sm:p-8 pb-20 sm:pb-8">
        <div>
          {/* 1. Export destination tabs */}
          <div className="mb-5 grid grid-cols-2 gap-2 bg-primary-light/30 p-1 rounded-lg sm:inline-grid sm:w-auto">
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
              className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-md text-sm font-semibold transition-all cursor-pointer border-2 ${
                exportDestination === 'local'
                  ? 'bg-white text-secondary border-primary'
                  : 'text-secondary/60 hover:text-secondary border-transparent'
              }`}
            >
              <Image src="/icons/icon-device.svg" alt="Local" width={20} height={20} />
              <span className="whitespace-nowrap">Local Download</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isProLoading) {
                  return;
                }

                if (isProLocked) {
                  persistTablesSnapshot();
                  showUpgradePrompt('');
                  return;
                }

                if (!isAuthenticated || !hasRequiredScopes) {
                  openAuthPopup('signin');
                  return;
                }

                setExportDestination('google_drive');
              }}
              className={`relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-md text-sm font-semibold transition-all cursor-pointer border-2 ${
                exportDestination === 'google_drive'
                  ? 'bg-white text-secondary border-primary'
                  : 'text-secondary/60 hover:text-secondary border-transparent'
              } ${isProLocked ? 'grayscale opacity-60' : ''}`}
            >
              <Image src="/icons/icon-google-drive.svg" alt="Google Drive" width={20} height={20} />
              <span className="whitespace-nowrap">Google Drive</span>
              {isProLocked && (
                <div className="ml-1">
                  <ProBadge variant="badge" />
                </div>
              )}
            </button>
          </div>

          {/* 2. Title + count + Clear */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-secondary">Table Preview</h3>
              <p className="text-sm text-secondary/60 mt-1">
                {localTables.length} tables detected
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onClear}
              className="h-8 py-1 px-3 text-sm hover:bg-destructive hover:text-white hover:border-destructive shrink-0"
            >
              Clear
            </Button>
          </div>

          {exportDestination === 'google_drive' && !isAuthenticated && (
            <p className="text-xs text-secondary/60 mb-4 text-center">
              Sign in with Google to export to Drive
            </p>
          )}

          <div className="flex items-center justify-between mb-4 gap-4">
            {localTables.length === 1 ? (
              <h4 className="text-lg font-bold text-secondary">Preview as:</h4>
            ) : (
              <div />
            )}

            {localTables.length === 1 && activeFormat === 'xlsx' && (
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
            )}
          </div>

          {localTables.length === 1 && (() => {
            const renderFormatButton = (option: FormatOption) => {
              const isSheetsDisabled = option.format === 'google_sheets' && exportDestination === 'local';
              const isPdfLocked = option.format === 'pdf' && isProLocked;
              const isGoogleSheetsLocked = option.format === 'google_sheets' && isProLocked;
              const isLocked = isPdfLocked || isGoogleSheetsLocked;

              return (
                <motion.button
                  key={option.format}
                  onClick={() => {
                    if (isSheetsDisabled) return;
                    if (isLocked) {
                      persistTablesSnapshot();
                      showUpgradePrompt('');
                      return;
                    }
                    setActiveFormat(option.format);
                  }}
                  disabled={isExporting}
                  aria-disabled={isSheetsDisabled || isLocked}
                  whileHover={{ scale: isLocked ? 1 : 1.05 }}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  className={`
                    relative p-2 rounded-xl border-2 transition-all duration-200
                    ${
                      activeFormat === option.format
                        ? 'border-primary bg-primary-light/30 shadow-[0_0_0_3px_rgba(27,147,88,0.08)]'
                        : 'border-primary-light bg-white hover:border-primary hover:bg-primary-light/10'
                    }
                    ${
                      isExporting || isSheetsDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                    ${isLocked ? 'grayscale opacity-60' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={
                    isSheetsDisabled
                      ? 'Switch to Google Drive to export as Google Sheets'
                      : isLocked
                        ? 'Pro feature - Click to upgrade'
                        : undefined
                  }
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2 z-10">
                      <ProBadge variant="badge" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2 sm:gap-3 py-2">
                    <div className="text-primary">{option.icon}</div>
                    <div className="text-center">
                      <p className="font-bold text-secondary text-sm sm:text-base">{option.label}</p>
                      <p className="text-xs text-secondary/60 mt-1">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            };

            const primaryFormats = formatOptions.slice(0, 4);
            const secondaryFormats = formatOptions.slice(4);

            return (
              <div>
                {/* Mobile: 2-col grid, first 4 + accordion */}
                <div className="md:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {primaryFormats.map(renderFormatButton)}
                  </div>

                  <AnimatePresence initial={false}>
                    {showAllFormats && (
                      <motion.div
                        key="extra-formats"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          {secondaryFormats.map(renderFormatButton)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {secondaryFormats.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setShowAllFormats((prev) => !prev);
                      }}
                      aria-expanded={showAllFormats}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-light/20 px-4 py-3 text-sm font-semibold text-primary transition-colors active:bg-primary-light/40"
                    >
                      <span>
                        {showAllFormats ? 'Show less formats' : 'Show more formats'}
                      </span>
                      <motion.span
                        animate={{ rotate: showAllFormats ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="inline-flex"
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                  )}
                </div>

                {/* Desktop: full grid */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formatOptions.map(renderFormatButton)}
                </div>
              </div>
            );
          })()}

          {localTables.length === 1 && (
            <AnimatePresence initial={false} mode="popLayout">
              {(activeFormat === 'pdf' || activeFormat === 'json') && (
                <motion.div
                  key={`format-advanced-${activeFormat}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 rounded-lg border border-primary-light/50 bg-primary-light/20 p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(6,32,19,0.12)]"
                  >
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                      Advanced options — {activeFormat === 'pdf' ? 'PDF export' : 'JSON export'}
                    </p>
                    {activeFormat === 'pdf' ? (
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`relative ${isProLocked ? 'pointer-events-none' : ''}`}>
                            <label className="block text-sm font-medium text-secondary mb-2">
                              Logo (PNG/JPG)
                            </label>
                            {pdfBranding.logo ? (
                              <div className="flex items-center gap-3">
                                <img
                                  src={pdfBranding.logo}
                                  alt="Logo preview"
                                  className={`w-16 h-16 object-contain border border-gray-200 rounded bg-white p-1 ${isProLocked ? 'grayscale' : ''}`}
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveLogo}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                >
                                  <X size={14} />
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <label
                                className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md transition-colors ${isProLocked ? 'grayscale opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                                onClick={(e) => {
                                  if (isProLoading || isProLocked) {
                                    e.preventDefault();
                                    persistTablesSnapshot();
                                    showUpgradePrompt('');
                                  }
                                }}
                              >
                                <Upload size={16} className="text-secondary/60" />
                                <span className="text-sm text-secondary">Upload Logo</span>
                                {!isProLocked && (
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                )}
                              </label>
                            )}
                            {isProLocked && (
                              <div className="absolute top-0 right-0">
                                <ProBadge variant="icon" size={16} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`relative ${isProLocked ? 'pointer-events-none' : ''}`}>
                            <label className="block text-sm font-medium text-secondary mb-2">
                              Header Color
                            </label>
                            <div className="flex items-center gap-3">
                              <div
                                className={`relative ${isProLocked ? 'cursor-not-allowed' : ''}`}
                                onClick={() => {
                                  if (isProLoading || isProLocked) {
                                    persistTablesSnapshot();
                                    showUpgradePrompt('');
                                  }
                                }}
                              >
                                <input
                                  type="color"
                                  value={pdfBranding.brandColor || '#1B9358'}
                                  onChange={(e) => handleColorChange(e.target.value)}
                                  disabled={isProLoading || isProLocked}
                                  className={`w-12 h-12 rounded border border-gray-300 ${isProLocked ? 'grayscale opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-sm text-secondary font-medium ${isProLocked ? 'opacity-60' : ''}`}>
                                  {pdfBranding.brandColor || '#1B9358'}
                                </span>
                                <span className="text-xs text-secondary/60">
                                  Customize PDF header branding
                                </span>
                              </div>
                            </div>
                            {isProLocked && (
                              <div className="absolute top-0 right-0">
                                <ProBadge variant="icon" size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-secondary/80">
                        JSON exports structured data only — no logo or header styling applies.
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {localTables.length > 1 && (
            <div className="mt-6 rounded-xl border-2 border-primary-light overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-primary-light/30">
                <div className="text-sm font-semibold text-secondary">Tables</div>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  disabled={isExporting}
                  className="text-xs text-secondary/70 hover:text-secondary transition-colors"
                >
                  {selectedTableIds.size === localTables.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto">
                {localTables.map((t) => {
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
            </div>
          )}

          {localTables.length >= 1 && (
            <motion.div
              key={effectiveFormat}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto mb-6 mt-6 rounded-xl border-2 border-gray-200 relative"
            >
              <div className="flex min-w-full w-max flex-col">
              {localTables.length === 1 && (
                <div className="border-b border-gray-200">
                  <div>
                    {localTables.map((t) => {
                      const isActive = t.id === activeTableId;
                      const isSelected = selectedTableIds.has(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={isExporting}
                          onClick={() => setActiveTableId(t.id)}
                          className={
                            `w-full flex items-center justify-between px-4 py-3 text-left transition-colors ` +
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
                </div>
              )}

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
              </div>

              {renderPreviewBody(effectiveFormat)}

              {effectiveFormat !== 'json' && effectiveFormat !== 'sql' && effectiveFormat !== 'md' && effectiveFormat !== 'pdf' && effectiveFormat !== 'docx' && activeTable.rowCount > 3 && (
                <div className="bg-primary-light/20 px-4 py-2 text-center text-sm text-secondary/60">
                  Showing 3 of {activeTable.rowCount} rows
                </div>
              )}
              </div>
            </motion.div>
          )}

          {localTables.length > 1 && onAppend && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-primary-light bg-primary-light/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-secondary">Add another table</div>
                {isProLocked && (
                  <div className="text-xs text-secondary/60 font-medium">
                    {localTables.length}/3 tables
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                <textarea
                  value={appendText}
                  onChange={(e) => setAppendText(e.target.value)}
                  placeholder="Paste another table..."
                  disabled={isExporting}
                  rows={1}
                  className="w-full md:flex-1 h-10 min-h-10 max-h-10 rounded-md border border-primary-light bg-white px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button
                  onClick={handleAppendTable}
                  disabled={isExporting || !appendText.trim()}
                  className="w-full md:w-auto h-10 px-4 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add table
                </Button>
              </div>
            </div>
          )}

          {localTables.length > 1 && (
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
                Selected: {selectedTableIds.size} / {localTables.length}
              </div>
            </div>
          )}

          {localTables.length === 1 && onAppend && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-primary-light bg-primary-light/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-secondary">Add another table</div>
                {isProLocked && (
                  <div className="text-xs text-secondary/60 font-medium">
                    {localTables.length}/3 tables
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                <textarea
                  value={appendText}
                  onChange={(e) => setAppendText(e.target.value)}
                  placeholder="Paste another table..."
                  disabled={isExporting}
                  rows={1}
                  className="w-full md:flex-1 h-10 min-h-10 max-h-10 rounded-md border border-primary-light bg-white px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button
                  onClick={handleAppendTable}
                  disabled={isExporting || !appendText.trim()}
                  className="w-full md:w-auto h-10 px-4 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add table
                </Button>
              </div>
            </div>
          )}


          {localTables.length === 1 && (
            <div className="mt-6">
              {activeFormat === 'google_sheets' && exportDestination === 'local' ? (
                <div className="text-center text-xs text-secondary/60">
                  Switch to Google Drive to export as Google Sheets
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    onClick={() => handleExportSingle(activeFormat)}
                    disabled={isExporting}
                    className="h-10 px-6 bg-primary hover:bg-primary/90 text-white"
                  >
                    {exportDestination === 'google_drive'
                      ? `Export ${getFormatLabel(activeFormat)} to Google Drive`
                      : `Export ${getFormatLabel(activeFormat)}`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isResumingUpgrade && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/92 backdrop-blur-sm px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <h3 className="text-xl font-semibold text-secondary mb-2">Restoring your upgrade flow</h3>
            <p className="text-sm text-secondary/70">Please wait while we sign you in and open secure checkout.</p>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        trigger={showPwaPrompt}
        onClose={() => setShowPwaPrompt(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </motion.div>
  );
};
