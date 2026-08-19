import { supabase } from './supabaseClient';
import type { BatteryDetail, BatteryFilters, BatterySummary } from '../types';

export interface BatteriesResult {
  batteries: BatterySummary[];
  total: number;
}

/**
 * Fetches distinct brands that produce battery storage systems.
 */
export async function fetchBatteryBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('batteries')
    .select('brand_name')
    .order('brand_name', { ascending: true });

  if (error) {
    console.error('fetchBatteryBrands error:', error);
    return [];
  }

  const set = new Set<string>();
  data?.forEach((r) => {
    if (r.brand_name) set.add(r.brand_name);
  });

  return Array.from(set).sort();
}

/**
 * Fetches a paginated, filtered list of battery summaries from `v_batteries_summary`.
 */
export async function fetchBatteriesSummary(
  filters: BatteryFilters,
  page = 1,
  pageSize = 24
): Promise<BatteriesResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('v_batteries_summary')
    .select('*', { count: 'exact' });

  // 1. Text search across model_name and brand_name
  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    const numVal = parseFloat(filters.search.trim());
    if (!isNaN(numVal) && numVal > 0) {
      query = query.or(
        `model_name.ilike.${term},brand_name.ilike.${term},usable_capacity_kwh.gte.${numVal - 2}`
      );
    } else {
      query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
    }
  }

  // 2. Brand filter
  if (filters.brandName && filters.brandName !== 'all') {
    query = query.eq('brand_name', filters.brandName);
  }

  // 3. Chemistry / Battery Type
  if (filters.batteryType && filters.batteryType !== 'all') {
    query = query.eq('battery_type', filters.batteryType);
  }

  // 4. Application Type
  if (filters.applicationType && filters.applicationType !== 'all') {
    query = query.eq('application_type', filters.applicationType);
  }

  // 5. Coupling Type
  if (filters.couplingType && filters.couplingType !== 'all') {
    query = query.eq('coupling_type', filters.couplingType);
  }

  // 6. Capacity Range (kWh)
  switch (filters.capacityRange) {
    case 'lt5k':
      query = query.lt('usable_capacity_kwh', 5.0);
      break;
    case '5kto10k':
      query = query.gte('usable_capacity_kwh', 5.0).lte('usable_capacity_kwh', 10.0);
      break;
    case '10kto20k':
      query = query.gte('usable_capacity_kwh', 10.0).lte('usable_capacity_kwh', 20.0);
      break;
    case 'gt20k':
      query = query.gt('usable_capacity_kwh', 20.0);
      break;
    default:
      break;
  }

  // 7. Sort Order
  switch (filters.sortBy) {
    case 'capacity_desc':
      query = query.order('usable_capacity_kwh', { ascending: false });
      break;
    case 'power_desc':
      query = query.order('continuous_power_kw', { ascending: false });
      break;
    case 'efficiency_desc':
      query = query.order('round_trip_efficiency_pct', { ascending: false });
      break;
    case 'warranty_desc':
      query = query.order('warranty_years', { ascending: false, nullsFirst: false });
      break;
    case 'brand_asc':
      query = query.order('brand_name', { ascending: true }).order('usable_capacity_kwh', { ascending: false });
      break;
    default:
      query = query.order('usable_capacity_kwh', { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('fetchBatteriesSummary error:', error);
    return { batteries: [], total: 0 };
  }

  return {
    batteries: (data as BatterySummary[]) || [],
    total: count ?? 0,
  };
}

/**
 * Fetches a single battery by its URL slug.
 */
export async function fetchBatteryBySlug(slug: string): Promise<BatteryDetail | null> {
  const { data, error } = await supabase
    .from('batteries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error(`fetchBatteryBySlug(${slug}) error:`, error);
    return null;
  }

  return data as BatteryDetail;
}

/**
 * Fetches related battery systems (same chemistry or similar capacity tier).
 */
export async function fetchRelatedBatteries(
  battery: BatteryDetail,
  limit = 4
): Promise<BatterySummary[]> {
  const minCap = Math.max(1, battery.usable_capacity_kwh * 0.7);
  const maxCap = battery.usable_capacity_kwh * 1.4;

  const { data, error } = await supabase
    .from('v_batteries_summary')
    .select('*')
    .neq('slug', battery.slug)
    .gte('usable_capacity_kwh', minCap)
    .lte('usable_capacity_kwh', maxCap)
    .order('usable_capacity_kwh', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRelatedBatteries error:', error);
    return [];
  }

  return (data as BatterySummary[]) || [];
}
