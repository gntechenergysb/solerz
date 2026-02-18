
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
  // KYC Fields
  ssm_no?: string; // Accessor for backward compatibility if needed, though we prefer new fields
  ssm_new_no?: string;
  ssm_old_no?: string;
  business_address?: string;
  incorporation_date?: string; // YYYY-MM-DD
  nature_of_business?: string;
  ssm_file_path?: string;
  avatar_url?: string;
}

export type Category = 'Panels' | 'Inverters' | 'Batteries' | 'Cable' | 'Protective' | 'Miscellaneous' | 'Accessories';

export type ListingCondition = 'New' | 'Used' | 'Refurbished' | string;

export interface BaseSpecs {
  [key: string]: string | number;
}

export interface PanelSpecs extends BaseSpecs {
  wattage: number;
  cell_type:
    | 'TOPCon'
    | 'BC'
    | 'HJT'
    | 'N-type'
    | 'P-type'
    | 'Bifacial'
    | 'Monofacial'
    | 'Thin-Film'
    | 'Standard Rigid'
    | 'Flexible'
    | 'BIPV'
    | 'Shingled'
    | 'PERC'
    | 'Mono'
    | 'Poly'
    | 'IBC'
    | 'ABC'
    | string;
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
  inverter_type?: 'String' | 'Micro' | 'Microinverter' | 'Hybrid' | 'Off-Grid' | 'Grid-Tied' | 'Central' | string;
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
  battery_type?:
    | 'Rack-mounted'
    | 'Wall-mounted'
    | 'Portable'
    | 'Container'
    | 'Floor-standing'
    | 'All-in-one'
    | string;
  technology:
    | 'LiFePO4'
    | 'NMC'
    | 'LTO'
    | 'Lead-Acid'
    | 'AGM'
    | 'Gel'
    | 'Sodium-Ion'
    | 'Flow'
    | 'Other'
    | string;
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

export interface CableSpecs extends BaseSpecs {
  current_type?: 'DC' | 'AC';
  cable_type?:
    | 'PV1-F'
    | 'H1Z2Z2-K'
    | 'USE-2'
    | 'PV Wire'
    | 'THHN'
    | 'H05VV-F'
    | 'N2XH'
    | 'Battery Cable'
    | 'MV Cable'
    | 'RHW-2'
    | 'THWN-2'
    | string;
  voltage_rating?:
    | '600V'
    | '1000V'
    | '1500V'
    | '1800V'
    | '2000V'
    | '0.6/1kV'
    | '450/750V'
    | '1.8/3kV'
    | '6.35/11kV'
    | '19/33kV'
    | string;
  insulation?: 'XLPE' | 'XLPO' | 'PVC' | 'Halogen-Free' | 'LSHF' | string;
  size_mm2?: number;
  cores?: number;
  length_m?: number;
  conductor?:
    | 'Copper'
    | 'Tinned Copper'
    | 'Aluminum'
    | 'Tinned Copper-Clad Aluminum (TCCA)'
    | 'Aluminum Alloy'
    | string;
}

export interface ProtectiveSpecs extends BaseSpecs {
  device_type?: 'Fuse' | 'Breaker' | 'SPD' | 'Isolator' | 'Other';
  rated_current_a?: number;
  rated_voltage_v?: number;
  poles?: number;
}

export type ProductSpecs = PanelSpecs | InverterSpecs | BatterySpecs | CableSpecs | ProtectiveSpecs | BaseSpecs;

export interface Listing {
  id: string;
  seller_id: string;
  seller_name?: string; // Joined field
  is_verified_seller?: boolean; // Joined field
  seller_type?: 'INDIVIDUAL' | 'COMPANY'; // Joined field
  seller_phone?: string; // Joined field
  seller_email?: string; // Joined field (public)
  seller_business_address?: string; // Joined field (public)
  seller_ssm_new_no?: string; // Joined field (public)
  seller_ssm_old_no?: string; // Joined field (public)
  seller_ssm_no?: string; // Joined field (public)
  title: string;
  category: Category;
  brand: string;
  condition?: ListingCondition;
  specs: ProductSpecs;
  price_rm: number;
  location_state: string;
  images_url: string[];
  active_until: string;
  archive_until: string;
  is_verified_listing: boolean; // New persistent field
  is_sold: boolean;
  is_hidden: boolean;
  is_paused: boolean; // 因配套额度不足暂停
  view_count: number;
  created_at: string;
}

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}
