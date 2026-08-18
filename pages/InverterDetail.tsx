import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Battery,
  Shield,
  CircuitBoard,
  Sun,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { fetchInverterBySlug } from '../services/inverterService';
import type { InverterDetail } from '../types';

const fmt = (val: number | null | undefined, unit: string, decimals = 1): string => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)} ${unit}`;
};

const fmtInt = (val: number | null | undefined, unit: string): string => {
  if (val == null) return '—';
  return `${Math.round(Number(val))} ${unit}`;
};

interface SpecRowProps {
  label: string;
  value: string;
  sub?: string;
  desc?: string;
}

const SpecRow: React.FC<SpecRowProps> = ({ label, value, sub, desc }) => (
  <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {label}
        </span>
        {sub && (
          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 ml-1.5">
            {sub}
          </span>
        )}
      </div>
      <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
        {value}
      </span>
    </div>
    {desc && (
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
        {desc}
      </p>
    )}
  </div>
);

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800">
      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm">
        {icon}
      </div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
        {title}
      </h2>
    </div>
    <div className="px-6 py-2">{children}</div>
  </div>
);

const InverterDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Check SSR initial state hydration
  const initialInverter = React.useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_INVERTER__) {
      const init = (window as any).__INITIAL_INVERTER__ as InverterDetail;
      if (init && init.slug === slug) return init;
    }
    return null;
  }, [slug]);

  const [inverter, setInverter] = useState<InverterDetail | null>(initialInverter);
  const [loading, setLoading] = useState(!initialInverter);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (inverter && inverter.slug === slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    fetchInverterBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else setInverter(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (notFound || !inverter) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Inverter Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested inverter model could not be found in our database.
        </p>
        <Link
          to="/inverters"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Inverters Catalog
        </Link>
      </div>
    );
  }

  const estimatedAcCurrent = (inverter.paco_w / inverter.vac_v).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb link */}
      <div className="flex items-center justify-between">
        <Link
          to="/inverters"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Inverters
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {inverter.inverter_type}
        </span>
      </div>

      {/* ================================================================= */}
      {/* HERO SECTION: INVERTER OVERVIEW & HERO SPECS */}
      {/* ================================================================= */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                {inverter.brand_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {inverter.model_name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {inverter.inverter_type}
                </span>
                {inverter.is_hybrid && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Battery className="w-3.5 h-3.5" />
                    Hybrid Storage Ready
                  </span>
                )}
                {inverter.cec_cert_date && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    CEC Certified ({inverter.cec_cert_date})
                  </span>
                )}
              </div>
            </div>

            {/* Hero Key Metrics */}
            <div className="flex items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                  Continuous AC Power
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {inverter.paco_w >= 1000
                      ? (inverter.paco_w / 1000).toFixed(1)
                      : Math.round(inverter.paco_w)}
                  </span>
                  <span className="text-base font-bold text-slate-400">
                    {inverter.paco_w >= 1000 ? 'kW' : 'W'}
                  </span>
                </div>
              </div>

              {inverter.efficiency_pct != null && (
                <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                    Sandia Efficiency
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5 text-amber-600 dark:text-amber-400">
                    <Zap className="w-5 h-5" />
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      {inverter.efficiency_pct.toFixed(1)}
                    </span>
                    <span className="text-base font-bold">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TECHNICAL SPECIFICATION SECTIONS */}
      {/* ================================================================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Section 1: AC Grid Output */}
        <SectionCard
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          title="AC Grid Output Specifications"
        >
          <SpecRow
            label="Max Continuous AC Power"
            sub="Paco"
            value={fmtInt(inverter.paco_w, 'W')}
            desc="Maximum continuous real power exported to the AC grid under normal operating conditions."
          />
          <SpecRow
            label="Nominal AC Grid Voltage"
            sub="Vac"
            value={fmtInt(inverter.vac_v, 'V')}
            desc="Grid connection voltage standard (e.g. 208V, 240V split-phase, 277V, 480V 3-phase)."
          />
          <SpecRow
            label="Estimated Continuous AC Current"
            sub="Iac"
            value={`${estimatedAcCurrent} A`}
            desc="Nominal continuous output current at rated AC voltage for breaker and conduit sizing."
          />
        </SectionCard>

        {/* Section 2: DC Input & MPPT Operating Window */}
        <SectionCard
          icon={<Sun className="w-5 h-5 text-emerald-500" />}
          title="DC Input & MPPT Operating Window"
        >
          <SpecRow
            label="Max DC Input Voltage"
            sub="Vdcmax"
            value={fmtInt(inverter.vdcmax_v, 'V')}
            desc="Absolute maximum cold-weather DC open-circuit voltage rating (Voc_cold limit)."
          />
          <SpecRow
            label="Max Continuous DC Current"
            sub="Idcmax"
            value={fmt(inverter.idcmax_a, 'A')}
            desc="Maximum continuous input current across all MPPT channels."
          />
          <SpecRow
            label="MPPT Voltage Range"
            sub="Vmppt"
            value={`${Math.round(inverter.mppt_low_v)} V – ${Math.round(inverter.mppt_high_v)} V`}
            desc="Operating DC voltage window within which the inverter performs maximum power point tracking."
          />
          <SpecRow
            label="Nominal DC Operating Voltage"
            sub="Vdco"
            value={fmtInt(inverter.vdco_v, 'V')}
            desc="DC voltage at which the inverter operates with highest efficiency."
          />
          <SpecRow
            label="Rated DC Input Power"
            sub="Pdco"
            value={fmtInt(inverter.pdco_w, 'W')}
            desc="DC input power required to achieve full rated AC output power."
          />
        </SectionCard>

        {/* Section 3: Losses & Standby Consumption */}
        <SectionCard
          icon={<Activity className="w-5 h-5 text-purple-500" />}
          title="Efficiency & Standby Losses"
        >
          <SpecRow
            label="Peak Conversion Efficiency"
            sub="η_max"
            value={inverter.efficiency_pct ? `${inverter.efficiency_pct.toFixed(2)}%` : '—'}
            desc="Peak DC-to-AC conversion efficiency calculated using the Sandia / CEC Inverter model."
          />
          <SpecRow
            label="Start-up Power Threshold"
            sub="Pso"
            value={fmt(inverter.pso_w, 'W', 2)}
            desc="Minimum DC solar power required to wake up the inverter and initiate grid synchronization."
          />
          <SpecRow
            label="Nighttime Tare Loss"
            sub="Pnt"
            value={fmt(inverter.pnt_w, 'W', 2)}
            desc="Parasitic power drawn from the grid during nighttime standby mode."
          />
        </SectionCard>

        {/* Section 4: Sandia Inverter Model Coefficients */}
        <SectionCard
          icon={<CircuitBoard className="w-5 h-5 text-blue-500" />}
          title="Sandia Simulation Model (.OND / SAM)"
        >
          <SpecRow
            label="Curvature Coefficient C0"
            sub="C0"
            value={inverter.c0 != null ? inverter.c0.toExponential(4) : '—'}
            desc="Empirical coefficient defining efficiency curve slope vs normalized power."
          />
          <SpecRow
            label="Curvature Coefficient C1"
            sub="C1"
            value={inverter.c1 != null ? inverter.c1.toExponential(4) : '—'}
            desc="Voltage-dependent power loss linear coefficient."
          />
          <SpecRow
            label="Curvature Coefficient C2"
            sub="C2"
            value={inverter.c2 != null ? inverter.c2.toExponential(4) : '—'}
            desc="Quadratic curvature factor for high-voltage DC operating conditions."
          />
          <SpecRow
            label="Curvature Coefficient C3"
            sub="C3"
            value={inverter.c3 != null ? inverter.c3.toExponential(4) : '—'}
            desc="Voltage sensitivity coefficient for off-nominal MPPT operating points."
          />
        </SectionCard>
      </div>

      {/* Back button */}
      <div className="pt-4 text-center">
        <Link
          to="/inverters"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inverters Catalog
        </Link>
      </div>
    </div>
  );
};

export default InverterDetailPage;
