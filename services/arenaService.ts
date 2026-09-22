// =============================================================================
// Solerz — Solar Arena & Leaderboard Benchmark Service
// =============================================================================
// Computes multi-dimensional hardware rankings, Solerz Rating scores (0-100),
// and powers the interactive head-to-head Blind Arena community challenges.
// =============================================================================

import { supabase } from './supabaseClient';
import type { SolarPanelDetail } from '../types';

export interface ArenaRankItem {
  rank: number;
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct: number;
  technol: string;
  is_bifacial: boolean;
  mu_pnom_spec_pct_c: number;
  warranty_power_years: number;
  warranty_product_years: number;
  solerzRating: number; // 0 - 100 overall composite score
  efficiencyScore: number;
  thermalScore: number;
  durabilityScore: number;
  highlights: string[];
  powerBracket: 'residential' | 'commercial' | 'utility';
}

export type ArenaDimension =
  | 'overall'
  | 'efficiency'
  | 'thermal'
  | 'residential'
  | 'commercial'
  | 'bifacial';

export interface BlindMatchupScenario {
  id: string;
  scenarioTitle: string;
  description: string;
  climateZone: string;
  panelA: SolarPanelDetail;
  panelB: SolarPanelDetail;
  votesA: number;
  votesB: number;
}

// -----------------------------------------------------------------------------
// Scoring Math Helpers
// -----------------------------------------------------------------------------
function calculateSolerzRating(panel: {
  module_efficiency_pct?: number | null;
  mu_pnom_spec_pct_c?: number | null;
  technol?: string | null;
  is_bifacial?: boolean;
  bifaciality_factor?: number | null;
  warranty_power_years?: number | null;
}): {
  overall: number;
  efficiency: number;
  thermal: number;
  durability: number;
} {
  // 1. Efficiency Score (18% - 24.5% scale)
  const eff = panel.module_efficiency_pct || 20.5;
  const effScore = Math.min(100, Math.max(40, ((eff - 18.0) / (24.2 - 18.0)) * 60 + 40));

  // 2. Thermal Resilience Score (-0.45 %/°C worst to -0.26 %/°C best)
  const tempCoeff = panel.mu_pnom_spec_pct_c || -0.35;
  // e.g. -0.28%/°C yields ~93 pts; -0.38%/°C yields ~65 pts
  const thermalScore = Math.min(
    100,
    Math.max(30, ((-0.45 - tempCoeff) / (-0.45 - -0.26)) * 70 + 30)
  );

  // 3. Durability & Technology Score
  const tech = (panel.technol || '').toLowerCase();
  const isNType =
    tech.includes('hjt') ||
    tech.includes('hit') ||
    tech.includes('topcon') ||
    tech.includes('ibc') ||
    tech.includes('abc') ||
    tech.includes('n-type');
  const baseDurability = isNType ? 92 : 78;
  const warrantyYears = panel.warranty_power_years || 25;
  const durabilityScore = Math.min(100, baseDurability + (warrantyYears >= 30 ? 6 : 0));

  // 4. Bifacial Bonus (up to 5 extra points)
  const bifacialBonus = panel.is_bifacial ? 5 : 0;

  // Composite Weighted Rating
  const overall =
    0.35 * effScore + 0.30 * thermalScore + 0.25 * durabilityScore + bifacialBonus;

  return {
    overall: Math.round(overall * 10) / 10,
    efficiency: Math.round(effScore * 10) / 10,
    thermal: Math.round(thermalScore * 10) / 10,
    durability: Math.round(durabilityScore * 10) / 10,
  };
}

// -----------------------------------------------------------------------------
// Arena Leaderboard Data Fetching
// -----------------------------------------------------------------------------

export async function fetchArenaLeaderboard(
  dimension: ArenaDimension = 'overall'
): Promise<ArenaRankItem[]> {
  let query = supabase
    .from('solar_panels')
    .select(
      'id, slug, brand_name, model_name, pnom_w, module_efficiency_pct, technol, is_bifacial, mu_pnom_spec_pct_c, warranty_power_years, warranty_product_years, bifaciality_factor'
    )
    .gt('pnom_w', 350)
    .not('module_efficiency_pct', 'is', null);

  // Dimension specific filters
  if (dimension === 'residential') {
    query = query.gte('pnom_w', 400).lte('pnom_w', 490);
  } else if (dimension === 'commercial') {
    query = query.gte('pnom_w', 500).lte('pnom_w', 630);
  } else if (dimension === 'bifacial') {
    query = query.eq('is_bifacial', true);
  }

  // Ordering based on dimension
  if (dimension === 'efficiency') {
    query = query.order('module_efficiency_pct', { ascending: false });
  } else if (dimension === 'thermal') {
    query = query.order('mu_pnom_spec_pct_c', { ascending: false }); // closest to 0 is best
  } else {
    query = query.order('module_efficiency_pct', { ascending: false });
  }

  const { data, error } = await query.limit(60);

  if (error || !data || data.length === 0) {
    console.error('Error fetching arena leaderboard:', error);
    return [];
  }

  // Calculate scores and map items
  const items: ArenaRankItem[] = data.map((p: any) => {
    const scores = calculateSolerzRating(p);
    const pnom = Math.round(p.pnom_w);
    const bracket: 'residential' | 'commercial' | 'utility' =
      pnom < 500 ? 'residential' : pnom <= 630 ? 'commercial' : 'utility';

    const highlights: string[] = [];
    if ((p.module_efficiency_pct || 0) >= 22.5) {
      highlights.push(`Ultra-High Eff (${(p.module_efficiency_pct || 0).toFixed(1)}%)`);
    }
    if ((p.mu_pnom_spec_pct_c || -0.35) >= -0.30) {
      highlights.push(`Superior Temp Coeff (${p.mu_pnom_spec_pct_c}%/°C)`);
    }
    if (p.is_bifacial) {
      highlights.push('Dual-Glass Bifacial');
    }
    if ((p.warranty_power_years || 25) >= 30) {
      highlights.push('30-Yr Linear Warranty');
    }

    return {
      rank: 0,
      id: p.id,
      slug: p.slug,
      brand_name: p.brand_name,
      model_name: p.model_name,
      pnom_w: pnom,
      module_efficiency_pct: p.module_efficiency_pct || 20.5,
      technol: p.technol || 'Mono-c-Si',
      is_bifacial: Boolean(p.is_bifacial),
      mu_pnom_spec_pct_c: p.mu_pnom_spec_pct_c || -0.35,
      warranty_power_years: p.warranty_power_years || 25,
      warranty_product_years: p.warranty_product_years || 15,
      solerzRating: scores.overall,
      efficiencyScore: scores.efficiency,
      thermalScore: scores.thermal,
      durabilityScore: scores.durability,
      highlights: highlights.slice(0, 2),
      powerBracket: bracket,
    };
  });

  // Sort by overall Solerz Rating if 'overall', 'residential', 'commercial', or 'bifacial'
  if (dimension === 'thermal') {
    items.sort((a, b) => b.thermalScore - a.thermalScore);
  } else if (dimension === 'efficiency') {
    items.sort((a, b) => b.module_efficiency_pct - a.module_efficiency_pct);
  } else {
    items.sort((a, b) => b.solerzRating - a.solerzRating);
  }

  // Assign 1-indexed ranks
  return items.slice(0, 30).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

// -----------------------------------------------------------------------------
// Interactive Blind Arena Matchups (Community Engineering Consensus)
// -----------------------------------------------------------------------------

export const SAMPLE_MATCHUPS: {
  scenarioTitle: string;
  description: string;
  climateZone: string;
  slugA: string;
  slugB: string;
  initialVotesA: number;
  initialVotesB: number;
}[] = [
  {
    scenarioTitle: 'High-Temperature Coastal Rooftop (45°C Ambient)',
    description:
      'A 12 kW commercial rooftop in a maritime hot-humid region with afternoon ambient heat up to 42°C. Which module retains more real-world energy?',
    climateZone: 'Tropical / High Heat (Zone 1)',
    slugA: 'aiko-solar-energy-ak-a455-mah54db',
    slugB: 'longi-green-energy-technology-lr5-54htb-435m',
    initialVotesA: 142,
    initialVotesB: 128,
  },
  {
    scenarioTitle: 'Cold-Climate High-Snow Ground Mount (Zone 6)',
    description:
      'Ground-mount installation in Minnesota enduring -25°C winter mornings and 5400 Pa heavy snowpack. Max string Voc and frame deflection are critical.',
    climateZone: 'Sub-Zero Winter (Zone 6)',
    slugA: 'jinko-solar-co-ltd-jkm580n-72hl4-bdv',
    slugB: 'trina-solar-co-ltd-tsm-580deg20c-20',
    initialVotesA: 215,
    initialVotesB: 198,
  },
];
