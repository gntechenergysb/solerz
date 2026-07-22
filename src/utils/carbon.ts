// Grid Carbon Intensity Factors (kg CO2 emissions avoided per kWh generated)
export const GLOBAL_CARBON_FACTORS: Record<string, number> = {
  // North America
  US: 0.385, // United States (National average)
  CA: 0.120, // Canada (Clean Hydro mix)
  MX: 0.430, // Mexico

  // Europe
  GB: 0.207, // United Kingdom
  DE: 0.350, // Germany
  FR: 0.055, // France (Nuclear heavy)
  IT: 0.310, // Italy
  ES: 0.210, // Spain
  NL: 0.290, // Netherlands
  PL: 0.750, // Poland (Coal heavy)
  NO: 0.020, // Norway (98% Hydro)
  SE: 0.025, // Sweden
  CH: 0.030, // Switzerland
  AT: 0.130, // Austria
  BE: 0.160, // Belgium

  // Asia Pacific
  AU: 0.680, // Australia (Coal transition)
  NZ: 0.110, // New Zealand (Hydro/Geothermal)
  CN: 0.550, // China
  JP: 0.470, // Japan
  KR: 0.440, // South Korea
  IN: 0.710, // India
  MY: 0.580, // Malaysia
  SG: 0.400, // Singapore
  ID: 0.720, // Indonesia
  TH: 0.460, // Thailand
  PH: 0.500, // Philippines
  VN: 0.450, // Vietnam
  TW: 0.495, // Taiwan

  // Latin America
  BR: 0.090, // Brazil (Hydro heavy)
  CL: 0.280, // Chile
  AR: 0.340, // Argentina

  // Middle East & Africa
  ZA: 0.900, // South Africa (Coal heavy)
  AE: 0.520, // United Arab Emirates
  SA: 0.580, // Saudi Arabia
  IL: 0.480, // Israel

  // Fallback Global Average
  DEFAULT: 0.475,
};

/**
 * Calculates CO2 avoided (in kg) for a given energy output and country code.
 */
export function calculateCO2SavedKg(kwh: number, countryCode: string = 'US'): number {
  const code = (countryCode || 'US').toUpperCase();
  const factor = GLOBAL_CARBON_FACTORS[code] || GLOBAL_CARBON_FACTORS.DEFAULT;
  return Math.round(kwh * factor * 100) / 100;
}

/**
 * Converts CO2 offset to equivalent trees planted (1 tree absorbs ~21.8 kg CO2/year)
 */
export function calculateTreesEquivalent(co2Kg: number): number {
  return Math.round((co2Kg / 21.8) * 10) / 10;
}
