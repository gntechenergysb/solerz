import { supabase } from './supabaseClient';
import type { InverterDetail, InverterFilters, InverterSummary } from '../types';

export interface InvertersResult {
  inverters: InverterSummary[];
  total: number;
}

/**
 * Fetches distinct brands that produce inverters.
 */
export async function fetchInverterBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('inverters')
    .select('brand_name')
    .order('brand_name', { ascending: true });

  if (error) {
    console.error('fetchInverterBrands error:', error);
    return [];
  }

  const set = new Set<string>();
  data?.forEach((r) => {
    if (r.brand_name) set.add(r.brand_name);
  });

  return Array.from(set).sort();
}

/**
 * Fetches a paginated, filtered list of inverter summaries from `v_inverters_summary`.
 */
export async function fetchInvertersSummary(
  filters: InverterFilters,
  page = 1,
  pageSize = 24
): Promise<InvertersResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('v_inverters_summary')
    .select('*', { count: 'exact' });

  // 1. Text search across model_name and brand_name
  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    const numVal = parseFloat(filters.search.trim());
    if (!isNaN(numVal) && numVal > 100) {
      query = query.or(
        `model_name.ilike.${term},brand_name.ilike.${term},paco_w.gte.${numVal - 500}`
      );
    } else {
      query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
    }
  }

  // 2. Brand filter
  if (filters.brandName && filters.brandName !== 'all') {
    query = query.eq('brand_name', filters.brandName);
  }

  // 3. Inverter Type
  if (filters.inverterType && filters.inverterType !== 'all') {
    query = query.eq('inverter_type', filters.inverterType);
  }

  // 4. Power range (AC Paco in Watts)
  switch (filters.powerRange) {
    case 'lt3k':
      query = query.lt('paco_w', 3000);
      break;
    case '3kto10k':
      query = query.gte('paco_w', 3000).lte('paco_w', 10000);
      break;
    case '10kto50k':
      query = query.gte('paco_w', 10000).lte('paco_w', 50000);
      break;
    case 'gt50k':
      query = query.gt('paco_w', 50000);
      break;
    default:
      break;
  }

  // 5. Hybrid battery storage only
  if (filters.isHybridOnly) {
    query = query.eq('is_hybrid', true);
  }

  // Order by AC continuous power descending (largest first)
  query = query
    .order('paco_w', { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('fetchInvertersSummary error:', error);
    throw error;
  }

  return {
    inverters: (data ?? []) as InverterSummary[],
    total: count ?? 0,
  };
}

/**
 * Fetches full inverter details by slug.
 */
export async function fetchInverterBySlug(
  slug: string
): Promise<InverterDetail | null> {
  const { data, error } = await supabase
    .from('inverters')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('fetchInverterBySlug error:', error);
    return null;
  }

  return data as InverterDetail;
}

/**
 * Search inverters for quick search or selector.
 */
export async function searchInverters(
  queryText: string,
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

  query = query.order('paco_w', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('searchInverters error:', error);
    return [];
  }

  return (data ?? []) as InverterSummary[];
}

// ---------------------------------------------------------------------------
// Inverter Competitor Comparisons (Programmatic SEO & Interlinking)
// ---------------------------------------------------------------------------

export interface InverterCompetitorComparison {
  competitor: InverterSummary;
  compareUrl: string;
}

export async function fetchInverterCompetitorComparisons(
  currentInverter: InverterDetail
): Promise<InverterCompetitorComparison[]> {
  const pMin = Math.max(0, Math.round(currentInverter.paco_w * 0.8));
  const pMax = Math.round(currentInverter.paco_w * 1.2);

  const { data, error } = await supabase
    .from('v_inverters_summary')
    .select('*')
    .neq('brand_id', currentInverter.brand_id)
    .gte('paco_w', pMin)
    .lte('paco_w', pMax)
    .order('paco_w', { ascending: false })
    .limit(6);

  if (error || !data) return [];

  return data.map((comp: any) => {
    const sortedSlugs = [currentInverter.slug, comp.slug].sort().join('-vs-');
    return {
      competitor: comp as InverterSummary,
      compareUrl: `/compare/inverters/${sortedSlugs}`,
    };
  });
}

