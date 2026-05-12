-- Migration: Roadmap / Feature Requests (anonymous read + vote + suggest)
-- Run once in Supabase → SQL Editor for the project used by NEXT_PUBLIC_SUPABASE_URL

CREATE TABLE IF NOT EXISTS public.feature_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  votes_count INTEGER NOT NULL DEFAULT 0 CHECK (votes_count >= 0),
  status      TEXT NOT NULL DEFAULT 'Under Review',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT feature_requests_status_check CHECK (
    status IN ('Under Review', 'Planned', 'In Progress', 'Completed')
  )
);

CREATE INDEX IF NOT EXISTS feature_requests_votes_created_idx
  ON public.feature_requests (votes_count DESC, created_at DESC);

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_requests_select_public" ON public.feature_requests;
CREATE POLICY "feature_requests_select_public"
  ON public.feature_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "feature_requests_insert_public" ON public.feature_requests;
CREATE POLICY "feature_requests_insert_public"
  ON public.feature_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "feature_requests_update_public" ON public.feature_requests;
CREATE POLICY "feature_requests_update_public"
  ON public.feature_requests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Browser client uses anon (logged out) or authenticated JWT
GRANT SELECT, INSERT, UPDATE ON public.feature_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.feature_requests TO authenticated;

NOTIFY pgrst, 'reload schema';

-- Next steps (same project):
--   database/feature-requests-vote-rpc.sql  → atomic votes
--   database/feature-requests-seed.sql      → default roadmap cards
