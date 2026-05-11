-- Migration: Create exports table for Export History feature
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.exports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  table_name  TEXT NOT NULL,
  data        JSONB NOT NULL,
  fix_stats   JSONB NOT NULL DEFAULT '{"markdown":0,"spaces":0,"numeric":0,"links":0}'::jsonb,
  source_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for efficient per-user queries sorted by date
CREATE INDEX IF NOT EXISTS exports_user_id_created_at_idx
  ON public.exports (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Users can only read their own exports
CREATE POLICY "exports: select own" ON public.exports
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own exports
CREATE POLICY "exports: insert own" ON public.exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own exports
CREATE POLICY "exports: delete own" ON public.exports
  FOR DELETE USING (auth.uid() = user_id);

-- Browser client uses the `authenticated` role
GRANT SELECT, INSERT, DELETE ON public.exports TO authenticated;

-- Reload PostgREST schema cache so the API sees the new table immediately
NOTIFY pgrst, 'reload schema';
