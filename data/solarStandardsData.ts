export interface SolarStandardDoc {
  id: string;
  code: string;
  title: string;
  issuingBody: 'IEC' | 'NEC' | 'UL' | 'IEEE' | 'CEN';
  category: 'modules' | 'inverters' | 'batteries' | 'installation';
  categoryLabel: string;
  status: 'Active (Latest)' | 'Mandatory Standard' | 'Harmonized Global';
  year: string;
  scope: string;
  keyRequirements: string[];
  officialPortalUrl: string;
  searchPdfUrl: string;
}

export const SOLAR_STANDARDS: SolarStandardDoc[] = [
  // -------------------------------------------------------------------------
  // 1. Solar Photovoltaic Modules
  // -------------------------------------------------------------------------
  {
    id: 'iec-61215',
    code: 'IEC 61215:2021',
    title: 'Terrestrial Photovoltaic (PV) Modules – Design Qualification and Type Approval',
    issuingBody: 'IEC',
    category: 'modules',
    categoryLabel: 'PV Modules',
    status: 'Harmonized Global',
    year: '2021',
    scope: 'The premier global benchmark for solar panel design qualification, mechanical endurance, and electrical performance verification under extreme environmental stress.',
    keyRequirements: [
      'Thermal Cycling Test: 200 cycles from -40°C to +85°C to verify solder ribbon integrity.',
      'Damp Heat Test: 1,000 hours at 85°C and 85% relative humidity to test encapsulant and junction box sealing.',
      'Mechanical Load Test: 2,400 Pa wind load / 5,400 Pa front-side heavy snow load qualification.',
      'Hail Impact Test: 25mm ice ball at 23.0 m/s (51.5 mph) kinetic impact testing.',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/61465',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+61215+2021+standard+pdf+technical+summary',
  },
  {
    id: 'iec-61730',
    code: 'IEC 61730:2023',
    title: 'Photovoltaic (PV) Module Safety Qualification – Construction & Testing Requirements',
    issuingBody: 'IEC',
    category: 'modules',
    categoryLabel: 'PV Modules',
    status: 'Active (Latest)',
    year: '2023',
    scope: 'Mandatory international standard specifying electrical shock prevention, fire hazard mitigation, and personal injury protection for PV modules up to 1500V DC.',
    keyRequirements: [
      'Electrical Insulation & Creepage: Strict clearance distance specifications for 1000V and 1500V system voltages.',
      'Fire Resistance Rating: Class A / Class C spread-of-flame rooftop fire safety classification.',
      'Impulse Voltage Withstand: 8kV to 16kV impulse surge dielectric test across laminate edges.',
      'UV Exposure Preconditioning: 15 kWh/m² UV radiation endurance before mechanical stress tests.',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/67891',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+61730+2023+safety+qualification+pdf',
  },
  {
    id: 'iec-62548',
    code: 'IEC 62548:2024',
    title: 'Photovoltaic (PV) Arrays – Design Requirements for Electrical Safety',
    issuingBody: 'IEC',
    category: 'installation',
    categoryLabel: 'Installation & Arrays',
    status: 'Active (Latest)',
    year: '2024',
    scope: 'Global design standard dictating array cabling architecture, string overcurrent protection, DC isolation switches, and lightning surge protection.',
    keyRequirements: [
      'String Sizing Rules: Calculation of maximum series modules based on lowest recorded site temperature.',
      'DC Disconnection: Requirement for load-break DC isolators within sight of inverters.',
      'Overcurrent Protection (OCPD): DC string fuses required when more than 2 parallel strings share an MPPT input.',
      'Equipotential Bonding: Continuous grounding conductor network across all metal array racking.',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/68421',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+62548+2024+design+requirements+pdf',
  },
  {
    id: 'ul-61730',
    code: 'UL 61730-1/2',
    title: 'Photovoltaic (PV) Module Safety Qualification (North American Harmonized Standard)',
    issuingBody: 'UL',
    category: 'modules',
    categoryLabel: 'PV Modules',
    status: 'Mandatory Standard',
    year: '2020',
    scope: 'The mandatory safety certification standard required by AHJs (Authorities Having Jurisdiction) for any solar panel installed in the United States and Canada.',
    keyRequirements: [
      'Type 1 / Type 2 Heavy Duty Fire Classification for steep and low-slope rooftop integration.',
      'Cut Susceptibility Test: Edge impact protection to prevent copper ribbon contact.',
      'UL 2703 Grounding Compliance: Tested bonding points for racking clamps and WEEB clips.',
    ],
    officialPortalUrl: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL61730-1',
    searchPdfUrl: 'https://www.google.com/search?q=UL+61730+standard+for+safety+pv+modules+pdf',
  },

  // -------------------------------------------------------------------------
  // 2. Inverters & Grid Interconnection
  // -------------------------------------------------------------------------
  {
    id: 'iec-62109',
    code: 'IEC 62109-1/2',
    title: 'Safety of Power Converters for Use in Photovoltaic Power Systems',
    issuingBody: 'IEC',
    category: 'inverters',
    categoryLabel: 'Inverters',
    status: 'Harmonized Global',
    year: '2022',
    scope: 'International electrical safety and ingress protection standard for string inverters, central inverters, microinverters, and charge controllers.',
    keyRequirements: [
      'Residual Current Monitoring Unit (RCMU): Mandatory sub-300ms disconnection on DC/AC ground leakage > 30mA.',
      'Galvanic Isolation & Transformerless Safety: Protective grounding and double insulation verification.',
      'IP65 / IP66 Enclosure Testing: Dust-tight sealing and high-pressure water jet ingress resistance.',
      'Anti-Islanding Protection: Sub-2 second automatic disconnection upon loss of grid voltage/frequency.',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/6584',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+62109+inverter+safety+standard+pdf',
  },
  {
    id: 'ieee-1547',
    code: 'IEEE 1547-2018',
    title: 'Standard for Interconnection and Interoperability of Distributed Energy Resources (DER)',
    issuingBody: 'IEEE',
    category: 'inverters',
    categoryLabel: 'Inverters',
    status: 'Mandatory Standard',
    year: '2018',
    scope: 'The definitive smart inverter grid-support standard requiring active voltage regulation, frequency ride-through, and digital communications with grid operators.',
    keyRequirements: [
      'Volt-VAR & Volt-Watt Modes: Inverters automatically inject/absorb reactive power to stabilize neighborhood grid voltage.',
      'Frequency Ride-Through (FRT): Inverters remain online during momentary grid frequency excursions (58.5Hz ~ 61.5Hz).',
      'Interoperability Protocols: Mandatory IEEE 2030.5 / SunSpec Modbus communication interfaces.',
    ],
    officialPortalUrl: 'https://standards.ieee.org/ieee/1547/5915/',
    searchPdfUrl: 'https://www.google.com/search?q=IEEE+1547+2018+interconnection+standard+pdf',
  },
  {
    id: 'ul-1741-sb',
    code: 'UL 1741 SB / SA',
    title: 'Inverters, Converters, Controllers and Interconnection System Equipment for Distributed Energy',
    issuingBody: 'UL',
    category: 'inverters',
    categoryLabel: 'Inverters',
    status: 'Mandatory Standard',
    year: '2023',
    scope: 'The benchmark certification testing standard for North American smart grid-tied inverters and hybrid energy storage systems (California Rule 21 compliant).',
    keyRequirements: [
      'Active Anti-Islanding: Guaranteed disconnect when utility power is interrupted, preventing backfeeding lineworkers.',
      'Rapid Shutdown Transmitter Testing: Integrated SunSpec PLC signal generation for rooftop fire safety.',
      'Harmonic Distortion (THD): Total harmonic current distortion strictly capped under 5% at rated power.',
    ],
    officialPortalUrl: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL1741',
    searchPdfUrl: 'https://www.google.com/search?q=UL+1741+SB+smart+inverter+testing+pdf',
  },

  // -------------------------------------------------------------------------
  // 3. Energy Storage & Battery Systems
  // -------------------------------------------------------------------------
  {
    id: 'ul-9540',
    code: 'UL 9540:2023',
    title: 'Standard for Energy Storage Systems (ESS) and Equipment',
    issuingBody: 'UL',
    category: 'batteries',
    categoryLabel: 'Storage Batteries',
    status: 'Active (Latest)',
    year: '2023',
    scope: 'The North American building code safety standard evaluating residential and commercial battery systems as a complete integrated package (cells + BMS + enclosure + inverter).',
    keyRequirements: [
      'Residential Capacity Limits: Max 20 kWh per individual unit / Max 80 kWh aggregated system capacity in residential garages.',
      'Separation Clearances: Minimum 3-foot (0.91m) physical separation between individual battery enclosures.',
      'Ventilation & Deflagration: Mandatory combustible gas detection and explosion mitigation mechanisms.',
    ],
    officialPortalUrl: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL9540',
    searchPdfUrl: 'https://www.google.com/search?q=UL+9540+energy+storage+systems+standard+pdf',
  },
  {
    id: 'ul-9540a',
    code: 'UL 9540A Test Method',
    title: 'Test Method for Evaluating Thermal Runaway Fire Propagation in Battery Energy Storage Systems',
    issuingBody: 'UL',
    category: 'batteries',
    categoryLabel: 'Storage Batteries',
    status: 'Mandatory Standard',
    year: '2021',
    scope: 'The rigorous 4-tier destructive testing protocol (Cell level, Module level, Unit level, Installation level) to quantify flammable gas release and flame spread during battery failure.',
    keyRequirements: [
      'Cell Thermal Runaway Triggering: Intentional overheating to force thermal event and measure peak heat release rate (HRR).',
      'Module-to-Module Propagation Test: Proves that a fire in one cell group cannot cascade to adjacent battery modules.',
      'Flammable Gas Volume & Lower Flammability Limit (LFL) calculation for indoor utility room permitting.',
    ],
    officialPortalUrl: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL9540A',
    searchPdfUrl: 'https://www.google.com/search?q=UL+9540A+thermal+runaway+test+report+pdf',
  },
  {
    id: 'iec-62619',
    code: 'IEC 62619:2022',
    title: 'Secondary Lithium Cells and Batteries for Use in Industrial & Stationary Energy Storage',
    issuingBody: 'IEC',
    category: 'batteries',
    categoryLabel: 'Storage Batteries',
    status: 'Harmonized Global',
    year: '2022',
    scope: 'The primary international safety qualification standard for stationary LiFePO4 and NMC batteries used in home storage, telecom, and commercial microgrids.',
    keyRequirements: [
      'Overcharge Protection Control: Dual-layer independent hardware and firmware voltage cutoff verification.',
      'Thermal Abuse & Propagation Test: Demonstrates internal fire containment at 85°C ambient.',
      'Short-Circuit Resistance: External dead short-circuit test with verified BMS disconnect in < 5 milliseconds.',
      'Drop Test & Mechanical Shock resistance testing for field transport and installation handling.',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/68735',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+62619+2022+stationary+battery+standard+pdf',
  },
  {
    id: 'un-38-3',
    code: 'UN 38.3 (DOT/IATA)',
    title: 'UN Manual of Tests and Criteria – Transportation Testing for Lithium Metal and Lithium Ion Batteries',
    issuingBody: 'CEN',
    category: 'batteries',
    categoryLabel: 'Storage Batteries',
    status: 'Mandatory Standard',
    year: '2023',
    scope: 'Mandatory international transport safety qualification required before any lithium battery pack can be shipped via air, sea, rail, or road freight.',
    keyRequirements: [
      'T.1 Altitude Simulation: Low pressure (11.6 kPa) testing equivalent to 15,000m aircraft cargo holds.',
      'T.2 Thermal Test: 10 cycles of rapid temperature swings between -40°C and +75°C.',
      'T.3 Vibration & T.4 Shock: Multi-axis mechanical vibration and 150g acceleration impact testing.',
      'T.5 External Short Circuit: 55°C high-temperature external dead-short verification.',
    ],
    officialPortalUrl: 'https://unece.org/transport/dangerous-goods',
    searchPdfUrl: 'https://www.google.com/search?q=UN+38.3+lithium+battery+test+summary+pdf',
  },

  // -------------------------------------------------------------------------
  // 4. National Electrical Code (NEC) & Installation Rules
  // -------------------------------------------------------------------------
  {
    id: 'nec-690',
    code: 'NEC 2023 Article 690',
    title: 'NFPA 70: National Electrical Code – Solar Photovoltaic (PV) Systems',
    issuingBody: 'NEC',
    category: 'installation',
    categoryLabel: 'Installation & Arrays',
    status: 'Mandatory Standard',
    year: '2023',
    scope: 'The most widely adopted national electrical code in the Western Hemisphere, governing all electrical aspects of residential, commercial, and ground-mount solar arrays.',
    keyRequirements: [
      'Section 690.7: Maximum DC Voltage calculation adjusted for lowest historical winter ambient temperature.',
      'Section 690.12: Rapid Shutdown requirements inside and outside the 1-foot array boundary.',
      'Section 690.11: Mandatory DC Arc-Fault Circuit Protection (AFCI) Type 1 detection and interruption.',
      'Section 690.41: System grounding and single-point DC ground fault detector/interrupter (GFDI).',
    ],
    officialPortalUrl: 'https://www.nfpa.org/codes-and-standards/70',
    searchPdfUrl: 'https://www.google.com/search?q=NEC+2023+Article+690+solar+pv+systems+pdf',
  },
  {
    id: 'nec-705',
    code: 'NEC 2023 Article 705',
    title: 'NFPA 70: National Electrical Code – Interconnected Electric Power Production Sources',
    issuingBody: 'NEC',
    category: 'installation',
    categoryLabel: 'Installation & Arrays',
    status: 'Mandatory Standard',
    year: '2023',
    scope: 'Rules governing how solar inverters and battery systems backfeed electrical service panels and point-of-interconnection (POI) breaker boxes.',
    keyRequirements: [
      'The 120% Busbar Rule (705.12(B)): Solar backfeed breaker + Main breaker <= 120% of busbar ampacity rating.',
      'Supply-Side Connection (705.11): Rules for tapping between the utility meter and main service disconnect.',
      'Loss of Primary Source: Mandatory anti-islanding disconnect to protect utility linemen.',
    ],
    officialPortalUrl: 'https://www.nfpa.org/codes-and-standards/70',
    searchPdfUrl: 'https://www.google.com/search?q=NEC+705.12+120+percent+rule+solar+interconnection+pdf',
  },
  {
    id: 'ul-2703',
    code: 'UL 2703:2021',
    title: 'Standard for Mounting Systems, Clamping Devices and Ground Lugs for Flat-Plate PV Modules',
    issuingBody: 'UL',
    category: 'installation',
    categoryLabel: 'Installation & Arrays',
    status: 'Mandatory Standard',
    year: '2021',
    scope: 'The structural and electrical grounding standard for solar roof racking, ground mount frames, and module hold-down clamps.',
    keyRequirements: [
      'Integrated Grounding & Bonding: Serrated bonding pins that penetrate anodized aluminum frame coatings.',
      'Mechanical Wind & Snow Load: Static and cyclic testing for 150 mph wind and 50 psf snow load resistance.',
      'Class A Rooftop Fire System Rating: Verification that racking does not accelerate flame spread over roof decking.',
    ],
    officialPortalUrl: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL2703',
    searchPdfUrl: 'https://www.google.com/search?q=UL+2703+mounting+systems+grounding+standard+pdf',
  },
  {
    id: 'iec-60364-7-712',
    code: 'IEC 60364-7-712',
    title: 'Low-Voltage Electrical Installations – Requirements for Solar Photovoltaic (PV) Power Supply Systems',
    issuingBody: 'IEC',
    category: 'installation',
    categoryLabel: 'Installation & Arrays',
    status: 'Harmonized Global',
    year: '2022',
    scope: 'The European and international standard specifying installation rules, cable routing, double insulation, and surge protective devices (SPD) for PV installations.',
    keyRequirements: [
      'Surge Protection Devices (SPD): Mandatory Type I/II DC surge arrestors at inverter and array combiner boxes.',
      'Cable Selection: Mandatory cross-linked PV1-F / H1Z2Z2-K solar cables rated for 120°C max temperature and UV resistance.',
      'Isolation Testing: Pre-commissioning insulation resistance testing (minimum 1.0 Megaohm at 1000V DC test voltage).',
    ],
    officialPortalUrl: 'https://webstore.iec.ch/publication/60364-7-712',
    searchPdfUrl: 'https://www.google.com/search?q=IEC+60364-7-712+pv+installation+standard+pdf',
  },
];
