'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileX,
  LayoutList,
  LayoutGrid,
  Trash2,
  ExternalLink,
  Shield,
  Lock,
  LogIn,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { fetchExports, deleteExport } from '@/services/exportHistoryService';
import { ExportRecord, ExportFixStats } from '@/types/database';
import { ParsedTable } from '@/types/table';
import { isExportsTableMissingError } from '@/lib/supabaseMissingTableErrors';

type ViewMode = 'list' | 'card';

const STORAGE_KEY = 'tx_parsed_tables_cache';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function sumFixes(stats: ExportFixStats): number {
  return stats.markdown + stats.spaces + stats.numeric + stats.links;
}

function FixStatsBadges({ stats }: { stats: ExportFixStats }) {
  const total = sumFixes(stats);
  if (total === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-semibold text-green-700">
        Clean
      </span>
    );
  }
  const badges = [
    stats.markdown > 0 && { label: `${stats.markdown} md`, title: 'Markdown artifacts removed' },
    stats.numeric > 0 && { label: `${stats.numeric} num`, title: 'Numeric values normalized' },
    stats.spaces > 0 && { label: `${stats.spaces} sp`, title: 'Noise/spaces cleaned' },
    stats.links > 0 && { label: `${stats.links} lnk`, title: 'Link artifacts cleaned' },
  ].filter(Boolean) as { label: string; title: string }[];

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          title={b.title}
          className="inline-flex items-center rounded-full bg-primary-light/60 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-secondary/80"
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function MiniTablePreview({ data }: { data: ExportRecord['data'] }) {
  const headers = data.headers.slice(0, 4);
  const rows = data.rows.slice(0, 3);
  const truncatedHeaders = headers.length < data.headers.length;

  return (
    <div className="overflow-hidden rounded-lg border border-secondary/10">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-primary">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-2 py-1.5 text-left font-semibold text-white truncate max-w-[80px]"
              >
                {h}
              </th>
            ))}
            {truncatedHeaders && (
              <th className="px-2 py-1.5 text-left font-semibold text-white/60">…</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}>
              {headers.map((_, ci) => (
                <td key={ci} className="px-2 py-1.5 text-secondary/70 truncate max-w-[80px]">
                  {row[ci] ?? ''}
                </td>
              ))}
              {truncatedHeaders && <td className="px-2 py-1.5 text-secondary/30">…</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light/40 border border-primary/20">
        <FileX size={36} className="text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold text-secondary mb-2">No exports yet</h3>
      <p className="text-secondary/50 text-sm max-w-xs leading-relaxed mb-8">
        Your saved exports will appear here. Start by pasting a table and exporting it.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white
          shadow-md hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
      >
        Start Exporting
      </Link>
    </motion.div>
  );
}

function SignInPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light/40 border border-primary/20">
        <LogIn size={36} className="text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold text-secondary mb-2">Sign in to view history</h3>
      <p className="text-secondary/50 text-sm max-w-xs leading-relaxed mb-8">
        Your export history is tied to your account. Sign in with Google to access it.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white
          shadow-md hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
      >
        Go to App & Sign In
      </Link>
    </motion.div>
  );
}

interface HistoryCardProps {
  record: ExportRecord;
  onReopen: (record: ExportRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function HistoryCard({ record, onReopen, onDelete, isDeleting }: HistoryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-2xl border border-secondary/10 bg-white/70
        backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30
        transition-all duration-200 overflow-hidden"
    >
      {/* Table preview */}
      <div className="p-4 pb-3 overflow-hidden">
        <MiniTablePreview data={record.data} />
      </div>

      {/* Info */}
      <div className="flex-1 px-4 pb-3">
        <h4 className="text-sm font-bold text-secondary truncate mb-1">{record.table_name}</h4>
        <div className="flex items-center gap-1.5 text-xs text-secondary/45 mb-3">
          <Clock size={11} />
          <span>{formatDate(record.created_at)}</span>
        </div>
        <FixStatsBadges stats={record.fix_stats} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-secondary/[0.07] bg-secondary/[0.015]">
        <button
          type="button"
          onClick={() => onReopen(record)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2
            text-xs font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <ExternalLink size={12} />
          Open in Editor
        </button>
        <button
          type="button"
          onClick={() => onDelete(record.id)}
          disabled={isDeleting}
          className="flex items-center justify-center rounded-lg border border-secondary/15 bg-white p-2
            text-secondary/50 hover:text-destructive hover:border-destructive/40 hover:bg-red-50
            transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

interface HistoryRowProps {
  record: ExportRecord;
  onReopen: (record: ExportRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function HistoryRow({ record, onReopen, onDelete, isDeleting }: HistoryRowProps) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="group border-b border-secondary/[0.07] hover:bg-primary-light/20 transition-colors"
    >
      <td className="px-5 py-3.5">
        <span className="text-sm font-semibold text-secondary">{record.table_name}</span>
        <p className="text-xs text-secondary/40 mt-0.5">
          {record.data.rows.length} rows × {record.data.headers.length} cols
        </p>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-secondary/50">
          <Clock size={11} />
          {formatDate(record.created_at)}
        </div>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell">
        <FixStatsBadges stats={record.fix_stats} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onReopen(record)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold
              text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <ExternalLink size={12} />
            Open
          </button>
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            disabled={isDeleting}
            className="flex items-center justify-center rounded-lg border border-secondary/15 p-1.5
              text-secondary/40 hover:text-destructive hover:border-destructive/30 hover:bg-red-50
              transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useGoogleAuth();

  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('card');

  const loadExports = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    const { data, error } = await fetchExports();
    if (error) {
      setFetchError(error);
      toast.error('Failed to load export history');
    } else {
      setExports(data ?? []);
    }
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void loadExports();
    }
  }, [loading, isAuthenticated, loadExports]);

  const handleReopen = useCallback(
    (record: ExportRecord) => {
      const table: ParsedTable = {
        id: `tbl_history_${Date.now()}`,
        name: record.table_name,
        data: {
          headers: record.data.headers,
          rows: record.data.rows,
        },
        rowCount: record.data.rows.length,
        columnCount: record.data.headers.length,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([table]));
      } catch {
        // ignore storage errors
      }

      router.push('/');
    },
    [router]
  );

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    // Optimistic update
    setExports((prev) => prev.filter((e) => e.id !== id));

    const { error } = await deleteExport(id);
    if (error) {
      toast.error('Failed to delete export');
      // Reload to restore state
      void loadExports();
    } else {
      toast.success('Export deleted');
    }
    setDeletingId(null);
  }, [loadExports]);

  const totalFixes = useMemo(
    () => exports.reduce((acc, e) => acc + sumFixes(e.fix_stats), 0),
    [exports]
  );

  const isLoading = loading || isFetching;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/10 via-white to-white">
      <div className="container-custom py-10 md:py-14">

        {/* Page header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-secondary/50 hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-1">Export History</h1>
              {exports.length > 0 && (
                <p className="text-sm text-secondary/50">
                  {exports.length} {exports.length === 1 ? 'export' : 'exports'}
                  {totalFixes > 0 && ` · ${totalFixes} total fixes applied`}
                </p>
              )}
            </div>

            {/* View toggle */}
            {exports.length > 0 && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/[0.05] border border-secondary/10">
                <button
                  type="button"
                  onClick={() => setView('card')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    view === 'card'
                      ? 'bg-white text-secondary shadow-sm border border-secondary/10'
                      : 'text-secondary/50 hover:text-secondary'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Card View
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    view === 'list'
                      ? 'bg-white text-secondary shadow-sm border border-secondary/10'
                      : 'text-secondary/50 hover:text-secondary'
                  }`}
                >
                  <LayoutList size={14} />
                  List View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-2xl border border-secondary/[0.08] bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm text-secondary/40">Loading your exports…</p>
            </div>
          )}

          {/* Auth check */}
          {!isLoading && !isAuthenticated && <SignInPrompt />}

          {/* Error state */}
          {!isLoading && isAuthenticated && fetchError && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4 max-w-lg mx-auto">
              {isExportsTableMissingError(fetchError) ? (
                <>
                  <p className="text-base font-semibold text-secondary">
                    Database setup required
                  </p>
                  <p className="text-sm text-secondary/70 leading-relaxed">
                    The Export History table (<code className="rounded bg-secondary/5 px-1.5 py-0.5 text-xs">public.exports</code>)
                    is not in your Supabase project yet, so the API cannot load anything.
                  </p>
                  <ol className="text-left text-sm text-secondary/75 space-y-2 list-decimal list-inside w-full">
                    <li>Open the Supabase Dashboard for this app → <strong>SQL Editor</strong>.</li>
                    <li>
                      Run the migration script from{' '}
                      <code className="rounded bg-secondary/5 px-1.5 py-0.5 text-xs">database/exports-table.sql</code>{' '}
                      in the repo (copy/paste the full file, then Run).
                    </li>
                    <li>Reload this page or tap Try again below.</li>
                  </ol>
                  <button
                    type="button"
                    onClick={loadExports}
                    className="text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-destructive">{fetchError}</p>
                  <button
                    type="button"
                    onClick={loadExports}
                    className="text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && isAuthenticated && !fetchError && exports.length === 0 && (
            <EmptyState />
          )}

          {/* Card View */}
          {!isLoading && isAuthenticated && !fetchError && exports.length > 0 && view === 'card' && (
            <div className="p-5 md:p-6">
              <AnimatePresence mode="popLayout">
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {exports.map((record) => (
                    <HistoryCard
                      key={record.id}
                      record={record}
                      onReopen={handleReopen}
                      onDelete={handleDelete}
                      isDeleting={deletingId === record.id}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* List View */}
          {!isLoading && isAuthenticated && !fetchError && exports.length > 0 && view === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary/10 bg-secondary/[0.02]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-secondary/50 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-secondary/50 uppercase tracking-wide hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-secondary/50 uppercase tracking-wide hidden md:table-cell">
                      Fix Stats
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-secondary/50 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {exports.map((record) => (
                      <HistoryRow
                        key={record.id}
                        record={record}
                        onReopen={handleReopen}
                        onDelete={handleDelete}
                        isDeleting={deletingId === record.id}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy / legal notice */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-light/20 px-5 py-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Shield size={16} className="text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Lock size={12} className="text-primary/70" />
              <span className="text-xs font-semibold text-secondary/70 uppercase tracking-wide">
                Privacy &amp; Security
              </span>
            </div>
            <p className="text-sm text-secondary/60 leading-relaxed">
              Your data is securely stored and encrypted. Only you can access your export history.
              We never share or process your table data for any purpose other than displaying it back to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
