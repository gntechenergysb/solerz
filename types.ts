// =============================================================================
// Solerz — Solar Panel Hardware Data Types
// =============================================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  tier_rating: string | null;
}

/**
 * Lightweight summary matching the `v_solar_panels_summary` view.
 * Used exclusively on the list/search page to minimize bandwidth.
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
 * Used on the spec detail page (`/panels/:slug`).
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