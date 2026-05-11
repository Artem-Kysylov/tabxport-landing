'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronUp,
  Plus,
  X,
  Sparkles,
  Lightbulb,
  Loader2,
  Map,
} from 'lucide-react';
import { toast } from 'sonner';
import { FeatureRequest, FeatureRequestStatus } from '@/types/database';
import {
  fetchFeatureRequests,
  adjustFeatureRequestVotes,
  getStoredVotedIds,
  markVoted,
  unmarkVoted,
  submitFeatureRequest,
} from '@/services/featureRequestsService';
import { isFeatureRequestsTableMissingError } from '@/lib/supabaseMissingTableErrors';

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const STATUS_CONFIG: Record<FeatureRequestStatus, StatusConfig> = {
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  'Planned': {
    label: 'Planned',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-primary-light/60',
    text: 'text-primary',
    border: 'border-primary/30',
    dot: 'bg-primary',
  },
  'Completed': {
    label: 'Completed',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
};

function StatusBadge({ status }: { status: FeatureRequestStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Under Review'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold
        ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Suggest Feature Modal ─────────────────────────────────────────────────────

interface SuggestModalProps {
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isSubmitting: boolean;
}

function SuggestModal({ onClose, onSubmit, isSubmitting }: SuggestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, description);
  };

  const isValid = title.trim().length >= 3;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4
          bg-secondary/30 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-2xl border border-secondary/[0.08]
            bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-secondary/[0.07]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light/50">
                <Lightbulb size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-secondary">Suggest a Feature</h2>
                <p className="text-xs text-secondary/50">Share what you&apos;d like us to build</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary/40
                hover:text-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-1.5" htmlFor="fr-title">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                ref={titleRef}
                id="fr-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Airtable Integration"
                maxLength={120}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-secondary/15 bg-white px-4 py-2.5 text-sm text-secondary
                  placeholder:text-secondary/35 focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary/40 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-1.5" htmlFor="fr-desc">
                Description
              </label>
              <textarea
                id="fr-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about your use case…"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
                className="w-full resize-none rounded-xl border border-secondary/15 bg-white px-4 py-2.5 text-sm text-secondary
                  placeholder:text-secondary/35 focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary/40 transition-all disabled:opacity-60"
              />
              <p className="mt-1 text-right text-[11px] text-secondary/35">{description.length}/500</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-secondary/15 px-4 py-2.5 text-sm font-semibold
                  text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-colors
                  cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold
                  text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer shadow-sm hover:shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Submit Idea
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  feature: FeatureRequest;
  voted: boolean;
  onVote: (id: string) => void;
}

function FeatureCard({ feature, voted, onVote }: FeatureCardProps) {
  return (
    <motion.div
      layout
      layoutId={feature.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex h-full flex-col rounded-2xl border p-5 transition-all duration-200 backdrop-blur-sm
        bg-white/75 hover:shadow-lg hover:border-primary/20
        ${voted ? 'border-primary/40 bg-primary-light/15 shadow-[0_12px_40px_-16px_rgba(27,147,88,0.35)]' : 'border-secondary/[0.09]'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => onVote(feature.id)}
          title={voted ? 'Remove your vote' : 'Upvote this feature'}
          className={`flex flex-col items-center gap-1 rounded-xl border min-w-[64px] px-3 py-2.5
            transition-all duration-200 cursor-pointer select-none
            ${
              voted
                ? 'border-primary bg-primary text-white shadow-[0_0_24px_rgba(27,147,88,0.55)] ring-2 ring-primary/40 ring-offset-2 ring-offset-white hover:bg-primary/92'
                : 'border-secondary/15 bg-white text-secondary/65 hover:border-primary/45 hover:text-primary hover:bg-primary-light/35 hover:shadow-[0_0_14px_rgba(27,147,88,0.2)]'
            }`}
        >
          <ChevronUp size={18} className="flex-shrink-0" strokeWidth={2.5} />
          <span className="text-base font-bold leading-none tabular-nums">{feature.votes_count}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">votes</span>
        </button>
        <StatusBadge status={feature.status} />
      </div>

      <h3 className="text-lg font-bold text-secondary leading-snug mb-2">{feature.title}</h3>
      {feature.description ? (
        <p className="text-sm text-secondary/55 leading-relaxed flex-1">{feature.description}</p>
      ) : null}
    </motion.div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ features }: { features: FeatureRequest[] }) {
  const counts = features.reduce<Record<FeatureRequestStatus, number>>(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }),
    { 'Under Review': 0, Planned: 0, 'In Progress': 0, Completed: 0 }
  );

  return (
    <div className="flex flex-wrap gap-3">
      {(Object.entries(STATUS_CONFIG) as [FeatureRequestStatus, StatusConfig][]).map(([status, cfg]) => (
        <div
          key={status}
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold
            ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {counts[status]} {cfg.label}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function parsePublicSupabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagText, setDiagText] = useState<string | null>(null);

  const supabaseHost = parsePublicSupabaseHost();

  const runDiagnostics = useCallback(async () => {
    setDiagBusy(true);
    setDiagText(null);
    try {
      const response = await fetch('/api/feature-requests/diagnostic');
      const payload: unknown = await response.json();

      if (
        payload &&
        typeof payload === 'object' &&
        'enabled' in payload &&
        (payload as { enabled: unknown }).enabled === false
      ) {
        const hint =
          typeof (payload as { hint?: unknown }).hint === 'string'
            ? ((payload as { hint?: unknown }).hint as string)
            : 'Diagnostics are disabled on the server.';
        setDiagText(
          JSON.stringify({ enabled: false, explanation: hint }, null, 2),
        );
        toast.message(hint, { duration: 8000 });
        return;
      }

      setDiagText(JSON.stringify(payload, null, 2));
      if (
        payload &&
        typeof payload === 'object' &&
        'enabled' in payload &&
        payload.enabled === true &&
        'serviceRoleRowCount' in payload &&
        typeof (payload as { serviceRoleRowCount: unknown }).serviceRoleRowCount === 'number' &&
        'anonApiRowCount' in payload &&
        typeof (payload as { anonApiRowCount: unknown }).anonApiRowCount === 'number'
      ) {
        const sr = (payload as { serviceRoleRowCount: number }).serviceRoleRowCount;
        const an = (payload as { anonApiRowCount: number }).anonApiRowCount;
        if (sr > 0 && an === 0) {
          toast.message(
            'Database has rows, but the public API sees none — run database/feature-requests-ensure-policies.sql in Supabase.',
            { duration: 8000 },
          );
        }
      }
    } catch {
      setDiagText('Diagnostic request failed');
      toast.error('Could not load diagnostics');
    } finally {
      setDiagBusy(false);
    }
  }, []);

  useEffect(() => {
    setVotedIds(new Set(getStoredVotedIds()));
  }, []);

  const loadFeatures = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    const { data, error } = await fetchFeatureRequests();
    if (error) {
      setFetchError(error);
      toast.error('Failed to load features');
    } else {
      setFeatures(data ?? []);
    }
    setIsFetching(false);
  }, []);

  useEffect(() => {
    void loadFeatures();
  }, [loadFeatures]);

  const handleVote = useCallback(async (id: string) => {
    const wasVoted = votedIds.has(id);
    const delta: 1 | -1 = wasVoted ? -1 : 1;

    setFeatures((prev) =>
      [...prev]
        .map((f) =>
          f.id === id ? { ...f, votes_count: Math.max(0, f.votes_count + delta) } : f
        )
        .sort((a, b) => b.votes_count - a.votes_count)
    );
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (wasVoted) next.delete(id);
      else next.add(id);
      return next;
    });

    const { newCount, error } = await adjustFeatureRequestVotes(id, delta);

    if (error) {
      toast.error('Could not save vote. Run the vote RPC migration if this persists.');
      const rev = (-delta) as 1 | -1;
      setFeatures((prev) =>
        [...prev]
          .map((f) =>
            f.id === id ? { ...f, votes_count: Math.max(0, f.votes_count + rev) } : f
          )
          .sort((a, b) => b.votes_count - a.votes_count)
      );
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (wasVoted) next.add(id);
        else next.delete(id);
        return next;
      });
      return;
    }

    if (newCount !== null) {
      setFeatures((prev) =>
        [...prev]
          .map((f) => (f.id === id ? { ...f, votes_count: newCount } : f))
          .sort((a, b) => b.votes_count - a.votes_count)
      );
    }

    if (wasVoted) unmarkVoted(id);
    else markVoted(id);
  }, [votedIds]);

  const handleSuggestSubmit = useCallback(async (title: string, description: string) => {
    setIsSubmitting(true);
    const { data, error } = await submitFeatureRequest({ title, description });
    setIsSubmitting(false);

    if (error || !data) {
      toast.error(error ?? 'Failed to submit. Please try again.');
      return;
    }

    setFeatures((prev) => [...prev, data].sort((a, b) => b.votes_count - a.votes_count));
    setShowModal(false);
    toast.success('Feature idea submitted! Thanks for the suggestion.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/10 via-white to-white">
      <div className="container-custom py-10 md:py-14">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-secondary/50 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        {/* Page header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light/50">
                <Map size={20} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary">
                Roadmap &amp; Feature Requests
              </h1>
            </div>
            <p className="text-secondary/50 text-base ml-[52px]">
              Vote for what we build next. Your voice shapes the product.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold
              text-white shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            Suggest a Feature
          </button>
        </div>

        {/* Status legend */}
        {features.length > 0 && !isFetching && (
          <div className="mb-6">
            <StatsStrip features={features} />
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">

          {/* Loading */}
          {isFetching && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-primary/50" />
              <p className="text-sm text-secondary/40">Loading feature requests…</p>
            </div>
          )}

          {/* Error */}
          {!isFetching && fetchError && (
            <div className="rounded-2xl border border-destructive/20 bg-red-50/40 px-6 py-8 text-center max-w-xl mx-auto">
              {isFeatureRequestsTableMissingError(fetchError) ? (
                <>
                  <p className="text-base font-semibold text-secondary mb-2">
                    Database setup required
                  </p>
                  <p className="text-sm text-secondary/70 leading-relaxed mb-4">
                    The roadmap table (
                    <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">
                      public.feature_requests
                    </code>
                    ) is missing in your Supabase project.
                  </p>
                  <ol className="text-left text-sm text-secondary/75 space-y-2 list-decimal list-inside mb-4">
                    <li>Open Supabase Dashboard → <strong>SQL Editor</strong>.</li>
                    <li>
                      Run <code className="rounded bg-white/80 px-1 py-0.5 text-xs">database/feature-requests-table.sql</code> from this repo.
                    </li>
                    <li>Click Try again below.</li>
                  </ol>
                  <button
                    type="button"
                    onClick={loadFeatures}
                    className="text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-destructive mb-3">{fetchError}</p>
                  <button
                    type="button"
                    onClick={loadFeatures}
                    className="text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Empty — encourage seed + suggest (grid loads after data exists) */}
          {!isFetching && !fetchError && features.length === 0 && (
            <div className="rounded-2xl border border-dashed border-secondary/20 bg-white/50 px-8 py-14 text-center max-w-xl mx-auto">
              <Lightbulb size={40} className="text-primary/35 mx-auto mb-4" />
              <p className="text-secondary font-semibold mb-2">No roadmap cards yet</p>
              <p className="text-sm text-secondary/50 mb-4 leading-relaxed">
                Run the seed script in Supabase, or suggest the first feature—new ideas appear in the grid immediately
                after submit.
              </p>
              {supabaseHost ? (
                <p className="text-xs text-secondary/45 mb-4 font-mono break-all">
                  App Supabase host: <span className="text-secondary/70">{supabaseHost}</span>
                  <span className="block mt-1 text-secondary/35 font-sans">
                    Must match the project where you ran SQL (Dashboard → Settings → API → Project URL).
                  </span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white
                  shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                Suggest a Feature
              </button>
              <div className="mt-8 pt-6 border-t border-secondary/10 text-left text-xs text-secondary/45 leading-relaxed space-y-3">
                <p className="font-semibold text-secondary/55 uppercase tracking-wide">Admin checklist</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Table + policies:{' '}
                    <code className="rounded bg-secondary/5 px-1 py-0.5">database/feature-requests-table.sql</code>
                  </li>
                  <li>
                    Seed rows:{' '}
                    <code className="rounded bg-secondary/5 px-1 py-0.5">database/feature-requests-seed.sql</code>
                  </li>
                  <li>
                    Vote RPC:{' '}
                    <code className="rounded bg-secondary/5 px-1 py-0.5">database/feature-requests-vote-rpc.sql</code>
                  </li>
                  <li>
                    <strong>If Supabase Table Editor shows rows but this page stays empty:</strong> run{' '}
                    <code className="rounded bg-secondary/5 px-1 py-0.5">database/feature-requests-ensure-policies.sql</code>{' '}
                    (fixes RLS / schema grants), then reload.
                  </li>
                </ol>
                <button
                  type="button"
                  disabled={diagBusy}
                  onClick={runDiagnostics}
                  className="mt-2 text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                >
                  {diagBusy ? 'Checking…' : 'Compare database vs public API (dev)'}
                </button>
                <p className="text-secondary/35">
                  Set{' '}
                  <code className="rounded bg-secondary/5 px-1 py-0.5">FEATURE_REQUESTS_DIAGNOSTIC=true</code> and{' '}
                  <code className="rounded bg-secondary/5 px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> in{' '}
                  <code className="rounded bg-secondary/5 px-1 py-0.5">.env.local</code>, restart{' '}
                  <code className="rounded bg-secondary/5 px-1 py-0.5">npm run dev</code>, then click the button above.
                </p>
                {diagText ? (
                  <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-secondary/[0.04] p-3 text-[11px] text-secondary/70 whitespace-pre-wrap">
                    {diagText}
                  </pre>
                ) : null}
              </div>
            </div>
          )}

          {/* Feature grid */}
          {!isFetching && !fetchError && features.length > 0 && (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {features.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    voted={votedIds.has(feature.id)}
                    onVote={handleVote}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-10 flex items-center gap-2 text-xs text-secondary/35 justify-center">
          <Sparkles size={12} className="text-primary/50" />
          <span>All votes are anonymous. You can change your vote at any time.</span>
        </div>
      </div>

      {/* Suggest Modal */}
      {showModal && (
        <SuggestModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSuggestSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
