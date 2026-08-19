-- ==============================================================================
-- SOLERZ BATTERY ENERGY STORAGE SYSTEMS (BESS) SCHEMA
-- ==============================================================================

-- 1. BATTERIES TABLE
CREATE TABLE IF NOT EXISTS batteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    battery_type TEXT NOT NULL DEFAULT 'LiFePO4',   -- 'LiFePO4', 'NMC', 'LTO', 'Lead-Carbon', 'Flow', etc.
    application_type TEXT NOT NULL DEFAULT 'Residential', -- 'Residential', 'Commercial', 'Utility-Scale', 'Portable'
    
    -- Usable & Nominal Energy Capacity
    usable_capacity_kwh NUMERIC(8,2) NOT NULL,       -- Usable Energy Storage Capacity (kWh)
    nominal_capacity_kwh NUMERIC(8,2),              -- Gross / Total Nameplate Energy Capacity (kWh)
    
    -- Power Ratings
    continuous_power_kw NUMERIC(8,2) NOT NULL,      -- Continuous Power Output (kW)
    peak_power_kw NUMERIC(8,2),                     -- Peak / Surge Power Output (10s peak, kW)
    
    -- Voltage & Electrical Architecture
    nominal_voltage_v NUMERIC(8,2) NOT NULL,        -- Nominal DC Battery Voltage (e.g. 48V, 51.2V, 400V)
    operating_voltage_min_v NUMERIC(8,2),           -- Min Discharge Cutoff Voltage (V)
    operating_voltage_max_v NUMERIC(8,2),           -- Max Charge Cutoff Voltage (V)
    max_continuous_current_a NUMERIC(8,2),          -- Max Continuous Charge/Discharge Current (A)
    coupling_type TEXT NOT NULL DEFAULT 'DC-Coupled', -- 'DC-Coupled', 'AC-Coupled', 'All-in-One'
    
    -- Efficiency & Lifespan
    round_trip_efficiency_pct NUMERIC(6,2) NOT NULL DEFAULT 90.0, -- Round-trip efficiency (RTE %)
    depth_of_discharge_pct NUMERIC(6,2) DEFAULT 100.0,            -- Depth of Discharge (DoD %)
    cycle_life_count INTEGER DEFAULT 6000,                        -- Cycle life rating (e.g. 6000 cycles @ 80% EoL)
    warranty_years INTEGER DEFAULT 10,                            -- Product & Performance Warranty (Years)
    warranty_energy_throughput_mwh NUMERIC(10,2),                 -- Guaranteed throughput (MWh)
    
    -- Scalability & Physical Specs
    max_parallel_units INTEGER DEFAULT 1,           -- Max parallel units for system expansion
    ip_rating TEXT DEFAULT 'IP65',                  -- Enclosure ingress protection rating (IP65, NEMA 3R, NEMA 4X)
    operating_temp_min_c NUMERIC(5,1) DEFAULT -10.0,-- Minimum operating temperature (°C)
    operating_temp_max_c NUMERIC(5,1) DEFAULT 50.0, -- Maximum operating temperature (°C)
    weight_kg NUMERIC(8,2),                         -- Net weight (kg)
    dimensions_mm TEXT,                             -- Dimensions H x W x D (mm)
    certifications TEXT,                            -- Safety standards (e.g. UL 9540, UL 9540A, UL 1973, CE)
    
    -- Status & Timestamps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_batteries_usable_capacity ON batteries(usable_capacity_kwh DESC);
CREATE INDEX IF NOT EXISTS idx_batteries_continuous_power ON batteries(continuous_power_kw DESC);
CREATE INDEX IF NOT EXISTS idx_batteries_efficiency ON batteries(round_trip_efficiency_pct DESC);
CREATE INDEX IF NOT EXISTS idx_batteries_brand ON batteries(brand_name);
CREATE INDEX IF NOT EXISTS idx_batteries_slug ON batteries(slug);
CREATE INDEX IF NOT EXISTS idx_batteries_type ON batteries(battery_type);
CREATE INDEX IF NOT EXISTS idx_batteries_app ON batteries(application_type);

-- 2. LIGHTWEIGHT LIST & SEARCH VIEW
CREATE OR REPLACE VIEW v_batteries_summary
WITH (security_invoker = true)
AS
SELECT 
    id,
    slug,
    brand_name,
    model_name,
    battery_type,
    application_type,
    coupling_type,
    usable_capacity_kwh,
    continuous_power_kw,
    peak_power_kw,
    nominal_voltage_v,
    round_trip_efficiency_pct,
    cycle_life_count,
    warranty_years,
    max_parallel_units,
    ip_rating,
    is_active
FROM batteries
WHERE is_active = true;

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on batteries" ON batteries;
CREATE POLICY "Allow public read access on batteries" ON batteries FOR SELECT USING (true);
