export interface SolarGuideArticle {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  category: 'Solar Panels' | 'Inverters' | 'Batteries' | 'System Sizing';
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
  };
  featuredBadge?: string;
  keyTakeaways: string[];
  sections: {
    heading: string;
    content: string; // Markdown or HTML formatted content
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  relatedHardwareCategory: string;
  relatedCategoryUrl: string;
}

export const SOLAR_GUIDES: SolarGuideArticle[] = [
  {
    slug: 'topcon-vs-hjt-vs-perc-solar-cell-technology-guide',
    title: 'N-Type TOPCon vs HJT vs Mono PERC: The 2026 Ultimate Photovoltaic Cell Guide',
    subtitle: 'A deep engineering comparison of conversion efficiencies, temperature coefficients, degradation rates, and levelized cost of energy (LCOE).',
    metaDescription: 'Complete engineering guide comparing N-Type TOPCon, Heterojunction (HJT), and P-Type Mono PERC solar cell technologies. Real efficiency data, temperature coefficients, and cost analysis.',
    category: 'Solar Panels',
    readTime: '8 min read',
    publishedAt: '2026-02-15',
    updatedAt: '2026-08-20',
    author: {
      name: 'Dr. Marcus Vance, PE',
      role: 'Chief Photovoltaic Systems Engineer',
    },
    featuredBadge: 'Most Popular Guide',
    keyTakeaways: [
      'N-Type TOPCon (Tunnel Oxide Passivated Contact) has become the dominant industry standard, achieving 22.5%~23.5% commercial module efficiencies at near-PERC manufacturing costs.',
      'HJT (Heterojunction) delivers the highest bifaciality (85%~95%) and best temperature coefficient (-0.26%/°C), making it the superior choice for hot climates and ground-mounted trackers.',
      'Legacy P-Type Mono PERC is rapidly phasing out due to higher Light-Induced Degradation (LID/LeTID) and a lower efficiency ceiling (capped around 21.5%).',
      'TOPCon and HJT produce ~3% to 8% more annual kilowatt-hours per installed kWp under identical real-world irradiance conditions.',
    ],
    sections: [
      {
        heading: '1. The Architectural Shift: P-Type to N-Type Silicon Wafers',
        content: `For over a decade, P-Type Boron-doped Monocrystalline PERC (Passivated Emitter and Rear Cell) was the workhorse of the global solar industry. However, Boron-Oxygen defect complexes in P-Type wafers cause **Light-Induced Degradation (LID)** of 1.5% to 2.5% in the first year of operation.

N-Type wafers are doped with **Phosphorus**, which contains no Boron-Oxygen defects. This fundamental physical distinction delivers:
- **Near-Zero LID/LeTID**: Year 1 power degradation drops below 1.0%.
- **Longer Carrier Lifetime**: Electrons travel further without recombining, raising open-circuit voltage (Voc).
- **Lower Temperature Coefficient**: Power loss in hot weather drops from -0.35%/°C to -0.29%/°C or better.`,
      },
      {
        heading: '2. Direct Technical Comparison Matrix',
        content: `| Specification Parameter | P-Type Mono PERC | N-Type TOPCon | N-Type HJT (Heterojunction) |
| :--- | :---: | :---: | :---: |
| **Average Module Efficiency** | 20.8% ~ 21.6% | 22.3% ~ 23.2% | 22.8% ~ 23.8% |
| **Power Temp Coefficient (γ_pmp)** | -0.34% ~ -0.37%/°C | -0.29% ~ -0.30%/°C | **-0.24% ~ -0.26%/°C (Best)** |
| **Bifaciality Factor** | 70% ± 5% | 80% ± 5% | **90% ± 5% (Best)** |
| **Year 1 Power Degradation** | 2.0% | 1.0% | **0.8%** |
| **Annual Linear Degradation** | 0.55%/year | 0.40%/year | **0.30%/year** |
| **Low-Light Responsiveness** | Standard | Good | **Exceptional** |
| **Manufacturing Cost Premium** | Baseline | +2% ~ +4% | +8% ~ +12% |`,
      },
      {
        heading: '3. Real-World Climate Suitability & Selection Advice',
        content: `**Choose TOPCon if:** You want the best balance of high efficiency, proven Tier-1 bankability (e.g. LONGi Hi-MO, Trina Vertex, Jinko Tiger Neo), and standard levelized cost of energy (LCOE) for residential rooftops and commercial C&I arrays.

**Choose HJT if:** You are installing in extremely hot desert climates (Middle East, Arizona, Australia), or using dual-axis trackers with high ground albedo (snow, white membrane roofs), where HJT's -0.26%/°C coefficient and 90% bifaciality yield maximum return on investment.`,
      },
    ],
    faq: [
      {
        question: 'Is TOPCon or HJT better for residential rooftop systems?',
        answer: 'For most residential roofs, TOPCon provides the highest energy yield per dollar invested due to its lower manufacturing cost premium. HJT is ideal if roof area is extremely constrained or ambient temperatures frequently exceed 38°C (100°F).',
      },
      {
        question: 'Can TOPCon and PERC panels be mixed on the same inverter string?',
        answer: 'No. Mixing different cell technologies or wattage ratings on the same series string causes electrical mismatch losses (current clipping) and is not recommended.',
      },
    ],
    relatedHardwareCategory: 'Browse 21,750+ TOPCon, HJT & PERC Solar Panels',
    relatedCategoryUrl: '/solar-panels',
  },
  {
    slug: 'bifacial-solar-panels-efficiency-albedo-gain',
    title: 'Bifacial Solar Panels: Albedo Gains, Ground Reflection & Real-World Yield',
    subtitle: 'How dual-glass transparent architecture captures reflected sunlight to generate up to 25% additional kWh.',
    metaDescription: 'Complete engineering guide to bifacial photovoltaic modules. Ground albedo coefficients, mounting height calculations, and inverter sizing rules.',
    category: 'Solar Panels',
    readTime: '6 min read',
    publishedAt: '2026-03-01',
    updatedAt: '2026-08-22',
    author: {
      name: 'Elena Rostova',
      role: 'Solar Yield & Modeling Specialist',
    },
    keyTakeaways: [
      'Bifacial solar panels feature dual-glass or transparent backsheets that produce electricity from both the front and rear sides.',
      'Rear-side energy gain ranges from 5% to 25%, depending on ground albedo, module elevation height, and row pitch.',
      'Snow, white TPO commercial roofing, and crushed white gravel deliver the highest ground albedo reflection (0.60 to 0.85).',
      'Inverter DC/AC ratio sizing must account for rear-side boost to prevent severe inverter clipping during peak midday hours.',
    ],
    sections: [
      {
        heading: '1. How Bifacial Photovoltaics Work',
        content: `Standard monofacial panels absorb light solely from the front glass surface. Bifacial modules replace the opaque white polymer backsheet with a secondary layer of tempered glass. 

Reflected diffuse irradiance from the ground (called **Albedo Irradiance**) strikes the rear surface of the solar cells, exciting electrons and boosting the total output current ($I_{mp}$) without increasing the physical footprint.`,
      },
      {
        heading: '2. Ground Albedo Reflectance Table',
        content: `| Ground Surface Type | Albedo Coefficient (Reflection %) | Typical Rear-Side Yield Gain |
| :--- | :---: | :---: |
| **Fresh White Snow** | 0.70 ~ 0.85 | **+18% ~ +25%** |
| **White TPO/PVC Roof Membrane** | 0.60 ~ 0.75 | **+12% ~ +20%** |
| **Crushed White Gravel / Limestone** | 0.35 ~ 0.45 | **+8% ~ +14%** |
| **Dry Light Sand / Concrete** | 0.25 ~ 0.35 | **+6% ~ +10%** |
| **Green Grass / Standard Soil** | 0.15 ~ 0.20 | **+4% ~ +7%** |
| **Dark Asphalt / Dark Tile Roof** | 0.08 ~ 0.12 | **+1% ~ +3%** |`,
      },
      {
        heading: '3. Installation Best Practices for Bifacial Modules',
        content: `- **Elevate Above Surface**: Mount panels at least 0.8m to 1.2m above the ground or roof to allow diffuse light to spread evenly across the rear array.
- **Avoid Rear Structural Shading**: Use racking clamps and purlins that do not cast horizontal shadows across the rear cell rows.
- **Inverter Headroom**: Size inverters with a conservative 1.15 to 1.20 DC/AC ratio rather than aggressive 1.40 oversizing to accommodate the midday rear current boost.`,
      },
    ],
    faq: [
      {
        question: 'Are bifacial panels worth it on regular residential pitched roofs?',
        answer: 'On dark shingles with flush mounting (less than 10cm gap), rear-side gain is negligible (1%~2%). Bifacial modules deliver their best ROI on flat commercial roofs with white membrane or ground mounts.',
      },
    ],
    relatedHardwareCategory: 'Filter 5,000+ Certified Bifacial Modules',
    relatedCategoryUrl: '/solar-panels',
  },
  {
    slug: 'string-inverter-vs-microinverter-comparison',
    title: 'String Inverters vs Microinverters vs Hybrid Storage: The 2026 Guide',
    subtitle: 'Detailed electrical architecture comparison, MPPT efficiency under shade, and total system cost breakdown.',
    metaDescription: 'Compare string inverters, microinverters, and hybrid storage inverters. Electrical safety, shade tolerance, Rapid Shutdown compliance, and pricing.',
    category: 'Inverters',
    readTime: '7 min read',
    publishedAt: '2026-03-10',
    updatedAt: '2026-08-25',
    author: {
      name: 'Dr. Marcus Vance, PE',
      role: 'Chief Photovoltaic Systems Engineer',
    },
    keyTakeaways: [
      'String inverters offer the lowest capital cost ($/W) and highest peak efficiency (98.5%+), making them the top choice for unshaded roofs and commercial projects.',
      'Microinverters eliminate string-level shading bottlenecks through panel-level MPPT and remove high-voltage DC on the roof for maximum safety.',
      'Hybrid inverters combine solar MPPT and bidirectional battery charging into a single chassis, reducing installation labor and equipment costs.',
    ],
    sections: [
      {
        heading: '1. Architecture & Working Principles',
        content: `Choosing the right inverter topology is the most critical design decision in any photovoltaic installation.
- **Centralized String Inverter**: 10 to 24 modules wired in series connect to 1 or 2 MPPT trackers on a single wall-mounted inverter.
- **Microinverters (Enphase, APsystems)**: A miniaturized inverter is mounted directly beneath each panel, converting DC to AC at the module level.
- **Hybrid Storage Inverter (Tesla, Huawei, Deye, Sol-Ark)**: Integrated DC-coupled inverter managing solar inputs, battery charge/discharge, and grid synchronization.`,
      },
      {
        heading: '2. Inverter Technology Decision Matrix',
        content: `| Feature | String Inverter | Microinverter System | Hybrid Storage Inverter |
| :--- | :---: | :---: | :---: |
| **System Cost ($/W)** | **Lowest ($0.10 ~ $0.18/W)** | Higher ($0.35 ~ $0.50/W) | Moderate ($0.22 ~ $0.32/W) |
| **Peak Efficiency** | **98.0% ~ 99.0%** | 96.5% ~ 97.5% | 97.5% ~ 98.5% |
| **Shade Tolerance** | Low (Without Optimizers) | **Maximum (Module MPPT)** | Low to Moderate |
| **Battery Compatibility** | Requires AC-coupling | Requires AC-coupling | **Native DC-Coupled (Best)** |
| **Rooftop DC Voltage** | High (300V ~ 1000V DC) | **Safe (< 60V AC)** | High (300V ~ 1000V DC) |
| **Warranty Life** | 10 ~ 15 Years | **25 Years** | 10 ~ 15 Years |`,
      },
    ],
    faq: [
      {
        question: 'Which inverter type is best for home battery storage?',
        answer: 'Hybrid inverters are vastly superior for battery integration because solar energy charges the battery directly via DC-to-DC conversion, achieving 95%+ round-trip efficiency compared to double-conversion losses on AC-coupled string systems.',
      },
    ],
    relatedHardwareCategory: 'Explore 2,340+ String & Hybrid Inverters',
    relatedCategoryUrl: '/inverters',
  },
  {
    slug: 'solar-panel-temperature-coefficient-explained',
    title: 'Solar Panel Temperature Coefficients: Calculating Real-World Power Loss',
    subtitle: 'Why solar panels produce less electricity in hot weather and how to factor NOCT into system design.',
    metaDescription: 'Master solar panel temperature coefficients (Pmp, Voc, Isc). Step-by-step formula for calculating heat losses and cold winter over-voltage protection.',
    category: 'Solar Panels',
    readTime: '5 min read',
    publishedAt: '2026-03-20',
    updatedAt: '2026-08-24',
    author: {
      name: 'Elena Rostova',
      role: 'Solar Yield & Modeling Specialist',
    },
    keyTakeaways: [
      'Standard Test Conditions (STC) measure solar panels at 25°C (77°F) cell temperature, but summer sun heats solar cells up to 60°C~70°C.',
      'Power temperature coefficient (γ_pmp) defines the percentage of power lost for every 1°C increase above 25°C.',
      'Modern N-Type panels (-0.29%/°C) lose significantly less power than older P-Type panels (-0.37%/°C).',
      'In freezing winter temperatures, Open-Circuit Voltage (Voc) spikes higher, requiring cold-temperature voltage compensation to protect inverters.',
    ],
    sections: [
      {
        heading: '1. The Core Temperature Loss Formula',
        content: `To calculate the real-world operating power of any solar panel on a hot summer afternoon:

$$\\Delta T = T_{cell} - 25^\\circ\\text{C}$$
$$P_{real} = P_{STC} \\times \\left[1 + \\left(\\gamma_{pmp} \\times \\Delta T\\right)\\right]$$

**Example Calculation:**
- Panel Rating: 500W STC
- Temperature Coefficient $\\gamma_{pmp}$: $-0.30\\%/^\\circ\\text{C}$
- Roof Cell Temperature: $65^\\circ\\text{C}$ ($\\\\Delta T = 40^\\circ\\text{C}$)
- Power Loss: $-0.30\\% \\times 40 = -12.0\\%$
- Real-World Power: $500\\text{W} \\times 0.88 = \\mathbf{440\\text{W}}$`,
      },
    ],
    faq: [
      {
        question: 'Do solar panels work better in cold sunny weather?',
        answer: 'Yes! Cold temperatures increase semiconductor voltage, allowing solar panels to produce up to 5%~10% above their rated STC wattage on clear, cold winter days.',
      },
    ],
    relatedHardwareCategory: 'Calculate DIY System Compatibility & Voltage Safety',
    relatedCategoryUrl: '/calculator',
  },
  {
    slug: 'lifepo4-vs-nmc-home-battery-chemistry-comparison',
    title: 'LiFePO4 vs NMC Solar Batteries: Safety, Cycle Life, and Depth of Discharge',
    subtitle: 'An unbiased chemistry breakdown comparing Lithium Iron Phosphate with Nickel Manganese Cobalt for residential energy storage.',
    metaDescription: 'Engineering comparison of LiFePO4 vs NMC home solar batteries. Thermal runaway safety, round-trip efficiency, 6000+ cycle degradation, and warranty.',
    category: 'Batteries',
    readTime: '6 min read',
    publishedAt: '2026-04-05',
    updatedAt: '2026-08-26',
    author: {
      name: 'Dr. Marcus Vance, PE',
      role: 'Chief Photovoltaic Systems Engineer',
    },
    keyTakeaways: [
      'LiFePO4 (LFP) is now the global standard for stationary home storage due to zero thermal runaway risk and 6,000+ cycle longevity (15+ years).',
      'NMC delivers higher volumetric energy density (more kWh in a smaller box), but suffers faster capacity degradation in hot ambient conditions.',
      'LFP batteries can be charged to 100% daily without accelerated cathode degradation, whereas NMC batteries prefer an 80%~90% cycle window.',
    ],
    sections: [
      {
        heading: '1. Chemical Stability & Thermal Runaway Thresholds',
        content: `Stationary home batteries prioritize **safety and calendar life** over lightweight mobility.
- **LiFePO4 (LFP)** has a thermal runaway threshold of **270°C (518°F)**. The chemical bond between iron, phosphorus, and oxygen is exceptionally stable and does not release oxygen when punctured or overcharged.
- **NMC (Nickel Manganese Cobalt)** has a thermal runaway threshold of **210°C (410°F)** and releases combustible oxygen during catastrophic cell failures.`,
      },
      {
        heading: '2. Lifecycle Degradation & Economics',
        content: `| Parameter | LiFePO4 (LFP) | NMC (Nickel Manganese Cobalt) |
| :--- | :---: | :---: |
| **Typical Cycle Life (to 80% Retained)** | **6,000 ~ 8,000 Cycles** | 3,000 ~ 4,000 Cycles |
| **Expected Service Life** | **15 ~ 20 Years** | 10 ~ 12 Years |
| **Daily Depth of Discharge (DoD)** | **100% Usable** | 90% Recommended |
| **Thermal Runaway Risk** | **Virtually Zero** | Requires Liquid Cooling |
| **Raw Material Toxicity** | Cobalt-Free (Eco-Friendly) | Contains Cobalt & Nickel |`,
      },
    ],
    faq: [
      {
        question: 'Which brands use LiFePO4 chemistry?',
        answer: 'Leading manufacturers including BYD, Enphase (IQ Battery 5P), Pylontech, Tesla (Powerwall 3), Growatt, and Fortress Power utilize LiFePO4 chemistry for maximum safety.',
      },
    ],
    relatedHardwareCategory: 'Browse Certified LiFePO4 Energy Storage Systems',
    relatedCategoryUrl: '/batteries',
  },
  {
    slug: 'how-to-size-solar-system-and-calculate-savings',
    title: 'How to Size a Solar System: Step-by-Step Engineering Calculation Guide',
    subtitle: 'Calculate your exact target kWp capacity, Peak Sun Hours (PSH), roof area requirements, and 25-year financial savings.',
    metaDescription: 'Step-by-step mathematical guide to sizing residential and commercial solar PV arrays. Formulas for daily kWh consumption, derate factors, and ROI.',
    category: 'System Sizing',
    readTime: '7 min read',
    publishedAt: '2026-04-18',
    updatedAt: '2026-08-27',
    author: {
      name: 'Dr. Marcus Vance, PE',
      role: 'Chief Photovoltaic Systems Engineer',
    },
    keyTakeaways: [
      'Target system capacity (kWp) = Daily Consumption (kWh) ÷ (Peak Sun Hours × 0.82 Derate Factor).',
      'A typical 10 kWp system requires approximately 48 to 55 square meters (520 to 600 sq ft) of unshaded roof area.',
      '25-year financial models must account for 0.4%/year module degradation and 2.5%~4.0% annual utility tariff inflation.',
    ],
    sections: [
      {
        heading: '1. The Master Sizing Equation',
        content: `To determine the exact system size in kilowatt-peak (kWp) needed to offset 100% of your electricity bill:

$$\\text{Target kWp} = \\frac{\\text{Monthly kWh} \\div 30}{\\text{Local PSH} \\times 0.82}$$

- **Monthly kWh**: From your utility bill (e.g. 1,200 kWh/month = 40 kWh/day).
- **Local PSH**: Peak Sun Hours per day (e.g. 4.5 hrs in California/Spain/SE Asia, 3.0 hrs in UK/Germany).
- **0.82 Derate Factor**: Standard engineering factor accounting for inverter efficiency (98%), wiring loss (2%), soiling/dust (3%), and cell heat derating (11%).`,
      },
      {
        heading: '2. Rule of Thumb Sizing Table',
        content: `| Monthly Electric Bill ($0.18/kWh) | Monthly Usage (kWh) | Recommended Solar Size (kWp) | Required Roof Space (m²) | Est. Annual Generation (kWh) |
| :---: | :---: | :---: | :---: | :---: |
| **$100 / mo** | 550 kWh | **4.5 kWp** | ~22 m² | 6,500 kWh/yr |
| **$180 / mo** | 1,000 kWh | **8.0 kWp** | ~40 m² | 11,800 kWh/yr |
| **$250 / mo** | 1,400 kWh | **11.5 kWp** | ~56 m² | 16,900 kWh/yr |
| **$400 / mo** | 2,200 kWh | **18.0 kWp** | ~88 m² | 26,500 kWh/yr |
| **$800+ / mo (C&I)** | 4,500+ kWh | **36.0+ kWp** | ~180 m² | 53,000+ kWh/yr |`,
      },
    ],
    faq: [
      {
        question: 'Can I simulate my exact hardware configuration directly?',
        answer: 'Yes! Use our free Solerz Intelligent Sizer & DIY Builder to configure specific panels, inverters, and batteries with real-time electrical safety checks.',
      },
    ],
    relatedHardwareCategory: 'Open Free Intelligent Solar System Sizer',
    relatedCategoryUrl: '/calculator',
  },
];
