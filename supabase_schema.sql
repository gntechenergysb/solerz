-- =================================────────────────===========================
-- SOLERZ GLOBAL DATABASE SCHEMA & DUMMY ENGINE
-- =================================────────────────===========================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    country_code TEXT NOT NULL DEFAULT 'US',
    city_region TEXT NOT NULL DEFAULT 'California',
    system_kwp NUMERIC(8, 2) NOT NULL DEFAULT 5.00 CHECK (system_kwp > 0),
    equipment_brand TEXT DEFAULT 'SolarEdge',
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
    
    -- Specific Yield: kWh / kWp (Normalized Efficiency)
    efficiency_kwh_per_kwp NUMERIC(8, 3) GENERATED ALWAYS AS (
        ROUND(kwh_generated / NULLIF(system_kwp, 0), 3)
    ) STORED,
    
    image_url TEXT,
    notes TEXT,
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- 3. COMMENTS TABLE
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
-- PERFORMANCE INDEXES
-- =================================────────────────===========================

CREATE INDEX IF NOT EXISTS idx_check_ins_leaderboard 
ON public.check_ins (check_in_date DESC, efficiency_kwh_per_kwp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_country 
ON public.profiles (country_code);

CREATE INDEX IF NOT EXISTS idx_profiles_dummy 
ON public.profiles (is_dummy);

-- =================================────────────────===========================
-- AUTOMATION TRIGGER FOR NEW USER REGISTRATION
-- =================================────────────────===========================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, country_code, city_region, system_kwp, equipment_brand, is_dummy)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'solar_owner_' || SUBSTRING(NEW.id::text FROM 1 FOR 6)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Solar Owner'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
        COALESCE(NEW.raw_user_meta_data->>'city_region', 'California'),
        COALESCE((NEW.raw_user_meta_data->>'system_kwp')::numeric, 5.00),
        COALESCE(NEW.raw_user_meta_data->>'equipment_brand', 'SolarEdge'),
        FALSE
    );
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
-- DYNAMIC DUMMY DATA SEEDER & CLEANUP PROCEDURE
-- =================================────────────────===========================

CREATE OR REPLACE FUNCTION public.seed_daily_dummy_data(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    d1 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    d2 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    d3 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    d4 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
    d5 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
    d6 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
    d7 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77';
    d8 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88';
BEGIN
    -- Insert Global Seed Profiles
    INSERT INTO public.profiles (id, username, display_name, country_code, city_region, system_kwp, equipment_brand, role, is_dummy)
    VALUES
        (d1, 'socal_sam', 'Sam (California)', 'US', 'Los Angeles', 8.50, 'Enphase', 'consumer', TRUE),
        (d2, 'london_solar', 'Oliver (UK Solar)', 'GB', 'London', 4.20, 'SolarEdge', 'consumer', TRUE),
        (d3, 'sydney_pv_pro', 'Shane (Sydney PV)', 'AU', 'Sydney', 10.00, 'Fronius', 'installer', TRUE),
        (d4, 'munich_hans', 'Hans (Bavaria Grid)', 'DE', 'Munich', 6.00, 'SMA', 'consumer', TRUE),
        (d5, 'kl_rooftop', 'Ken (KL Energy)', 'MY', 'Kuala Lumpur', 5.50, 'Sungrow', 'consumer', TRUE),
        (d6, 'sg_cleantech', 'David (Singapore PV)', 'SG', 'Singapore', 7.20, 'Huawei', 'installer', TRUE),
        (d7, 'paris_sun', 'Pierre (Paris Eco)', 'FR', 'Paris', 5.00, 'SolarEdge', 'consumer', TRUE),
        (d8, 'toronto_grid', 'Liam (Ontario Solar)', 'CA', 'Toronto', 6.80, 'Tesla', 'consumer', TRUE)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Dynamic Seed Check-ins
    INSERT INTO public.check_ins (user_id, check_in_date, kwh_generated, system_kwp, notes, is_dummy)
    VALUES
        (d1, target_date, ROUND((8.50 * (5.6 + random() * 1.0))::numeric, 2), 8.50, 'Clear skies in SoCal today! Microinverters peaking.', TRUE),
        (d3, target_date, ROUND((10.00 * (5.2 + random() * 0.9))::numeric, 2), 10.00, 'Commercial rooftop system in Sydney.', TRUE),
        (d5, target_date, ROUND((5.50 * (4.5 + random() * 0.8))::numeric, 2), 5.50, 'Steady yield despite afternoon clouds in KL.', TRUE),
        (d8, target_date, ROUND((6.80 * (4.3 + random() * 1.1))::numeric, 2), 6.80, 'Great generation day in Ontario.', TRUE),
        (d2, target_date, ROUND((4.20 * (4.0 + random() * 1.0))::numeric, 2), 4.20, 'Solid production day in London.', TRUE),
        (d6, target_date, ROUND((7.20 * (4.1 + random() * 0.8))::numeric, 2), 7.20, 'Optimized string configuration running well.', TRUE),
        (d4, target_date, ROUND((6.00 * (3.8 + random() * 0.9))::numeric, 2), 6.00, 'Bavarian sun doing its job today.', TRUE),
        (d7, target_date, ROUND((5.00 * (3.6 + random() * 0.8))::numeric, 2), 5.00, 'Paris system performing as expected.', TRUE)
    ON CONFLICT (user_id, check_in_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed Today's Initial Dummy Data
SELECT public.seed_daily_dummy_data(CURRENT_DATE);

-- 💡 HELPER TO DELETE ALL DUMMY DATA IN 1-CLICK:
-- DELETE FROM public.profiles WHERE is_dummy = TRUE;
