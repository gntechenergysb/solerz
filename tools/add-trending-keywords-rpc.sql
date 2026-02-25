-- ==============================================================================
-- SQL Patch: Add get_trending_keywords RPC
-- Instructions: Run this script directly in your Supabase SQL Editor.
-- This adds the new RPC without affecting any existing tables or data.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_trending_keywords(
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 3,
  p_min_count INT DEFAULT 2
)
RETURNS TABLE(keyword TEXT, searches BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    LOWER(TRIM(se.search_query)) AS keyword,
    COUNT(*)::BIGINT AS searches
  FROM public.search_events se
  WHERE se.created_at >= (NOW() - make_interval(days => GREATEST(p_days, 1)))
    AND se.search_query IS NOT NULL
    AND btrim(se.search_query) <> ''
  GROUP BY 1
  HAVING COUNT(*) >= p_min_count
  ORDER BY searches DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_trending_keywords(INT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_trending_keywords(INT, INT, INT) TO anon, authenticated;
