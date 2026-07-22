-- =================================────────────────===========================
-- SOLERZ PRODUCTION DATABASE SCHEMA & RLS POLICIES (CLEAN - NO HARDCODED SEED)
-- =================================────────────────===========================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    country_code TEXT NOT NULL DEFAULT 'US',
    city_region TEXT NOT NULL DEFAULT 'California',
    system_kwp NUMERIC(8, 2) NOT NULL DEFAULT 5.00 CHECK (system_kwp > 0),
    panel_brand TEXT DEFAULT 'Jinko Solar',
    inverter_brand TEXT DEFAULT 'SolarEdge',
    role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'installer', 'supplier')),
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DAILY CHECK-INS TABLE (Auto-calculated Specific Yield)
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    kwh_generated NUMERIC(8, 2) NOT NULL CHECK (kwh_generated >= 0),
    system_kwp NUMERIC(8, 2) NOT NULL CHECK (system_kwp > 0),
    
    -- Normalized Efficiency: kWh / kWp
    efficiency_kwh_per_kwp NUMERIC(8, 3) GENERATED ALWAYS AS (
        ROUND(kwh_generated / NULLIF(system_kwp, 0), 3)
    ) STORED,
    
    image_url TEXT,
    notes TEXT,
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- 3. COMMENTS & TROUBLESHOOTING TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FLEX REACTIONS / UPVOTES TABLE
CREATE TABLE IF NOT EXISTS public.flex_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_checkin_flex UNIQUE (check_in_id, user_id)
);

-- =================================────────────────===========================
-- INDEXES
-- =================================────────────────===========================

CREATE INDEX IF NOT EXISTS idx_check_ins_leaderboard 
ON public.check_ins (check_in_date DESC, efficiency_kwh_per_kwp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_country 
ON public.profiles (country_code);

CREATE INDEX IF NOT EXISTS idx_profiles_inverter_brand 
ON public.profiles (inverter_brand);

CREATE INDEX IF NOT EXISTS idx_profiles_panel_brand 
ON public.profiles (panel_brand);

-- =================================────────────────===========================
-- AUTH USER TRIGGER
-- =================================────────────────===========================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, username, display_name, avatar_url, country_code, city_region, 
        system_kwp, panel_brand, inverter_brand, is_dummy
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'solar_owner_' || REPLACE(NEW.id::text, '-', '')),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Solar Owner'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
        COALESCE(NEW.raw_user_meta_data->>'city_region', 'California'),
        COALESCE((NEW.raw_user_meta_data->>'system_kwp')::numeric, 5.00),
        COALESCE(NEW.raw_user_meta_data->>'panel_brand', 'Jinko Solar'),
        COALESCE(NEW.raw_user_meta_data->>'inverter_brand', 'SolarEdge'),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================────────────────===========================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================────────────────===========================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flex_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles Public Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles User Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Check-ins Public Read" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Check-ins User Insert" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Check-ins User Update" ON public.check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Check-ins User Delete" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Comments Public Read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Comments User Insert" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Comments User Delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Reactions Public Read" ON public.flex_reactions FOR SELECT USING (true);
CREATE POLICY "Reactions User Insert" ON public.flex_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reactions User Delete" ON public.flex_reactions FOR DELETE USING (auth.uid() = user_id);

-- =================================────────────────===========================
-- ADD STANDALONE DISCUSSIONS & COMMUNITY Q&A TABLES
-- =================================────────────────===========================

-- 1. DISCUSSIONS TABLE
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('troubleshooting', 'hardware', 'tips', 'general')),
    image_url TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    upvotes_count INT NOT NULL DEFAULT 0,
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DISCUSSION COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.discussion_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DISCUSSION UPVOTES TABLE
CREATE TABLE IF NOT EXISTS public.discussion_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_discussion_upvote UNIQUE (discussion_id, user_id)
);

-- INDEXES FOR FAST FEED LOADING
CREATE INDEX IF NOT EXISTS idx_discussions_feed ON public.discussions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON public.discussions (category);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_post ON public.discussion_comments (discussion_id, created_at ASC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions Public Read" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "Discussions User Insert" ON public.discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Discussions User Update" ON public.discussions FOR UPDATE USING (true);
CREATE POLICY "Discussions User Delete" ON public.discussions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Discussion Comments Public Read" ON public.discussion_comments FOR SELECT USING (true);
CREATE POLICY "Discussion Comments User Insert" ON public.discussion_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Discussion Comments User Delete" ON public.discussion_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Discussion Upvotes Public Read" ON public.discussion_upvotes FOR SELECT USING (true);
CREATE POLICY "Discussion Upvotes User Insert" ON public.discussion_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Discussion Upvotes User Delete" ON public.discussion_upvotes FOR DELETE USING (auth.uid() = user_id);