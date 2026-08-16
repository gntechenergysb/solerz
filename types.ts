export interface Brand {
  id: string;
  name: string;
  slug: string;
  headquarters_country?: string;
  website_url?: string;
  logo_url?: string;
  tier_rating?: string;
}

export interface SolarPanel {
  id: string;
  brand_id?: string;
  brand_name: string;
  model_name: string;
  slug: string;
  technol: string;
  ncels: number;
  ncelp: number;
  ndiodes: number;
  pnom_w: number;
  pnom_tol_low_pct: number;
  pnom_tol_up_pct: number;
  voc_v: number;
  isc_a: number;
  vmp_v: number;
  imp_a: number;
  module_efficiency_pct: number;
  mu_isc_ma_c: number;
  mu_voc_spec_pct_c: number;
  mu_pnom_spec_pct_c: number;
  r_serie_ohm?: number;
  r_shunt_ohm?: number;
  is_bifacial: boolean;
  bifaciality_factor: number;
  width_m: number;
  length_m: number;
  depth_m: number;
  weight_kg: number;
  vmax_iec_v: number;
  vmax_ul_v: number;
  certifications: string[];
  warranty_product_years: number;
  warranty_power_years: number;
  datasheet_url?: string;
  image_url?: string;
  raw_pan_content?: string;
  views_count: number;
}

export interface SolarInverter {
  id: string;
  brand_id?: string;
  brand_name: string;
  model_name: string;
  slug: string;
  inverter_type: 'String' | 'Hybrid' | 'Microinverter';
  grid_phases: 'Single Phase' | 'Three Phase';
  pnom_conv_w: number;
  pmax_out_va: number;
  vmin_mpp_v: number;
  vmax_mpp_v: number;
  v_abs_max_v: number;
  imax_pv_a: number;
  nb_mppt: number;
  max_efficiency_pct?: number;
  euro_efficiency_pct?: number;
  is_battery_supported: boolean;
  battery_voltage_type?: 'LV' | 'HV';
  battery_voltage_min_v?: number;
  battery_voltage_max_v?: number;
  max_charge_current_a?: number;
  max_discharge_current_a?: number;
  certifications: string[];
  warranty_years: number;
  ip_rating: string;
  weight_kg?: number;
  datasheet_url?: string;
  image_url?: string;
  raw_ond_content?: string;
  views_count: number;
}

export interface SolarBattery {
  id: string;
  brand_id?: string;
  brand_name: string;
  model_name: string;
  slug: string;
  cell_chemistry: string;
  voltage_architecture: 'LV' | 'HV';
  nominal_voltage_v: number;
  operating_voltage_min_v: number;
  operating_voltage_max_v: number;
  total_energy_kwh: number;
  usable_energy_kwh: number;
  nominal_capacity_ah: number;
  max_c_rate: number;
  depth_of_discharge_pct: number;
  cycle_life: number;
  communication_protocols: string[];
  certifications: string[];
  warranty_years: number;
  datasheet_url?: string;
  image_url?: string;
  views_count: number;
}

// ============================================================================
// Legacy Application Types (Cleaned)
// ============================================================================

export type UserTier = 'UNSUBSCRIBED' | 'STARTER' | 'PRO' | 'ELITE' | 'ENTERPRISE';

export interface Profile {
  id: string;
  email: string;
  company_name: string;
  is_verified: boolean;
  handphone_no?: string | null;
  tier: UserTier;
  pending_tier?: UserTier | null;
  tier_effective_at?: number | null;
  seller_type: 'INDIVIDUAL' | 'COMPANY';
  role: 'ADMIN' | 'SELLER' | 'BUYER';
  created_at: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  stripe_current_period_end?: number | null;
  stripe_current_period_start?: number | null;
  stripe_billing_interval?: 'month' | 'year' | null;
  stripe_cancel_at_period_end?: boolean | null;
  company_reg_no?: string;
  company_doc_path?: string;
  country?: string;
  avatar_url?: string;
}

export interface SalesRepresentative {
  id: string;
  seller_id: string;
  name: string;
  phone: string;
  email?: string | null;
  avatar_url?: string | null;
  whatsapp?: string | null;
  wechat?: string | null;
  telegram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  x_twitter?: string | null;
  skype?: string | null;
  line?: string | null;
  instagram?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Category = 'Panels' | 'Inverters' | 'Batteries' | 'Mounting' | 'Cable' | 'Protective' | 'Accessories' | 'Misc' | 'Full System';

export type ListingCondition = 'New / Unused' | 'Used (Working)' | 'Refurbished (Tested)' | 'For Parts / Repair' | 'Scrap / Recycling' | string;

export interface PriceTier {
  min_quantity: number;
  max_quantity?: number | null;
  price: number;
}

export interface BaseSpecs {
  [key: string]: string | number | boolean | PriceTier[] | null | undefined;
  price_tiers?: PriceTier[];
  video_url?: string;
}

export interface PanelSpecs extends BaseSpecs {
  wattage: number;
  cell_type: string;
  efficiency: number;
  dimensions: string;
  model?: string;
  voc_v?: number;
  isc_a?: number;
  vmp_v?: number;
  imp_a?: number;
  max_system_voltage_v?: number;
  max_fuse_rating_a?: number;
  temp_coeff_pmax_pct_per_c?: number;
  temp_coeff_voc_pct_per_c?: number;
  temp_coeff_isc_pct_per_c?: number;
  weight_kg?: number;
  warranty_years?: number;
}

export interface InverterSpecs extends BaseSpecs {
  inverter_type?: string;
  phase: 'Single' | 'Three';
  max_input_voltage: number;
  efficiency: number;
  warranty_years: number;
  model?: string;
  rated_ac_power_kw?: number;
  max_ac_power_kw?: number;
  mppt_count?: number;
  max_dc_power_kw?: number;
  max_output_current_a?: number;
  protection_rating?: string;
  dimensions?: string;
  weight_kg?: number;
  nominal_frequency_hz?: number;
  nominal_voltage_v?: number;
  max_battery_voltage_v?: number;
  charging_mode?: string;
  communication_protocol?: string;
}

export interface BatterySpecs extends BaseSpecs {
  cycle_life: number;
  capacity_kwh: number;
  nominal_voltage: number;
  battery_type?: string;
  technology: string;
  model?: string;
  usable_capacity_kwh?: number;
  max_charge_kw?: number;
  max_discharge_kw?: number;
  depth_of_discharge_pct?: number;
  warranty_years?: number;
  dimensions?: string;
  weight_kg?: number;
  protection_rating?: string;
  round_trip_efficiency_pct?: number;
  self_discharge_rate_pct_per_month?: number;
  operating_temperature_range_c?: string;
}

export interface MountingSpecs extends BaseSpecs {
  mounting_type?: string;
  material?: string;
  roof_type?: string;
  wind_load_ms?: number;
  snow_load_knm2?: number;
  warranty_years?: number;
}

export interface CableSpecs extends BaseSpecs {
  current_type?: 'DC' | 'AC';
  cable_type?: string;
  voltage_rating?: string;
  insulation?: string;
  size_mm2?: number;
  cores?: number;
  length_m?: number;
  conductor?: string;
}

export interface ProtectiveSpecs extends BaseSpecs {
  device_type?: string;
  rated_current_a?: number;
  rated_voltage_v?: number;
  poles?: number;
}

export interface FullSystemSpecs extends BaseSpecs {
  system_type?: string;
  total_capacity_kwp?: number;
  battery_storage_kwh?: number;
  panel_brand?: string;
  panel_wattage_w?: number;
  panel_cell_type?: string;
  inverter_brand?: string;
  inverter_rated_power_kw?: number;
  inverter_phase?: string;
  inverter_type?: string;
  battery_brand?: string;
  battery_capacity_kwh?: number;
  battery_technology?: string;
  mounting_brand?: string;
  mounting_type?: string;
  mounting_material?: string;
  cable_brand?: string;
  cable_type?: string;
  cable_size_mm2?: number;
  protective_breaker_brand?: string;
  protective_breaker_rated_current_a?: number;
  protective_spd_brand?: string;
  protective_spd_rated_current_a?: number;
  protective_fuse_brand?: string;
  protective_fuse_rated_current_a?: number;
  protective_others_brand?: string;
  protective_others_rated_current_a?: number;
  workmanship_warranty_years?: number;
  panel_power_warranty_years?: number;
  panel_performance_warranty_years?: number;
  other_warranty?: string;
}

export type ProductSpecs = PanelSpecs | InverterSpecs | BatterySpecs | MountingSpecs | CableSpecs | ProtectiveSpecs | FullSystemSpecs | BaseSpecs;

export interface Listing {
  id: string;
  seller_id: string;
  seller_name?: string;
  is_verified_seller?: boolean;
  seller_type?: 'INDIVIDUAL' | 'COMPANY';
  seller_phone?: string;
  seller_email?: string;
  seller_business_address?: string;
  seller_company_reg_no?: string;
  seller_avatar_url?: string;
  title: string;
  category: Category;
  brand: string;
  condition?: ListingCondition;
  specs: ProductSpecs;
  price: number;
  moq?: number;
  currency: string;
  location_country: string;
  location_state: string;
  location_countries?: string[] | null;
  images_url: string[];
  datasheet_url?: string;
  active_until: string;
  archive_until: string;
  is_verified_listing: boolean;
  is_sold: boolean;
  is_hidden: boolean;
  is_paused: boolean;
  view_count: number;
  created_at: string;
}

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}