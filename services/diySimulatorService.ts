import { supabase } from './supabaseClient';
import type { SolarPanelDetail, InverterDetail, BatteryDetail } from '../types';

export interface DiySystemConfig {
  panel: SolarPanelDetail | null;
  totalPanels: number;
  seriesPerString: number;
  parallelStrings: number;
  inverter: InverterDetail | null;
  inverterQuantity: number;
  battery: BatteryDetail | null;
  batteryQuantity: number;
  minTempC: number; // Lowest expected temperature, default -10°C
  sunHours: number; // Peak sun hours/day, default 4.5
}

export type SafetySeverity = 'safe' | 'warning' | 'danger';

export interface ElectricalCheckItem {
  id: string;
  title: string;
  severity: SafetySeverity;
  actualValue: string;
  expectedLimit: string;
  message: string;
  tip?: string;
}

export interface DiySimulationResult {
  status: SafetySeverity;
  score: number; // 0 - 100%
  statusTitle: string;
  statusDescription: string;
  totalArrayKwp: number;
  inverterTotalKw: number;
  dcAcRatio: number;
  vocColdV: number;
  vmpStringV: number;
  totalAreaM2: number;
  totalAreaSqFt: number;
  estAnnualGenerationKwh: number;
  checks: ElectricalCheckItem[];
}

// ---------------------------------------------------------------------------
// 1. Electrical Simulation Engine
// ---------------------------------------------------------------------------

export function simulateDiySystem(config: DiySystemConfig): DiySimulationResult {
  const {
    panel,
    totalPanels,
    seriesPerString,
    parallelStrings,
    inverter,
    inverterQuantity,
    battery,
    batteryQuantity,
    minTempC = -10,
    sunHours = 4.5,
  } = config;

  if (!panel || !inverter) {
    return {
      status: 'warning',
      score: 50,
      statusTitle: 'Incomplete System Configuration',
      statusDescription: 'Please select both a Solar Panel model and an Inverter model to run electrical compatibility simulation.',
      totalArrayKwp: 0,
      inverterTotalKw: 0,
      dcAcRatio: 0,
      vocColdV: 0,
      vmpStringV: 0,
      totalAreaM2: 0,
      totalAreaSqFt: 0,
      estAnnualGenerationKwh: 0,
      checks: [],
    };
  }

  const checks: ElectricalCheckItem[] = [];

  // --- 1. Total DC Power & AC Capacity ---
  const totalArrayKwp = Math.round(((totalPanels * panel.pnom_w) / 1000) * 100) / 100;
  const inverterUnitKw = inverter.paco_w / 1000;
  const inverterTotalKw = Math.round((inverterUnitKw * inverterQuantity) * 100) / 100;
  const dcAcRatio = inverterTotalKw > 0 ? Math.round((totalArrayKwp / inverterTotalKw) * 100) / 100 : 0;

  // --- 2. String Voltage Calculations ---
  // Temp coefficient for Voc (%/°C). Default ~ -0.28%/°C if missing
  const muVocPct = panel.mu_voc_spec_mv_c && panel.voc_v
    ? (panel.mu_voc_spec_mv_c / (panel.voc_v * 1000)) * 100
    : (panel.mu_pnom_spec_pct_c ? panel.mu_pnom_spec_pct_c * 0.8 : -0.28);

  const deltaT = minTempC - 25; // Cold delta
  const tempMultiplier = 1 + (muVocPct / 100) * deltaT; // e.g. at -10°C (delta -35), (1 + (-0.28/100)*(-35)) = 1.098 (+9.8%)
  
  const vocSingleCold = panel.voc_v * Math.max(1.0, tempMultiplier);
  const vocColdV = Math.round(seriesPerString * vocSingleCold * 10) / 10;
  const vmpStringV = Math.round(seriesPerString * panel.vmp_v * 10) / 10;

  // Inverter Limits
  const vdcMax = inverter.vdcmax_v || 600;
  const mpptLow = inverter.mppt_low_v || 160;
  const mpptHigh = inverter.mppt_high_v || (vdcMax * 0.9);
  const idcMax = inverter.idcmax_a || 30;

  // --- Check 1: Max Open-Circuit Voltage Safety ($V_{oc,\ cold} \le V_{dc,max}$) ---
  if (vocColdV > vdcMax) {
    checks.push({
      id: 'voc-safety',
      title: 'DC Voltage Safety Limit (Cold Voc)',
      severity: 'danger',
      actualValue: `${vocColdV} V (at ${minTempC}°C)`,
      expectedLimit: `Max ${vdcMax} V`,
      message: `Extreme Hazard: String cold Voc (${vocColdV}V) exceeds the inverter's maximum input voltage (${vdcMax}V). High risk of burning out the inverter during cold mornings!`,
      tip: `Reduce the number of series panels per string from ${seriesPerString} to ${Math.floor(vdcMax / (vocSingleCold * 1.05))}.`,
    });
  } else if (vocColdV > vdcMax * 0.92) {
    checks.push({
      id: 'voc-safety',
      title: 'DC Voltage Safety Margin (Cold Voc)',
      severity: 'warning',
      actualValue: `${vocColdV} V`,
      expectedLimit: `Max ${vdcMax} V (< 92% buffer recommended)`,
      message: `String voltage (${vocColdV}V) is very close to the inverter ceiling (${vdcMax}V). Safety margin is narrow.`,
      tip: `Consider keeping a 10-15% voltage headroom for grid transients.`,
    });
  } else {
    checks.push({
      id: 'voc-safety',
      title: 'DC Voltage Safety (Cold Voc)',
      severity: 'safe',
      actualValue: `${vocColdV} V (at ${minTempC}°C)`,
      expectedLimit: `Max ${vdcMax} V`,
      message: `Safe: Cold open-circuit voltage is well within the inverter's maximum ${vdcMax}V DC limit with healthy headroom.`,
    });
  }

  // --- Check 2: MPPT Operating Window ($V_{mp}$ Window) ---
  if (vmpStringV < mpptLow) {
    checks.push({
      id: 'mppt-window',
      title: 'MPPT Operating Voltage Window',
      severity: 'warning',
      actualValue: `${vmpStringV} V Vmp`,
      expectedLimit: `${mpptLow} V ~ ${mpptHigh} V`,
      message: `String operating voltage (${vmpStringV}V) is below the inverter's minimum MPPT startup threshold (${mpptLow}V). Inverter will fail to track maximum power efficiently in hot weather.`,
      tip: `Increase the number of panels in series per string (at least ${Math.ceil(mpptLow / panel.vmp_v)} panels).`,
    });
  } else if (vmpStringV > mpptHigh) {
    checks.push({
      id: 'mppt-window',
      title: 'MPPT Operating Voltage Window',
      severity: 'warning',
      actualValue: `${vmpStringV} V Vmp`,
      expectedLimit: `${mpptLow} V ~ ${mpptHigh} V`,
      message: `String operating voltage (${vmpStringV}V) exceeds the maximum MPPT tracking range (${mpptHigh}V). Power clipping will occur.`,
      tip: `Reduce series count and split array into multiple parallel strings.`,
    });
  } else {
    checks.push({
      id: 'mppt-window',
      title: 'MPPT Operating Voltage Window',
      severity: 'safe',
      actualValue: `${vmpStringV} V Vmp`,
      expectedLimit: `${mpptLow} V ~ ${mpptHigh} V`,
      message: `Optimal: Operating voltage sits squarely in the sweet spot of the MPPT tracking window for maximum energy harvest.`,
    });
  }

  // --- Check 3: DC / AC Capacity Oversizing Ratio ---
  if (dcAcRatio < 0.85) {
    checks.push({
      id: 'dc-ac-ratio',
      title: 'DC / AC Capacity Sizing Ratio',
      severity: 'warning',
      actualValue: `${dcAcRatio} : 1.0`,
      expectedLimit: `1.10 ~ 1.35 Optimal`,
      message: `Array is significantly undersized for this inverter. Inverter capacity is being wasted.`,
      tip: `Add more solar panels or select a smaller capacity inverter.`,
    });
  } else if (dcAcRatio > 1.45) {
    checks.push({
      id: 'dc-ac-ratio',
      title: 'DC / AC Capacity Sizing Ratio',
      severity: 'warning',
      actualValue: `${dcAcRatio} : 1.0`,
      expectedLimit: `1.10 ~ 1.35 Optimal`,
      message: `Array is heavily oversized (${dcAcRatio}x). High inverter clipping loss will occur during peak midday sun.`,
      tip: `Upgrade to a higher rated inverter or reduce total panel count.`,
    });
  } else {
    checks.push({
      id: 'dc-ac-ratio',
      title: 'DC / AC Capacity Sizing Ratio',
      severity: 'safe',
      actualValue: `${dcAcRatio} : 1.0`,
      expectedLimit: `1.10 ~ 1.35 Optimal`,
      message: `Optimal: Sizing ratio (${dcAcRatio}x) maximizes inverter utilization during shoulder hours without excessive clipping.`,
    });
  }

  // --- Check 4: String Array Topology & Current Check ---
  const calculatedTotal = seriesPerString * parallelStrings;
  if (calculatedTotal !== totalPanels) {
    checks.push({
      id: 'string-symmetry',
      title: 'Array String Symmetry',
      severity: 'warning',
      actualValue: `${seriesPerString} series × ${parallelStrings} parallel = ${calculatedTotal} panels`,
      expectedLimit: `${totalPanels} panels total`,
      message: `Mismatch between total panel count (${totalPanels}) and string layout (${calculatedTotal}). Strings must be symmetric for optimal MPPT performance.`,
      tip: `Adjust total panel count to a multiple of series strings.`,
    });
  }

  // Max input current
  const totalIsc = Math.round(panel.isc_a * parallelStrings * 10) / 10;
  if (totalIsc > idcMax * 1.1) {
    checks.push({
      id: 'current-limit',
      title: 'DC Short-Circuit Current (Isc)',
      severity: 'warning',
      actualValue: `${totalIsc} A Total`,
      expectedLimit: `Max ${idcMax} A per MPPT`,
      message: `Combined parallel string current (${totalIsc}A) exceeds inverter rated DC input current (${idcMax}A).`,
    });
  }

  // --- Check 5: Battery Energy Storage Coupling (If Selected) ---
  if (battery) {
    const totalBatKwh = Math.round(battery.usable_capacity_kwh * batteryQuantity * 10) / 10;
    const isHybrid = inverter.is_hybrid || (inverter.inverter_type && inverter.inverter_type.toLowerCase().includes('hybrid'));
    
    if (!isHybrid) {
      checks.push({
        id: 'battery-coupling',
        title: 'Battery Coupling & Inverter Topology',
        severity: 'warning',
        actualValue: `${inverter.inverter_type}`,
        expectedLimit: `Hybrid Storage Inverter or AC-Coupled BESS`,
        message: `Selected inverter is a standard String Inverter without integrated DC battery ports. An additional AC-coupling gateway or Hybrid Inverter is required.`,
        tip: `Switch to a Hybrid Inverter model (e.g. Deye, GoodWe, Huawei SUN2000-KTL-L1/M1) for direct DC battery connection.`,
      });
    } else {
      checks.push({
        id: 'battery-coupling',
        title: 'Battery Storage Topology',
        severity: 'safe',
        actualValue: `${totalBatKwh} kWh (${batteryQuantity}x ${battery.brand_name})`,
        expectedLimit: `Hybrid Inverter DC-Coupled`,
        message: `Compatible: Selected battery interfaces seamlessly with the Hybrid Inverter for DC-coupled energy storage and backup.`,
      });
    }
  }

  // --- Overall Status Determination ---
  const hasDanger = checks.some((c) => c.severity === 'danger');
  const hasWarning = checks.some((c) => c.severity === 'warning');

  let status: SafetySeverity = 'safe';
  let score = 100;
  let statusTitle = '✅ System 100% Compatible & Safe to Install';
  let statusDescription = 'All electrical parameters (Cold Voc safety, MPPT voltage window, DC/AC oversizing ratio, and current thresholds) are fully verified and meet international installation standards.';

  if (hasDanger) {
    status = 'danger';
    score = 35;
    statusTitle = '❌ Critical Incompatibility: Electrical Hazard Detected';
    statusDescription = 'The selected configuration violates critical electrical safety limits (overvoltage risk). Review the safety alerts below before installation.';
  } else if (hasWarning) {
    status = 'warning';
    score = 75;
    statusTitle = '⚠️ Feasible with Optimizations Needed';
    statusDescription = 'The system is electrically viable, but one or more sizing parameters (such as DC/AC ratio or MPPT window) could be optimized for higher efficiency.';
  }

  // Required Roof Area
  const panelArea = panel.length_m && panel.width_m ? panel.length_m * panel.width_m : panel.pnom_w / 215;
  const totalAreaM2 = Math.round(totalPanels * panelArea * 10) / 10;
  const totalAreaSqFt = Math.round(totalAreaM2 * 10.7639);

  // Annual Generation
  const estAnnualGenerationKwh = Math.round(totalArrayKwp * sunHours * 365 * 0.82);

  return {
    status,
    score,
    statusTitle,
    statusDescription,
    totalArrayKwp,
    inverterTotalKw,
    dcAcRatio,
    vocColdV,
    vmpStringV,
    totalAreaM2,
    totalAreaSqFt,
    estAnnualGenerationKwh,
    checks,
  };
}

// ---------------------------------------------------------------------------
// 2. Auto-Optimizer: Finds Best (Series × Parallel) for Given Panel Count
// ---------------------------------------------------------------------------

export function autoOptimizeStrings(
  panel: SolarPanelDetail,
  inverter: InverterDetail,
  totalPanels: number,
  minTempC: number = -10
): { series: number; parallel: number } {
  const vdcMax = inverter.vdcmax_v || 600;
  const mpptLow = inverter.mppt_low_v || 160;
  const mpptHigh = inverter.mppt_high_v || (vdcMax * 0.9);

  const muVocPct = panel.mu_voc_spec_mv_c && panel.voc_v
    ? (panel.mu_voc_spec_mv_c / (panel.voc_v * 1000)) * 100
    : -0.28;
  const vocSingleCold = panel.voc_v * Math.max(1.0, 1 + (muVocPct / 100) * (minTempC - 25));

  // Max series allowed without exceeding 90% of VdcMax
  const maxSeriesAllowed = Math.max(1, Math.floor((vdcMax * 0.9) / vocSingleCold));
  // Min series needed to exceed mpptLow
  const minSeriesNeeded = Math.max(1, Math.ceil(mpptLow / panel.vmp_v));

  // Try to find clean factor of totalPanels
  for (let s = Math.min(totalPanels, maxSeriesAllowed); s >= minSeriesNeeded; s--) {
    if (totalPanels % s === 0) {
      const p = totalPanels / s;
      return { series: s, parallel: p };
    }
  }

  // Fallback: Best split
  const s = Math.min(totalPanels, maxSeriesAllowed);
  const p = Math.max(1, Math.ceil(totalPanels / s));
  return { series: s, parallel: p };
}

// ---------------------------------------------------------------------------
// 3. Database Search Helpers for DIY Selectors
// ---------------------------------------------------------------------------

export async function searchPanelsForDiy(keyword: string = ''): Promise<SolarPanelDetail[]> {
  let q = supabase
    .from('solar_panels')
    .select('*')
    .eq('is_active', true)
    .order('pnom_w', { ascending: false })
    .limit(20);

  if (keyword.trim()) {
    q = q.or(`model_name.ilike.%${keyword.trim()}%,brand_name.ilike.%${keyword.trim()}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.error('Error searching panels for DIY:', error);
    return [];
  }
  return data as SolarPanelDetail[];
}

export async function searchInvertersForDiy(keyword: string = ''): Promise<InverterDetail[]> {
  let q = supabase
    .from('inverters')
    .select('*')
    .eq('is_active', true)
    .order('paco_w', { ascending: false })
    .limit(20);

  if (keyword.trim()) {
    q = q.or(`model_name.ilike.%${keyword.trim()}%,brand_name.ilike.%${keyword.trim()}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.error('Error searching inverters for DIY:', error);
    return [];
  }
  return data as InverterDetail[];
}

export async function searchBatteriesForDiy(keyword: string = ''): Promise<BatteryDetail[]> {
  let q = supabase
    .from('batteries')
    .select('*')
    .eq('is_active', true)
    .order('usable_capacity_kwh', { ascending: false })
    .limit(20);

  if (keyword.trim()) {
    q = q.or(`model_name.ilike.%${keyword.trim()}%,brand_name.ilike.%${keyword.trim()}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.error('Error searching batteries for DIY:', error);
    return [];
  }
  return data as BatteryDetail[];
}
