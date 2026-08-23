import { supabase } from './supabaseClient';
import type { SolarPanelDetail } from '../types';

export interface InverterSummary {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  paco_w: number;
  vdcmax_v?: number;
  efficiency_pct?: number;
  warranty_years?: number;
}

export interface BatterySummary {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  usable_capacity_kwh: number;
  nominal_capacity_kwh?: number;
  battery_type?: string;
  warranty_years?: number;
}

export interface SizingInputs {
  monthlyBill: number;       // In USD (or local currency)
  tariffRate: number;        // USD / kWh, default ~0.18
  monthlyKwh?: number;       // Direct kWh if known
  sunHours: number;          // Peak sun hours/day, default 4.5
  systemType: 'residential' | 'commercial';
  includeBattery: boolean;
  batteryHours: number;      // Overnight backup hours or kWh needed
}

export interface SizingResults {
  monthlyKwhNeeded: number;
  dailyKwhNeeded: number;
  targetKw: number;
  targetKwp: number;
  annualGenerationKwh: number;
  estAnnualSavings: number;
  est25YearSavings: number;
  co2OffsetTonsPerYear: number;
}

export interface MatchedHardwareSet {
  id: string;
  title: string;
  tag: string;
  description: string;
  panel: SolarPanelDetail | null;
  panelCount: number;
  totalArrayKwp: number;
  requiredAreaM2: number;
  requiredAreaSqFt: number;
  inverter: InverterSummary | null;
  inverterCount: number;
  battery: BatterySummary | null;
  batteryCount: number;
  dcAcRatio: number;
}

// ---------------------------------------------------------------------------
// 1. Sizing Calculations Engine
// ---------------------------------------------------------------------------

export function calculateSystemSizing(inputs: SizingInputs): SizingResults {
  const monthlyKwh =
    inputs.monthlyKwh && inputs.monthlyKwh > 0
      ? inputs.monthlyKwh
      : inputs.monthlyBill / Math.max(0.01, inputs.tariffRate);

  const dailyKwh = monthlyKwh / 30;

  // Derate factor ~ 0.82 accounts for inverter efficiency, temperature loss, soiling, wiring
  const derateFactor = 0.82;
  const targetKw = dailyKwh / Math.max(1, inputs.sunHours * derateFactor);

  // Standard PV sizing target
  const targetKwp = Math.round(targetKw * 10) / 10;

  // Annual generation
  const annualGenerationKwh = Math.round(targetKwp * inputs.sunHours * 365 * derateFactor);

  // Annual savings ($)
  const estAnnualSavings = Math.round(annualGenerationKwh * inputs.tariffRate);
  
  // 25-Year savings assuming 2.5% annual utility inflation and 0.5%/yr module degradation
  let est25YearSavings = 0;
  for (let year = 1; year <= 25; year++) {
    const degradedGen = annualGenerationKwh * Math.pow(1 - 0.005, year - 1);
    const inflatedTariff = inputs.tariffRate * Math.pow(1 + 0.025, year - 1);
    est25YearSavings += degradedGen * inflatedTariff;
  }
  est25YearSavings = Math.round(est25YearSavings);

  // Carbon offset: ~0.85 lbs CO2 per kWh = ~0.385 kg CO2 per kWh
  const co2OffsetTonsPerYear = Math.round((annualGenerationKwh * 0.000385) * 10) / 10;

  return {
    monthlyKwhNeeded: Math.round(monthlyKwh),
    dailyKwhNeeded: Math.round(dailyKwh * 10) / 10,
    targetKw: Math.round(targetKw * 10) / 10,
    targetKwp,
    annualGenerationKwh,
    estAnnualSavings,
    est25YearSavings,
    co2OffsetTonsPerYear,
  };
}

// ---------------------------------------------------------------------------
// 2. Hardware Recommendation Fetcher
// ---------------------------------------------------------------------------

export async function fetchRecommendedHardware(
  sizing: SizingResults,
  inputs: SizingInputs
): Promise<MatchedHardwareSet[]> {
  const targetKwp = Math.max(2, sizing.targetKwp);
  const isCommercial = inputs.systemType === 'commercial';

  // Target panel wattages:
  // - Residential standard: 410W ~ 460W
  // - Residential high-density: 460W ~ 550W
  // - Commercial standard: 540W ~ 600W
  // - Commercial high-power: 650W ~ 750W
  const minPanelW = isCommercial ? 540 : 410;
  const maxPanelW = isCommercial ? 730 : 500;
  const highDensityW = isCommercial ? 700 : 550;

  try {
    // 1. Fetch Top Quality Panels
    const [standardPanelsRes, highDensityPanelsRes] = await Promise.all([
      supabase
        .from('solar_panels')
        .select('*')
        .eq('is_active', true)
        .gte('pnom_w', minPanelW)
        .lte('pnom_w', maxPanelW)
        .order('module_efficiency_pct', { ascending: false, nullsFirst: false })
        .limit(6),
      supabase
        .from('solar_panels')
        .select('*')
        .eq('is_active', true)
        .gte('pnom_w', highDensityW - 20)
        .order('module_efficiency_pct', { ascending: false, nullsFirst: false })
        .limit(6),
    ]);

    const standardPanel = (standardPanelsRes.data?.[0] || standardPanelsRes.data?.[1]) as SolarPanelDetail | undefined;
    const highDensityPanel = (highDensityPanelsRes.data?.[0] || standardPanel) as SolarPanelDetail | undefined;

    // 2. Fetch Matching Inverters (Target Inverter Power in kW)
    // Target DC/AC ratio ~ 1.20
    const targetInverterKw = targetKwp / 1.2;
    const inverterMinW = Math.max(2000, Math.round((targetInverterKw * 0.7) * 1000));
    const inverterMaxW = Math.round((targetInverterKw * 1.35) * 1000);

    const invertersRes = await supabase
      .from('inverters')
      .select('id, slug, brand_name, model_name, paco_w, vdcmax_v, efficiency_pct, inverter_type')
      .eq('is_active', true)
      .gte('paco_w', inverterMinW)
      .lte('paco_w', inverterMaxW)
      .order('paco_w', { ascending: true })
      .limit(6);

    // Pick best matching inverter
    let matchedInverter: InverterSummary | null = null;
    if (invertersRes.data && invertersRes.data.length > 0) {
      // Find the one closest to targetInverterKw * 1000
      matchedInverter = invertersRes.data.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.paco_w - targetInverterKw * 1000);
        const currDiff = Math.abs(curr.paco_w - targetInverterKw * 1000);
        return currDiff < prevDiff ? curr : prev;
      });
    }

    // 3. Fetch Matching Batteries
    let matchedBattery: BatterySummary | null = null;
    let batteryCount = 1;
    if (inputs.includeBattery) {
      // Target battery storage ~ daily consumption * 0.5 (overnight)
      const targetBatteryKwh = Math.max(5, Math.round((sizing.dailyKwhNeeded * 0.6) * 10) / 10);
      const batteriesRes = await supabase
        .from('batteries')
        .select('id, slug, brand_name, model_name, usable_capacity_kwh, nominal_capacity_kwh, battery_type, warranty_years')
        .eq('is_active', true)
        .order('usable_capacity_kwh', { ascending: false })
        .limit(10);

      if (batteriesRes.data && batteriesRes.data.length > 0) {
        matchedBattery = batteriesRes.data.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.usable_capacity_kwh - targetBatteryKwh);
          const currDiff = Math.abs(curr.usable_capacity_kwh - targetBatteryKwh);
          return currDiff < prevDiff ? curr : prev;
        });

        if (matchedBattery && matchedBattery.usable_capacity_kwh > 0) {
          batteryCount = Math.max(1, Math.round(targetBatteryKwh / matchedBattery.usable_capacity_kwh));
        }
      }
    }

    // Build 3 distinct solutions:
    const solutions: MatchedHardwareSet[] = [];

    // Helper to calculate module array
    const buildSet = (
      id: string,
      title: string,
      tag: string,
      description: string,
      panel: SolarPanelDetail | null,
      inverter: InverterSummary | null,
      battery: BatterySummary | null,
      batCount: number
    ): MatchedHardwareSet => {
      const panelPnom = panel?.pnom_w || 440;
      const panelCount = Math.max(4, Math.ceil((targetKwp * 1000) / panelPnom));
      const totalArrayKwp = Math.round((panelCount * panelPnom) / 10) / 100;
      
      const panelArea =
        panel?.length_m && panel?.width_m
          ? panel.length_m * panel.width_m
          : (panelPnom / 215); // fallback ~215W/m2

      const requiredAreaM2 = Math.round(panelCount * panelArea * 10) / 10;
      const requiredAreaSqFt = Math.round(requiredAreaM2 * 10.7639);

      const inverterPaco = inverter?.paco_w ? inverter.paco_w / 1000 : totalArrayKwp / 1.2;
      const dcAcRatio = Math.round((totalArrayKwp / Math.max(0.1, inverterPaco)) * 100) / 100;

      return {
        id,
        title,
        tag,
        description,
        panel,
        panelCount,
        totalArrayKwp,
        requiredAreaM2,
        requiredAreaSqFt,
        inverter,
        inverterCount: isCommercial && targetKwp > 100 ? Math.ceil(targetKwp / ((inverter?.paco_w || 50000) / 1000)) : 1,
        battery,
        batteryCount: batCount,
        dcAcRatio,
      };
    };

    // Option 1: Balanced Best-Value System
    solutions.push(
      buildSet(
        'best-value',
        'Balanced Performance (Top Pick)',
        'Most Popular',
        'Optimal blend of high-efficiency TopCon/Mono-PERC modules and matching string inverter for lowest levelized cost of energy (LCOE).',
        standardPanel || null,
        matchedInverter,
        inputs.includeBattery ? matchedBattery : null,
        batteryCount
      )
    );

    // Option 2: Space-Saver High Density
    solutions.push(
      buildSet(
        'space-saver',
        'Space-Saver High-Density System',
        'Minimum Roof Area',
        'Uses maximum wattage modules to produce maximum kilowatt-hours while minimizing roof space footprint.',
        highDensityPanel || standardPanel || null,
        matchedInverter,
        inputs.includeBattery ? matchedBattery : null,
        batteryCount
      )
    );

    // Option 3: Premium Energy Independence
    if (matchedBattery) {
      solutions.push(
        buildSet(
          'energy-independence',
          'Solar + Battery Resilience System',
          'Zero Grid Dependency',
          'Complete hybrid architecture with energy storage for continuous power during blackouts and peak-rate arbitrage.',
          standardPanel || null,
          matchedInverter,
          matchedBattery,
          Math.max(2, batteryCount)
        )
      );
    }

    return solutions;
  } catch (err) {
    console.error('Error fetching recommended hardware:', err);
    return [];
  }
}
