// =============================================================================
// Solerz — Solar Hardware Data Types (Panels & Inverters)
// =============================================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  tier_rating: string | null;
}

// -----------------------------------------------------------------------------
// Solar Panels Types
// -----------------------------------------------------------------------------

/**
 * Lightweight summary matching the `v_solar_panels_summary` view.
 */
export interface SolarPanelSummary {
  id: string;
  brand_id: string;
  brand_name: string;
  model_name: string;
  slug: string;
  technol: string;
  pnom_w: number;
  module_efficiency_pct: number | null;
  is_bifacial: boolean;
  vmp_v: number;
  imp_a: number;
  length_m: number | null;
  width_m: number | null;
  weight_kg: number | null;
  warranty_product_years: number;
}

/**
 * Full detail record from the `solar_panels` table.
 */
export interface SolarPanelDetail extends SolarPanelSummary {
  ncels: number;
  ncelp: number;
  ndiodes: number;
  pnom_tol_low_pct: number;
  pnom_tol_up_pct: number;
  voc_v: number;
  isc_a: number;
  mu_isc_ma_c: number;
  mu_voc_spec_mv_c: number;
  mu_pnom_spec_pct_c: number;
  r_serie_ohm: number | null;
  r_shunt_ohm: number | null;
  rp_0_ohm: number | null;
  rp_exp: number | null;
  gamma: number | null;
  bifaciality_factor: number | null;
  depth_m: number | null;
  vmax_iec_v: number | null;
  vmax_ul_v: number | null;
  warranty_power_years: number | null;
  raw_pan_content: string | null;
}

/**
 * Filter state for the panels list page.
 */
export interface PanelFilters {
  search: string;
  brandId: string;
  powerRange: 'all' | 'lt400' | '400to550' | 'gt550';
  bifacialOnly: boolean;
}

// -----------------------------------------------------------------------------
// Inverters Types (PVSyst .OND / CEC Sandia Standard)
// -----------------------------------------------------------------------------

export type InverterType =
  | 'String Inverter'
  | 'Microinverter'
  | 'Hybrid Storage Inverter'
  | 'Utility Central Inverter';

/**
 * Lightweight summary matching `v_inverters_summary` view.
 */
export interface InverterSummary {
  id: string;
  brand_id: string;
  brand_name: string;
  model_name: string;
  slug: string;
  inverter_type: InverterType;
  vac_v: number;
  paco_w: number;
  efficiency_pct: number | null;
  is_hybrid: boolean;
  vdcmax_v: number;
  idcmax_a: number;
  mppt_low_v: number;
  mppt_high_v: number;
}

/**
 * Full detail record from the `inverters` table.
 */
export interface InverterDetail extends InverterSummary {
  pdco_w: number;
  vdco_v: number;
  pso_w: number;
  pnt_w: number;
  c0: number | null;
  c1: number | null;
  c2: number | null;
  c3: number | null;
  cec_cert_date: string | null;
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Filter state for the inverters list page.
 */
export interface InverterFilters {
  search: string;
  brandName: string;
  inverterType: 'all' | 'String Inverter' | 'Microinverter' | 'Hybrid Storage Inverter' | 'Utility Central Inverter';
  powerRange: 'all' | 'lt3k' | '3kto10k' | '10kto50k' | 'gt50k';
  isHybridOnly: boolean;
}