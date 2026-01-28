
export type UserTier = 'STARTER' | 'PRO' | 'MERCHANT' | 'ENTERPRISE';
 
export interface Profile {
  id: string;
  email: string;
  company_name: string;
  ssm_no: string;
  is_verified: boolean;
  whatsapp_no: string;
  tier: UserTier;
  seller_type: 'INDIVIDUAL' | 'COMPANY';
  created_at: string;
}

export type Category = 'Panels' | 'Inverters' | 'Batteries' | 'Accessories';

export interface BaseSpecs {
  [key: string]: string | number;
}

export interface PanelSpecs extends BaseSpecs {
  wattage: number;
  cell_type: 'Monocrystalline' | 'Polycrystalline' | 'Thin-Film';
  efficiency: number;
  dimensions: string;
}

export interface InverterSpecs extends BaseSpecs {
  phase: 'Single' | 'Three';
  max_input_voltage: number;
  efficiency: number;
  warranty_years: number;
}

export interface BatterySpecs extends BaseSpecs {
  cycle_life: number;
  capacity_kwh: number;
  nominal_voltage: number;
  technology: 'LiFePO4' | 'Lead-Acid' | 'Other';
}

export type ProductSpecs = PanelSpecs | InverterSpecs | BatterySpecs | BaseSpecs;

export interface Listing {
  id: string;
  seller_id: string;
  seller_name?: string; // Joined field
  is_verified_seller?: boolean; // Joined field
  seller_type?: 'INDIVIDUAL' | 'COMPANY'; // Joined field
  title: string;
  category: Category;
  brand: string;
  specs: ProductSpecs;
  price_rm: number;
  location_state: string;
  images_url: string[];
  active_until: string;
  archive_until: string;
  is_verified_listing: boolean; // New persistent field
  is_sold: boolean;
  is_hidden: boolean;
  view_count: number;
  created_at: string;
}

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}
