-- Atomic vote adjustments (avoids race conditions vs client-side counts)
-- Run in Supabase SQL Editor after feature_requests table exists.

CREATE OR REPLACE FUNCTION public.adjust_feature_request_votes(target_id uuid, delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.feature_requests
  SET votes_count = GREATEST(0, votes_count + delta)
  WHERE id = target_id
  RETURNING votes_count INTO new_count;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.adjust_feature_request_votes(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.adjust_feature_request_votes(uuid, integer) TO authenticated;

NOTIFY pgrst, 'reload schema';
