export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  country_code: string;
  city_region: string;
  system_kwp: number;
  panel_brand: string;
  inverter_brand: string;
  role: 'consumer' | 'installer' | 'supplier';
  is_dummy: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  kwh_generated: number;
  system_kwp: number;
  efficiency_kwh_per_kwp: number;
  image_url?: string;
  notes?: string;
  is_dummy: boolean;
  created_at: string;
  profiles?: Profile;
  flex_count?: number;
  user_has_flexed?: boolean;
}

export interface Comment {
  id: string;
  check_in_id: string;
  user_id: string;
  content: string;
  is_dummy: boolean;
  created_at: string;
  profiles?: Profile;
}
