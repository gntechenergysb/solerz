export interface SolarEngineeringTip {
  id: string;
  slug: string;
  category: 'modules' | 'inverters' | 'batteries' | 'sizing' | 'safety';
  categoryLabel: string;
  title: string;
  question: string;
  formulaOrRule: string;
  summary: string;
  explanation: string;
  pitfall: string;
  standardRef: string;
  tags: string[];
  contextualTriggers?: {
    isBifacial?: boolean;
    isHighPower?: boolean;
    isHybrid?: boolean;
    categoryMatch?: ('panel' | 'inverter' | 'battery' | 'calculator')[];
  };
}

export const SOLAR_TIPS: SolarEngineeringTip[] = [
  // -------------------------------------------------------------------------
  // 1. Solar Panels & Array Design
  // -------------------------------------------------------------------------
  {
    id: 'bifacial-mounting-height-rule',
    slug: 'bifacial-mounting-height-rule',
    category: 'modules',
    categoryLabel: 'Solar Modules',
    title: 'Bifacial Solar Panel Minimum Elevation Rule',
    question: 'What is the minimum ground clearance required for bifacial solar panels to capture optimal albedo gain?',
    formulaOrRule: 'H_clearance >= 0.8m ~ 1.2m (Ground Clearance) | Tilt >= 20°',
    summary: 'Bifacial modules require at least 0.8 to 1.2 meters of ground clearance above the surface to allow reflected diffuse light to reach the rear cell layer evenly. Mounting flush to a roof reduces rear-side gain to near zero.',
    explanation: 'Albedo irradiance scatters omnidirectionally from the ground. When panels are mounted too close to the surface (< 0.5m), the center rear cells are starved of diffuse reflection due to self-shading by the frame and adjacent rows. Elevated mounting expands the rear view factor (VF), maximizing energy harvest by 8% to 22% over white gravel, snow, or membrane roofs.',
    pitfall: 'Do not flush-mount bifacial panels directly on dark asphalt shingle roofs; the rear gain is negligible (1%~2%) while dual-glass weight adds structural roof strain.',
    standardRef: 'NREL Bifacial PV Performance Modeling Standard & IEC 62548',
    tags: ['bifacial', 'albedo', 'mounting', 'ground clearance', 'modules'],
    contextualTriggers: {
      isBifacial: true,
      categoryMatch: ['panel'],
    },
  },
  {
    id: 'winter-solstice-row-pitch-calculation',
    slug: 'winter-solstice-row-pitch-calculation',
    category: 'modules',
    categoryLabel: 'Solar Modules',
    title: 'Winter Solstice Row Spacing (Anti-Shading Pitch)',
    question: 'How do you calculate the minimum row-to-row spacing between solar arrays to prevent inter-row shading on the shortest day of the year?',
    formulaOrRule: 'Pitch = Module_Length * [sin(Tilt + Solar_Altitude) / sin(Solar_Altitude)] * cos(Azimuth)',
    summary: 'Array row spacing must be sized for 9:00 AM to 3:00 PM solar window on the Winter Solstice (December 21 in Northern Hemisphere). The solar elevation angle reaches its annual minimum, casting the longest shadows.',
    explanation: 'Inter-row shading causes localized bypass diode activation, dropping entire string voltage and creating severe thermal stress. In mid-latitudes (35°N~45°N), the row pitch is typically 2.2 to 2.8 times the vertical module height to ensure 100% unshaded generation during peak mid-day production.',
    pitfall: 'Never squeeze extra rows onto a flat roof without verifying Winter Solstice 9AM shadow length; the bottom 5cm of morning shade can wipe out 30% of string power.',
    standardRef: 'IEC 62548 Photovoltaic Array Design Requirements',
    tags: ['row pitch', 'shading', 'tilt angle', 'winter solstice', 'modules'],
    contextualTriggers: {
      categoryMatch: ['panel', 'calculator'],
    },
  },
  {
    id: 'bypass-diode-hotspot-threshold',
    slug: 'bypass-diode-hotspot-threshold',
    category: 'modules',
    categoryLabel: 'Solar Modules',
    title: 'Bypass Diode Conduction & Hotspot Protection',
    question: 'How do bypass diodes prevent catastrophic solar cell thermal burnout during partial shading?',
    formulaOrRule: 'V_reverse >= -0.5V to -0.7V (Diode Forward Activation Threshold)',
    summary: 'When a single cell is shaded, it turns into a resistive electrical load. When reverse voltage reaches ~0.6V, the bypass diode turns forward-biased, routing string current around the shaded 20-24 cell sub-string.',
    explanation: 'Modern half-cut modules integrate 3 Schottky bypass diodes in the central junction box. Without bypass diodes, full string current (13A~18A) forced through a shaded high-resistance cell generates localized heat in excess of 150°C, causing backsheet burning, EVA browning, and glass cracking.',
    pitfall: 'Repeated long-term partial shading (e.g. from overhead power lines or chimneys) can overheat the Schottky diodes in the junction box, causing permanent short-circuit diode failure.',
    standardRef: 'IEC 61215-2 Hot Spot Endurance Testing',
    tags: ['bypass diode', 'hotspot', 'shading', 'safety', 'modules'],
    contextualTriggers: {
      categoryMatch: ['panel'],
    },
  },
  {
    id: 'ntype-vs-ptype-low-light-physics',
    slug: 'ntype-vs-ptype-low-light-physics',
    category: 'modules',
    categoryLabel: 'Solar Modules',
    title: 'N-Type vs P-Type Low-Light Carrier Lifetime',
    question: 'Why do N-Type TOPCon and HJT solar cells generate significantly more power in the early morning, dusk, and cloudy days compared to P-Type PERC?',
    formulaOrRule: 'Carrier Lifetime (N-Type) >= 1.0~3.0 ms vs Carrier Lifetime (P-Type) <= 0.2~0.4 ms',
    summary: 'Phosphorus-doped N-Type silicon has a minority carrier (hole) lifetime 5 to 10 times longer than Boron-doped P-Type silicon, allowing low-intensity photons in cloudy or dawn/dusk conditions to generate collected current.',
    explanation: 'In P-Type silicon, trace Boron atoms bond with residual Oxygen during light exposure, creating Boron-Oxygen defect recombination traps (LID/LeTID). N-Type silicon is immune to Boron-Oxygen defects, maintaining higher open-circuit voltage even when sunlight irradiance drops below 200 W/m².',
    pitfall: 'Do not evaluate modules based solely on STC rating (1000 W/m²); in temperate and maritime climates, over 45% of annual daylight hours occur under low-irradiance conditions (< 400 W/m²).',
    standardRef: 'IEC 61853-1 Photovoltaic Module Energy Rating',
    tags: ['ntype', 'topcon', 'hjt', 'low-light', 'modules'],
    contextualTriggers: {
      categoryMatch: ['panel'],
    },
  },

  // -------------------------------------------------------------------------
  // 2. Inverters & Electrical Strings
  // -------------------------------------------------------------------------
  {
    id: 'cold-voc-temperature-compensation',
    slug: 'cold-voc-temperature-compensation',
    category: 'inverters',
    categoryLabel: 'Inverters & String Math',
    title: 'Winter Cold Voc Voltage Derating Formula',
    question: 'How do you calculate the maximum cold-weather string voltage to prevent frying an inverter on a freezing sunny morning?',
    formulaOrRule: 'Voc_max = N_panels * Voc_STC * [1 + (beta_oc / 100) * (T_min_ambient - 25°C)] <= Vdc_max',
    summary: 'Photovoltaic semiconductor voltage rises sharply in sub-zero temperatures. The maximum series panel count must be calculated against the local 50-year historical lowest ambient temperature, NOT standard 25°C STC.',
    explanation: 'For a module with Voc = 50V and temperature coefficient beta_oc = -0.28%/°C, at -15°C (40°C below STC), the Voc rises by +11.2% to 55.6V. A 12-panel string rises from 600V to 667.2V. If connected to a 600V-rated inverter, the over-voltage will blow the DC input capacitor bank.',
    pitfall: 'Using 25°C STC voltage to design string lengths is the #1 cause of inverter warranty voiding and premature component breakdown in cold winter regions.',
    standardRef: 'NEC Article 690.7(A) Maximum Voltage & IEC 62548',
    tags: ['voc', 'temperature coefficient', 'mppt', 'string sizing', 'inverters'],
    contextualTriggers: {
      categoryMatch: ['panel', 'inverter', 'calculator'],
    },
  },
  {
    id: 'dc-voltage-drop-cable-sizing',
    slug: 'dc-voltage-drop-cable-sizing',
    category: 'inverters',
    categoryLabel: 'Inverters & String Math',
    title: 'DC Cable Voltage Drop & Wire Sizing Rule',
    question: 'What is the maximum permissible voltage drop for DC solar home runs, and how is cable cross-section calculated?',
    formulaOrRule: 'Voltage_Drop_% = (2 * Length * Current * Resistivity) / (Area * Voltage) <= 1.5% (Max 2.0%)',
    summary: 'Keep DC voltage drop from solar array to inverter under 1.5% at maximum operating current (Imp). High resistance in undersized cables dissipates valuable solar energy as heat.',
    explanation: 'Solar systems operate at peak current for thousands of hours over 25+ years. Copper resistivity rho = 0.0175 ohm*mm²/m. For a 30-meter 15A string at 400V DC, a 4mm² wire has a 1.97% drop (118W continuous heat loss), while upgrading to 6mm² cuts loss to 1.31%, paying for the copper in under 18 months.',
    pitfall: 'Do not size DC solar cables based only on thermal ampacity (fire safety); always calculate 25-year cumulative kWh resistance loss economics.',
    standardRef: 'NEC 310 / IEC 60364-7-712 Solar PV Installations',
    tags: ['cable sizing', 'voltage drop', 'dc wiring', 'efficiency', 'inverters'],
    contextualTriggers: {
      categoryMatch: ['inverter', 'calculator'],
    },
  },
  {
    id: 'summer-mppt-low-voltage-trap',
    slug: 'summer-mppt-low-voltage-trap',
    category: 'inverters',
    categoryLabel: 'Inverters & String Math',
    title: 'Summer Noon MPPT Low-Voltage Drop Trap',
    question: 'Why do short solar strings suddenly stop producing power on hot summer afternoons?',
    formulaOrRule: 'Vmp_hot = N_panels * Vmp_STC * [1 + (gamma_vmp / 100) * (T_cell_hot - 25°C)] >= Inverter_MPPT_Min_V',
    summary: 'On hot summer days, rooftop cell temperatures reach 65°C to 70°C, causing operating voltage (Vmp) to drop by 15%~18%. If string Vmp drops below the inverter minimum MPPT threshold, the inverter drops out of MPPT tracking.',
    explanation: 'For example, an inverter with an MPPT operating window of 160V~550V needs at least 5 panels. In winter, 5 panels deliver 210V. But at 68°C cell temperature on a summer roof, 5 panels drop to 158V — falling below the 160V minimum, causing the inverter to throttle output to zero.',
    pitfall: 'Always verify that string Vmp at NOCT + 25°C (summer roof condition) maintains at least a 15V safety buffer above the inverter lower MPPT voltage limit.',
    standardRef: 'Sandia Inverter Performance Modeling Guidelines',
    tags: ['mppt', 'vmp', 'summer heat', 'string sizing', 'inverters'],
    contextualTriggers: {
      categoryMatch: ['panel', 'inverter', 'calculator'],
    },
  },
  {
    id: 'dc-ac-oversizing-ratio-economics',
    slug: 'dc-ac-oversizing-ratio-economics',
    category: 'inverters',
    categoryLabel: 'Inverters & String Math',
    title: 'DC/AC Inverter Oversizing Ratio (1.25 to 1.35x)',
    question: 'Why do commercial solar engineers intentionally size solar panels 25% to 35% larger than the inverter AC rating?',
    formulaOrRule: 'DC/AC Ratio = Total_Array_Wp / Inverter_AC_Rated_W = 1.25 ~ 1.35 (Utility: up to 1.45x)',
    summary: 'Solar panels rarely operate at 100% STC due to real-world heat, angle of incidence, and soiling. Oversizing DC capacity broadens the daily generation bell curve, harvesting 12%~18% more morning and evening kWh.',
    explanation: 'Peak midday clipping loss with a 1.30x ratio is typically less than 1.2% of annual energy yield. However, the inverter operates at higher utilization efficiency throughout the entire morning and late afternoon shoulder hours, significantly lowering the overall levelized cost of energy (LCOE).',
    pitfall: 'Avoid oversizing above 1.15x for high-albedo bifacial arrays, as intense ground reflection during midday will cause severe inverter thermal throttling and clipping losses exceeding 5%.',
    standardRef: 'NREL Inverter Clipping & DC-to-AC Ratio Optimization',
    tags: ['dc ac ratio', 'oversizing', 'clipping', 'economics', 'inverters'],
    contextualTriggers: {
      categoryMatch: ['inverter', 'calculator'],
    },
  },

  // -------------------------------------------------------------------------
  // 3. Storage & Batteries
  // -------------------------------------------------------------------------
  {
    id: 'lifepo4-subzero-charging-hazard',
    slug: 'lifepo4-subzero-charging-hazard',
    category: 'batteries',
    categoryLabel: 'Energy Storage & Batteries',
    title: 'LiFePO4 Sub-Zero Temperature Charging Protection',
    question: 'What happens if a Lithium Iron Phosphate (LiFePO4) solar battery is charged below 0°C (32°F)?',
    formulaOrRule: 'T_cell < 0°C => Charge Current = 0A (Mandatory BMS Low-Temp Cutoff)',
    summary: 'Charging a LiFePO4 battery below freezing causes irreversible metallic lithium plating on the graphite anode, permanently destroying capacity and creating internal micro-short circuit fire risks.',
    explanation: 'At sub-zero temperatures, the diffusion rate of lithium ions through the electrolyte slows dramatically. When charging current is applied, ions cannot intercalate into the anode structure fast enough and instead deposit as solid metallic lithium needles (dendrites) that can pierce the separator.',
    pitfall: 'Discharging below 0°C is safe down to -20°C, but charging is strictly prohibited. Always choose home batteries with integrated internal heating pads for unheated garage or outdoor installs.',
    standardRef: 'UL 1973 / UL 9540 Stationary Energy Storage Standards',
    tags: ['lifepo4', 'low-temperature', 'bms', 'battery safety', 'batteries'],
    contextualTriggers: {
      categoryMatch: ['battery', 'calculator'],
    },
  },
  {
    id: 'high-voltage-vs-low-voltage-battery-loss',
    slug: 'high-voltage-vs-low-voltage-battery-loss',
    category: 'batteries',
    categoryLabel: 'Energy Storage & Batteries',
    title: '400V High-Voltage vs 48V Low-Voltage Battery Efficiency',
    question: 'Why are modern home battery systems shifting from traditional 48V DC to 350V~450V High-Voltage (HV) architectures?',
    formulaOrRule: 'P_loss = I^2 * R | For same 10kW power: I_48V = 208A vs I_400V = 25A (Loss is 69x lower)',
    summary: 'High-voltage batteries operate at 300V~450V DC, matching the inverter DC bus voltage. This eliminates heavy step-up transformer conversion stages and reduces cabling copper heat loss by over 98%.',
    explanation: 'Delivering 10 kW of backup power at 48V requires a staggering 208 Amperes of continuous current, requiring thick 70mm² (2/0 AWG) copper cables and generating significant I²R resistive heat. At 400V, the current is just 25A, allowing standard 4mm² wires and raising round-trip conversion efficiency from 86% to 95%+.',
    pitfall: '48V low-voltage systems remain ideal for off-grid cabins and telecom (safer touch voltage < 60V DC), but 400V HV systems deliver superior efficiency for grid-tied residential storage.',
    standardRef: 'IEEE 2030.5 & IEC 62619 Industrial Lithium Battery Standard',
    tags: ['high voltage', '48v', 'round-trip efficiency', 'hybrid inverters', 'batteries'],
    contextualTriggers: {
      isHybrid: true,
      categoryMatch: ['battery', 'inverter'],
    },
  },
  {
    id: 'depth-of-discharge-cycle-longevity',
    slug: 'depth-of-discharge-cycle-longevity',
    category: 'batteries',
    categoryLabel: 'Energy Storage & Batteries',
    title: 'Depth of Discharge (DoD) & Cycle Life Multiplier',
    question: 'How does operating a solar battery at 80% Depth of Discharge compare to 100% full daily discharge in terms of lifespan?',
    formulaOrRule: 'Cycles @ 80% DoD (~6,500+ cycles) ~= 1.8x Cycles @ 100% DoD (~3,500 cycles)',
    summary: 'Limiting daily battery cycling to 80% DoD instead of 100% deep discharge almost doubles the cumulative lifetime kilowatt-hour throughput of Lithium Iron Phosphate (LiFePO4) storage systems.',
    explanation: 'Mechanical strain on the cathode and anode crystal lattice occurs predominantly at the extreme ends of the state-of-charge curve (> 95% SoC and < 10% SoC). Keeping the battery operating within the 10%~90% sweet spot minimizes lattice micro-cracking and electrolyte decomposition.',
    pitfall: 'Lead-acid batteries must never exceed 50% DoD. Modern LiFePO4 batteries are warranted for 90%~100% DoD, but programming an 85% reserve buffer for critical storm backup extends system life beyond 18 years.',
    standardRef: 'IEC 62660 Secondary Lithium-Ion Cells Reliability Standards',
    tags: ['dod', 'cycle life', 'degradation', 'state of charge', 'batteries'],
    contextualTriggers: {
      categoryMatch: ['battery'],
    },
  },
  {
    id: 'battery-c-rate-and-surge-power',
    slug: 'battery-c-rate-and-surge-power',
    category: 'batteries',
    categoryLabel: 'Energy Storage & Batteries',
    title: 'Battery C-Rate & Motor Surge Power Matching',
    question: 'How do you determine if a home battery can start a central air conditioning compressor or well pump during a grid blackout?',
    formulaOrRule: 'Continuous_Power_kW = Capacity_kWh * Continuous_C_Rate | LRA_Surge_kVA = Inrush_Current * Volts',
    summary: 'A 10 kWh battery with a 0.5C rating can only deliver 5 kW continuous power. Induction motors (HVAC, well pumps, heat pumps) require Locked Rotor Amps (LRA) surge power 3 to 6 times higher than running watts.',
    explanation: 'For example, a 3-ton central A/C compressor drawing 3.5 kW running power can draw an instantaneous starting surge of 18 kW (75A LRA for 150ms). If your battery and hybrid inverter peak surge rating is under 15 kVA, the battery protection BMS will instantly trip on over-current.',
    pitfall: 'Never assume a 15 kWh battery can power a whole house; always check the instantaneous peak kW surge rating and install a soft-starter on central A/C units.',
    standardRef: 'UL 9540 / NEMA Motor Starting Standards',
    tags: ['c-rate', 'surge power', 'lra', 'motor starting', 'batteries'],
    contextualTriggers: {
      categoryMatch: ['battery', 'calculator'],
    },
  },

  // -------------------------------------------------------------------------
  // 4. System Sizing, Economics & Codes
  // -------------------------------------------------------------------------
  {
    id: 'psh-vs-sunshine-hours-distinction',
    slug: 'psh-vs-sunshine-hours-distinction',
    category: 'sizing',
    categoryLabel: 'System Sizing & Physics',
    title: 'Peak Sun Hours (PSH) vs Daylight Hours Distinction',
    question: 'Why is 8 hours of daylight NOT the same as 8 Peak Sun Hours (PSH) in solar engineering calculations?',
    formulaOrRule: '1 PSH = 1 kWh/m² of Total Daily Solar Irradiance = Cumulative Solar Energy Equivalent at 1,000 W/m²',
    summary: 'Daylight hours count any time the sun is visible in the sky. Peak Sun Hours (PSH) integrate the entire day variable solar irradiance curve into an equivalent number of hours at standard 1,000 W/m² peak intensity.',
    explanation: 'A sunny day in Germany might have 14 hours of summer daylight, but due to low sun angles in the morning and evening, the integrated daily solar radiation totals only 4.2 kWh/m² — which equals 4.2 PSH. In Arizona, 12 daylight hours can deliver 6.5 PSH.',
    pitfall: 'Sizing solar systems using "hours of sunshine" from weather apps instead of NASA/NREL satellite PSH irradiation data will result in 40%~60% under-sized solar systems.',
    standardRef: 'WMO (World Meteorological Organization) Solar Radiation Measurement Standards',
    tags: ['psh', 'solar irradiance', 'daily yield', 'system sizing', 'calculator'],
    contextualTriggers: {
      categoryMatch: ['calculator'],
    },
  },
  {
    id: 'rapid-shutdown-nec-compliance',
    slug: 'rapid-shutdown-nec-compliance',
    category: 'safety',
    categoryLabel: 'Codes & Safety Standards',
    title: 'NEC 690.12 Rapid Shutdown 30-Second Voltage Rule',
    question: 'What are the legal electrical safety requirements for Rapid Shutdown on rooftop solar installations?',
    formulaOrRule: 'Inside Array: <= 80V within 30s | Outside Array Boundary (1 ft): <= 30V within 30s',
    summary: 'Rapid Shutdown mandates that when building main power is disconnected, rooftop DC voltage must drop to safe touch levels within 30 seconds to allow firefighters safe roof access.',
    explanation: 'Module-level power electronics (MLPE) like microinverters (Enphase) or DC optimizers (SolarEdge, Tigo) satisfy this requirement natively by shutting off DC string voltage at the individual panel junction.',
    pitfall: 'Traditional string inverters without module-level rapid shutdown receivers cannot legally be installed on residential buildings in the United States and jurisdictions adopting NEC 2017/2020/2023.',
    standardRef: 'NEC Article 690.12 Rapid Shutdown of PV Systems on Buildings',
    tags: ['rapid shutdown', 'nec 690.12', 'fire safety', 'mlpe', 'safety'],
    contextualTriggers: {
      categoryMatch: ['inverter', 'panel'],
    },
  },
  {
    id: 'module-soiling-self-cleaning-tilt',
    slug: 'module-soiling-self-cleaning-tilt',
    category: 'sizing',
    categoryLabel: 'System Sizing & Physics',
    title: 'Minimum Tilt Angle for Rain Self-Cleaning',
    question: 'What is the minimum installation tilt angle required for rainwater to naturally wash away dust and pollen from solar panels?',
    formulaOrRule: 'Minimum Tilt Angle >= 10° to 15° (Optimal Rain Drainage & Self-Cleaning)',
    summary: 'Installing solar panels completely flat (0°~5° tilt) leads to dirt, pollen, and water ponding along the bottom aluminum frame, creating continuous bottom-cell shading that reduces generation by up to 25%.',
    explanation: 'At tilt angles of 10° or greater, standard rainfall creates a sheet-flow runoff with sufficient kinetic energy to transport dust particles over the bottom frame lip. Anti-soiling drainage clips can be retrofitted onto low-tilt modules to prevent water stagnation.',
    pitfall: 'Commercial flat roofs should use minimum 10° ballasted tilt racking instead of 0° flush mounting to eliminate costly quarterly manual panel washing contracts.',
    standardRef: 'NREL Photovoltaic Soiling and Cleaning Mechanics',
    tags: ['tilt angle', 'soiling', 'dust loss', 'self-cleaning', 'modules'],
    contextualTriggers: {
      categoryMatch: ['panel', 'calculator'],
    },
  },
  {
    id: 'grounding-and-equipotential-bonding',
    slug: 'grounding-and-equipotential-bonding',
    category: 'safety',
    categoryLabel: 'Codes & Safety Standards',
    title: 'Equipment Grounding & Anodized Frame Bonding',
    question: 'How do you properly ground solar module aluminum frames through non-conductive anodized coatings?',
    formulaOrRule: 'Ground Resistance R <= 4.0 Ohms (Utility: <= 10 Ohms) | UL 2703 Certified Grounding Clips',
    summary: 'Aluminum solar panel frames are coated with an electrical non-conductive anodized layer. Grounding requires stainless-steel serrated bonding hardware (WEEB clips) that penetrate the anodization to bond all frames together.',
    explanation: 'Without continuous equipotential bonding to the ground electrode conductor (GEC), a ground fault (e.g. damaged cable touching the frame) energizes the entire metal racking system at up to 1000V DC, presenting a lethal shock hazard to roof technicians.',
    pitfall: 'Standard zinc-plated bolts or copper wire directly touching aluminum frames causes severe galvanic corrosion over time, breaking the ground continuity path.',
    standardRef: 'UL 2703 / NEC 690.43 Equipment Grounding & Bonding',
    tags: ['grounding', 'bonding', 'ul 2703', 'safety', 'electrical'],
    contextualTriggers: {
      categoryMatch: ['panel', 'inverter'],
    },
  },
];
