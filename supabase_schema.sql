-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. BRANDS TABLE
-- ============================================================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    headquarters_country VARCHAR(50),
    website_url TEXT,
    logo_url TEXT,
    tier_rating VARCHAR(10) DEFAULT 'Tier-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. SOLAR PANELS (.PAN Standard + Specifications)
-- ============================================================================
CREATE TABLE solar_panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    
    -- PVSyst .PAN Core Electrical Specs (STC: 1000W/m2, 25C)
    technol VARCHAR(50) DEFAULT 'mtSiMonoTOPCon',
    ncels INT NOT NULL,
    ncelp INT DEFAULT 1,
    ndiodes INT DEFAULT 3,
    pnom_w NUMERIC(6,2) NOT NULL,
    pnom_tol_low_pct NUMERIC(4,2) DEFAULT 0.0,
    pnom_tol_up_pct NUMERIC(4,2) DEFAULT 3.0,
    voc_v NUMERIC(5,2) NOT NULL,
    isc_a NUMERIC(5,2) NOT NULL,
    vmp_v NUMERIC(5,2) NOT NULL,
    imp_a NUMERIC(5,2) NOT NULL,
    module_efficiency_pct NUMERIC(5,2) NOT NULL,
    
    -- Temperature Coefficients (PVSyst Standard Native Units)
    mu_isc_ma_c NUMERIC(6,3) NOT NULL,       -- mA/°C (PVSyst muISC)
    mu_voc_spec_mv_c NUMERIC(7,2) NOT NULL,  -- mV/°C (PVSyst muVocSpec, e.g. -127.00)
    mu_pnom_spec_pct_c NUMERIC(5,3) NOT NULL,-- %/°C (PVSyst muPmpReq)
    
    -- Single-Diode Model (SDM) Physical Parameters
    r_serie_ohm NUMERIC(6,3),
    r_shunt_ohm NUMERIC(8,2),
    rp_0_ohm NUMERIC(9,2),
    rp_exp NUMERIC(5,2) DEFAULT 5.5,
    gamma NUMERIC(5,3) DEFAULT 1.050,
    
    -- Optical, Advanced Curves & Mechanical Specs
    is_bifacial BOOLEAN DEFAULT FALSE,
    bifaciality_factor NUMERIC(4,2) DEFAULT 0.80,
    iam_b0 NUMERIC(4,3) DEFAULT 0.05,
    iam_profile JSONB,                       -- IAM Optical Incidence Angle Curve (e.g. TCubicProfile)
    oper_points JSONB,                       -- Low-light & Irradiance Matrix Points (100-1100 W/m2)
    width_m NUMERIC(4,3) NOT NULL,
    length_m NUMERIC(4,3) NOT NULL,
    depth_m NUMERIC(4,3) DEFAULT 0.030,
    weight_kg NUMERIC(5,2) NOT NULL,
    vmax_iec_v INT DEFAULT 1500,
    vmax_ul_v INT DEFAULT 1500,
    
    -- Commercial & Compliance Layer
    certifications TEXT[] DEFAULT '{"IEC 61215", "IEC 61730", "UL 61730", "CE"}',
    origin_country VARCHAR(50),
    warranty_product_years INT DEFAULT 15,
    warranty_power_years INT DEFAULT 30,
    datasheet_url TEXT,
    image_url TEXT,
    raw_pan_content TEXT,                    -- 100% full raw .PAN file backup
    
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. SOLAR INVERTERS (.OND Standard + Specifications)
-- ============================================================================
CREATE TABLE solar_inverters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    
    inverter_type VARCHAR(50) NOT NULL,       -- String, Hybrid, Microinverter
    grid_phases VARCHAR(30) NOT NULL,         -- Single Phase, Three Phase
    pnom_conv_w NUMERIC(8,2) NOT NULL,        -- Rated AC Power (W)
    pmax_out_va NUMERIC(8,2) NOT NULL,        -- Max AC Apparent Power (VA)
    vmin_mpp_v NUMERIC(5,2) NOT NULL,         -- MPPT Range Min (V)
    vmax_mpp_v NUMERIC(6,2) NOT NULL,         -- MPPT Range Max (V)
    v_abs_max_v NUMERIC(6,2) NOT NULL,        -- Absolute Max DC Voltage (V)
    imax_pv_a NUMERIC(5,2) NOT NULL,          -- Max Input Current per MPPT (A)
    nb_mppt INT DEFAULT 2,                    -- MPPT Trackers Count
    max_efficiency_pct NUMERIC(5,2),
    euro_efficiency_pct NUMERIC(5,2),
    efficiency_curve JSONB,                   -- Efficiency vs Output Power/Voltage curve
    
    -- Hybrid Battery Interface
    is_battery_supported BOOLEAN DEFAULT FALSE,
    battery_voltage_type VARCHAR(20),         -- LV (48V) or HV (150-600V)
    battery_voltage_min_v NUMERIC(5,2),
    battery_voltage_max_v NUMERIC(6,2),
    max_charge_current_a NUMERIC(5,2),
    max_discharge_current_a NUMERIC(5,2),
    
    -- Commercial & Physical Layer
    certifications TEXT[] DEFAULT '{"UL 1741", "AS4777.2", "VDE-AR-N 4105", "CE"}',
    warranty_years INT DEFAULT 10,
    ip_rating VARCHAR(10) DEFAULT 'IP65',
    weight_kg NUMERIC(5,2),
    datasheet_url TEXT,
    image_url TEXT,
    raw_ond_content TEXT,
    
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. STORAGE BATTERIES (BESS Specifications)
-- ============================================================================
CREATE TABLE solar_batteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    
    cell_chemistry VARCHAR(50) DEFAULT 'LiFePO4',
    voltage_architecture VARCHAR(20) DEFAULT 'LV',
    nominal_voltage_v NUMERIC(6,2) NOT NULL,
    operating_voltage_min_v NUMERIC(6,2) NOT NULL,
    operating_voltage_max_v NUMERIC(6,2) NOT NULL,
    total_energy_kwh NUMERIC(6,2) NOT NULL,
    usable_energy_kwh NUMERIC(6,2) NOT NULL,
    nominal_capacity_ah NUMERIC(6,2) NOT NULL,
    max_c_rate NUMERIC(4,2) DEFAULT 0.5,
    depth_of_discharge_pct NUMERIC(5,2) DEFAULT 90.0,
    cycle_life INT DEFAULT 6000,
    
    communication_protocols TEXT[] DEFAULT '{"CAN", "RS485"}',
    certifications TEXT[] DEFAULT '{"UL 9540", "IEC 62619", "UN 38.3", "CE"}',
    warranty_years INT DEFAULT 10,
    datasheet_url TEXT,
    image_url TEXT,
    
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_panels_slug ON solar_panels(slug);
CREATE INDEX idx_panels_pnom ON solar_panels(pnom_w);
CREATE INDEX idx_inverters_slug ON solar_inverters(slug);
CREATE INDEX idx_inverters_pnom ON solar_inverters(pnom_conv_w);
CREATE INDEX idx_batteries_slug ON solar_batteries(slug);