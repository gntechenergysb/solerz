import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Zap,
  Thermometer,
  CircuitBoard,
  Ruler,
  Shield,
  Layers,
  ArrowLeft,
  Scale,
  Sparkles,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { fetchPanelBySlug, fetchCompetitorComparisons, type CompetitorComparison } from '../services/panelService';
import type { SolarPanelDetail } from '../types';
import DatasheetSection from '../components/DatasheetSection';
import ExpertAnalysisSection from '../components/ExpertAnalysisSection';
import CrossProductRecommender from '../components/CrossProductRecommender';
import ContextualTipCard from '../components/ContextualTipCard';
import AdSlotPlaceholder from '../components/AdSlotPlaceholder';
import { generatePanelExpertInsights, getRelatedNewsAndResourceLinks } from '../services/seoInsightsService';

/** Maps DB technol codes to human-readable labels */
const techLabel = (t: string | null): string => {
  if (!t) return '—';
  const map: Record<string, string> = {
    mtSiMono: 'Mono-c-Si',
    mtSiPoly: 'Poly-c-Si',
    mtCdTe: 'CdTe',
    mtCIS: 'CIS/CIGS',
    mtHIT: 'HIT/HJT',
    mtSiAmorp: 'a-Si',
  };
  return map[t] ?? t;
};

/** Null-safe format: returns the value with unit, or '—' */
const fmt = (
  val: number | null | undefined,
  unit: string,
  decimals = 2
): string => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)} ${unit}`;
};

const fmtInt = (val: number | null | undefined, unit: string): string => {
  if (val == null) return '—';
  return `${Math.round(Number(val))} ${unit}`;
};

// ---------------------------------------------------------------------------
// Spec card sub-component
// ---------------------------------------------------------------------------
interface SpecRowProps {
  label: string;
  value: string;
  sub?: string;
}

const SpecRow: React.FC<SpecRowProps> = ({ label, value, sub }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      {sub && (
        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
          {sub}
        </span>
      )}
    </div>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-right tabular-nums">
      {value}
    </span>
  </div>
);

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      {icon}
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {title}
      </h2>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Detail page
// ---------------------------------------------------------------------------
const PanelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Check SSR hydration state
  const initialPanel = React.useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_PANEL__) {
      const init = (window as any).__INITIAL_PANEL__ as SolarPanelDetail;
      if (init && init.slug === slug) {
        return init;
      }
    }
    return null;
  }, [slug]);

  const [panel, setPanel] = useState<SolarPanelDetail | null>(initialPanel);
  const [loading, setLoading] = useState(!initialPanel);
  const [notFound, setNotFound] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorComparison[]>([]);

  useEffect(() => {
    if (!slug) return;
    if (panel && panel.slug === slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    fetchPanelBySlug(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          document.title = 'Solar Panel Not Found | Solerz';
        } else {
          setPanel(data);
          document.title = `${data.brand_name} ${data.model_name} (${Math.round(data.pnom_w)}W) Specs & PAN File | Solerz`;
          // Fetch competitor comparisons in the same wattage bracket
          fetchCompetitorComparisons(data)
            .then(setCompetitors)
            .catch(() => setCompetitors([]));
        }
      })
      .catch(() => {
        setNotFound(true);
        document.title = 'Solar Panel Not Found | Solerz';
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  // --- Not found state ---
  if (notFound || !panel) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Panel Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The solar panel you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/solar-panels"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to panels
        </Link>
      </div>
    );
  }

  // --- Computed values ---
  const area =
    panel.length_m && panel.width_m
      ? (panel.length_m * panel.width_m).toFixed(3)
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SEO Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/solar-panels" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Solar Panels
        </Link>
        {panel.brand_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/brands/${encodeURIComponent(panel.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              {panel.brand_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-xs">
          {panel.model_name}
        </span>
      </nav>

      {/* ================================================================= */}
      {/* Hero Card */}
      {/* ================================================================= */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {panel.brand_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {panel.model_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {techLabel(panel.technol)}
                </span>
                {panel.is_bifacial && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Layers className="w-3 h-3" />
                    Bifacial
                  </span>
                )}
              </div>
            </div>

            {/* Hero metrics */}
            <div className="flex items-end gap-6 sm:text-right">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                  Power
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {Math.round(panel.pnom_w)}
                  </span>
                  <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                    Wp
                  </span>
                </div>
              </div>
              {panel.module_efficiency_pct != null && (
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                    Efficiency
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                      {panel.module_efficiency_pct.toFixed(1)}
                    </span>
                    <span className="text-lg font-semibold text-amber-400 dark:text-amber-500">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Spec Sections — 2-column responsive grid */}
      {/* ================================================================= */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* STC Electrical Parameters */}
        <Section
          icon={<Zap className="w-4 h-4 text-emerald-500" />}
          title="STC Electrical (1000 W/m², 25°C)"
        >
          <SpecRow label="Max Power" value={fmt(panel.pnom_w, 'W', 1)} sub="Pnom" />
          <SpecRow label="Max Power Voltage" value={fmt(panel.vmp_v, 'V')} sub="Vmp" />
          <SpecRow label="Max Power Current" value={fmt(panel.imp_a, 'A')} sub="Imp" />
          <SpecRow label="Open Circuit Voltage" value={fmt(panel.voc_v, 'V')} sub="Voc" />
          <SpecRow label="Short Circuit Current" value={fmt(panel.isc_a, 'A')} sub="Isc" />
          <SpecRow label="Max System Voltage (IEC)" value={fmtInt(panel.vmax_iec_v, 'V')} />
          <SpecRow label="Max System Voltage (UL)" value={fmtInt(panel.vmax_ul_v, 'V')} />
        </Section>

        {/* Temperature Coefficients */}
        <Section
          icon={<Thermometer className="w-4 h-4 text-red-500" />}
          title="Temperature Coefficients"
        >
          <SpecRow
            label="Power Temp Coeff"
            value={fmt(panel.mu_pnom_spec_pct_c, '%/°C', 3)}
            sub="γ_pmp"
          />
          <SpecRow
            label="Voltage Temp Coeff"
            value={fmt(panel.mu_voc_spec_mv_c, 'mV/°C', 2)}
            sub="β_oc"
          />
          <SpecRow
            label="Current Temp Coeff"
            value={fmt(panel.mu_isc_ma_c, 'mA/°C', 3)}
            sub="α_sc"
          />
        </Section>

        {/* Single Diode Model */}
        <Section
          icon={<CircuitBoard className="w-4 h-4 text-blue-500" />}
          title="Single Diode Model (SDM)"
        >
          <SpecRow label="Series Resistance" value={fmt(panel.r_serie_ohm, 'Ω', 3)} sub="Rs" />
          <SpecRow label="Shunt Resistance" value={fmt(panel.r_shunt_ohm, 'Ω', 2)} sub="Rsh" />
          <SpecRow label="Diode Ideality Factor" value={panel.gamma != null ? panel.gamma.toFixed(3) : '—'} sub="γ (Gamma)" />
          {panel.is_bifacial && (
            <SpecRow label="Bifaciality Factor" value={panel.bifaciality_factor != null ? panel.bifaciality_factor.toFixed(2) : '0.80 ± 5%'} />
          )}
        </Section>

        {/* NMOT / NOCT Real-World Specs */}
        <Section
          icon={<Sun className="w-4 h-4 text-amber-500" />}
          title="NMOT Operating Specs (800 W/m², 20°C, 1m/s)"
        >
          <SpecRow
            label="Nominal Cell Temp (NOCT)"
            value={panel.noct_c != null ? `${panel.noct_c}°C` : '45 ± 2°C'}
            sub="NOCT"
          />
          <SpecRow
            label="NMOT Power Output"
            value={panel.pnom_nmot_w != null ? fmt(panel.pnom_nmot_w, 'W', 1) : fmt(panel.pnom_w * 0.752, 'W', 1)}
            sub="Pmax (NMOT)"
          />
          <SpecRow
            label="NMOT Voltage"
            value={panel.vmp_nmot_v != null ? fmt(panel.vmp_nmot_v, 'V') : fmt(panel.vmp_v * 0.935, 'V')}
            sub="Vmp (NMOT)"
          />
          <SpecRow
            label="NMOT Current"
            value={panel.imp_nmot_a != null ? fmt(panel.imp_nmot_a, 'A') : fmt(panel.imp_a * 0.805, 'A')}
            sub="Imp (NMOT)"
          />
          <SpecRow
            label="NMOT Open Circuit Voltage"
            value={panel.voc_nmot_v != null ? fmt(panel.voc_nmot_v, 'V') : fmt(panel.voc_v * 0.942, 'V')}
            sub="Voc (NMOT)"
          />
        </Section>

        {/* Electrical Protection & Limits */}
        <Section
          icon={<Shield className="w-4 h-4 text-purple-500" />}
          title="Electrical Protection & Design Limits"
        >
          <SpecRow
            label="Max Series Fuse Rating"
            value={panel.max_series_fuse_a != null ? `${panel.max_series_fuse_a} A` : (panel.isc_a > 15 ? '30 A' : '25 A')}
            sub="Fuse / Breaker Sizing"
          />
          <SpecRow
            label="Power Sorting Tolerance"
            value={panel.power_tolerance || '0 ~ +3% / 0 ~ +5W (Positive)'}
            sub="Power Binning"
          />
          <SpecRow
            label="Operating Temperature"
            value={panel.operating_temp_range || '-40°C ~ +85°C'}
            sub="Ambient Range"
          />
          <SpecRow
            label="Max System Voltage (IEC)"
            value={fmtInt(panel.vmax_iec_v || 1500, 'V')}
          />
          <SpecRow
            label="Max System Voltage (UL)"
            value={fmtInt(panel.vmax_ul_v || 1500, 'V')}
          />
        </Section>

        {/* Mechanical Load & Materials */}
        <Section
          icon={<Ruler className="w-4 h-4 text-orange-500" />}
          title="Mechanical Load & Construction"
        >
          <SpecRow label="Length × Width" value={`${fmt(panel.length_m, 'm', 3)} × ${fmt(panel.width_m, 'm', 3)}`} />
          <SpecRow label="Frame Depth" value={fmt(panel.depth_m || 0.030, 'm', 3)} sub={panel.depth_m ? `${Math.round(panel.depth_m * 1000)} mm` : '30 mm'} />
          <SpecRow label="Module Weight" value={panel.weight_kg != null ? `${panel.weight_kg} kg` : '—'} />
          <SpecRow
            label="Front Static Load (Snow)"
            value={panel.front_load_pa != null ? `${panel.front_load_pa.toLocaleString()} Pa` : '5,400 Pa (550 kg/m²)'}
          />
          <SpecRow
            label="Rear Static Load (Wind)"
            value={panel.rear_load_pa != null ? `${panel.rear_load_pa.toLocaleString()} Pa` : '2,400 Pa (240 km/h)'}
          />
          <SpecRow
            label="Glass Construction"
            value={panel.glass_type || (panel.is_bifacial ? '2.0mm + 2.0mm Dual-Glass AR' : '3.2mm Tempered Glass AR')}
          />
          <SpecRow
            label="Junction Box & Protection"
            value={panel.junction_box_ip || 'IP68 (3 Bypass Diodes)'}
          />
          <SpecRow
            label="Connector Type"
            value={panel.connector_type || 'MC4 / MC4-EVO2 Compatible'}
          />
        </Section>
      </div>

      {/* Bifacial Extra Rear-side Gain (Dual-Glass) */}
      {panel.is_bifacial && (
        <Section
          icon={<Layers className="w-4 h-4 text-purple-500" />}
          title="Bifacial Rear-Side Energy Gain Scenarios"
        >
          <div className="grid sm:grid-cols-3 sm:gap-4 py-2">
            <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-1">
                +5% Ground Albedo Gain
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {panel.bifacial_gain_5pct_w != null ? `${Math.round(panel.bifacial_gain_5pct_w)} W` : `${Math.round(panel.pnom_w * 1.05)} W`}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Typical for grass / dark soil</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-1">
                +15% Ground Albedo Gain
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {panel.bifacial_gain_15pct_w != null ? `${Math.round(panel.bifacial_gain_15pct_w)} W` : `${Math.round(panel.pnom_w * 1.15)} W`}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Concrete / light gravel surface</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700/60">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-1">
                +25% Ground Albedo Gain
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {panel.bifacial_gain_25pct_w != null ? `${Math.round(panel.bifacial_gain_25pct_w)} W` : `${Math.round(panel.pnom_w * 1.25)} W`}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">White TPO roof / fresh snow</span>
            </div>
          </div>
        </Section>
      )}

      {/* Packaging & Logistics + Warranty — 2-column grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Warranty */}
        <Section
          icon={<Shield className="w-4 h-4 text-emerald-500" />}
          title="Warranty & Reliability"
        >
          <SpecRow
            label="Product Workmanship Warranty"
            value={panel.warranty_product_years ? `${panel.warranty_product_years} years` : '12 to 25 years'}
          />
          <SpecRow
            label="Linear Power Output Warranty"
            value={panel.warranty_power_years ? `${panel.warranty_power_years} years` : '25 to 30 years'}
          />
        </Section>

        {/* Packaging & Logistics */}
        <Section
          icon={<Scale className="w-4 h-4 text-cyan-500" />}
          title="Packaging & Container Logistics"
        >
          <SpecRow
            label="Modules per Pallet"
            value={panel.pcs_per_pallet != null ? `${panel.pcs_per_pallet} pcs / Pallet` : '31 ~ 36 pcs / Pallet'}
          />
          <SpecRow
            label="40' HQ Container Capacity"
            value={panel.pcs_per_40hq_container != null ? `${panel.pcs_per_40hq_container} pcs / 40ft HQ` : '620 ~ 720 pcs / 40ft HQ'}
          />
        </Section>
      </div>

      {/* ================================================================= */}
      {/* Official Datasheet & Technical Documents */}
      {/* ================================================================= */}
      <DatasheetSection
        category="Solar Panel"
        brandName={panel.brand_name}
        modelName={panel.model_name}
        powerOrCapacity={`${Math.round(panel.pnom_w)}W`}
        datasheetUrl={panel.datasheet_url}
        panelDetail={panel}
      />

      {/* Ad / Hardware Partner Promotion Slot */}
      <AdSlotPlaceholder
        format="horizontal"
        customText={`Compare wholesale stock & lead times for ${panel.brand_name} ${panel.model_name} panels.`}
      />

      {/* Contextual Pro Engineering Tip */}
      <ContextualTipCard
        isBifacial={panel.is_bifacial}
        category="modules"
      />

      {/* ================================================================= */}
      {/* Expert Analysis & Engineering Review (Solerz Deep Dive) */}
      {/* ================================================================= */}
      <ExpertAnalysisSection
        insights={generatePanelExpertInsights(panel)}
        newsLinks={getRelatedNewsAndResourceLinks(panel.brand_name, panel.model_name, 'Solar Panel')}
        category="Solar Panel"
        brandName={panel.brand_name}
        modelName={panel.model_name}
      />

      {/* ================================================================= */}
      {/* Cross-Product Hardware Recommender (Ecosystem Internal Links) */}
      {/* ================================================================= */}
      <CrossProductRecommender sourceType="panel" panel={panel} />

      {/* ================================================================= */}
      {/* Direct Competitor Head-to-Head Comparisons (Programmatic SEO) */}
      {/* ================================================================= */}
      {competitors.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Top Rival Comparisons
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    ±20W Direct Competitors
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare {panel.model_name} side-by-side with rival modules in the same wattage class
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {competitors.map(({ competitor, compareUrl }) => {
              const pDiff = Math.round(competitor.pnom_w - panel.pnom_w);
              const pDiffLabel = pDiff === 0 ? 'Exact Match' : (pDiff > 0 ? `+${pDiff}W` : `${pDiff}W`);
              
              return (
                <Link
                  key={competitor.id}
                  to={compareUrl}
                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      VS
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block truncate">
                        {competitor.brand_name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {competitor.model_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {Math.round(competitor.pnom_w)}W
                        </span>
                        <span>•</span>
                        <span>{competitor.module_efficiency_pct?.toFixed(1)}% Eff</span>
                        <span>•</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${pDiff === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : (pDiff > 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400')}`}>
                          {pDiffLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 dark:text-slate-300 transition-all">
                      Compare
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer for bottom padding */}
      <div className="h-4" />
    </div>
  );
};

export default PanelDetailPage;
