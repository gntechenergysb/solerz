import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Battery,
  Sun,
  Shield,
  Activity,
  CircuitBoard,
  Cpu,
  Layers,
} from 'lucide-react';
import { fetchInverterBySlug } from '../services/inverterService';
import type { InverterDetail } from '../types';

/** Null-safe format: returns the value with unit, or '—' */
const fmt = (
  val: number | null | undefined,
  unit: string,
  decimals = 2
): string => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)} ${unit}`;
};

const fmtPower = (val: number | null | undefined): string => {
  if (val == null) return '—';
  const num = Number(val);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)} MW (${num.toLocaleString()} W)`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} kW (${num.toLocaleString()} W)`;
  }
  return `${Math.round(num)} W`;
};

const fmtInt = (val: number | null | undefined, unit: string): string => {
  if (val == null) return '—';
  return `${Math.round(Number(val))} ${unit}`;
};

// ---------------------------------------------------------------------------
// Spec row sub-component (matching PanelDetail clean 1-line style)
// ---------------------------------------------------------------------------
interface SpecRowProps {
  label: string;
  value: string;
  sub?: string;
}

const SpecRow: React.FC<SpecRowProps> = ({ label, value, sub }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">
      {label}
      {sub && (
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1 font-mono">
          ({sub})
        </span>
      )}
    </span>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
      {value}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Section Card (matching PanelDetail)
// ---------------------------------------------------------------------------
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {title}
      </h2>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Detail Page
// ---------------------------------------------------------------------------
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

  // --- Loading state ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  // --- Not found state ---
  if (notFound || !inverter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Inverter Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The inverter model you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/inverters"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors shadow-lg shadow-amber-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inverters
        </Link>
      </div>
    );
  }

  const estimatedAcCurrent = (inverter.paco_w / inverter.vac_v).toFixed(1);
  const powerKw = (inverter.paco_w / 1000);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/inverters"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Inverters
      </Link>

      {/* ================================================================= */}
      {/* Hero Card */}
      {/* ================================================================= */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {inverter.brand_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {inverter.model_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {inverter.inverter_type}
                </span>
                {inverter.is_hybrid && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Battery className="w-3 h-3" />
                    Hybrid Storage Ready
                  </span>
                )}
                {inverter.cec_cert_date && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1">
                    CEC Certified ({inverter.cec_cert_date})
                  </span>
                )}
              </div>
            </div>

            {/* Hero metrics */}
            <div className="flex items-end gap-6 sm:text-right">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                  Rated AC Power
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {inverter.paco_w >= 1000
                      ? powerKw >= 100
                        ? Math.round(powerKw)
                        : powerKw.toFixed(1)
                      : Math.round(inverter.paco_w)}
                  </span>
                  <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                    {inverter.paco_w >= 1000 ? 'kW' : 'W'}
                  </span>
                </div>
              </div>

              {inverter.efficiency_pct != null && (
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                    Efficiency
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                      {inverter.efficiency_pct.toFixed(1)}
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
      {/* Spec Sections — 2-column responsive grid (Identical to PanelDetail) */}
      {/* ================================================================= */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Section 1: AC Grid Output */}
        <SectionCard
          icon={<Zap className="w-4 h-4 text-amber-500" />}
          title="AC Grid Output"
        >
          <SpecRow
            label="Rated Continuous Power"
            sub="Paco"
            value={fmtPower(inverter.paco_w)}
          />
          <SpecRow
            label="Nominal Grid Voltage"
            sub="Vac"
            value={fmtInt(inverter.vac_v, 'V')}
          />
          <SpecRow
            label="Estimated AC Current"
            sub="Iac"
            value={`${estimatedAcCurrent} A`}
          />
          <SpecRow
            label="Inverter Topology"
            value={inverter.inverter_type}
          />
        </SectionCard>

        {/* Section 2: DC Input & MPPT Window */}
        <SectionCard
          icon={<Sun className="w-4 h-4 text-amber-500" />}
          title="DC Input & MPPT Window"
        >
          <SpecRow
            label="Max DC Input Voltage"
            sub="Vdcmax"
            value={fmtInt(inverter.vdcmax_v, 'V')}
          />
          <SpecRow
            label="Max Continuous DC Current"
            sub="Idcmax"
            value={fmt(inverter.idcmax_a, 'A')}
          />
          <SpecRow
            label="MPPT Operating Range"
            sub="Vmppt"
            value={`${Math.round(inverter.mppt_low_v)} V – ${Math.round(inverter.mppt_high_v)} V`}
          />
          <SpecRow
            label="Nominal DC Voltage"
            sub="Vdco"
            value={fmtInt(inverter.vdco_v, 'V')}
          />
          <SpecRow
            label="Rated DC Input Power"
            sub="Pdco"
            value={fmtPower(inverter.pdco_w)}
          />
        </SectionCard>

        {/* Section 3: Losses & Standby */}
        <SectionCard
          icon={<Activity className="w-4 h-4 text-purple-500" />}
          title="Efficiency & Standby"
        >
          <SpecRow
            label="Sandia Peak Efficiency"
            sub="η_max"
            value={inverter.efficiency_pct ? `${inverter.efficiency_pct.toFixed(2)}%` : '—'}
          />
          <SpecRow
            label="Start-up Power Threshold"
            sub="Pso"
            value={fmt(inverter.pso_w, 'W')}
          />
          <SpecRow
            label="Nighttime Tare Loss"
            sub="Pnt"
            value={fmt(inverter.pnt_w, 'W')}
          />
          <SpecRow
            label="Battery Storage Ready"
            value={inverter.is_hybrid ? 'Yes (Hybrid)' : 'No (Standard Grid-Tied)'}
          />
        </SectionCard>

        {/* Section 4: Sandia Empirical Simulation Parameters */}
        <SectionCard
          icon={<CircuitBoard className="w-4 h-4 text-blue-500" />}
          title="Sandia Model (.OND / SAM)"
        >
          <SpecRow
            label="Curvature Coefficient"
            sub="C0"
            value={inverter.c0 != null ? inverter.c0.toExponential(4) : '—'}
          />
          <SpecRow
            label="Voltage Coeff Linear"
            sub="C1"
            value={inverter.c1 != null ? inverter.c1.toExponential(4) : '—'}
          />
          <SpecRow
            label="Voltage Coeff Quadratic"
            sub="C2"
            value={inverter.c2 != null ? inverter.c2.toExponential(4) : '—'}
          />
          <SpecRow
            label="Voltage Sensitivity"
            sub="C3"
            value={inverter.c3 != null ? inverter.c3.toExponential(4) : '—'}
          />
        </SectionCard>
      </div>

      {/* Footer Info / Citation */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Parameters certified according to California Energy Commission (CEC) test protocol & Sandia National Laboratories Inverter Model.
        </p>
      </div>
    </div>
  );
};

export default InverterDetailPage;
