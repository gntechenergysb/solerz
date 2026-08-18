import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Zap,
  Battery,
  Shield,
  Search,
  Trophy,
  CheckCircle2,
  Share2,
  Sparkles,
  Layers,
  Sun,
  Activity,
  CircuitBoard,
  RotateCcw,
} from 'lucide-react';
import type { InverterDetail, InverterSummary } from '../types';
import {
  fetchComparisonInverters,
  searchInvertersForCompare,
} from '../services/inverterCompareService';

const TOP_INVERTER_BRANDS = [
  'All',
  'Enphase',
  'SolarEdge',
  'SMA',
  'Sungrow',
  'Huawei',
  'Growatt',
  'GoodWe',
  'Fronius',
  'ABB',
  'Delta',
];

const fmtPower = (pacoW: number | null | undefined): string => {
  if (pacoW == null) return '—';
  if (pacoW >= 1000000) return `${(pacoW / 1000000).toFixed(2)} MW`;
  if (pacoW >= 1000) return `${(pacoW / 1000).toFixed(1)} kW`;
  return `${Math.round(pacoW)} W`;
};

// ---------------------------------------------------------------------------
// Comparison metric evaluators (Multi-column best highlight)
// ---------------------------------------------------------------------------
function compareMultiHigherBetter(
  values: (number | null | undefined)[],
  unit: string,
  decimals = 1
): { formatted: string; isWinner: boolean; raw: number | null | undefined }[] {
  const numericValues = values.filter((v): v is number => v != null && !isNaN(v));
  const maxVal = numericValues.length > 0 ? Math.max(...numericValues) : null;

  return values.map((v) => {
    const formatted = v != null ? `${Number(v).toFixed(decimals)} ${unit}` : '—';
    const isWinner = v != null && maxVal != null && v === maxVal && numericValues.length > 1;
    return { formatted, isWinner, raw: v };
  });
}

function compareMultiLowerBetter(
  values: (number | null | undefined)[],
  unit: string,
  decimals = 2
): { formatted: string; isWinner: boolean; raw: number | null | undefined }[] {
  const numericValues = values.filter((v): v is number => v != null && !isNaN(v));
  const minVal = numericValues.length > 0 ? Math.min(...numericValues) : null;

  return values.map((v) => {
    const formatted = v != null ? `${Number(v).toFixed(decimals)} ${unit}` : '—';
    const isWinner = v != null && minVal != null && v === minVal && numericValues.length > 1;
    return { formatted, isWinner, raw: v };
  });
}

// ---------------------------------------------------------------------------
// Main Inverter Comparison Page
// ---------------------------------------------------------------------------
const InverterComparePage: React.FC = () => {
  const { slugs: routeSlugs } = useParams<{ slugs: string }>();
  const navigate = useNavigate();

  // Parse 2, 3, or 4 slugs from URL (split by '-vs-')
  const slugList = useMemo(() => {
    if (!routeSlugs) return [];
    return routeSlugs
      .split('-vs-')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [routeSlugs]);

  // Check SSR initial hydration data
  const initialInverters = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_INVERTERS__) {
      const init = (window as any).__INITIAL_INVERTERS__ as InverterDetail[];
      if (
        init &&
        init.length >= 2 &&
        init.every((p, idx) => p.slug === slugList[idx])
      ) {
        return init;
      }
    }
    return [];
  }, [slugList]);

  const [inverters, setInverters] = useState<InverterDetail[]>(initialInverters);
  const [loading, setLoading] = useState(initialInverters.length < 2);
  const [error, setError] = useState<string | null>(null);

  // Quick-add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [searchResults, setSearchResults] = useState<InverterSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load inverters data
  useEffect(() => {
    if (slugList.length < 2) {
      setError('Please select at least 2 inverters to compare.');
      setLoading(false);
      return;
    }

    if (
      inverters.length >= 2 &&
      inverters.every((p, idx) => p.slug === slugList[idx])
    ) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchComparisonInverters(slugList)
      .then((data) => {
        if (data.length < 2) {
          setError('One or more compared inverters could not be found.');
          return;
        }
        setInverters(data);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load inverter comparison data.');
      })
      .finally(() => setLoading(false));
  }, [slugList]);

  // Handle Remove an Inverter from comparison
  const handleRemoveInverter = (slugToRemove: string) => {
    const updated = inverters.filter((p) => p.slug !== slugToRemove);
    if (updated.length < 2) {
      navigate('/inverters');
      return;
    }
    const newSlugs = updated.map((p) => p.slug).sort().join('-vs-');
    navigate(`/compare/inverters/${newSlugs}`);
  };

  // Handle Adding an Inverter from Modal
  const handleAddInverter = (newInverter: InverterSummary) => {
    const combinedSlugs = Array.from(new Set([...inverters.map((p) => p.slug), newInverter.slug]))
      .sort()
      .join('-vs-');
    setIsAddModalOpen(false);
    navigate(`/compare/inverters/${combinedSlugs}`);
  };

  // Modal Search Debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isAddModalOpen) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(() => {
      let query = searchQuery.trim();
      if (selectedBrandFilter !== 'All') {
        query = `${selectedBrandFilter} ${query}`.trim();
      }
      searchInvertersForCompare(query, inverters.map((p) => p.slug), 15)
        .then((res) => {
          setSearchResults(res);
        })
        .finally(() => setIsSearching(false));
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, selectedBrandFilter, isAddModalOpen, inverters]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || inverters.length < 2) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Comparison Unavailable
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {error || 'Please select at least 2 inverters to compare side-by-side.'}
        </p>
        <Link
          to="/inverters"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inverters Catalog
        </Link>
      </div>
    );
  }

  // Multi-inverter metric comparisons
  const pacoComps = compareMultiHigherBetter(inverters.map((p) => p.paco_w), 'W', 0);
  const effComps = compareMultiHigherBetter(inverters.map((p) => p.efficiency_pct), '%', 1);
  const vacComps = compareMultiHigherBetter(inverters.map((p) => p.vac_v), 'V', 0);
  const vdcmaxComps = compareMultiHigherBetter(inverters.map((p) => p.vdcmax_v), 'V', 0);
  const idcmaxComps = compareMultiHigherBetter(inverters.map((p) => p.idcmax_a), 'A', 1);
  const psoComps = compareMultiLowerBetter(inverters.map((p) => p.pso_w), 'W', 1);
  const pntComps = compareMultiLowerBetter(inverters.map((p) => p.pnt_w), 'W', 1);

  return (
    <div className="space-y-8">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/inverters"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-wider mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inverters
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {inverters.map((p) => `${p.brand_name} ${p.model_name}`).join(' vs ')}
          </h1>
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Comparison URL copied to clipboard!');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Comparison
        </button>
      </div>

      {/* ================================================================= */}
      {/* GSMarena-style Synchronized Comparison Table */}
      {/* ================================================================= */}
      <div className="overflow-x-auto no-scrollbar pb-6">
        <div className="min-w-[850px] space-y-4">
          {/* 1. Header Cards Row */}
          <div className="flex items-stretch gap-4">
            {/* Left label corner */}
            <div className="w-72 flex-none p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
                  Solerz Inverter Match
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Side-by-Side Comparison
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Comparing {inverters.length} inverters with AC power, MPPT operating windows, and Sandia efficiency.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {inverters.length}/4 Active Columns
              </span>
            </div>

            {/* Inverter Header Cards */}
            {inverters.map((inv) => (
              <div
                key={inv.id}
                className="flex-1 min-w-[200px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveInverter(inv.slug)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Remove from compare"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate pr-6">
                    {inv.brand_name}
                  </span>
                  <Link
                    to={`/inverters/${inv.slug}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 line-clamp-2 mt-0.5"
                  >
                    {inv.model_name}
                  </Link>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {inv.inverter_type.replace(' Inverter', '')}
                    </span>
                    {inv.is_hybrid && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300">
                        Battery
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Power
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {fmtPower(inv.paco_w)}
                    </span>
                  </div>
                  {inv.efficiency_pct != null && (
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Efficiency
                      </span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {inv.efficiency_pct.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Inverter Slot (if < 4) */}
            {inverters.length < 4 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 min-w-[200px] p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <span className="text-xs font-bold">Add Inverter</span>
                <span className="text-[10px] text-slate-400">
                  Compare up to 4 models
                </span>
              </button>
            )}
          </div>

          {/* Section 1: AC Grid Output Specifications */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AC Grid Output Characteristics
              </h3>
            </div>

            {/* Row 1: Continuous AC Power */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Continuous AC Power <span className="text-xs text-slate-400 font-mono">(Paco)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Higher continuous real power generates more energy under full sun.
                </span>
              </div>
              {pacoComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${comp.isWinner ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                      {fmtPower(comp.raw)}
                    </span>
                    {comp.isWinner && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Trophy className="w-2.5 h-2.5" /> Best
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 2: Grid Voltage */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Nominal AC Grid Voltage <span className="text-xs text-slate-400 font-mono">(Vac)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Grid connection voltage standard (e.g. 208V, 240V split-phase, 480V 3-phase).
                </span>
              </div>
              {vacComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {comp.formatted}
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 3: Estimated AC Current */}
            <div className="flex items-center py-3 px-5">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Nominal Continuous AC Current <span className="text-xs text-slate-400 font-mono">(Iac)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Continuous AC current for circuit breaker and electrical panel sizing.
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {(inv.paco_w / inv.vac_v).toFixed(1)} A
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>
          </div>

          {/* Section 2: DC Input & MPPT Operating Window */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <Sun className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                DC Input & MPPT Operating Window
              </h3>
            </div>

            {/* Row 1: Max DC Voltage */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Max DC Input Voltage <span className="text-xs text-slate-400 font-mono">(Vdcmax)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Cold-weather Voc ceiling limit for solar panel string configuration.
                </span>
              </div>
              {vdcmaxComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {comp.formatted}
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 2: Max DC Current */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Max Continuous DC Current <span className="text-xs text-slate-400 font-mono">(Idcmax)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Maximum current input capacity accommodating high-amperage modern PV panels.
                </span>
              </div>
              {idcmaxComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {comp.formatted}
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 3: MPPT Operating Window */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  MPPT Voltage Tracking Range <span className="text-xs text-slate-400 font-mono">(Vmppt)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Operating window for maximum power point tracking under shading or high heat.
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(inv.mppt_low_v)} V – {Math.round(inv.mppt_high_v)} V
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 4: Nominal DC Operating Voltage */}
            <div className="flex items-center py-3 px-5">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Nominal DC Voltage <span className="text-xs text-slate-400 font-mono">(Vdco)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  DC input voltage at which the inverter reaches its highest conversion efficiency.
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(inv.vdco_v)} V
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>
          </div>

          {/* Section 3: Efficiency & Standby Consumption */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <Activity className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Efficiency, Standby & Battery Storage
              </h3>
            </div>

            {/* Row 1: Peak Efficiency */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Sandia Peak Efficiency <span className="text-xs text-slate-400 font-mono">(η_max)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Higher efficiency minimizes thermal dissipation and increases energy harvest.
                </span>
              </div>
              {effComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${comp.isWinner ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                      {comp.formatted}
                    </span>
                    {comp.isWinner && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Trophy className="w-2.5 h-2.5" /> Best
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 2: Start-up Power Threshold */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Start-up Threshold <span className="text-xs text-slate-400 font-mono">(Pso)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Lower start-up power allows the inverter to begin generation earlier at dawn.
                </span>
              </div>
              {psoComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${comp.isWinner ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                      {comp.formatted}
                    </span>
                    {comp.isWinner && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Trophy className="w-2.5 h-2.5" /> Lowest
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 3: Nighttime Tare Loss */}
            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Nighttime Tare Loss <span className="text-xs text-slate-400 font-mono">(Pnt)</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Parasitic grid power drawn while on standby overnight.
                </span>
              </div>
              {pntComps.map((comp, idx) => (
                <div key={idx} className="flex-1 px-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {comp.formatted}
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            {/* Row 4: Battery Storage Hybrid Ready */}
            <div className="flex items-center py-3 px-5">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Battery Storage Compatibility
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Integrated DC battery port for seamless energy storage coupling.
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    inv.is_hybrid
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {inv.is_hybrid ? 'Hybrid Ready (Battery)' : 'Standard Grid-Tied'}
                  </span>
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>
          </div>

          {/* Section 4: Sandia Model Empirical Simulation Parameters */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <CircuitBoard className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Sandia Simulation Model (.OND / SAM Parameters)
              </h3>
            </div>

            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Curvature Coeff <span className="text-xs text-slate-400 font-mono">(C0)</span>
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {inv.c0 != null ? inv.c0.toExponential(4) : '—'}
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Voltage Linear Coeff <span className="text-xs text-slate-400 font-mono">(C1)</span>
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {inv.c1 != null ? inv.c1.toExponential(4) : '—'}
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            <div className="flex items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Voltage Quadratic Coeff <span className="text-xs text-slate-400 font-mono">(C2)</span>
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {inv.c2 != null ? inv.c2.toExponential(4) : '—'}
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>

            <div className="flex items-center py-3 px-5">
              <div className="w-72 flex-none pr-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Voltage Sensitivity Coeff <span className="text-xs text-slate-400 font-mono">(C3)</span>
                </span>
              </div>
              {inverters.map((inv) => (
                <div key={inv.id} className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {inv.c3 != null ? inv.c3.toExponential(4) : '—'}
                </div>
              ))}
              {inverters.length < 4 && <div className="flex-1 px-3" />}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Quick Add Inverter Modal */}
      {/* ================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Add Inverter to Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Search 2,340+ inverters to compare side-by-side.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model, brand, or wattage (e.g. SE7600H, IQ8, 5000)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  autoFocus
                />
              </div>

              {/* Brand Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {TOP_INVERTER_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrandFilter(brand)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedBrandFilter === brand
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2">
                {isSearching ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Searching inverters...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No matching inverters found.
                  </div>
                ) : (
                  searchResults.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => handleAddInverter(inv)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-amber-50/30 dark:hover:bg-amber-500/5 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          {inv.brand_name}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {inv.model_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-none">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {fmtPower(inv.paco_w)}
                        </span>
                        <span className="p-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InverterComparePage;
