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
  datasheet_url?: string | null;
  raw_pan_content: string | null;

  // --- Group 1: NMOT / NOCT Real-World Specs (800 W/m², 20°C, 1m/s wind) ---
  noct_c?: number | null;
  pnom_nmot_w?: number | null;
  vmp_nmot_v?: number | null;
  imp_nmot_a?: number | null;
  voc_nmot_v?: number | null;
  isc_nmot_a?: number | null;

  // --- Group 2: Electrical Protection & System Limits ---
  max_series_fuse_a?: number | null;
  power_tolerance?: string | null;
  operating_temp_range?: string | null;

  // --- Group 3: Mechanical Load & Materials ---
  front_load_pa?: number | null;
  rear_load_pa?: number | null;
  glass_type?: string | null;
  frame_type?: string | null;
  junction_box_ip?: string | null;
  connector_type?: string | null;

  // --- Group 4: Bifacial Rear-side Gain (Dual-Glass) ---
  bifacial_gain_5pct_w?: number | null;
  bifacial_gain_15pct_w?: number | null;
  bifacial_gain_25pct_w?: number | null;

  // --- Group 5: Packaging & Logistics ---
  pcs_per_pallet?: number | null;
  pcs_per_40hq_container?: number | null;
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
  datasheet_url?: string | null;
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

/**
 * Battery types and application categories.
 */
export type BatteryChemistry = 'all' | 'LiFePO4' | 'NMC' | 'LTO' | 'Lead-Carbon' | 'Flow';
export type BatteryApplication = 'all' | 'Residential' | 'Commercial' | 'Utility-Scale' | 'Portable';
export type BatteryCoupling = 'all' | 'DC-Coupled' | 'AC-Coupled' | 'All-in-One';

/**
 * Lightweight battery summary for list view, search, and cards.
 */
export interface BatterySummary {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  battery_type: string;
  application_type: string;
  coupling_type: string;
  usable_capacity_kwh: number;
  continuous_power_kw: number;
  peak_power_kw: number | null;
  nominal_voltage_v: number;
  round_trip_efficiency_pct: number;
  cycle_life_count: number | null;
  warranty_years: number | null;
  max_parallel_units: number | null;
  ip_rating: string | null;
  is_active: boolean;
}

/**
 * Full battery detail including electrical specifications, scalability, and physical dimensions.
 */
export interface BatteryDetail extends BatterySummary {
  brand_id: string | null;
  nominal_capacity_kwh: number | null;
  operating_voltage_min_v: number | null;
  operating_voltage_max_v: number | null;
  max_continuous_current_a: number | null;
  depth_of_discharge_pct: number | null;
  warranty_energy_throughput_mwh: number | null;
  operating_temp_min_c: number | null;
  operating_temp_max_c: number | null;
  weight_kg: number | null;
  dimensions_mm: string | null;
  certifications: string | null;
  datasheet_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Filter state for the batteries list page.
 */
export interface BatteryFilters {
  search: string;
  brandName: string;
  batteryType: BatteryChemistry;
  applicationType: BatteryApplication;
  couplingType: BatteryCoupling;
  capacityRange: 'all' | 'lt5k' | '5kto10k' | '10kto20k' | 'gt20k';
  sortBy: 'capacity_desc' | 'power_desc' | 'efficiency_desc' | 'warranty_desc' | 'brand_asc';
}