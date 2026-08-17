import { supabase } from './supabaseClient';
import type { Brand, SolarPanelSummary, SolarPanelDetail, PanelFilters } from '../types';

const PAGE_SIZE = 24;

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, tier_rating')
    .order('name');

  if (error) throw error;
  return (data ?? []) as Brand[];
}

// ---------------------------------------------------------------------------
// Panel list (uses lightweight view `v_solar_panels_summary`)
// ---------------------------------------------------------------------------

export interface PanelListResult {
  panels: SolarPanelSummary[];
  total: number;
}

export async function fetchPanelsSummary(
  filters: PanelFilters,
  page: number
): Promise<PanelListResult> {
  let query = supabase
    .from('v_solar_panels_summary')
    .select('*', { count: 'exact' });

  // Brand filter
  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  // Power range filter
  switch (filters.powerRange) {
    case 'lt400':
      query = query.lt('pnom_w', 400);
      break;
    case '400to550':
      query = query.gte('pnom_w', 400).lte('pnom_w', 550);
      break;
    case 'gt550':
      query = query.gt('pnom_w', 550);
      break;
  }

  // Bifacial filter
  if (filters.bifacialOnly) {
    query = query.eq('is_bifacial', true);
  }

  // Search filter — match on model_name or brand_name
  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
  }

  // Ordering & pagination
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query
    .order('pnom_w', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    panels: (data ?? []) as SolarPanelSummary[],
    total: count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Panel detail (uses full `solar_panels` table)
// ---------------------------------------------------------------------------

export async function fetchPanelBySlug(
  slug: string
): Promise<SolarPanelDetail | null> {
  const { data, error } = await supabase
    .from('solar_panels')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as SolarPanelDetail;
}
