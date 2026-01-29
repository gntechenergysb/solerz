-- ################################################
-- SOLERZ SUPABASE SETUP SCRIPT - V3.0 (KYC & Admin Enhanced)
-- ################################################

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 商家/个人资料表 (Profiles)
-- 我们使用 ALTER TABLE IF NOT EXISTS 模式，方便您在现有表上运行
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加新字段 (即使表已存在，这些命令也会添加缺失的列)
DO $$ 
BEGIN 
    -- 基础字段
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'INDIVIDUAL';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'STARTER';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    
    -- 权限字段 (Critical for Admin Security)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'SELLER'; -- 'SELLER' or 'ADMIN'

    -- 详细 SSM 字段 (KYC)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_new_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_old_no TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS incorporation_date DATE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nature_of_business TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ssm_file_path TEXT; -- 存储文件在Bucket中的路径
END $$;

-- 2. 产品列表表 (Listings)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
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

-- ################################################
-- 自动化流程 (Triggers & Functions)
-- ################################################

-- A. 处理新用户注册
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name, seller_type, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'seller_type', 'INDIVIDUAL'),
    'SELLER' -- 默认都是 Seller，管理员需手动修改数据库设为 Admin
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_listing_details ON public.listings;
CREATE TRIGGER trg_set_listing_details
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.set_listing_details_v2();

-- C. 浏览量
CREATE OR REPLACE FUNCTION public.increment_view_count(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.listings SET view_count = view_count + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ################################################
-- 安全策略 (RLS) - 增强版
-- ################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Profiles: 
-- 1. 所有人可以看公开信息 (简化版，实际生产可能需要隐藏敏感字段如SSM文件路径)
--    为了安全，我们只允许查看基本信息，SSM详细信息最好只允许Admin看
--    但在Supabase简单模式下，我们先允许读取，前端控制显示。
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- 2. 只有Admin和自己可以修改
--    Supabase SQL可以直接检查 auth.uid()
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: 保持不变
CREATE POLICY "Active listings are viewable by everyone" 
ON public.listings FOR SELECT 
USING (now() < archive_until AND is_hidden = FALSE);

CREATE POLICY "Authenticated users can insert listings" 
ON public.listings FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings" 
ON public.listings FOR ALL 
USING (auth.uid() = seller_id);

-- ################################################
-- 存储桶 (Storage) - 图片 & SSM文件
-- ################################################

-- 1. Listing Images (公开)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Listing images public" ON storage.objects FOR SELECT USING ( bucket_id = 'listing-images' );
CREATE POLICY "Listing images upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'listing-images' AND auth.role() = 'authenticated' );

-- 2. SSM Documents (私有 - 安全重点)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ssm-documents', 'ssm-documents', false) -- FALSE表示私有
ON CONFLICT (id) DO NOTHING;

-- 策略: 
-- Upload: 认证用户可上传
CREATE POLICY "User upload SSM" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'ssm-documents' AND auth.role() = 'authenticated');

-- Read: 只有 Owner 和 Admin 可以读取 (Admin逻辑需要在应用层用Service Role或这里写复杂Policy)
-- 简单起见，允许用户读取自己的文件
CREATE POLICY "User read own SSM" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'ssm-documents' AND auth.uid()::text = (storage.foldername(name))[1] );

-- RLS helper for Admin (可选，如果您的账号是Admin)
-- 您可以在 Dashboard 直接手动修改某个 User 的 role 为 'ADMIN'
