-- Fix empty API responses when rows exist in Table Editor (RLS / grants)
-- Run in Supabase SQL Editor on the SAME project as NEXT_PUBLIC_SUPABASE_URL

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

GRANT SELECT, INSERT, UPDATE ON public.feature_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.feature_requests TO authenticated;

NOTIFY pgrst, 'reload schema';
