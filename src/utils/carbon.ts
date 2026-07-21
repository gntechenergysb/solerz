/**
 * Carbon emission reduction factors
 * Standard grid emission factor: approx 0.495 kg CO2e / kWh (varies by region, default 0.495 kg/kWh)
 * Average tree carbon absorption: approx 12 kg CO2 / tree / year (or ~0.033 kg/day)
 */

export const CO2_PER_KWH = 0.495; // kg CO2 saved per kWh solar generated
export const CO2_PER_TREE_YEAR = 12.0; // kg CO2 absorbed per tree yearly

export function calculateCO2Reduction(kWh: number): number {
  return Number((kWh * CO2_PER_KWH).toFixed(2));
}

export function calculateTreesEquivalent(co2Kg: number): number {
  return Number((co2Kg / (CO2_PER_TREE_YEAR / 365)).toFixed(1));
}

export function calculateEfficiencyFactor(dailyKWh: number, capacitykWp: number): number {
  if (!capacitykWp || capacitykWp <= 0) return 0;
  // Peak sun hours equivalent = dailyKWh / capacitykWp
  return Number((dailyKWh / capacitykWp).toFixed(2));
}
