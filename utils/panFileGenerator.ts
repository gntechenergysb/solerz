import type { SolarPanelDetail } from '../types';

/**
 * Generates standard PVsyst-compliant .PAN file text from solar panel specifications.
 */
export function generatePanFileContent(panel: SolarPanelDetail): string {
  // If raw PVsyst PAN content exists in DB, return that directly
  if (panel.raw_pan_content && panel.raw_pan_content.trim().length > 20) {
    return panel.raw_pan_content.trim();
  }

  const brand = panel.brand_name || 'Generic';
  const model = panel.model_name || 'PV Module';
  const technol = panel.technol || 'mtSiMono';
  const pnom = Number(panel.pnom_w || 0).toFixed(1);
  const voc = Number(panel.voc_v || 0).toFixed(2);
  const isc = Number(panel.isc_a || 0).toFixed(2);
  const vmp = Number(panel.vmp_v || 0).toFixed(2);
  const imp = Number(panel.imp_a || 0).toFixed(2);
  const ncels = panel.ncels || 144;
  const ncelp = panel.ncelp || 1;
  const ndiodes = panel.ndiodes || 3;
  const length = panel.length_m ? Number(panel.length_m).toFixed(3) : '2.278';
  const width = panel.width_m ? Number(panel.width_m).toFixed(3) : '1.134';
  const depth = panel.depth_m ? Number(panel.depth_m).toFixed(3) : '0.035';
  const weight = panel.weight_kg ? Number(panel.weight_kg).toFixed(1) : '28.0';

  const muIsc = panel.mu_isc_ma_c != null ? Number(panel.mu_isc_ma_c).toFixed(2) : (Number(isc) * 0.05 * 10).toFixed(2);
  const muVoc = panel.mu_voc_spec_mv_c != null ? Number(panel.mu_voc_spec_mv_c).toFixed(1) : (-Number(voc) * 2.7).toFixed(1);
  const muPnom = panel.mu_pnom_spec_pct_c != null ? Number(panel.mu_pnom_spec_pct_c).toFixed(3) : '-0.340';

  const rSerie = panel.r_serie_ohm != null ? Number(panel.r_serie_ohm).toFixed(4) : '0.2200';
  const rShunt = panel.r_shunt_ohm != null ? Number(panel.r_shunt_ohm).toFixed(1) : '800.0';
  const rp0 = panel.rp_0_ohm != null ? Number(panel.rp_0_ohm).toFixed(1) : '3200.0';
  const rpExp = panel.rp_exp != null ? Number(panel.rp_exp).toFixed(2) : '5.50';
  const gamma = panel.gamma != null ? Number(panel.gamma).toFixed(3) : '0.980';
  const bifacial = panel.is_bifacial ? (panel.bifaciality_factor ? Number(panel.bifaciality_factor).toFixed(2) : '0.70') : '0.00';
  const vmaxIec = panel.vmax_iec_v || 1500;
  const vmaxUl = panel.vmax_ul_v || 1500;

  return [
    'PVObject_ = pvModule',
    'Version = 7.4.0',
    'Flags = $00000000',
    `Manufacturer = "${brand.replace(/"/g, '')}"`,
    `Model = "${model.replace(/"/g, '')}"`,
    'Commercial = 1',
    'DataSource = "Solerz Global PV Database"',
    `Year = ${new Date().getFullYear()}`,
    `Technol = ${technol}`,
    `NCelS = ${ncels}`,
    `NCelP = ${ncelp}`,
    `NDiode = ${ndiodes}`,
    `Width = ${width}`,
    `Length = ${length}`,
    `Height = ${depth}`,
    `Weight = ${weight}`,
    'GRef = 1000',
    'TRef = 25',
    `PNom = ${pnom}`,
    `PNomTolLow = ${panel.pnom_tol_low_pct || 0.0}`,
    `PNomTolUp = ${panel.pnom_tol_up_pct || 3.0}`,
    `Isc = ${isc}`,
    `Voc = ${voc}`,
    `Imp = ${imp}`,
    `Vmp = ${vmp}`,
    `muIsc = ${muIsc}`,
    `muVocSpec = ${muVoc}`,
    `muPnom = ${muPnom}`,
    `RSerie = ${rSerie}`,
    `RShunt = ${rShunt}`,
    `Rp_0 = ${rp0}`,
    `Rp_Exp = ${rpExp}`,
    `Gamma = ${gamma}`,
    `BifacialityFactor = ${bifacial}`,
    `VMaxIEC = ${vmaxIec}`,
    `VMaxUL = ${vmaxUl}`,
  ].join('\r\n');
}

/**
 * Triggers a browser file download of the .PAN file.
 */
export function downloadPanFile(panel: SolarPanelDetail): void {
  const content = generatePanFileContent(panel);
  const cleanFilename = `${(panel.brand_name || 'Module')}_${(panel.model_name || 'PV')}.PAN`
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
