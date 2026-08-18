import { supabase } from './supabaseClient';
import type { SolarPanelDetail } from '../types';

/**
 * Fetches an array of panels by their slugs (supports 2, 3, 4 panels).
 * Returns array of panels in the requested order.
 */
export async function fetchComparisonPanels(
  slugs: string[]
): Promise<SolarPanelDetail[]> {
  if (!slugs.length) return [];

  const { data, error } = await supabase
    .from('solar_panels')
    .select('*')
    .in('slug', slugs);

  if (error) throw error;
  if (!data) return [];

  // Reorder to match incoming slugs order
  const map = new Map<string, SolarPanelDetail>();
  data.forEach((p: any) => map.set(p.slug, p as SolarPanelDetail));

  return slugs
    .map((slug) => map.get(slug))
    .filter((p): p is SolarPanelDetail => p !== undefined);
}

/**
 * Search panels for the in-page "+ Add to compare" quick picker (GSMarena style)
 */
export async function searchPanelsForCompare(
  queryText: string,
  excludeSlugs: string[] = [],
  limit = 8
): Promise<RelatedPanel[]> {
  let query = supabase
    .from('v_solar_panels_summary')
    .select('id, slug, brand_name, model_name, pnom_w, module_efficiency_pct')
    .limit(limit);

  if (queryText.trim()) {
    const term = `%${queryText.trim()}%`;
    query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
  } else {
    query = query.order('pnom_w', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  const results = (data ?? []) as RelatedPanel[];
  return results.filter((p) => !excludeSlugs.includes(p.slug));
}

// ---------------------------------------------------------------------------
// Fetch related panels for "Related Comparisons" section
// ---------------------------------------------------------------------------

export interface RelatedPanel {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct: number | null;
}

/**
 * Fetches up to `limit` panels with similar power output.
 * Includes both same-brand and cross-brand panels for comprehensive comparison.
 * Used in the "Compare with other panels" section.
 */
export async function fetchRelatedPanels(
  excludeId: string,
  pnomW: number,
  _brandName: string,
  limit = 6
): Promise<RelatedPanel[]> {
  // Look for panels within ±20W of the same power rating
  const { data, error } = await supabase
    .from('v_solar_panels_summary')
    .select('id, slug, brand_name, model_name, pnom_w, module_efficiency_pct')
    .gte('pnom_w', pnomW - 20)
    .lte('pnom_w', pnomW + 20)
    .neq('id', excludeId)
    .order('pnom_w', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as RelatedPanel[];
}
