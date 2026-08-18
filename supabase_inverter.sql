-- ============================================================================
-- SOLERZ INVERTERS DATABASE SCHEMA (.OND / CEC Sandia Inverter Standard)
-- ============================================================================

-- 1. 确保 extensions schema 及 pg_trgm 扩展
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;

-- ============================================================================
-- 2. INVERTERS TABLE
-- ============================================================================
DROP VIEW IF EXISTS v_inverters_summary;
DROP TABLE IF EXISTS inverters;

CREATE TABLE inverters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    inverter_type VARCHAR(50) DEFAULT 'String Inverter', -- 'String Inverter', 'Microinverter', 'Hybrid Storage Inverter', 'Utility Central Inverter'
    
    -- AC Output Specifications (Grid-tied)
    vac_v NUMERIC(8,2) NOT NULL,            -- Rated AC Output Voltage (V)
    paco_w NUMERIC(10,2) NOT NULL,          -- Maximum Continuous AC Power Output (W)
    
    -- DC Input & MPPT Operating Window
    pdco_w NUMERIC(10,2) NOT NULL,          -- DC Power required at Max AC Power (W)
    vdco_v NUMERIC(8,2) NOT NULL,           -- DC Operating Voltage at Max AC Power (V)
    vdcmax_v NUMERIC(8,2) NOT NULL,         -- Maximum DC Input Voltage (V)
    idcmax_a NUMERIC(8,2) NOT NULL,         -- Maximum Continuous DC Input Current (A)
    mppt_low_v NUMERIC(8,2) NOT NULL,       -- Minimum MPPT Operating Voltage (V)
    mppt_high_v NUMERIC(8,2) NOT NULL,      -- Maximum MPPT Operating Voltage (V)
    
    -- Standby & Parasitic Losses
    pso_w NUMERIC(8,3) NOT NULL DEFAULT 0,  -- Standby Power / Start-up threshold (W)
    pnt_w NUMERIC(8,3) NOT NULL DEFAULT 0,  -- Nighttime Tare Loss (W)
    
    -- Efficiency & Capabilities
    efficiency_pct NUMERIC(6,2),            -- Peak / CEC Weighted Conversion Efficiency (%)
    is_hybrid BOOLEAN DEFAULT FALSE,        -- Battery Storage Hybrid Inverter (Y/N)
    
    -- Sandia Inverter Model Empirical Parameters (C0 - C3 for PVSyst .OND / SAM Simulation)
    c0 NUMERIC(14,9),
    c1 NUMERIC(14,9),
    c2 NUMERIC(14,9),
    c3 NUMERIC(14,9),
    
    -- Metadata
    cec_cert_date DATE,
    views_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. 性能索引 (优化列表筛选、功率排序、对比与模糊检索)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_inverters_brand_id ON inverters(brand_id);
CREATE INDEX IF NOT EXISTS idx_inverters_paco ON inverters(paco_w);
CREATE INDEX IF NOT EXISTS idx_inverters_slug ON inverters(slug);
CREATE INDEX IF NOT EXISTS idx_inverters_type ON inverters(inverter_type);
CREATE INDEX IF NOT EXISTS idx_inverters_filter_composite ON inverters(brand_id, paco_w, is_hybrid);
CREATE INDEX IF NOT EXISTS idx_inverters_search_trgm ON inverters USING gin(model_name extensions.gin_trgm_ops);

-- ============================================================================
-- 4. 轻量摘要视图 (用于前端列表与多栏卡片展示，大幅节省网络频宽)
-- ============================================================================
CREATE OR REPLACE VIEW v_inverters_summary 
WITH (security_invoker = true) AS
SELECT 
    id, brand_id, brand_name, model_name, slug, inverter_type,
    vac_v, paco_w, efficiency_pct, is_hybrid, vdcmax_v, idcmax_a,
    mppt_low_v, mppt_high_v
FROM inverters
WHERE is_active = TRUE;

-- ============================================================================
-- 5. Row Level Security (RLS) - 只读公开访问策略
-- ============================================================================
ALTER TABLE inverters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on inverters" ON inverters FOR SELECT USING (true);
