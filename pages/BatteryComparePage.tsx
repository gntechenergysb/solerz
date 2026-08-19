import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  Trophy,
  Zap,
  Battery,
  Shield,
  Layers,
  Plus,
  X,
  Search,
  Check,
  Share2,
  Trash2,
  GitCompareArrows,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  Cpu,
  CircuitBoard,
} from 'lucide-react';
import {
  fetchComparisonBatteries,
  searchBatteriesForCompare,
} from '../services/batteryCompareService';
import type { BatteryDetail, BatterySummary } from '../types';

const MAX_COMPARE = 4;

const fmtVal = (
  val: number | null | undefined,
  unit: string,
  decimals = 1
): string => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)} ${unit}`;
};

interface WinnerMap {
  [key: string]: number; // specKey -> index of the winning battery
}

const BatteryComparePage: React.FC = () => {
  const { slugs } = useParams<{ slugs: string }>();
  const navigate = useNavigate();

  // Parse slug list from URL
  const slugList = useMemo(() => {
    if (!slugs) return [];
    return slugs.split('-vs-').map((s) => s.trim()).filter(Boolean);
  }, [slugs]);

  // Check SSR initial state hydration
  const initialBatteries = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_BATTERIES__) {
      const init = (window as any).__INITIAL_BATTERIES__ as BatteryDetail[];
      if (
        Array.isArray(init) &&
        init.length === slugList.length &&
        init.every((b, idx) => b.slug === slugList[idx])
      ) {
        return init;
      }
    }
    return null;
  }, [slugList]);

  const [batteries, setBatteries] = useState<BatteryDetail[]>(initialBatteries || []);
  const [loading, setLoading] = useState(!initialBatteries && slugList.length >= 2);
  const [error, setError] = useState<string | null>(null);

  // Quick Add Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalResults, setModalResults] = useState<BatterySummary[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');

  // Load batteries data
  useEffect(() => {
    if (slugList.length < 2) {
      setError('Please select at least 2 battery storage systems to compare.');
      setLoading(false);
      return;
    }

    if (
      batteries.length === slugList.length &&
      batteries.every((b, idx) => b.slug === slugList[idx])
    ) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchComparisonBatteries(slugList)
      .then((data) => {
        if (data.length < 2) {
          setError('One or more compared battery systems could not be found.');
          return;
        }
        setBatteries(data);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load battery comparison data.');
      })
      .finally(() => setLoading(false));
  }, [slugList]);

  // Update dynamic document title
  useEffect(() => {
    if (batteries.length >= 2) {
      const names = batteries.map((b) => `${b.brand_name} ${b.model_name}`).join(' vs ');
      document.title = `${names} | Battery Systems Comparison | Solerz`;
    }
  }, [batteries]);

  // Remove a battery from active comparison
  const handleRemoveBattery = useCallback(
    (slugToRemove: string) => {
      const remaining = batteries.filter((b) => b.slug !== slugToRemove);
      if (remaining.length < 2) {
        navigate('/batteries');
      } else {
        const newSlugs = remaining.map((b) => b.slug).sort();
        navigate(`/compare/batteries/${newSlugs.join('-vs-')}`);
      }
    },
    [batteries, navigate]
  );

  // Add a battery into active comparison
  const handleAddBattery = useCallback(
    (batteryToAdd: BatterySummary) => {
      if (batteries.length >= MAX_COMPARE) return;
      if (batteries.some((b) => b.slug === batteryToAdd.slug)) return;

      const newSlugs = [...batteries.map((b) => b.slug), batteryToAdd.slug].sort();
      setIsAddModalOpen(false);
      navigate(`/compare/batteries/${newSlugs.join('-vs-')}`);
    },
    [batteries, navigate]
  );

  // Modal search
  useEffect(() => {
    if (!isAddModalOpen) return;
    setModalLoading(true);
    const timer = setTimeout(() => {
      const currentSlugs = batteries.map((b) => b.slug);
      searchBatteriesForCompare(modalSearch, currentSlugs, 20)
        .then((res) => {
          if (selectedBrandFilter !== 'All') {
            setModalResults(res.filter((r) => r.brand_name === selectedBrandFilter));
          } else {
            setModalResults(res);
          }
        })
        .finally(() => setModalLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [isAddModalOpen, modalSearch, selectedBrandFilter, batteries]);

  // Popular brands for quick filter chips in modal
  const popularBrands = [
    'All',
    'Tesla',
    'Enphase',
    'BYD',
    'LG Energy Solution',
    'SolarEdge',
    'EcoFlow',
    'FranklinWH',
    'EG4 Electronics',
    'Huawei',
    'Sungrow',
  ];

  // ---------------------------------------------------------------------------
  // Winner calculation
  // ---------------------------------------------------------------------------
  const { winners, winCounts, overallWinnerIndex } = useMemo(() => {
    const wMap: WinnerMap = {};
    const counts = new Array(batteries.length).fill(0);

    if (batteries.length < 2) {
      return { winners: wMap, winCounts: counts, overallWinnerIndex: 0 };
    }

    const checkHigher = (key: string, accessor: (b: BatteryDetail) => number | null | undefined) => {
      let maxVal = -Infinity;
      let maxIdx = -1;
      let tie = false;

      batteries.forEach((b, idx) => {
        const v = accessor(b);
        if (v != null && !isNaN(v)) {
          if (v > maxVal) {
            maxVal = v;
            maxIdx = idx;
            tie = false;
          } else if (v === maxVal && maxIdx !== -1) {
            tie = true;
          }
        }
      });

      if (!tie && maxIdx !== -1 && maxVal > 0) {
        wMap[key] = maxIdx;
        counts[maxIdx] += 1;
      }
    };

    // 1. Usable Capacity (Higher is better)
    checkHigher('usable_capacity_kwh', (b) => b.usable_capacity_kwh);

    // 2. Continuous Power (Higher is better)
    checkHigher('continuous_power_kw', (b) => b.continuous_power_kw);

    // 3. Peak Power (Higher is better)
    checkHigher('peak_power_kw', (b) => b.peak_power_kw);

    // 4. Round-Trip Efficiency (Higher is better)
    checkHigher('round_trip_efficiency_pct', (b) => b.round_trip_efficiency_pct);

    // 5. Cycle Life (Higher is better)
    checkHigher('cycle_life_count', (b) => b.cycle_life_count);

    // 6. Warranty (Higher is better)
    checkHigher('warranty_years', (b) => b.warranty_years);

    // 7. Max Parallel Scaling (Higher is better)
    checkHigher('max_parallel_units', (b) => b.max_parallel_units);

    // Determine Overall Best Choice
    let maxWins = -1;
    let bestIdx = 0;
    counts.forEach((c, idx) => {
      if (c > maxWins) {
        maxWins = c;
        bestIdx = idx;
      }
    });

    return {
      winners: wMap,
      winCounts: counts,
      overallWinnerIndex: bestIdx,
    };
  }, [batteries]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (error || batteries.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <Info className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Comparison Unavailable
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error || 'Please select at least two battery storage systems to generate a side-by-side comparison.'}
        </p>
        <Link
          to="/batteries"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Battery Catalog
        </Link>
      </div>
    );
  }

  const columnWidthClass = 'w-72 min-w-[288px] max-w-[288px]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-purple-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/batteries" className="hover:text-purple-500 transition-colors">
            Batteries
          </Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 font-semibold">
            Head-to-Head Comparison
          </span>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Comparison URL copied to clipboard!');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-semibold transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Comparison
        </button>
      </div>

      {/* Hero Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-2">
          <GitCompareArrows className="w-3.5 h-3.5" />
          Technical Hardware Matrix
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {batteries.map((b) => `${b.brand_name} ${b.model_name}`).join(' vs ')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl">
          Multi-column side-by-side technical comparison across usable storage capacity, continuous and peak power, round-trip efficiency, cycle life ratings, and physical installation dimensions.
        </p>
      </div>

      {/* Overall Winner Highlight Banner */}
      {batteries.length >= 2 && winCounts[overallWinnerIndex] > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 p-6 sm:p-7 text-white shadow-xl border border-purple-500/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-none">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Highest Spec Score
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold">
                    {winCounts[overallWinnerIndex]} Winning Specs
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {batteries[overallWinnerIndex].brand_name} {batteries[overallWinnerIndex].model_name}
                </h2>
              </div>
            </div>

            <Link
              to={`/batteries/${batteries[overallWinnerIndex].slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md flex-none"
            >
              View Winning Datasheet <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Comparison Matrix Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            {/* Sticky Header Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 backdrop-blur-md">
                {/* Fixed Label Column Header */}
                <th className="p-4 sm:p-5 w-56 min-w-[220px] align-top text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hardware System
                </th>

                {/* Battery Header Cards */}
                {batteries.map((battery, idx) => {
                  const isOverall = idx === overallWinnerIndex && winCounts[idx] > 0;
                  return (
                    <th key={battery.id} className={`p-4 sm:p-5 align-top ${columnWidthClass}`}>
                      <div className="space-y-3 relative">
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveBattery(battery.slug)}
                          className="absolute -top-1 -right-1 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Remove from comparison"
                          aria-label={`Remove ${battery.model_name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 pr-6">
                          {isOverall && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-600 dark:text-amber-300 text-[10px] font-black">
                              <Crown className="w-3 h-3 text-amber-500" /> Best
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md">
                            {battery.brand_name}
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          to={`/batteries/${battery.slug}`}
                          className="block text-sm font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2"
                        >
                          {battery.model_name}
                        </Link>

                        {/* Hero Metric */}
                        <div className="pt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {battery.usable_capacity_kwh}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 ml-1">kWh</span>
                        </div>

                        {/* Win Trophy Count */}
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Trophy className="w-3 h-3" />
                          <span>Top Specs 🏆 {winCounts[idx]}</span>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Optional "+ Add Battery" slot */}
                {batteries.length < MAX_COMPARE && (
                  <th className={`p-4 sm:p-5 align-middle ${columnWidthClass}`}>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all bg-slate-50/50 dark:bg-slate-800/20 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">Add Battery</span>
                      <span className="text-[10px] text-slate-400">({batteries.length}/{MAX_COMPARE})</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {/* SECTION 1: Energy & Power Specs */}
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
                <td
                  colSpan={batteries.length + (batteries.length < MAX_COMPARE ? 2 : 1)}
                  className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400"
                >
                  ⚡ Energy Storage & Power Output
                </td>
              </tr>

              {/* Usable Capacity */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Usable Energy Storage
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['usable_capacity_kwh'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.usable_capacity_kwh} kWh
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Continuous Power */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Continuous Power Rating
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['continuous_power_kw'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.continuous_power_kw} kW
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Peak Power */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Peak Power Output (10s)
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['peak_power_kw'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {fmtVal(b.peak_power_kw, 'kW', 1)}
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Coupling Architecture */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Coupling Architecture
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-medium ${columnWidthClass}`}>
                    {b.coupling_type}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* SECTION 2: Electrical & Voltage */}
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
                <td
                  colSpan={batteries.length + (batteries.length < MAX_COMPARE ? 2 : 1)}
                  className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
                >
                  🔋 Electrical & Voltage Architecture
                </td>
              </tr>

              {/* Nominal Voltage */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nominal DC Voltage
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-semibold tabular-nums ${columnWidthClass}`}>
                    {Math.round(b.nominal_voltage_v)}V
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Operating Voltage Range */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Operating Voltage Range
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-semibold tabular-nums ${columnWidthClass}`}>
                    {b.operating_voltage_min_v && b.operating_voltage_max_v
                      ? `${b.operating_voltage_min_v}V – ${b.operating_voltage_max_v}V`
                      : '—'}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Max Current */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Max Continuous Current
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-semibold tabular-nums ${columnWidthClass}`}>
                    {fmtVal(b.max_continuous_current_a, 'A', 1)}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Battery Chemistry */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Battery Chemistry
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-medium ${columnWidthClass}`}>
                    {b.battery_type}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* SECTION 3: Efficiency & Warranty */}
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
                <td
                  colSpan={batteries.length + (batteries.length < MAX_COMPARE ? 2 : 1)}
                  className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
                >
                  🌱 Efficiency, Degradation & Warranty
                </td>
              </tr>

              {/* Round-Trip Efficiency */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Round-Trip Efficiency (RTE)
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['round_trip_efficiency_pct'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.round_trip_efficiency_pct.toFixed(1)}%
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Rated Cycle Life */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Rated Cycle Life
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['cycle_life_count'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.cycle_life_count ? `${b.cycle_life_count.toLocaleString()} Cycles` : '—'}
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Warranty Years */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Warranty Coverage
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['warranty_years'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.warranty_years ? `${b.warranty_years} Years` : '—'}
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* SECTION 4: Physical & Scalability */}
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
                <td
                  colSpan={batteries.length + (batteries.length < MAX_COMPARE ? 2 : 1)}
                  className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400"
                >
                  📦 Scalability & Physical Dimensions
                </td>
              </tr>

              {/* Max Parallel Units */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Max Parallel Scaling
                </td>
                {batteries.map((b, idx) => {
                  const isWin = winners['max_parallel_units'] === idx;
                  return (
                    <td key={b.id} className={`p-4 text-sm font-semibold tabular-nums ${columnWidthClass}`}>
                      <div className="flex items-center justify-between">
                        <span className={isWin ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                          {b.max_parallel_units ? `Up to ${b.max_parallel_units} Units` : '1 Unit'}
                        </span>
                        {isWin && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none ml-2" />}
                      </div>
                    </td>
                  );
                })}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Ingress Protection */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Enclosure Rating
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-medium ${columnWidthClass}`}>
                    {b.ip_rating || 'IP65'}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Weight */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Net Weight
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 font-semibold tabular-nums ${columnWidthClass}`}>
                    {fmtVal(b.weight_kg, 'kg', 1)}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>

              {/* Dimensions */}
              <tr className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Physical Dimensions
                </td>
                {batteries.map((b) => (
                  <td key={b.id} className={`p-4 text-xs text-slate-600 dark:text-slate-400 font-mono ${columnWidthClass}`}>
                    {b.dimensions_mm || '—'}
                  </td>
                ))}
                {batteries.length < MAX_COMPARE && <td className={columnWidthClass} />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Advantages & Standouts Cards */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Key Advantages &amp; Standouts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batteries.map((b, idx) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg">
                  {b.brand_name}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {winCounts[idx]} Top Specs
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {b.model_name}
              </h3>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500 flex-none mt-0.5" />
                  <span><strong>{b.usable_capacity_kwh} kWh</strong> usable energy capacity ({b.battery_type})</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500 flex-none mt-0.5" />
                  <span><strong>{b.continuous_power_kw} kW</strong> continuous power with {b.nominal_voltage_v}V DC architecture</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500 flex-none mt-0.5" />
                  <span><strong>{b.round_trip_efficiency_pct.toFixed(1)}% RTE</strong> round-trip storage efficiency</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Add Battery System to Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Search certified battery models to compare side-by-side.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search by brand or model (e.g. Powerwall, IQ 5P, BYD)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  autoFocus
                />
              </div>

              {/* Brand Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrandFilter(brand)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedBrandFilter === brand
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-72 overflow-y-auto px-5 pb-5 space-y-2">
              {modalLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Searching batteries...</div>
              ) : modalResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No matching batteries found</div>
              ) : (
                modalResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddBattery(item)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {item.brand_name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.battery_type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.model_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {item.usable_capacity_kwh} kWh
                      </span>
                      <button className="p-1.5 rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-600/30 group-hover:scale-105 transition-transform">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatteryComparePage;
