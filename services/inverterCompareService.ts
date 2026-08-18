import { supabase } from './supabaseClient';
import type { InverterDetail, InverterSummary } from '../types';

/**
 * Fetches 2, 3, or 4 full inverter records matching the provided slug array.
 */
export async function fetchComparisonInverters(slugs: string[]): Promise<InverterDetail[]> {
  if (!slugs || slugs.length === 0) return [];

  const { data, error } = await supabase
    .from('inverters')
    .select('*')
    .in('slug', slugs);

  if (error) {
    console.error('fetchComparisonInverters error:', error);
    throw error;
  }

  // Preserve the exact order requested in slugs
  const map = new Map<string, InverterDetail>();
  (data || []).forEach((inv) => map.set(inv.slug, inv as InverterDetail));

  return slugs
    .map((slug) => map.get(slug))
    .filter((inv): inv is InverterDetail => inv !== undefined);
}

/**
 * Quick search for inverters to add into an active comparison.
 */
export async function searchInvertersForCompare(
  queryText: string,
  excludeSlugs: string[] = [],
  limit = 20
): Promise<InverterSummary[]> {
  let query = supabase
    .from('v_inverters_summary')
    .select('*')
    .limit(limit);

  if (queryText.trim()) {
    const term = `%${queryText.trim()}%`;
    query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
  }

  if (excludeSlugs.length > 0) {
    query = query.not('slug', 'in', `(${excludeSlugs.join(',')})`);
  }

  query = query.order('paco_w', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('searchInvertersForCompare error:', error);
    return [];
  }

  return (data || []) as InverterSummary[];
}
