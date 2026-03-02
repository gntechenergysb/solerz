-- Migration script to upgrade Solerz from Malaysia-only to Global
-- Run this script in the Supabase SQL Editor safely. It will not drop any tables or users.

DO $$ 
BEGIN 
    -- 1. Add country parameter to profiles and profiles_public
    -- We assume the existing users are from Malaysia to preserve data context
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Malaysia';
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Malaysia';

    -- 2. Modify `listings` table for Multi-Currency and Global Location
    -- a) Rename price_rm to price if price_rm exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'listings' 
          AND column_name = 'price_rm'
    ) THEN
        ALTER TABLE public.listings RENAME COLUMN price_rm TO price;
    END IF;

    -- b) Add currency column, defaulting existing listings to MYR
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MYR';
    UPDATE public.listings SET currency = 'MYR' WHERE currency IS NULL;

    -- c) Add location_country to accompany location_state, defaulting to Malaysia
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'Malaysia';

    -- 3. Add country tracking to search logs
    -- 4. Update Search Events Table
    ALTER TABLE public.search_events
    ADD COLUMN IF NOT EXISTS country TEXT;

    -- 5. Update track_search_event function
    CREATE OR REPLACE FUNCTION public.track_search_event(
      p_search_query TEXT,
      p_category TEXT,
      p_country TEXT,
      p_state TEXT,
      p_condition TEXT,
      p_marketplace_layer TEXT
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      PERFORM public.check_rate_limit('rpc.track_search_event', 240, 60);

      INSERT INTO public.search_events (user_id, search_query, category, country, state, condition, marketplace_layer)
      VALUES (auth.uid(), p_search_query, p_category, p_country, p_state, p_condition, p_marketplace_layer);
    END;
    $$;

    REVOKE ALL ON FUNCTION public.track_search_event(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.track_search_event(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

END $$;
