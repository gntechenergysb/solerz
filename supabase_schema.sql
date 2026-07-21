-- ===========================================================================
-- SOLERZ MVP DATABASE SCHEMA & RLS POLICIES
-- ===========================================================================

-- 1. 啟用 UUID 擴充套件
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 用戶 Profiles 資料表
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    city_region TEXT NOT NULL DEFAULT 'Taipei',
    system_kwp NUMERIC(8, 2) NOT NULL DEFAULT 5.00 CHECK (system_kwp > 0),
    equipment_brand TEXT DEFAULT 'Generic',
    role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'installer', 'supplier')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 每日打卡 Check-ins 資料表 (包含自動計算效率欄位)
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    kwh_generated NUMERIC(8, 2) NOT NULL CHECK (kwh_generated >= 0),
    system_kwp NUMERIC(8, 2) NOT NULL CHECK (system_kwp > 0),
    -- 自動計算特定發電量: kWh / kWp (精確到小數點後三位)
    efficiency_kwh_per_kwp NUMERIC(8, 3) GENERATED ALWAYS AS (
        ROUND(kwh_generated / NULLIF(system_kwp, 0), 3)
    ) STORED,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 限制同一用戶一天只能打卡一次
    CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- 4. 討論與留言 Comments 資料表
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 點贊/炫耀 Reactions 資料表
CREATE TABLE IF NOT EXISTS public.flex_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_checkin_flex UNIQUE (check_in_id, user_id)
);

-- ===========================================================================
-- 索引優化 (INDEXES)
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_check_ins_leaderboard
ON public.check_ins (check_in_date DESC, efficiency_kwh_per_kwp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_region
ON public.profiles (city_region);

CREATE INDEX IF NOT EXISTS idx_profiles_brand
ON public.profiles (equipment_brand);

CREATE INDEX IF NOT EXISTS idx_comments_check_in
ON public.comments (check_in_id, created_at ASC);

-- ===========================================================================
-- 自動化觸發器 (TRIGGERS)
-- ===========================================================================

-- 新用戶註冊時自動建立 Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, city_region, system_kwp, equipment_brand)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'solar_user_' || SUBSTRING(NEW.id::text FROM 1 FOR 6)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Solar Owner'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'city_region', 'Taipei'),
        COALESCE((NEW.raw_user_meta_data->>'system_kwp')::numeric, 5.00),
        COALESCE(NEW.raw_user_meta_data->>'equipment_brand', 'SolarEdge')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================================
-- 安全權限 (ROW LEVEL SECURITY - RLS)
-- ===========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flex_reactions ENABLE ROW LEVEL SECURITY;

-- Profiles 權限
CREATE POLICY "Profiles Public Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles User Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Check-ins 權限
CREATE POLICY "Check-ins Public Read" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Check-ins User Insert" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Check-ins User Update" ON public.check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Check-ins User Delete" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

-- Comments 權限
CREATE POLICY "Comments Public Read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Comments User Insert" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Comments User Delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions 權限
CREATE POLICY "Reactions Public Read" ON public.flex_reactions FOR SELECT USING (true);
CREATE POLICY "Reactions User Insert" ON public.flex_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reactions User Delete" ON public.flex_reactions FOR DELETE USING (auth.uid() = user_id);
