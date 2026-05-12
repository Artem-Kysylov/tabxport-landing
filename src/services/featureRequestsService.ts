import { createClient } from '@/lib/supabase/client';
import { FeatureRequest } from '@/types/database';

const VOTED_KEY = 'tx_voted_features';

function getVotedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveVotedSet(set: Set<string>): void {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]));
  } catch {
    // ignore storage errors
  }
}

/** All feature IDs the browser has marked as upvoted (for restoring toggle state). */
export function getStoredVotedIds(): string[] {
  return [...getVotedSet()];
}

export function hasVoted(id: string): boolean {
  return getVotedSet().has(id);
}

export function markVoted(id: string): void {
  const set = getVotedSet();
  set.add(id);
  saveVotedSet(set);
}

export function unmarkVoted(id: string): void {
  const set = getVotedSet();
  set.delete(id);
  saveVotedSet(set);
}

export async function fetchFeatureRequests(): Promise<{
  data: FeatureRequest[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('feature_requests')
    .select('id,title,description,votes_count,status,created_at')
    .order('votes_count', { ascending: false });

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []) as FeatureRequest[];

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && rows.length === 0) {
    console.warn(
      '[feature_requests] Loaded 0 rows with no error — empty table, wrong Supabase project in .env, or RLS blocking anon/authenticated. Run database/feature-requests-ensure-policies.sql',
    );
  }

  return { data: rows, error: null };
}

/**
 * Atomically change vote total via RPC (`database/feature-requests-vote-rpc.sql`).
 * Returns the new count from the database.
 */
export async function adjustFeatureRequestVotes(
  id: string,
  delta: 1 | -1
): Promise<{ newCount: number | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('adjust_feature_request_votes', {
    target_id: id,
    delta,
  });

  if (error) {
    return { newCount: null, error: error.message };
  }

  if (data === null || data === -1) {
    return { newCount: null, error: 'Feature not found' };
  }

  return { newCount: data as number, error: null };
}

export async function submitFeatureRequest(params: {
  title: string;
  description: string;
}): Promise<{ data: FeatureRequest | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('feature_requests')
    .insert({ title: params.title.trim(), description: params.description.trim() })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FeatureRequest, error: null };
}
