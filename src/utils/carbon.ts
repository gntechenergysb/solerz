// Grid Carbon Emission Factors (kg CO2 avoided per kWh generated)
export const WORLDWIDE_GRID_CARBON_FACTORS: Record<string, number> = {
  // North America
  US: 0.385, CA: 0.120, MX: 0.430,
  
  // Europe
  GB: 0.207, DE: 0.350, FR: 0.055, IT: 0.310, ES: 0.210,
  NL: 0.290, PL: 0.750, NO: 0.020, SE: 0.025, CH: 0.030,
  AT: 0.130, BE: 0.160, DK: 0.140, FI: 0.045, IE: 0.280,
  
  // Asia Pacific
  AU: 0.680, NZ: 0.110, CN: 0.550, JP: 0.470, KR: 0.440,
  IN: 0.710, MY: 0.580, SG: 0.400, ID: 0.720, TH: 0.460,
  PH: 0.500, VN: 0.450, TW: 0.495, HK: 0.530,
  
  // Latin America
  BR: 0.090, CL: 0.280, AR: 0.340, CO: 0.180,
  
  // Middle East & Africa
  ZA: 0.900, AE: 0.520, SA: 0.580, IL: 0.480, EG: 0.460,

  DEFAULT: 0.475,
};

export function calculateCO2SavedKg(kwh: number, countryCode: string = 'US'): number {
  const code = (countryCode || 'US').toUpperCase();
  const factor = WORLDWIDE_GRID_CARBON_FACTORS[code] || WORLDWIDE_GRID_CARBON_FACTORS.DEFAULT;
  return Math.round(kwh * factor * 100) / 100;
}

export function calculateTreesEquivalent(co2Kg: number): number {
  return Math.round((co2Kg / 21.8) * 10) / 10;
}
