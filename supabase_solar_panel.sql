-- 启用 pg_trgm 扩展用于快速模糊搜索
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. BRANDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    headquarters_country VARCHAR(50),
    website_url TEXT,
    logo_url TEXT,
    tier_rating VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. SOLAR PANELS (.PAN Standard + CEC Compatible)
-- ============================================================================
-- 如果已建错表，可先删除重建（如有旧数据请注意备份）
DROP VIEW IF EXISTS v_solar_panels_summary;
DROP TABLE IF EXISTS solar_panels;

CREATE TABLE solar_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    
    -- PVSyst .PAN Core Electrical Specs (STC: 1000W/m2, 25C)
    technol VARCHAR(50) DEFAULT 'mtSiMono',
    ncels INT NOT NULL DEFAULT 60,
    ncelp INT DEFAULT 1,
    ndiodes INT DEFAULT 3,
    pnom_w NUMERIC(8,2) NOT NULL,
    pnom_tol_low_pct NUMERIC(4,2) DEFAULT 0.0,
    pnom_tol_up_pct NUMERIC(4,2) DEFAULT 3.0,
    voc_v NUMERIC(8,2) NOT NULL,
    isc_a NUMERIC(8,2) NOT NULL,
    vmp_v NUMERIC(8,2) NOT NULL,
    imp_a NUMERIC(8,2) NOT NULL,
    module_efficiency_pct NUMERIC(6,2),
    
    -- Temperature Coefficients (已扩大精度，防止异常大值报错)
    mu_isc_ma_c NUMERIC(10,3) NOT NULL,       -- mA/°C (PVSyst muISC)
    mu_voc_spec_mv_c NUMERIC(10,2) NOT NULL,  -- mV/°C (PVSyst muVocSpec)
    mu_pnom_spec_pct_c NUMERIC(6,3) NOT NULL, -- %/°C (PVSyst muPmpReq)
    
    -- Single-Diode Model (SDM) Physical Parameters
    r_serie_ohm NUMERIC(8,3),
    r_shunt_ohm NUMERIC(12,2),
    rp_0_ohm NUMERIC(12,2),
    rp_exp NUMERIC(5,2) DEFAULT 5.5,
    gamma NUMERIC(5,3) DEFAULT 1.050,
    
    -- Optical, Mechanical Specs (允许 NULL 以兼容 CEC 数据)
    is_bifacial BOOLEAN DEFAULT FALSE,
    bifaciality_factor NUMERIC(4,2) DEFAULT 0.80,
    iam_b0 NUMERIC(4,3) DEFAULT 0.05,
    iam_profile JSONB,                       
    oper_points JSONB,                       
    width_m NUMERIC(6,3),
    length_m NUMERIC(6,3),
    depth_m NUMERIC(6,3) DEFAULT 0.030,
    weight_kg NUMERIC(6,2),
    vmax_iec_v INT DEFAULT 1500,
    vmax_ul_v INT DEFAULT 1500,
    
    -- Commercial & Compliance Layer
    certifications TEXT[] DEFAULT '{"IEC 61215", "IEC 61730", "UL 61730", "CE"}',
    origin_country VARCHAR(50),
    warranty_product_years INT DEFAULT 15,
    warranty_power_years INT DEFAULT 30,
    datasheet_url TEXT,
    image_url TEXT,
    raw_pan_content TEXT,                    -- 存放未来官方 .PAN 全文
    
    views_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. 性能索引
-- ============================================================================
CREATE INDEX idx_panels_brand_id ON solar_panels(brand_id);
CREATE INDEX idx_panels_pnom ON solar_panels(pnom_w);
CREATE INDEX idx_panels_slug ON solar_panels(slug);
CREATE INDEX idx_panels_filter_composite ON solar_panels(brand_id, pnom_w, is_bifacial);
CREATE INDEX idx_panels_search_trgm ON solar_panels USING gin(model_name gin_trgm_ops);

-- ============================================================================
-- 4. 轻量摘要视图 (用于前端列表/卡片展示，大幅节省频宽)
-- ============================================================================
CREATE OR REPLACE VIEW v_solar_panels_summary AS
SELECT 
    id, brand_id, brand_name, model_name, slug, technol, 
    pnom_w, module_efficiency_pct, is_bifacial, vmp_v, imp_a,
    length_m, width_m, weight_kg, warranty_product_years
FROM solar_panels
WHERE is_active = TRUE;

-- ============================================================================
-- 5. Row Level Security (RLS) - 只读公开访问策略
-- ============================================================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on brands" ON brands FOR SELECT USING (true);

ALTER TABLE solar_panels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on solar_panels" ON solar_panels FOR SELECT USING (true);