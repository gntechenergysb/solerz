import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Layers,
  Ruler,
  Shield,
  CircuitBoard,
  Sun,
} from 'lucide-react';
import { fetchPanelBySlug } from '../services/panelService';
import type { SolarPanelDetail } from '../types';

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
  const [panel, setPanel] = useState<SolarPanelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchPanelBySlug(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setPanel(data);
        }
      })
      .catch(() => setNotFound(true))
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
          to="/"
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
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Panels
      </Link>

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
          {panel.is_bifacial && panel.bifaciality_factor != null && (
            <SpecRow label="Bifaciality Factor" value={panel.bifaciality_factor.toFixed(2)} />
          )}
        </Section>

        {/* Mechanical & Dimensions */}
        <Section
          icon={<Ruler className="w-4 h-4 text-orange-500" />}
          title="Mechanical & Dimensions"
        >
          <SpecRow label="Length" value={fmt(panel.length_m, 'm', 3)} />
          <SpecRow label="Width" value={fmt(panel.width_m, 'm', 3)} />
          <SpecRow label="Depth" value={fmt(panel.depth_m, 'm', 3)} />
          {area && <SpecRow label="Module Area" value={`${area} m²`} />}
          <SpecRow label="Weight" value={panel.weight_kg != null ? `${panel.weight_kg} kg` : '—'} />
          <SpecRow label="Series Cells" value={fmtInt(panel.ncels, '')} sub="Ns" />
          <SpecRow label="Parallel Cells" value={fmtInt(panel.ncelp, '')} sub="Np" />
          <SpecRow label="Bypass Diodes" value={fmtInt(panel.ndiodes, '')} />
        </Section>
      </div>

      {/* Warranty — full width */}
      <Section
        icon={<Shield className="w-4 h-4 text-emerald-500" />}
        title="Warranty & Compliance"
      >
        <div className="grid sm:grid-cols-2 sm:gap-x-8">
          <SpecRow
            label="Product Warranty"
            value={panel.warranty_product_years ? `${panel.warranty_product_years} years` : '—'}
          />
          <SpecRow
            label="Linear Power Warranty"
            value={panel.warranty_power_years ? `${panel.warranty_power_years} years` : '—'}
          />
        </div>
      </Section>

      {/* Spacer for bottom padding */}
      <div className="h-4" />
    </div>
  );
};

export default PanelDetailPage;
