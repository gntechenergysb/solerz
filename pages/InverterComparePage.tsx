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
  Share2,
  Sparkles,
  Sun,
  Activity,
  CircuitBoard,
  ChevronRight,
  GitCompareArrows,
  Crown,
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
    let formatted = '—';
    if (v != null) {
      if (unit === 'W' && v >= 1000) {
        formatted = fmtPower(v);
      } else {
        formatted = `${Number(v).toFixed(decimals)} ${unit}`;
      }
    }
    const isWinner = v != null && maxVal != null && v === maxVal && numericValues.length > 1;
    return { formatted, isWinner, raw: v };
  });
}

function compareMultiLowerBetter(
  values: (number | null | undefined)[],
  unit: string,
  decimals = 1
): { formatted: string; isWinner: boolean; raw: number | null | undefined }[] {
  const numericValues = values.filter((v): v is number => v != null && !isNaN(v));
  const minVal = numericValues.length > 0 ? Math.min(...numericValues) : null;

  return values.map((v) => {
    let formatted = '—';
    if (v != null) {
      if (unit === 'W' && v >= 1000) {
        formatted = fmtPower(v);
      } else {
        formatted = `${Number(v).toFixed(decimals)} ${unit}`;
      }
    }
    const isWinner = v != null && minVal != null && v === minVal && numericValues.length > 1;
    return { formatted, isWinner, raw: v };
  });
}

// ---------------------------------------------------------------------------
// Section Definition
// ---------------------------------------------------------------------------
interface SpecRowData {
  label: string;
  sub?: string;
  desc?: string;
  values: { formatted: string; isWinner: boolean; raw: any }[];
}

interface SectionData {
  title: string;
  icon: React.ReactNode;
  specs: SpecRowData[];
}

function buildMultiInverterSections(inverters: InverterDetail[]): SectionData[] {
  return [
    {
      title: 'AC Grid Output Characteristics',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      specs: [
        {
          label: 'Continuous AC Power',
          sub: 'Paco',
          desc: 'Higher continuous real power generates more kilowatt-hours under high solar irradiance.',
          values: compareMultiHigherBetter(inverters.map((p) => p.paco_w), 'W', 0),
        },
        {
          label: 'Nominal AC Grid Voltage',
          sub: 'Vac',
          desc: 'Grid connection voltage standard (e.g. 208V, 240V split-phase, 480V 3-phase).',
          values: inverters.map((p) => ({
            formatted: `${Math.round(p.vac_v)} V`,
            isWinner: false,
            raw: p.vac_v,
          })),
        },
        {
          label: 'Continuous AC Current',
          sub: 'Iac',
          desc: 'Continuous output current for circuit breaker and electrical panel wiring.',
          values: inverters.map((p) => ({
            formatted: `${(p.paco_w / p.vac_v).toFixed(1)} A`,
            isWinner: false,
            raw: p.paco_w / p.vac_v,
          })),
        },
        {
          label: 'Inverter Topology',
          desc: 'System architecture classification.',
          values: inverters.map((p) => ({
            formatted: p.inverter_type,
            isWinner: false,
            raw: p.inverter_type,
          })),
        },
      ],
    },
    {
      title: 'DC Input & MPPT Operating Window',
      icon: <Sun className="w-4 h-4 text-emerald-500" />,
      specs: [
        {
          label: 'Max DC Input Voltage',
          sub: 'Vdcmax',
          desc: 'Higher maximum voltage permits longer module strings in cold weather without tripping.',
          values: compareMultiHigherBetter(inverters.map((p) => p.vdcmax_v), 'V', 0),
        },
        {
          label: 'Max Continuous DC Current',
          sub: 'Idcmax',
          desc: 'Maximum current intake accommodating modern high-current solar modules.',
          values: compareMultiHigherBetter(inverters.map((p) => p.idcmax_a), 'A', 1),
        },
        {
          label: 'MPPT Operating Range',
          sub: 'Vmppt',
          desc: 'Full power tracking range under varying temperature and partial shading.',
          values: inverters.map((p) => ({
            formatted: `${Math.round(p.mppt_low_v)} V – ${Math.round(p.mppt_high_v)} V`,
            isWinner: false,
            raw: p.mppt_high_v - p.mppt_low_v,
          })),
        },
        {
          label: 'Nominal DC Voltage',
          sub: 'Vdco',
          desc: 'DC operating voltage at peak conversion efficiency.',
          values: inverters.map((p) => ({
            formatted: `${Math.round(p.vdco_v)} V`,
            isWinner: false,
            raw: p.vdco_v,
          })),
        },
        {
          label: 'Rated DC Input Power',
          sub: 'Pdco',
          desc: 'DC input power required to produce full rated AC power.',
          values: inverters.map((p) => ({
            formatted: fmtPower(p.pdco_w),
            isWinner: false,
            raw: p.pdco_w,
          })),
        },
      ],
    },
    {
      title: 'Efficiency & Standby Losses',
      icon: <Activity className="w-4 h-4 text-purple-500" />,
      specs: [
        {
          label: 'Sandia Peak Efficiency',
          sub: 'η_max',
          desc: 'Higher efficiency minimizes thermal loss and maximizes lifetime energy production.',
          values: compareMultiHigherBetter(inverters.map((p) => p.efficiency_pct), '%', 1),
        },
        {
          label: 'Start-up Power Threshold',
          sub: 'Pso',
          desc: 'Lower start-up power wakes up the inverter earlier at sunrise.',
          values: compareMultiLowerBetter(inverters.map((p) => p.pso_w), 'W', 1),
        },
        {
          label: 'Nighttime Tare Loss',
          sub: 'Pnt',
          desc: 'Lower tare loss reduces parasitic energy draw from the grid overnight.',
          values: compareMultiLowerBetter(inverters.map((p) => p.pnt_w), 'W', 1),
        },
        {
          label: 'Battery Storage Ready',
          desc: 'Integrated hybrid DC battery coupling.',
          values: inverters.map((p) => ({
            formatted: p.is_hybrid ? 'Yes (Hybrid Storage)' : 'Standard Grid-Tied',
            isWinner: p.is_hybrid,
            raw: p.is_hybrid,
          })),
        },
      ],
    },
    {
      title: 'Sandia Simulation Model (.OND / SAM)',
      icon: <CircuitBoard className="w-4 h-4 text-blue-500" />,
      specs: [
        {
          label: 'Curvature Coeff C0',
          sub: 'C0',
          values: inverters.map((p) => ({
            formatted: p.c0 != null ? p.c0.toExponential(4) : '—',
            isWinner: false,
            raw: p.c0,
          })),
        },
        {
          label: 'Voltage Coeff Linear C1',
          sub: 'C1',
          values: inverters.map((p) => ({
            formatted: p.c1 != null ? p.c1.toExponential(4) : '—',
            isWinner: false,
            raw: p.c1,
          })),
        },
        {
          label: 'Voltage Coeff Quadratic C2',
          sub: 'C2',
          values: inverters.map((p) => ({
            formatted: p.c2 != null ? p.c2.toExponential(4) : '—',
            isWinner: false,
            raw: p.c2,
          })),
        },
        {
          label: 'Voltage Sensitivity C3',
          sub: 'C3',
          values: inverters.map((p) => ({
            formatted: p.c3 != null ? p.c3.toExponential(4) : '—',
            isWinner: false,
            raw: p.c3,
          })),
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Main Inverter Comparison Page
// ---------------------------------------------------------------------------
const InverterComparePage: React.FC = () => {
  const { slugs: routeSlugs } = useParams<{ slugs: string }>();
  const navigate = useNavigate();

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

  // Build comparison sections
  const sections = useMemo(() => {
    if (inverters.length < 2) return [];
    return buildMultiInverterSections(inverters);
  }, [inverters]);

  // Calculate total wins per inverter
  const winCounts = useMemo(() => {
    const counts = new Array(inverters.length).fill(0);
    sections.forEach((sec) => {
      sec.specs.forEach((spec) => {
        spec.values.forEach((v, idx) => {
          if (v.isWinner) counts[idx]++;
        });
      });
    });
    return counts;
  }, [inverters, sections]);

  // Determine overall champion
  const maxWins = Math.max(...winCounts);
  const championIdx = maxWins > 0 ? winCounts.indexOf(maxWins) : -1;

  const handleRemoveInverter = (slugToRemove: string) => {
    const updated = inverters.filter((p) => p.slug !== slugToRemove);
    if (updated.length < 2) {
      navigate('/inverters');
      return;
    }
    const newSlugs = updated.map((p) => p.slug).sort().join('-vs-');
    navigate(`/compare/inverters/${newSlugs}`);
  };

  const handleAddInverter = (newInverter: InverterSummary) => {
    const combinedSlugs = Array.from(new Set([...inverters.map((p) => p.slug), newInverter.slug]))
      .sort()
      .join('-vs-');
    setIsAddModalOpen(false);
    navigate(`/compare/inverters/${combinedSlugs}`);
  };

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

  const columnCount = inverters.length;
  const canAddMore = columnCount < 4;
  const totalGridSlots = columnCount + (canAddMore ? 1 : 0);

  const gridColumnsClass =
    totalGridSlots === 2
      ? 'grid-cols-2'
      : totalGridSlots === 3
      ? 'grid-cols-3'
      : 'grid-cols-4';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
      {/* GSMarena Unified Table Header Card Grid */}
      {/* ================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />

        <div className="p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Left Info Corner */}
            <div className="w-full lg:w-72 flex-none p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  Solerz Inverter Engine
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  Inverter Specifications Comparison
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Cross-analyzing continuous AC power, MPPT tracking windows, and Sandia conversion efficiency.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                <span>{inverters.length} / 4 Selected</span>
                {canAddMore && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    + Add Model
                  </button>
                )}
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className={`flex-1 grid gap-3.5 ${gridColumnsClass}`}>
              {inverters.map((inv, idx) => {
                const isChampion = idx === championIdx && maxWins > 0;
                return (
                  <div
                    key={inv.id}
                    className={`relative flex flex-col justify-between p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border transition-all ${
                      isChampion
                        ? 'border-amber-400 dark:border-amber-500 shadow-md shadow-amber-500/10'
                        : 'border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-600'
                    }`}
                  >
                    {/* Remove button */}
                    {inverters.length > 2 && (
                      <button
                        onClick={() => handleRemoveInverter(inv.slug)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title={`Remove ${inv.model_name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div>
                      {/* Overall Best Choice Banner */}
                      {isChampion && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm mb-1.5">
                          <Crown className="w-3 h-3 fill-current" /> Overall Best Choice
                        </div>
                      )}

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate pr-4">
                        {inv.brand_name}
                      </span>
                      <Link
                        to={`/inverters/${inv.slug}`}
                        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 mt-0.5"
                      >
                        {inv.model_name}
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {inv.inverter_type.replace(' Inverter', '')}
                        </span>
                        {inv.is_hybrid && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Battery className="w-2.5 h-2.5" />
                            Battery
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Power & Efficiency */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                            Rated Power
                          </span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {fmtPower(inv.paco_w)}
                          </span>
                        </div>

                        {inv.efficiency_pct != null && (
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                              Efficiency
                            </span>
                            <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                              <Zap className="w-3 h-3" />
                              <span className="text-base font-black">
                                {inv.efficiency_pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Best Specs Badge */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Top Specs</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {winCounts[idx]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Inverter Slot */}
              {canAddMore && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-slate-900/30 transition-all group cursor-pointer min-h-[190px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Add Inverter
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                    Slot {inverters.length + 1} of 4
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 100% ALIGNED SPECIFICATION COMPARISON SECTIONS */}
      {/* ================================================================= */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm">
                {section.icon}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {section.specs.map((spec) => (
                <div key={spec.label} className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-3.5 items-start lg:items-center">
                    {/* Left Spec Label (w-72) */}
                    <div className="w-full lg:w-72 flex-none pr-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {spec.label}
                        </span>
                        {spec.sub && (
                          <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
                            ({spec.sub})
                          </span>
                        )}
                      </div>
                      {spec.desc && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                          {spec.desc}
                        </p>
                      )}
                    </div>

                    {/* Right Values Grid */}
                    <div className={`flex-1 grid gap-3.5 ${gridColumnsClass}`}>
                      {spec.values.map((v, valIdx) => (
                        <div
                          key={valIdx}
                          className={`p-2.5 rounded-xl text-left flex items-center justify-between gap-1 transition-all ${
                            v.isWinner
                              ? 'bg-amber-50/80 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 font-bold text-amber-800 dark:text-amber-300 shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <span className="text-xs sm:text-sm tabular-nums truncate">
                            {v.formatted}
                          </span>
                          {v.isWinner && (
                            <Trophy
                              className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-none ml-1"
                              title="Best in comparison"
                            />
                          )}
                        </div>
                      ))}

                      {/* Empty filler cell for alignment under +Add button */}
                      {canAddMore && (
                        <div className="p-2.5 rounded-xl border border-dashed border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 text-center text-xs flex items-center justify-center">
                          <Plus
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-3.5 h-3.5 cursor-pointer hover:text-amber-500 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ================================================================= */}
      {/* KEY ADVANTAGES SUMMARY FOR EACH INVERTER */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Key Advantages &amp; Standouts
          </h3>
        </div>

        <div
          className={`grid gap-4 ${
            columnCount === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : columnCount === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {inverters.map((inv, pIdx) => {
            const wins: string[] = [];
            sections.forEach((sec) => {
              sec.specs.forEach((sp) => {
                if (sp.values[pIdx]?.isWinner) {
                  wins.push(`${sp.label} (${sp.values[pIdx].formatted})`);
                }
              });
            });

            const isChamp = pIdx === championIdx && maxWins > 0;

            return (
              <div
                key={inv.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm relative ${
                  isChamp
                    ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isChamp && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    <Crown className="w-2.5 h-2.5 fill-current" /> Top Pick
                  </div>
                )}

                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 pr-16">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {inv.brand_name}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {inv.model_name}
                  </h4>
                </div>

                {wins.length > 0 ? (
                  <ul className="space-y-2">
                    {wins.map((w, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-none" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    Balanced competitive specifications across all grid parameters.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Modal */}
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
