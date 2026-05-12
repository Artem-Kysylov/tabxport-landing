import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Compare what the browser can see (RLS) vs real row count (service role).
 * Enable with FEATURE_REQUESTS_DIAGNOSTIC=true and SUPABASE_SERVICE_ROLE_KEY in .env.local — never commit the service key.
 */
export async function GET() {
  if (process.env.FEATURE_REQUESTS_DIAGNOSTIC !== 'true') {
    return NextResponse.json({
      enabled: false,
      hint:
        'Set FEATURE_REQUESTS_DIAGNOSTIC=true and SUPABASE_SERVICE_ROLE_KEY in .env.local, restart next dev, then run diagnostics again.',
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        enabled: true,
        error: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
      },
      { status: 400 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count, error: countError } = await admin
    .from('feature_requests')
    .select('*', { count: 'exact', head: true });

  const { data: rows, error: rowsError } = await admin
    .from('feature_requests')
    .select('id,title,votes_count')
    .order('votes_count', { ascending: false })
    .limit(10);

  let anonCount: number | null = null;
  let anonError: string | null = null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const anonClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const ac = await anonClient.from('feature_requests').select('*', { count: 'exact', head: true });
    anonCount = ac.count ?? null;
    anonError = ac.error?.message ?? null;
  }

  return NextResponse.json({
    enabled: true,
    supabaseHost: new URL(url).hostname,
    serviceRoleRowCount: countError ? null : count,
    serviceRoleError: countError?.message ?? null,
    anonApiRowCount: anonCount,
    anonApiError: anonError,
    sampleTitles: rowsError ? [] : (rows ?? []).map((r) => r.title),
    rowsError: rowsError?.message ?? null,
  });
}
