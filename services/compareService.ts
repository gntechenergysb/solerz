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

// ---------------------------------------------------------------------------
// Search panels for the in-page "+ Add to compare" quick picker
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
 * High-precision multi-token search for solar panels.
 * Handles single or multi-word queries like "Longi 550", "Tiger Neo", "seg 745".
 */
export async function searchPanelsForCompare(
  queryText: string,
  excludeSlugs: string[] = [],
  limit = 40
): Promise<RelatedPanel[]> {
  let query = supabase
    .from('v_solar_panels_summary')
    .select('id, slug, brand_name, model_name, pnom_w, module_efficiency_pct')
    .limit(limit);

  const cleanQuery = queryText.trim();

  if (cleanQuery) {
    const tokens = cleanQuery.split(/\s+/).filter(Boolean);

    if (tokens.length === 1) {
      const term = `%${tokens[0]}%`;
      // Check if the token is a number (e.g. 550 or 750)
      const numVal = parseFloat(tokens[0]);
      if (!isNaN(numVal) && numVal > 50 && numVal < 1000) {
        query = query.or(
          `model_name.ilike.${term},brand_name.ilike.${term},pnom_w.eq.${numVal}`
        );
      } else {
        query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
      }
    } else {
      // Multiple tokens (e.g. "Longi 550", "SEG 745", "Trina 700")
      // Match each token across brand or model
      tokens.forEach((token) => {
        const term = `%${token}%`;
        const numVal = parseFloat(token);
        if (!isNaN(numVal) && numVal > 50 && numVal < 1000) {
          query = query.or(
            `model_name.ilike.${term},brand_name.ilike.${term},pnom_w.eq.${numVal}`
          );
        } else {
          query = query.or(`model_name.ilike.${term},brand_name.ilike.${term}`);
        }
      });
    }

    query = query.order('pnom_w', { ascending: false });
  } else {
    // Default: Top popular / highest power modules
    query = query.order('pnom_w', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('searchPanelsForCompare error:', error);
    return [];
  }

  const results = (data ?? []) as RelatedPanel[];
  return results.filter((p) => !excludeSlugs.includes(p.slug));
}

// ---------------------------------------------------------------------------
// Fetch related panels for "Related Comparisons" section
// ---------------------------------------------------------------------------

/**
 * Fetches up to `limit` panels with similar power output.
 * Includes both same-brand and cross-brand panels for comprehensive comparison.
 */
export async function fetchRelatedPanels(
  excludeId: string,
  pnomW: number,
  _brandName: string,
  limit = 6
): Promise<RelatedPanel[]> {
  const { data, error } = await supabase
    .from('v_solar_panels_summary')
    .select('id, slug, brand_name, model_name, pnom_w, module_efficiency_pct')
    .gte('pnom_w', pnomW - 25)
    .lte('pnom_w', pnomW + 25)
    .neq('id', excludeId)
    .order('pnom_w', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as RelatedPanel[];
}
