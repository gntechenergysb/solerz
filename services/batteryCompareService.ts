import { supabase } from './supabaseClient';
import type { BatteryDetail, BatterySummary } from '../types';

/**
 * Fetches 2, 3, or 4 full battery records matching the provided slug array.
 */
export async function fetchComparisonBatteries(slugs: string[]): Promise<BatteryDetail[]> {
  if (!slugs || slugs.length === 0) return [];

  const { data, error } = await supabase
    .from('batteries')
    .select('*')
    .in('slug', slugs);

  if (error) {
    console.error('fetchComparisonBatteries error:', error);
    throw error;
  }

  // Preserve the exact order requested in slugs
  const map = new Map<string, BatteryDetail>();
  (data || []).forEach((b) => map.set(b.slug, b as BatteryDetail));

  return slugs
    .map((slug) => map.get(slug))
    .filter((b): b is BatteryDetail => b !== undefined);
}

/**
 * Quick search for batteries to add into an active comparison.
 */
export async function searchBatteriesForCompare(
  queryText: string,
  excludeSlugs: string[] = [],
  limit = 20
): Promise<BatterySummary[]> {
  let query = supabase
    .from('v_batteries_summary')
    .select('*')
    .limit(limit);

  if (queryText.trim()) {
    const term = `%${queryText.trim()}%`;
    query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
  }

  if (excludeSlugs.length > 0) {
    query = query.not('slug', 'in', `(${excludeSlugs.join(',')})`);
  }

  query = query.order('usable_capacity_kwh', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('searchBatteriesForCompare error:', error);
    return [];
  }

  return (data || []) as BatterySummary[];
}
