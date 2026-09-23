// =============================================================================
// Solerz — Engineering Heuristics Engine (Deterministic Photovoltaic Physics)
// =============================================================================
// This engine evaluates physical, electrical, thermal, and mechanical trade-offs
// between solar modules using first-principles solar physics and international
// engineering standards (IEC 61215, IEC 62548, NEC 690, ASCE 7-22, NREL).
//
// Designed to run in both Edge Functions (Cloudflare Workers) and Client UI.
// =============================================================================

export interface PanelLike {
  id?: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct?: number | null;
  technol?: string | null;
  is_bifacial?: boolean;
  vmp_v: number;
  imp_a: number;
  voc_v: number;
  isc_a: number;
  mu_pnom_spec_pct_c: number;
  mu_voc_spec_mv_c: number;
  mu_isc_ma_c?: number | null;
  r_serie_ohm?: number | null;
  r_shunt_ohm?: number | null;
  gamma?: number | null;
  bifaciality_factor?: number | null;
  ncels?: number | null;
  ndiodes?: number | null;
  length_m?: number | null;
  width_m?: number | null;
  weight_kg?: number | null;
  warranty_product_years?: number | null;
  warranty_power_years?: number | null;
  noct_c?: number | null;
  front_load_pa?: number | null;
  max_series_fuse_a?: number | null;
}

export type VerdictCategory =
  | 'thermal'
  | 'electrical'
  | 'degradation'
  | 'bifacial'
  | 'mechanical'
  | 'bos'
  | 'safety';

export interface EngineeringVerdict {
  id: string;
  category: VerdictCategory;
  categoryLabel: string;
  title: string;
  badge: string;
  summary: string;
  analysisHtml: string;
  formula: string;
  standardRef: string;
  importance: 'critical' | 'high' | 'medium';
  winnerSlug: string | null;
  winnerModelName: string | null;
  isTie: boolean;
  handbookSlug?: string;
  handbookTitle?: string;
  metrics: {
    panelSlug: string;
    modelName: string;
    value: number | string;
    formatted: string;
    isAdvantage: boolean;
  }[];
}

// -----------------------------------------------------------------------------
// Helper math & formatting functions
// -----------------------------------------------------------------------------
const round = (val: number, decimals = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
};

const getTechCategory = (tech?: string | null): 'n_type' | 'p_type' | 'poly' | 'thin_film' => {
  if (!tech) return 'p_type';
  const t = tech.toLowerCase();
  if (t.includes('hjt') || t.includes('hit') || t.includes('topcon') || t.includes('ibc') || t.includes('abc') || t.includes('n-type')) {
    return 'n_type';
  }
  if (t.includes('poly') || t.includes('multi')) {
    return 'poly';
  }
  if (t.includes('cdte') || t.includes('cigs') || t.includes('amorphous')) {
    return 'thin_film';
  }
  return 'p_type';
};

// -----------------------------------------------------------------------------
// Heuristic 1: Extreme Cold Voc Surge & String Sizing (NEC 690.7)
// -----------------------------------------------------------------------------
function evalColdVocSurge(panels: PanelLike[]): EngineeringVerdict {
  const coldTempC = -15; // Standard design cold condition (-15°C)
  const systemVoltageLimit = 1000; // 1000V C&I standard (or 1500V)

  const metrics = panels.map((p) => {
    // mu_voc_spec_mv_c is in mV/°C (typically negative, e.g. -270 mV/°C)
    const muVocVPerC = (p.mu_voc_spec_mv_c || -270) / 1000;
    const deltaT = coldTempC - 25; // -40°C
    const vocCold = p.voc_v + muVocVPerC * deltaT;
    const surgePct = ((vocCold - p.voc_v) / p.voc_v) * 100;
    const maxStringLen = Math.floor(systemVoltageLimit / vocCold);

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      vocCold: round(vocCold, 1),
      surgePct: round(surgePct, 1),
      maxStringLen,
      rawScore: maxStringLen, // Higher string length reduces BOS combiner cost
    };
  });

  const maxLen = Math.max(...metrics.map((m) => m.maxStringLen));
  const minLen = Math.min(...metrics.map((m) => m.maxStringLen));
  const isTie = maxLen === minLen;
  const best = metrics.find((m) => m.maxStringLen === maxLen);

  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Under extreme winter design temperatures (<strong>${coldTempC}°C</strong> ambient), open-circuit voltage surges by up to <strong>${Math.max(...metrics.map((m) => m.surgePct))}%</strong> due to the negative temperature coefficient of silicon PN junctions. Under a standard 1,000V DC system limit, <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> safely permits <strong>${maxLen} modules per string</strong> compared to <strong>${minLen} modules</strong> for the tighter models, reducing overall DC home-run combiner wiring and balance-of-system cost by up to <strong>${round(((maxLen - minLen) / maxLen) * 100, 1)}%</strong>.`;

  return {
    id: 'cold-voc-string-sizing',
    category: 'electrical',
    categoryLabel: 'Electrical & String Sizing',
    title: 'Extreme Cold Voc Surge & Max String Sizing',
    badge: 'NEC 690.7 Safety',
    summary: `Calculates maximum string voltage surge at ${coldTempC}°C to prevent inverter input over-voltage destruction.`,
    analysisHtml,
    formula: 'Voc(cold) = Voc_STC + [mu_Voc_mV * (T_cold - 25°C) / 1000]',
    standardRef: 'NEC Article 690.7 & IEC 62548 Clause 7.3',
    importance: 'critical',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'cold-voc-temperature-compensation',
    handbookTitle: 'Winter Cold Voc Voltage Derating Formula',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.vocCold,
      formatted: `${m.vocCold}V (${m.maxStringLen} mods/str)`,
      isAdvantage: !isTie && m.maxStringLen === maxLen,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 2: High-Temperature Power Yield Derating (65°C Cell Temp)
// -----------------------------------------------------------------------------
function evalHighTempDerating(panels: PanelLike[]): EngineeringVerdict {
  // Cell temperature at 35°C ambient, 1000 W/m² irradiance ~ 65°C
  const cellTempC = 65;
  const deltaT = cellTempC - 25; // 40°C above STC

  const metrics = panels.map((p) => {
    const coeff = p.mu_pnom_spec_pct_c || -0.35; // e.g. -0.29 %/°C for HJT/TOPCon vs -0.36 %/°C for PERC
    const powerLossPct = Math.abs(coeff * deltaT);
    const hotPowerW = p.pnom_w * (1 - powerLossPct / 100);
    const retainedRatio = (hotPowerW / p.pnom_w) * 100;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      coeff,
      powerLossPct: round(powerLossPct, 2),
      hotPowerW: round(hotPowerW, 1),
      retainedRatio: round(retainedRatio, 1),
    };
  });

  const bestRetained = Math.max(...metrics.map((m) => m.retainedRatio));
  const worstRetained = Math.min(...metrics.map((m) => m.retainedRatio));
  const isTie = Math.abs(bestRetained - worstRetained) < 0.2;
  const best = metrics.find((m) => m.retainedRatio === bestRetained);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `At peak midday summer operation with a cell junction temperature of <strong>65°C</strong> (40°C above standard STC 25°C), thermal degradation causes significant output reduction. <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> maintains <strong>${bestRetained}%</strong> of its nameplate power (${best?.coeff}%/°C) versus <strong>${worstRetained}%</strong> on less thermally resilient modules. In tropical, desert, or hot rooftop climates (>35°C ambient), this thermal gap accounts for a <strong>${round(bestRetained - worstRetained, 2)}% net annual kWh yield variance</strong>.`;

  return {
    id: 'high-temp-thermal-derating',
    category: 'thermal',
    categoryLabel: 'Thermal Dynamics',
    title: 'Midday Hot-Climate Power Retention (65°C Cell)',
    badge: 'Thermal Yield',
    summary: 'Evaluates real-world kilowatt output under realistic solar rooftop heating conditions.',
    analysisHtml,
    formula: 'P_hot = P_stc * [1 + (mu_Pnom_% * (T_cell - 25°C) / 100)]',
    standardRef: 'IEC 61215 MQT 04 Temperature Coefficients',
    importance: 'critical',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'summer-mppt-low-voltage-trap',
    handbookTitle: 'Summer Noon MPPT Low-Voltage Drop Trap',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.hotPowerW,
      formatted: `${m.hotPowerW}W (${m.retainedRatio}% left)`,
      isAdvantage: !isTie && m.retainedRatio === bestRetained,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 3: 25-Year / 30-Year Lifecycle Degradation & Cumulative Harvest
// -----------------------------------------------------------------------------
function evalDegradationLifetime(panels: PanelLike[]): EngineeringVerdict {
  const metrics = panels.map((p) => {
    const techType = getTechCategory(p.technol);
    // N-Type TOPCon/HJT/IBC vs P-Type PERC degradation benchmarks
    const firstYearDeg = techType === 'n_type' ? 1.0 : techType === 'poly' ? 2.5 : 2.0;
    const annualDeg = techType === 'n_type' ? 0.40 : techType === 'poly' ? 0.65 : 0.55;
    const years = p.warranty_power_years || (techType === 'n_type' ? 30 : 25);

    // Remaining output at Year 25
    const remainingPctYr25 = 100 - (firstYearDeg + 24 * annualDeg);

    // Cumulative MWh per 10 kW DC system over 25 years (assuming 1,450 peak sun hours/yr)
    let cumulativeKwhPerKw = 0;
    for (let yr = 1; yr <= 25; yr++) {
      const degFactor = yr === 1 ? 1 - firstYearDeg / 100 : 1 - (firstYearDeg + (yr - 1) * annualDeg) / 100;
      cumulativeKwhPerKw += 1450 * degFactor;
    }
    const cumulativeMwh10kW = round((cumulativeKwhPerKw * 10) / 1000, 1);

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      techType,
      firstYearDeg,
      annualDeg,
      remainingPctYr25: round(remainingPctYr25, 1),
      cumulativeMwh10kW,
      warrantyYears: years,
    };
  });

  const bestRemaining = Math.max(...metrics.map((m) => m.remainingPctYr25));
  const worstRemaining = Math.min(...metrics.map((m) => m.remainingPctYr25));
  const isTie = Math.abs(bestRemaining - worstRemaining) < 0.5;
  const best = metrics.find((m) => m.remainingPctYr25 === bestRemaining);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const deltaMwh = round(Math.max(...metrics.map((m) => m.cumulativeMwh10kW)) - Math.min(...metrics.map((m) => m.cumulativeMwh10kW)), 1);

  const analysisHtml = `Accounting for Light-Induced Degradation (LID) and Light-and-elevated-Temperature-Induced Degradation (LeTID), <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> preserves <strong>${bestRemaining}%</strong> of original rated power at Year 25 (${best?.annualDeg}%/yr degradation) compared to <strong>${worstRemaining}%</strong> on conventional models. Over a standard 25-year asset lifecycle for a 10 kW residential array, this creates an incremental generation delta of <strong>+${deltaMwh} MWh of clean electricity</strong>.`;

  return {
    id: 'lifetime-degradation-yield',
    category: 'degradation',
    categoryLabel: 'Lifetime Degradation',
    title: '25-Year Lifecycle Output & LID/LeTID Retention',
    badge: '25-Year LCOE',
    summary: 'Models 25-year cumulative kilowatt-hour generation based on cell silicon wafer metallurgy.',
    analysisHtml,
    formula: 'Yield(Yr25) = 100% - [FirstYearDeg% + 24 * AnnualDeg%]',
    standardRef: 'IEC 61215 MQT 19 Stabilization & NREL PV Fleet Reliability',
    importance: 'high',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'ntype-vs-ptype-low-light-physics',
    handbookTitle: 'N-Type vs P-Type Carrier Lifetime & Degradation',

    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.remainingPctYr25,
      formatted: `${m.remainingPctYr25}% (Yr25) / ${m.cumulativeMwh10kW} MWh`,
      isAdvantage: !isTie && m.remainingPctYr25 === bestRemaining,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 4: Bifacial Albedo Rear-side Gain (Ground Reflectivity)
// -----------------------------------------------------------------------------
function evalBifacialAlbedoGain(panels: PanelLike[]): EngineeringVerdict {
  const albedo = 0.35; // Light crushed gravel / concrete commercial flat roof
  const viewFactor = 0.70; // Standard ground/roof clearance factor

  const metrics = panels.map((p) => {
    const isBifacial = Boolean(p.is_bifacial);
    const bifaciality = p.bifaciality_factor || (isBifacial ? 0.75 : 0);
    const rearGainPct = isBifacial ? albedo * bifaciality * viewFactor * 100 : 0;
    const effectivePowerW = p.pnom_w * (1 + rearGainPct / 100);

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      isBifacial,
      bifaciality: round(bifaciality * 100, 0),
      rearGainPct: round(rearGainPct, 1),
      effectivePowerW: round(effectivePowerW, 1),
    };
  });

  const bestEffective = Math.max(...metrics.map((m) => m.effectivePowerW));
  const worstEffective = Math.min(...metrics.map((m) => m.effectivePowerW));
  const isTie = Math.abs(bestEffective - worstEffective) < 2;
  const best = metrics.find((m) => m.effectivePowerW === bestEffective);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `When deployed over reflective substrates (such as light gravel, white TPO commercial membrane roofs, or snow with 35% albedo), rear-side photon absorption provides significant boost. <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> yields an effective output of <strong>${best?.effectivePowerW}W (+${best?.rearGainPct}% gain)</strong> thanks to a ${best?.bifaciality}% bifaciality factor, providing higher energy density per installed structure.`;

  return {
    id: 'bifacial-albedo-gain',
    category: 'bifacial',
    categoryLabel: 'Bifacial Performance',
    title: 'Bifacial Rear-Side Gain over Reflective Substrates',
    badge: 'Albedo Harvest',
    summary: 'Simulates rear-side photovoltaic harvest over crushed gravel or commercial white TPO membrane.',
    analysisHtml,
    formula: 'P_effective = P_stc * [1 + (Albedo * BifacialityFactor * ViewFactor)]',
    standardRef: 'IEC TS 60904-1-2 Bifacial Measurement Standard',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'bifacial-mounting-height-rule',
    handbookTitle: 'Bifacial Solar Panel Minimum Elevation Rule',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.effectivePowerW,
      formatted: `${m.effectivePowerW}W (+${m.rearGainPct}% rear)`,
      isAdvantage: !isTie && m.effectivePowerW === bestEffective,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 5: DC Cable Ohm Heating Loss (40m Run - I²R Loss)
// -----------------------------------------------------------------------------
function evalDcCableLoss(panels: PanelLike[]): EngineeringVerdict {
  const wireLengthM = 40; // 40m array-to-inverter one-way (80m loop)
  const copperResistivity = 0.0175; // Ohm * mm² / m
  const wireAreaMm2 = 4.0; // Standard 4mm² (12 AWG) solar PV cable
  const cableResistanceOhm = (2 * wireLengthM * copperResistivity) / wireAreaMm2; // 0.35 Ohm

  const metrics = panels.map((p) => {
    const current = p.imp_a;
    const powerLossWatts = Math.pow(current, 2) * cableResistanceOhm;
    const lossPercentage = (powerLossWatts / (p.pnom_w * 10)) * 100; // Assuming 10-panel string

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      imp: round(current, 2),
      powerLossWatts: round(powerLossWatts, 1),
      lossPercentage: round(lossPercentage, 2),
    };
  });

  const minLoss = Math.min(...metrics.map((m) => m.powerLossWatts));
  const maxLoss = Math.max(...metrics.map((m) => m.powerLossWatts));
  const isTie = Math.abs(minLoss - maxLoss) < 3;
  const best = metrics.find((m) => m.powerLossWatts === minLoss);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Due to Joule heating loss ($P = I^2 R$), operating current (Imp) drastically alters DC cable efficiency over a standard 40m array loop ($4\\text{ mm}^2$ / 12 AWG copper). <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> operates at <strong>${best?.imp}A</strong>, dissipating only <strong>${minLoss}W (${best?.lossPercentage}% of string power)</strong>, while high-current alternatives with large 210mm wafers dissipate <strong>${maxLoss}W</strong>, frequently mandating up-sizing to thicker $6\\text{ mm}^2$ or $10\\text{ mm}^2$ wiring to prevent thermal throttling.`;

  return {
    id: 'dc-cable-joule-loss',
    category: 'electrical',
    categoryLabel: 'Electrical & Cabling',
    title: 'DC String Cable Ohm Heating Loss (40m Run)',
    badge: 'I²R Efficiency',
    summary: 'Calculates resistive wattage dissipation and cable gauge upgrade requirements.',
    analysisHtml,
    formula: 'P_loss = Imp² * (2 * Length * rho / Area)',
    standardRef: 'NEC 310 & IEC 60364-5-52 Cable Sizing Rules',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'dc-voltage-drop-cable-sizing',
    handbookTitle: 'DC Cable Voltage Drop & Wire Sizing Rule',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.powerLossWatts,
      formatted: `${m.powerLossWatts}W loss (${m.imp}A Imp)`,
      isAdvantage: !isTie && m.powerLossWatts === minLoss,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 6: Maximum Series Fuse & OCPD Protection (NEC 690.8/690.9)
// -----------------------------------------------------------------------------
function evalFuseOcpd(panels: PanelLike[]): EngineeringVerdict {
  const metrics = panels.map((p) => {
    const isc = p.isc_a;
    // NEC 690.8 continuous duty factor: Isc * 1.25 * 1.25 = 1.5625 * Isc
    const minOcpdCalc = isc * 1.5625;
    const stdFuseSteps = [15, 20, 25, 30, 35, 40];
    const recommendedFuseA = stdFuseSteps.find((f) => f >= minOcpdCalc) || Math.ceil(minOcpdCalc / 5) * 5;
    const manufacturerRatingA = p.max_series_fuse_a || recommendedFuseA;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      isc: round(isc, 2),
      minOcpdCalc: round(minOcpdCalc, 1),
      recommendedFuseA,
      manufacturerRatingA,
    };
  });

  const minFuse = Math.min(...metrics.map((m) => m.recommendedFuseA));
  const maxFuse = Math.max(...metrics.map((m) => m.recommendedFuseA));
  const isTie = minFuse === maxFuse;
  const best = metrics.find((m) => m.recommendedFuseA === minFuse);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Under NEC 690.8/690.9 overcurrent protection rules, strings require a continuous duty multiplier of $1.5625 \\times I_{sc}$. <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> draws a lower short-circuit current of <strong>${best?.isc}A</strong>, qualifying for standard <strong>${minFuse}A fuses</strong>, while high-current modules push OCPD requirements to <strong>${maxFuse}A</strong>. Lower fuse ratings lower combiner enclosure thermal buildup and reduce potential arc flash incident energy.`;

  return {
    id: 'fuse-ocpd-rating',
    category: 'safety',
    categoryLabel: 'Safety & Protection',
    title: 'Maximum Series Fuse & OCPD String Protection',
    badge: 'NEC 690.8/9 Code',
    summary: 'Determines combiner box fuse ampacity and arc flash risk profile.',
    analysisHtml,
    formula: 'Fuse_Rating = Isc * 1.25 (Continuous) * 1.25 (Over-irradiance)',
    standardRef: 'NEC Article 690.8 & UL 1741 Safety Standard',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'dc-voltage-drop-cable-sizing',
    handbookTitle: 'DC Cable & Overcurrent Protection Sizing',

    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.recommendedFuseA,
      formatted: `${m.recommendedFuseA}A OCPD (Isc: ${m.isc}A)`,
      isAdvantage: !isTie && m.recommendedFuseA === minFuse,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 7: 5400 Pa Extreme Mechanical Snow/Wind Force & Deflection
// -----------------------------------------------------------------------------
function evalMechanicalLoad(panels: PanelLike[]): EngineeringVerdict {
  const testPressurePa = 5400; // IEC 61215 heavy snow load test (5,400 N/m²)

  const metrics = panels.map((p) => {
    const length = p.length_m || 2.0;
    const width = p.width_m || 1.0;
    const areaM2 = length * width;
    const totalForceN = testPressurePa * areaM2;
    const totalMassKg = totalForceN / 9.80665;
    const moduleWeightKg = p.weight_kg || 22.0;
    const aspect = length / width;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      areaM2: round(areaM2, 2),
      totalForceN: round(totalForceN, 0),
      totalMassKg: round(totalMassKg, 0),
      moduleWeightKg,
      aspect: round(aspect, 2),
      // Smaller surface area experiences less aggregate downward crushing force
      forceScore: totalForceN,
    };
  });

  const minForce = Math.min(...metrics.map((m) => m.totalForceN));
  const maxForce = Math.max(...metrics.map((m) => m.totalForceN));
  const isTie = Math.abs(minForce - maxForce) < 300;
  const best = metrics.find((m) => m.totalForceN === minForce);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Under an international standard <strong>5,400 Pa heavy snow/wind load</strong>, the aggregate downward force on <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> is <strong>${best?.totalForceN} N (${best?.totalMassKg} kg equivalent)</strong> due to its compact ${best?.areaM2} m² footprint. Larger oversized utility format panels endure up to <strong>${maxForce} N</strong>, creating severe center-span glass deflection, micro-cracking risks, and mandating 6-clamp mounting profiles.`;

  return {
    id: 'mechanical-5400pa-load',
    category: 'mechanical',
    categoryLabel: 'Mechanical & Structural',
    title: '5,400 Pa Heavy Snow/Wind Surface Deflection Force',
    badge: 'Structural Load',
    summary: 'Evaluates aggregate downward static force and racking rail deflection vulnerability.',
    analysisHtml,
    formula: 'TotalForce (N) = TestPressure (5400 Pa) * SurfaceArea (L * W)',
    standardRef: 'IEC 61215 MQT 16 Mechanical Load & ASCE 7-22',
    importance: 'high',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'winter-solstice-row-pitch-calculation',
    handbookTitle: 'Winter Solstice Row Spacing (Anti-Shading Pitch)',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.totalForceN,
      formatted: `${m.totalForceN} N (${m.totalMassKg} kg load)`,
      isAdvantage: !isTie && m.totalForceN === minForce,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 8: Balance of System (BOS) Footprint & Structural Sizing (10 kW Array)
// -----------------------------------------------------------------------------
function evalBosFootprint(panels: PanelLike[]): EngineeringVerdict {
  const targetDcSystemW = 10000; // 10 kW DC

  const metrics = panels.map((p) => {
    const modulesNeeded = Math.ceil(targetDcSystemW / p.pnom_w);
    const actualSystemWatts = modulesNeeded * p.pnom_w;
    const areaPerPanel = (p.length_m || 2.0) * (p.width_m || 1.0);
    const totalAreaM2 = modulesNeeded * areaPerPanel;
    const totalWeightKg = modulesNeeded * (p.weight_kg || 22.0);
    const roofArealDensityKgM2 = totalWeightKg / totalAreaM2;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      modulesNeeded,
      actualSystemWatts,
      totalAreaM2: round(totalAreaM2, 1),
      totalWeightKg: round(totalWeightKg, 0),
      roofArealDensityKgM2: round(roofArealDensityKgM2, 1),
    };
  });

  const minArea = Math.min(...metrics.map((m) => m.totalAreaM2));
  const maxArea = Math.max(...metrics.map((m) => m.totalAreaM2));
  const isTie = Math.abs(minArea - maxArea) < 0.5;
  const best = metrics.find((m) => m.totalAreaM2 === minArea);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const minMods = Math.min(...metrics.map((m) => m.modulesNeeded));
  const maxMods = Math.max(...metrics.map((m) => m.modulesNeeded));

  const analysisHtml = `To construct a nominal <strong>10 kW DC solar array</strong>, <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> requires only <strong>${best?.modulesNeeded} modules</strong> occupying <strong>${minArea} m²</strong> of roof space. By contrast, lower efficiency models require up to <strong>${maxMods} modules (${maxArea} m²)</strong>, directly increasing mounting rail lengths, roof penetration flashings, MLPE optimizers, and installation labor by <strong>${round(((maxMods - minMods) / minMods) * 100, 1)}%</strong>.`;

  return {
    id: 'bos-footprint-10kw',
    category: 'bos',
    categoryLabel: 'Balance of System (BOS)',
    title: '10 kW Array Roof Footprint & Racking BOS Efficiency',
    badge: 'BOS Cost Optimization',
    summary: 'Analyzes roof area required and racking hardware count for a 10 kW DC system.',
    analysisHtml,
    formula: 'ArrayArea = Ceil(10kW / Pnom) * (Module_L * Module_W)',
    standardRef: 'IEC 62548 Array Sizing & Real Estate Optimization',
    importance: 'high',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'winter-solstice-row-pitch-calculation',
    handbookTitle: 'Winter Solstice Row Spacing (Anti-Shading Pitch)',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.totalAreaM2,
      formatted: `${m.totalAreaM2} m² (${m.modulesNeeded} panels)`,
      isAdvantage: !isTie && m.totalAreaM2 === minArea,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 9: Hot-Spot Resistance & Bypass Diode Thermal Dissipation
// -----------------------------------------------------------------------------
function evalHotSpotResistance(panels: PanelLike[]): EngineeringVerdict {
  const metrics = panels.map((p) => {
    const totalCells = p.ncels || 108;
    const diodes = p.ndiodes || 3;
    const cellsPerDiode = Math.round(totalCells / diodes);
    const isHalfCut = totalCells >= 108;
    // In half-cut cells, internal cell current is halved: Ploss = (I/2)^2 * R = 0.25 * Ploss_full
    const internalResistanceLossFactor = isHalfCut ? 0.25 : 1.0;
    const hotSpotTempRiseEstC = round(cellsPerDiode * 0.5 * (isHalfCut ? 0.6 : 1.0), 0);

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      totalCells,
      diodes,
      cellsPerDiode,
      isHalfCut,
      internalResistanceLossFactor,
      hotSpotTempRiseEstC,
    };
  });

  const minTempRise = Math.min(...metrics.map((m) => m.hotSpotTempRiseEstC));
  const maxTempRise = Math.max(...metrics.map((m) => m.hotSpotTempRiseEstC));
  const isTie = minTempRise === maxTempRise;
  const best = metrics.find((m) => m.hotSpotTempRiseEstC === minTempRise);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Under localized partial tree shading or bird droppings, shadowed cells are forced into reverse bias, dissipating power as localized heat. <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> incorporates a <strong>${best?.totalCells} half-cut cell architecture with ${best?.diodes} Schottky bypass diodes</strong>, cutting cell-level current in half and reducing resistive dissipation by <strong>75%</strong> during partial shading events to prevent EVA encapsulant browning and thermal cell cleavage.`;

  return {
    id: 'hotspot-thermal-stress',
    category: 'safety',
    categoryLabel: 'Safety & Protection',
    title: 'Hot-Spot Thermal Stress & Bypass Diode Partitioning',
    badge: 'Hot-Spot Immunity',
    summary: 'Evaluates reverse-bias cell heating and bypass diode sub-string division.',
    analysisHtml,
    formula: 'P_dissipated = (I_string / Branches)² * R_internal * ShadedCells',
    standardRef: 'IEC 61215 MQT 09 Hot-Spot Endurance Test',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'bypass-diode-hotspot-threshold',
    handbookTitle: 'Bypass Diode Conduction & Hotspot Protection',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.hotSpotTempRiseEstC,
      formatted: `${m.totalCells} cells / ${m.diodes} diodes (${m.isHalfCut ? 'Half-cut' : 'Full'})`,
      isAdvantage: !isTie && m.hotSpotTempRiseEstC === minTempRise,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 10: Low-Light & Diffuse Irradiance Yield (200 W/m² Response)
// -----------------------------------------------------------------------------
function evalLowLightResponse(panels: PanelLike[]): EngineeringVerdict {
  const metrics = panels.map((p) => {
    const tech = getTechCategory(p.technol);
    const rShunt = p.r_shunt_ohm || (tech === 'n_type' ? 800 : 400);
    // Relative efficiency retention at 200 W/m² (overcast/dawn/dusk)
    // N-Type TOPCon/HJT typically retains 96-98% relative efficiency; PERC 91-94%
    const relativeRetentionPct = tech === 'n_type' ? 97.5 : tech === 'poly' ? 89.0 : 93.5;
    const lowLightEfficiency = ((p.module_efficiency_pct || 21.0) * relativeRetentionPct) / 100;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      tech,
      rShunt,
      relativeRetentionPct,
      lowLightEfficiency: round(lowLightEfficiency, 2),
    };
  });

  const bestRetention = Math.max(...metrics.map((m) => m.relativeRetentionPct));
  const worstRetention = Math.min(...metrics.map((m) => m.relativeRetentionPct));
  const isTie = bestRetention === worstRetention;
  const best = metrics.find((m) => m.relativeRetentionPct === bestRetention);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Under overcast skies, dawn, dusk, or diffuse winter light conditions ($200\\text{ W/m}^2$), parasitic shunt resistance determines relative efficiency retention. <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> maintains <strong>${bestRetention}%</strong> of its rated conversion efficiency (operating at ${best?.lowLightEfficiency}% under low irradiance) compared to <strong>${worstRetention}%</strong> for standard cells. Ideal for northern latitudes with high cloud cover frequencies (e.g. Northern Europe, UK, Pacific Northwest).`;

  return {
    id: 'low-light-diffuse-response',
    category: 'thermal',
    categoryLabel: 'Irradiance & Diffuse Light',
    title: 'Low-Light & Diffuse Irradiance Retention (200 W/m²)',
    badge: 'Low-Light Yield',
    summary: 'Evaluates shunt resistance and low-irradiance performance on overcast days.',
    analysisHtml,
    formula: 'Eff_relative(200W) = Eff(STC) * [1 - (V_oc_drop + I_shunt_loss)]',
    standardRef: 'IEC 60904-1 & IEC 61853-1 Energy Rating Standard',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'ntype-vs-ptype-low-light-physics',
    handbookTitle: 'N-Type vs P-Type Low-Light Carrier Lifetime',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.relativeRetentionPct,
      formatted: `${m.relativeRetentionPct}% retention (${m.lowLightEfficiency}% eff)`,
      isAdvantage: !isTie && m.relativeRetentionPct === bestRetention,
    })),
  };
}

// -----------------------------------------------------------------------------
// Heuristic 11: Microinverter & DC Optimizer Match Compatibility
// -----------------------------------------------------------------------------
function evalMicroinverterCompatibility(panels: PanelLike[]): EngineeringVerdict {
  // Benchmark microinverter: 330W max AC output, 12.5A max continuous input MPPT
  const maxMpptCurrentA = 13.0;
  const microinverterAcW = 330;

  const metrics = panels.map((p) => {
    const dcAcRatio = p.pnom_w / microinverterAcW;
    const currentExceeds = p.imp_a > maxMpptCurrentA;
    const clippingRisk = dcAcRatio > 1.35 || currentExceeds;

    return {
      panelSlug: p.slug,
      modelName: p.model_name,
      dcAcRatio: round(dcAcRatio, 2),
      imp: round(p.imp_a, 2),
      clippingRisk,
      compatibilityScore: (currentExceeds ? 50 : 100) - Math.abs(dcAcRatio - 1.25) * 20,
    };
  });

  const bestScore = Math.max(...metrics.map((m) => m.compatibilityScore));
  const worstScore = Math.min(...metrics.map((m) => m.compatibilityScore));
  const isTie = Math.abs(bestScore - worstScore) < 5;
  const best = metrics.find((m) => m.compatibilityScore === bestScore);
  const bestPanel = panels.find((p) => p.slug === best?.panelSlug);

  const analysisHtml = `Pairing modules with module-level power electronics (MLPE, such as Enphase or Hoymiles microinverters) requires balancing DC/AC clipping ratio and MPPT current limits (typically 12.5A~14A). <strong>${bestPanel?.brand_name} ${bestPanel?.model_name}</strong> pairs with an optimal DC/AC ratio of <strong>${best?.dcAcRatio}</strong> and ${best?.imp}A operating current, eliminating thermal clipping bottleneck while maximizing inverter capacity factor.`;

  return {
    id: 'microinverter-mlpe-match',
    category: 'electrical',
    categoryLabel: 'Electrical & MLPE Compatibility',
    title: 'Microinverter & MLPE DC/AC Clipping Compatibility',
    badge: 'MLPE Pairing',
    summary: 'Evaluates clipping ratio and maximum input current thresholds for microinverter pairing.',
    analysisHtml,
    formula: 'DC/AC_Ratio = P_nom / P_ac_max; Current_Margin = I_mppt_max - I_mp',
    standardRef: 'IEEE 1547-2018 & Inverter MPPT Operating Envelope',
    importance: 'medium',
    winnerSlug: isTie ? null : best?.panelSlug || null,
    winnerModelName: isTie ? null : best?.modelName || null,
    isTie,
    handbookSlug: 'dc-ac-oversizing-ratio-economics',
    handbookTitle: 'DC/AC Inverter Oversizing Ratio (1.25 to 1.35x)',
    metrics: metrics.map((m) => ({
      panelSlug: m.panelSlug,
      modelName: m.modelName,
      value: m.dcAcRatio,
      formatted: `${m.dcAcRatio}x DC/AC (${m.imp}A Imp)`,
      isAdvantage: !isTie && m.compatibilityScore === bestScore,
    })),
  };
}

// =============================================================================
// Main Engine Entry Points
// =============================================================================

/**
 * Executes the full suite of 11 deterministic engineering heuristics on
 * an array of 2 to 4 solar panels.
 */
export function generateEngineeringHeuristics(panels: PanelLike[]): EngineeringVerdict[] {
  if (!panels || panels.length < 2) return [];

  return [
    evalColdVocSurge(panels),
    evalHighTempDerating(panels),
    evalDegradationLifetime(panels),
    evalBifacialAlbedoGain(panels),
    evalDcCableLoss(panels),
    evalFuseOcpd(panels),
    evalMechanicalLoad(panels),
    evalBosFootprint(panels),
    evalHotSpotResistance(panels),
    evalLowLightResponse(panels),
    evalMicroinverterCompatibility(panels),
  ];
}

/**
 * Renders the engineering verdicts as semantic, SEO-rich, crawler-visible HTML.
 * Used for Cloudflare Pages Edge SSR pre-rendering so crawlers see genuine,
 * long-form technical analysis on initial HTTP response.
 */
export function renderVerdictsToPrerenderHtml(
  panels: PanelLike[],
  verdicts: EngineeringVerdict[]
): string {
  if (!panels || panels.length < 2 || !verdicts || verdicts.length === 0) {
    return '';
  }

  const modelNames = panels.map((p) => `${p.brand_name} ${p.model_name}`).join(' vs ');

  const cardsHtml = verdicts
    .map((v) => {
      const metricsRows = v.metrics
        .map(
          (m) =>
            `<li style="margin-bottom: 4px;"><strong>${escapeHtml(m.modelName)}:</strong> ${escapeHtml(
              m.formatted
            )}${m.isAdvantage ? ' <span style="color:#059669; font-weight:bold;">[Winner]</span>' : ''}</li>`
        )
        .join('');

      return `
    <article style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #059669; letter-spacing: 0.05em;">${escapeHtml(
          v.categoryLabel
        )}</span>
        <span style="font-size: 11px; background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">${escapeHtml(
          v.badge
        )}</span>
      </div>
      <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${escapeHtml(
        v.title
      )}</h3>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 14px;">${v.analysisHtml}</p>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Quantitative Metrics:</div>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: #1e293b;">
          ${metricsRows}
        </ul>
      </div>

      <div style="font-size: 11px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
        <div style="margin-bottom: 4px;"><strong>Engineering Rule:</strong> <code>${escapeHtml(v.formula)}</code></div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Standard:</strong> ${escapeHtml(v.standardRef)}</span>
          ${
            v.handbookSlug
              ? `<a href="/handbook/${escapeHtml(
                  v.handbookSlug
                )}" style="color: #059669; font-weight: 700; text-decoration: underline;">Read Full Engineering Guide &rarr;</a>`
              : ''
          }
        </div>
      </div>
    </article>`;
    })
    .join('\n');

  return `
  <section style="max-width: 1200px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Solerz Heuristics Engine</div>
      <h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">Deterministic Engineering Verdicts: ${escapeHtml(
        modelNames
      )}</h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Cross-evaluating physical semiconductor behavior, thermal coefficients, balance-of-system footprint, and electrical safety under international engineering standards.
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
      ${cardsHtml}
    </div>
  </section>`;
}

export function renderComparisonSpecsTableHtml(panels: PanelLike[]): string {

  if (!panels || panels.length < 2) return '';

  const rows = [
    { label: 'Manufacturer Brand', get: (p: PanelLike) => p.brand_name },
    { label: 'Model Designation', get: (p: PanelLike) => p.model_name },
    { label: 'Rated Power (STC Pnom)', get: (p: PanelLike) => `${Math.round(p.pnom_w)} Wp` },
    {
      label: 'Module Efficiency',
      get: (p: PanelLike) =>
        p.module_efficiency_pct != null ? `${p.module_efficiency_pct.toFixed(2)}%` : '—',
    },
    { label: 'Cell Technology', get: (p: PanelLike) => p.technol || 'Silicon Mono' },
    {
      label: 'Bifacial Architecture',
      get: (p: PanelLike) =>
        p.is_bifacial
          ? `Yes (${Math.round((p.bifaciality_factor || 0.75) * 100)}% Bifaciality)`
          : 'Monofacial',
    },
    { label: 'Voltage at Pmax (Vmp)', get: (p: PanelLike) => `${p.vmp_v.toFixed(2)} V` },
    { label: 'Current at Pmax (Imp)', get: (p: PanelLike) => `${p.imp_a.toFixed(2)} A` },
    { label: 'Open-Circuit Voltage (Voc)', get: (p: PanelLike) => `${p.voc_v.toFixed(2)} V` },
    { label: 'Short-Circuit Current (Isc)', get: (p: PanelLike) => `${p.isc_a.toFixed(2)} A` },
    {
      label: 'Power Temp. Coefficient (mu_Pnom)',
      get: (p: PanelLike) => `${p.mu_pnom_spec_pct_c.toFixed(3)} %/°C`,
    },
    {
      label: 'Voltage Temp. Coefficient (mu_Voc)',
      get: (p: PanelLike) => `${p.mu_voc_spec_mv_c.toFixed(1)} mV/°C`,
    },
    {
      label: 'Dimensions (L x W)',
      get: (p: PanelLike) =>
        p.length_m && p.width_m
          ? `${Math.round(p.length_m * 1000)} x ${Math.round(p.width_m * 1000)} mm`
          : '—',
    },
    {
      label: 'Weight',
      get: (p: PanelLike) => (p.weight_kg != null ? `${p.weight_kg.toFixed(1)} kg` : '—'),
    },
    {
      label: 'Product Workmanship Warranty',
      get: (p: PanelLike) =>
        p.warranty_product_years != null ? `${p.warranty_product_years} Years` : '—',
    },
    {
      label: 'Linear Performance Warranty',
      get: (p: PanelLike) =>
        p.warranty_power_years != null ? `${p.warranty_power_years} Years` : '—',
    },
  ];

  const headersHtml = panels
    .map(
      (p) =>
        `<th style="padding: 12px 16px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">${escapeHtml(
          p.brand_name
        )} ${escapeHtml(p.model_name)}</th>`
    )
    .join('');

  const bodyRowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="padding: 10px 16px; border: 1px solid #e2e8f0; font-weight: 600; color: #334155; background: #fafafa; font-size: 13px;">${escapeHtml(
        r.label
      )}</td>
      ${panels
        .map(
          (p) =>
            `<td style="padding: 10px 16px; border: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">${escapeHtml(
              r.get(p)
            )}</td>`
        )
        .join('')}
    </tr>`
    )
    .join('\n');

  return `
  <section style="max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Head-to-Head Technical Specification Matrix</h2>
    <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 12px 16px; text-align: left; background: #f1f5f9; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 260px;">Specification</th>
            ${headersHtml}
          </tr>
        </thead>
        <tbody>
          ${bodyRowsHtml}
        </tbody>
      </table>
    </div>
  </section>`;
}

/**
 * Combines both deterministic heuristics and full technical specs into
 * a complete server-rendered markup ready to be injected into <div id="root">.
 */
export function renderFullComparisonPrerenderHtml(
  panels: PanelLike[],
  verdicts: EngineeringVerdict[]
): string {
  const specsTableHtml = renderComparisonSpecsTableHtml(panels);
  const verdictsHtml = renderVerdictsToPrerenderHtml(panels, verdicts);

  return `
  <main id="ssr-prerendered-root" style="background-color: #ffffff; color: #0f172a; padding: 20px 0 60px 0;">
    ${specsTableHtml}
    ${verdictsHtml}
  </main>
  `;
}

const escapeHtml = (s: string): string =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

