-- ################################################
-- SOLERZ SUPABASE SETUP SCRIPT - V3.2 (Robust & Clean)
-- ################################################

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. 商家/个人资料表 (Profiles)
-- 我们添加 'IF NOT EXISTS'，但为了确保所有列都在，我们在下面会补充检查
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles_public'
      AND c.relkind IN ('v', 'm')
  ) THEN
    EXECUTE 'DROP VIEW IF EXISTS public.profiles_public CASCADE';
    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.profiles_public CASCADE';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles_public (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    company_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    seller_type TEXT DEFAULT 'INDIVIDUAL',
    handphone_no TEXT,
    business_address TEXT,
    ssm_new_no TEXT,
    ssm_old_no TEXT,
    ssm_no TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'INDIVIDUAL';
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS handphone_no TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS business_address TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS ssm_new_no TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS ssm_old_no TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS ssm_no TEXT;
    ALTER TABLE public.profiles_public ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- 2. 确保所有必要字段存在 (Defensive Column check)
-- 这一步非常重要，因为如果使用的是 Supabase 模板，profiles 表可能已经存在但只包含基础字段
-- 这段代码会填充所有缺失的 KYC 字段，确保 "schema mismatch" 错误不会发生
DO $$ 
BEGIN 
    -- 基础配置
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'INDIVIDUAL';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handphone_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'UNSUBSCRIBED';
    ALTER TABLE public.profiles ALTER COLUMN tier SET DEFAULT 'UNSUBSCRIBED';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'SELLER';

    -- 核心 KYC 字段
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_new_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_old_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS incorporation_date DATE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nature_of_business TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_file_path TEXT;
    
    -- 兼容性字段 (解决 "Column ssm_no does not exist" 错误)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_no TEXT;
END $$;

-- 3. 产品列表表 (Listings)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    condition TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    price_rm DECIMAL(12, 2) NOT NULL,
    location_state TEXT NOT NULL,
    images_url TEXT[] DEFAULT '{}',
    is_verified_listing BOOLEAN DEFAULT FALSE,
    active_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    archive_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    is_sold BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS condition TEXT;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.listing_view_events (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    bucket BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id, bucket)
);

CREATE TABLE IF NOT EXISTS public.search_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    search_query TEXT,
    category TEXT,
    state TEXT,
    condition TEXT,
    marketplace_layer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_events_created_at ON public.search_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_category_created_at ON public.search_events (category, created_at DESC);

CREATE TABLE IF NOT EXISTS public.listing_contact_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_contact_events_listing_created_at ON public.listing_contact_events (listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_contact_events_created_at ON public.listing_contact_events (created_at DESC);

CREATE TABLE IF NOT EXISTS public.saved_listings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
    actor_key TEXT NOT NULL,
    action TEXT NOT NULL,
    bucket BIGINT NOT NULL,
    hits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (actor_key, action, bucket)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_seller_public_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.listings
      ADD CONSTRAINT listings_seller_public_fkey
      FOREIGN KEY (seller_id)
      REFERENCES public.profiles_public(id)
      ON DELETE CASCADE
      NOT VALID;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

-- ################################################
-- 自动化流程 (Triggers & Functions)
-- ################################################

-- A. 处理新用户注册
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name, seller_type, role, tier, handphone_no)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'seller_type', 'INDIVIDUAL'),
    CASE
      WHEN upper(COALESCE(NEW.raw_user_meta_data->>'role', 'SELLER')) = 'BUYER' THEN 'BUYER'
      ELSE 'SELLER'
    END,
    CASE
      WHEN upper(COALESCE(NEW.raw_user_meta_data->>'role', 'SELLER')) = 'BUYER' THEN 'UNSUBSCRIBED'
      ELSE 'UNSUBSCRIBED'
    END,
    NEW.raw_user_meta_data->>'handphone_no'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_max_hits INT,
  p_window_seconds INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor TEXT;
  rl_bucket BIGINT;
  new_hits INT;
BEGIN
  actor := COALESCE(auth.uid()::text, 'anon');
  rl_bucket := floor(extract(epoch from now()) / p_window_seconds);

  INSERT INTO public.rate_limit_buckets (actor_key, action, bucket, hits)
  VALUES (actor, p_action, rl_bucket, 1)
  ON CONFLICT (actor_key, action, bucket)
  DO UPDATE SET hits = public.rate_limit_buckets.hits + 1
  RETURNING hits INTO new_hits;

  IF new_hits > p_max_hits THEN
    RAISE EXCEPTION 'rate limit exceeded';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.renew_listing(p_listing_id UUID)
RETURNS TABLE(active_until TIMESTAMPTZ, archive_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT l.seller_id INTO owner_id
  FROM public.listings l
  WHERE l.id = p_listing_id;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'listing not found';
  END IF;

  IF owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.renew_listing', 5, 86400);

  PERFORM set_config('solerz.internal_listing_renew', 'true', true);

  UPDATE public.listings
  SET active_until = NOW() + INTERVAL '30 days',
      archive_until = NOW() + INTERVAL '30 days',
      updated_at = NOW()
  WHERE id = p_listing_id
  RETURNING public.listings.active_until, public.listings.archive_until
  INTO active_until, archive_until;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.renew_listing(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.renew_listing(UUID) TO authenticated;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. 自动同步认证状态
CREATE OR REPLACE FUNCTION public.set_listing_details_v2()
RETURNS TRIGGER AS $$
DECLARE
    seller_verified BOOLEAN;
BEGIN
    NEW.active_until := NOW() + INTERVAL '30 days';
    NEW.archive_until := NOW() + INTERVAL '30 days';
    SELECT is_verified INTO seller_verified FROM public.profiles WHERE id = NEW.seller_id;
    NEW.is_verified_listing := COALESCE(seller_verified, FALSE);
    NEW.view_count := 0;
    NEW.created_at := NOW();
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_listing_details ON public.listings;
CREATE TRIGGER trg_set_listing_details
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.set_listing_details_v2();

-- C. 浏览量
CREATE OR REPLACE FUNCTION public.increment_view_count(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    view_bucket BIGINT;
    rows_inserted INT;
BEGIN
    IF auth.uid() IS NULL THEN
        UPDATE public.listings SET view_count = view_count + 1 WHERE id = listing_id;
        RETURN;
    END IF;

    PERFORM public.check_rate_limit('rpc.increment_view_count', 120, 60);

    view_bucket := floor(extract(epoch from now()) / 3600);

    INSERT INTO public.listing_view_events (user_id, listing_id, bucket)
    VALUES (auth.uid(), listing_id, view_bucket)
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS rows_inserted = ROW_COUNT;
    IF rows_inserted > 0 THEN
        PERFORM set_config('solerz.internal_view_update', 'true', true);
        UPDATE public.listings SET view_count = view_count + 1 WHERE id = listing_id;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_view_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_search_event(
  p_search_query TEXT,
  p_category TEXT,
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

  INSERT INTO public.search_events (user_id, search_query, category, state, condition, marketplace_layer)
  VALUES (auth.uid(), p_search_query, p_category, p_state, p_condition, p_marketplace_layer);
END;
$$;

REVOKE ALL ON FUNCTION public.track_search_event(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_search_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_listing_contact_event(
  p_listing_id UUID,
  p_action TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.check_rate_limit('rpc.track_listing_contact_event', 180, 60);

  IF p_action IS NULL OR p_action NOT IN ('whatsapp', 'phone_reveal', 'email') THEN
    RETURN;
  END IF;

  INSERT INTO public.listing_contact_events (user_id, listing_id, action)
  VALUES (auth.uid(), p_listing_id, p_action);
END;
$$;

REVOKE ALL ON FUNCTION public.track_listing_contact_event(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_listing_contact_event(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_market_demand(p_days INT DEFAULT 7)
RETURNS TABLE(category TEXT, searches BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(se.category, '') AS category,
    COUNT(*)::BIGINT AS searches
  FROM public.search_events se
  WHERE se.created_at >= (NOW() - make_interval(days => GREATEST(p_days, 1)))
    AND se.category IS NOT NULL
    AND btrim(se.category) <> ''
  GROUP BY 1
  ORDER BY searches DESC;
$$;

REVOKE ALL ON FUNCTION public.get_market_demand(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_market_demand(INT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_seller_funnel(p_seller_id UUID, p_days INT DEFAULT 7)
RETURNS TABLE(impressions BIGINT, views BIGINT, contacts BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT (NOW() - make_interval(days => GREATEST(p_days, 1))) AS since
  )
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.search_events se, win w WHERE se.created_at >= w.since) AS impressions,
    (SELECT COUNT(*)::BIGINT
     FROM public.listing_view_events ve
     JOIN public.listings l ON l.id = ve.listing_id
     JOIN win w ON TRUE
     WHERE l.seller_id = p_seller_id
       AND ve.created_at >= w.since) AS views,
    (SELECT COUNT(*)::BIGINT
     FROM public.listing_contact_events ce
     JOIN public.listings l ON l.id = ce.listing_id
     JOIN win w ON TRUE
     WHERE l.seller_id = p_seller_id
       AND ce.created_at >= w.since) AS contacts;
$$;

REVOKE ALL ON FUNCTION public.get_seller_funnel(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_seller_funnel(UUID, INT) TO anon, authenticated;

-- ################################################
-- 安全策略 (RLS)
-- ################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles_public ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_view_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_contact_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert search events" ON public.search_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert contact events" ON public.listing_contact_events
FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'ADMIN'
  );
$$;

REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC;
GRANT SELECT ON TABLE public.rate_limit_buckets TO authenticated;

DROP POLICY IF EXISTS "Admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Admin can read audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can read rate limits" ON public.rate_limit_buckets;
CREATE POLICY "Admin can read rate limits"
ON public.rate_limit_buckets FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own view events" ON public.listing_view_events;
CREATE POLICY "Users can insert own view events"
ON public.listing_view_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own view events" ON public.listing_view_events;
CREATE POLICY "Users can view own view events"
ON public.listing_view_events FOR SELECT
USING (auth.uid() = user_id);

-- Saved Listings
DROP POLICY IF EXISTS "Users can save listings" ON public.saved_listings;
CREATE POLICY "Users can save listings"
ON public.saved_listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view saved listings" ON public.saved_listings;
CREATE POLICY "Users can view saved listings"
ON public.saved_listings FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove saved listings" ON public.saved_listings;
CREATE POLICY "Users can remove saved listings"
ON public.saved_listings FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.write_audit_log(TEXT, TEXT, UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.write_audit_log(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles_public;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles_public FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.sync_profiles_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles_public (id, email, company_name, is_verified, seller_type, handphone_no, business_address, ssm_new_no, ssm_old_no, ssm_no, updated_at)
  VALUES (NEW.id, NEW.email, NEW.company_name, NEW.is_verified, NEW.seller_type, NEW.handphone_no, NEW.business_address, NEW.ssm_new_no, NEW.ssm_old_no, NEW.ssm_no, NOW())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      company_name = EXCLUDED.company_name,
      is_verified = EXCLUDED.is_verified,
      seller_type = EXCLUDED.seller_type,
      handphone_no = EXCLUDED.handphone_no,
      business_address = EXCLUDED.business_address,
      ssm_new_no = EXCLUDED.ssm_new_no,
      ssm_old_no = EXCLUDED.ssm_old_no,
      ssm_no = EXCLUDED.ssm_no,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profiles_public ON public.profiles;
CREATE TRIGGER trg_sync_profiles_public
AFTER INSERT OR UPDATE OF email, company_name, is_verified, seller_type, handphone_no, business_address, ssm_new_no, ssm_old_no, ssm_no ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profiles_public();

INSERT INTO public.profiles_public (id, email, company_name, is_verified, seller_type, handphone_no, business_address, ssm_new_no, ssm_old_no, ssm_no, updated_at)
SELECT id, email, company_name, is_verified, seller_type, handphone_no, business_address, ssm_new_no, ssm_old_no, ssm_no, NOW()
FROM public.profiles
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    company_name = EXCLUDED.company_name,
    is_verified = EXCLUDED.is_verified,
    seller_type = EXCLUDED.seller_type,
    handphone_no = EXCLUDED.handphone_no,
    business_address = EXCLUDED.business_address,
    ssm_new_no = EXCLUDED.ssm_new_no,
    ssm_old_no = EXCLUDED.ssm_old_no,
    ssm_no = EXCLUDED.ssm_no,
    updated_at = NOW();

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.listings
    VALIDATE CONSTRAINT listings_seller_public_fkey;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Listings
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings are viewable by everyone" 
ON public.listings FOR SELECT 
USING (now() < active_until AND is_hidden = FALSE AND is_sold = FALSE);

DROP POLICY IF EXISTS "Sellers can view own listings" ON public.listings;
CREATE POLICY "Sellers can view own listings"
ON public.listings FOR SELECT
USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
CREATE POLICY "Authenticated users can insert listings" 
ON public.listings FOR INSERT 
WITH CHECK (
  auth.uid() = seller_id
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_verified = TRUE
      AND p.tier <> 'UNSUBSCRIBED'
  )
);

DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;
CREATE POLICY "Sellers can update own listings" 
ON public.listings FOR UPDATE 
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.listings;
CREATE POLICY "Sellers can delete own listings" 
ON public.listings FOR DELETE 
USING (auth.uid() = seller_id);

CREATE OR REPLACE FUNCTION public.enforce_listing_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow server-side operations (SQL editor/service context) where there's no JWT
  IF auth.uid() IS NULL THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF current_setting('solerz.internal_view_update', true) = 'true' THEN
    NEW.seller_id := OLD.seller_id;
    NEW.is_verified_listing := OLD.is_verified_listing;
    NEW.active_until := OLD.active_until;
    NEW.archive_until := OLD.archive_until;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF current_setting('solerz.internal_listing_renew', true) = 'true' THEN
    NEW.seller_id := OLD.seller_id;
    NEW.is_verified_listing := OLD.is_verified_listing;
    NEW.view_count := OLD.view_count;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() THEN
    NEW.seller_id := OLD.seller_id;
    NEW.is_verified_listing := OLD.is_verified_listing;
    NEW.view_count := OLD.view_count;
    NEW.active_until := OLD.active_until;
    NEW.archive_until := OLD.archive_until;
    NEW.created_at := OLD.created_at;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_listing_protected_fields ON public.listings;
CREATE TRIGGER trg_enforce_listing_protected_fields
BEFORE UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_protected_fields();

-- ################################################
-- 存储桶 (Storage)
-- ################################################

-- 1. Listing Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Listing images public" ON storage.objects;
DROP POLICY IF EXISTS "Listing images list own" ON storage.objects;
CREATE POLICY "Listing images list own" ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-images' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "Listing images upload" ON storage.objects;
CREATE POLICY "Listing images upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'listing-images' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "Listing images update" ON storage.objects;
CREATE POLICY "Listing images update" ON storage.objects FOR UPDATE
USING ( bucket_id = 'listing-images' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' )
WITH CHECK ( bucket_id = 'listing-images' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "Listing images delete" ON storage.objects;
CREATE POLICY "Listing images delete" ON storage.objects FOR DELETE
USING ( bucket_id = 'listing-images' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

-- 2. SSM Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ssm-documents', 'ssm-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "User upload SSM" ON storage.objects;
CREATE POLICY "User upload SSM" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'ssm-documents' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "User update own SSM" ON storage.objects;
CREATE POLICY "User update own SSM" 
ON storage.objects FOR UPDATE
USING ( bucket_id = 'ssm-documents' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' )
WITH CHECK ( bucket_id = 'ssm-documents' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "User delete own SSM" ON storage.objects;
CREATE POLICY "User delete own SSM" 
ON storage.objects FOR DELETE
USING ( bucket_id = 'ssm-documents' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "User read own SSM" ON storage.objects;
CREATE POLICY "User read own SSM" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'ssm-documents' AND auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '/%' );

DROP POLICY IF EXISTS "Admin read any SSM" ON storage.objects;
CREATE POLICY "Admin read any SSM" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'ssm-documents' AND public.is_admin() );

CREATE OR REPLACE FUNCTION public.admin_list_profiles(filter_status TEXT DEFAULT 'PENDING')
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.admin_list_profiles', 30, 60);

  IF filter_status = 'VERIFIED' THEN
    RETURN QUERY SELECT * FROM public.profiles p WHERE p.is_verified = TRUE ORDER BY p.created_at DESC;
  ELSIF filter_status = 'ALL' THEN
    RETURN QUERY SELECT * FROM public.profiles p ORDER BY p.created_at DESC;
  ELSE
    -- PENDING
    RETURN QUERY SELECT * FROM public.profiles p WHERE p.is_verified = FALSE AND (p.ssm_no IS NOT NULL OR p.ssm_new_no IS NOT NULL) ORDER BY p.created_at DESC;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_profiles(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_listing_times(
  p_listing_id UUID,
  p_active_until TIMESTAMPTZ,
  p_archive_until TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.admin_set_listing_times', 30, 60);

  UPDATE public.listings
  SET active_until = p_active_until,
      archive_until = p_archive_until,
      updated_at = NOW()
  WHERE id = p_listing_id;

  PERFORM public.write_audit_log(
    'listing.times.set',
    'listings',
    p_listing_id,
    jsonb_build_object('active_until', p_active_until, 'archive_until', p_archive_until)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_listing_times(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_listing_times(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_listings(filter_status TEXT DEFAULT 'ACTIVE')
RETURNS TABLE(
  id UUID,
  seller_id UUID,
  seller_company_name TEXT,
  seller_is_verified BOOLEAN,
  title TEXT,
  category TEXT,
  brand TEXT,
  price_rm DECIMAL,
  location_state TEXT,
  is_hidden BOOLEAN,
  is_sold BOOLEAN,
  is_verified_listing BOOLEAN,
  active_until TIMESTAMPTZ,
  archive_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.admin_list_listings', 30, 60);

  IF filter_status = 'ALL' THEN
    RETURN QUERY
      SELECT l.id, l.seller_id, p.company_name, p.is_verified, l.title, l.category, l.brand,
             l.price_rm, l.location_state, l.is_hidden, l.is_sold, l.is_verified_listing,
             l.active_until, l.archive_until, l.created_at
      FROM public.listings l
      LEFT JOIN public.profiles_public p ON p.id = l.seller_id
      ORDER BY l.created_at DESC;
  ELSIF filter_status = 'HIDDEN' THEN
    RETURN QUERY
      SELECT l.id, l.seller_id, p.company_name, p.is_verified, l.title, l.category, l.brand,
             l.price_rm, l.location_state, l.is_hidden, l.is_sold, l.is_verified_listing,
             l.active_until, l.archive_until, l.created_at
      FROM public.listings l
      LEFT JOIN public.profiles_public p ON p.id = l.seller_id
      WHERE l.is_hidden = TRUE
      ORDER BY l.created_at DESC;
  ELSIF filter_status = 'SOLD' THEN
    RETURN QUERY
      SELECT l.id, l.seller_id, p.company_name, p.is_verified, l.title, l.category, l.brand,
             l.price_rm, l.location_state, l.is_hidden, l.is_sold, l.is_verified_listing,
             l.active_until, l.archive_until, l.created_at
      FROM public.listings l
      LEFT JOIN public.profiles_public p ON p.id = l.seller_id
      WHERE l.is_sold = TRUE
      ORDER BY l.created_at DESC;
  ELSIF filter_status = 'EXPIRED' THEN
    RETURN QUERY
      SELECT l.id, l.seller_id, p.company_name, p.is_verified, l.title, l.category, l.brand,
             l.price_rm, l.location_state, l.is_hidden, l.is_sold, l.is_verified_listing,
             l.active_until, l.archive_until, l.created_at
      FROM public.listings l
      LEFT JOIN public.profiles_public p ON p.id = l.seller_id
      WHERE NOW() >= l.active_until
      ORDER BY l.created_at DESC;
  ELSE
    RETURN QUERY
      SELECT l.id, l.seller_id, p.company_name, p.is_verified, l.title, l.category, l.brand,
             l.price_rm, l.location_state, l.is_hidden, l.is_sold, l.is_verified_listing,
             l.active_until, l.archive_until, l.created_at
      FROM public.listings l
      LEFT JOIN public.profiles_public p ON p.id = l.seller_id
      WHERE NOW() < l.active_until AND l.is_hidden = FALSE AND l.is_sold = FALSE
      ORDER BY l.created_at DESC;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_listings(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_listings(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_listing_moderation(
  p_listing_id UUID,
  p_is_hidden BOOLEAN DEFAULT NULL,
  p_is_sold BOOLEAN DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.admin_set_listing_moderation', 30, 60);

  UPDATE public.listings
  SET is_hidden = COALESCE(p_is_hidden, is_hidden),
      is_sold = COALESCE(p_is_sold, is_sold),
      updated_at = NOW()
  WHERE id = p_listing_id;

  PERFORM public.write_audit_log(
    'listing.moderation.set',
    'listings',
    p_listing_id,
    jsonb_build_object('is_hidden', p_is_hidden, 'is_sold', p_is_sold)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_listing_moderation(UUID, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_listing_moderation(UUID, BOOLEAN, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_profile_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow server-side operations (SQL editor/service context) where there's no JWT
  IF auth.uid() IS NULL THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() THEN
    NEW.is_verified := OLD.is_verified;
    NEW.role := OLD.role;
    NEW.tier := OLD.tier;
    NEW.seller_type := OLD.seller_type;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_protected_fields ON public.profiles;
CREATE TRIGGER trg_enforce_profile_protected_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_protected_fields();

CREATE OR REPLACE FUNCTION public.sync_listings_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    UPDATE public.listings
    SET is_verified_listing = NEW.is_verified,
        updated_at = NOW()
    WHERE seller_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_listings_verification ON public.profiles;
CREATE TRIGGER trg_sync_listings_verification
AFTER UPDATE OF is_verified ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_listings_verification();

CREATE OR REPLACE FUNCTION public.set_profile_verification(target_profile_id UUID, verified BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.set_profile_verification', 20, 60);

  UPDATE public.profiles
  SET is_verified = verified,
      updated_at = NOW()
  WHERE id = target_profile_id;

  PERFORM public.write_audit_log(
    'profile.verification.set',
    'profiles',
    target_profile_id,
    jsonb_build_object('verified', verified)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_profile_verification(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_verification(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.purchase_plan(
  new_tier TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized TEXT;
BEGIN
  PERFORM public.check_rate_limit('rpc.purchase_plan', 10, 60);

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  normalized := upper(COALESCE(new_tier, ''));
  IF normalized NOT IN ('STARTER', 'PRO', 'MERCHANT', 'ENTERPRISE') THEN
    RAISE EXCEPTION 'invalid tier';
  END IF;

  UPDATE public.profiles
  SET tier = normalized,
      role = CASE WHEN role = 'BUYER' THEN 'SELLER' ELSE role END,
      updated_at = NOW()
  WHERE id = auth.uid();

  PERFORM public.write_audit_log(
    'profile.tier.purchase',
    'profiles',
    auth.uid(),
    jsonb_build_object('tier', normalized)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_plan(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_plan(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_profile_role(
  target_profile_id UUID,
  new_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM public.check_rate_limit('rpc.admin_set_profile_role', 20, 60);

  normalized := upper(COALESCE(new_role, ''));
  IF normalized NOT IN ('BUYER', 'SELLER') THEN
    RAISE EXCEPTION 'invalid role';
  END IF;

  UPDATE public.profiles
  SET role = normalized,
      updated_at = NOW()
  WHERE id = target_profile_id;

  PERFORM public.write_audit_log(
    'profile.role.set',
    'profiles',
    target_profile_id,
    jsonb_build_object('role', normalized)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_profile_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_role(UUID, TEXT) TO authenticated;
