import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Ruler,
  Shield,
  CircuitBoard,
  Trophy,
  Plus,
  X,
  Search,
  ChevronRight,
  GitCompareArrows,
  Layers,
  Sparkles,
  Sun,
  Scale,
} from 'lucide-react';
import {
  fetchComparisonPanels,
  fetchRelatedPanels,
  searchPanelsForCompare,
  type RelatedPanel,
} from '../services/compareService';
import type { SolarPanelDetail } from '../types';

// ---------------------------------------------------------------------------
// Helpers & Types
// ---------------------------------------------------------------------------

const techLabel = (t: string | null): string => {
  if (!t) return '—';
  const map: Record<string, string> = {
    mtSiMono: 'Mono-c-Si',
    mtSiPoly: 'Poly-c-Si',
    mtCdTe: 'CdTe',
    mtCIS: 'CIS/CIGS',
    mtHIT: 'HIT/HJT',
    mtSiAmorp: 'a-Si',
    'Mono-c-Si': 'Mono-c-Si',
    'Multi-c-Si': 'Poly-c-Si',
  };
  return map[t] ?? t;
};

const fmtVal = (val: number | null | undefined, decimals = 2): string => {
  if (val == null) return '—';
  return Number(val).toFixed(decimals);
};

const TOP_BRANDS_FILTER = [
  'All',
  'LONGi',
  'Jinko',
  'Trina',
  'Canadian',
  'JA Solar',
  'SEG Solar',
  'REC',
  'SunPower',
];

interface SpecRowMulti {
  label: string;
  sub?: string;
  desc?: string;
  values: {
    raw: number | string | null | undefined;
    formatted: string;
    isWinner: boolean;
  }[];
}

interface MultiCategorySection {
  title: string;
  icon: React.ReactNode;
  specs: SpecRowMulti[];
}

function compareMultiHigherBetter(
  values: (number | null | undefined)[],
  unit: string,
  decimals = 2
): { formatted: string; isWinner: boolean; raw: number | null | undefined }[] {
  const numericValues = values.filter((v): v is number => v != null);
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
  const numericValues = values.filter((v): v is number => v != null);
  const minVal = numericValues.length > 0 ? Math.min(...numericValues) : null;

  return values.map((v) => {
    const formatted = v != null ? `${Number(v).toFixed(decimals)} ${unit}` : '—';
    const isWinner = v != null && minVal != null && v === minVal && numericValues.length > 1;
    return { formatted, isWinner, raw: v };
  });
}

// ---------------------------------------------------------------------------
// Main Multi-Column Compare Page
// ---------------------------------------------------------------------------

const ComparePage: React.FC = () => {
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
  const initialPanels = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_PANELS__) {
      const init = (window as any).__INITIAL_PANELS__ as SolarPanelDetail[];
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

  const [panels, setPanels] = useState<SolarPanelDetail[]>(initialPanels);
  const [relatedPanels, setRelatedPanels] = useState<RelatedPanel[]>([]);
  const [loading, setLoading] = useState(initialPanels.length < 2);
  const [error, setError] = useState<string | null>(null);

  // Quick-add search modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [searchResults, setSearchResults] = useState<RelatedPanel[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load panels data
  useEffect(() => {
    if (slugList.length < 2) {
      setError('Please select at least 2 solar panels to compare.');
      setLoading(false);
      return;
    }

    // If initial SSR data matches current slugs, skip client fetch for main panels
    if (
      panels.length >= 2 &&
      panels.every((p, idx) => p.slug === slugList[idx])
    ) {
      setLoading(false);
      // Fetch related panels in the background without blocking
      const primary = panels[0];
      fetchRelatedPanels(primary.id, primary.pnom_w, primary.brand_name, 6).then(
        setRelatedPanels
      );
      return;
    }

    setLoading(true);
    setError(null);

    fetchComparisonPanels(slugList)
      .then((data) => {
        if (data.length < 2) {
          setError('One or more compared solar panels could not be found.');
          return;
        }
        setPanels(data);

        // Fetch related comparisons based on the primary panel's power
        const primary = data[0];
        fetchRelatedPanels(primary.id, primary.pnom_w, primary.brand_name, 6).then(
          setRelatedPanels
        );
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load panel comparison data.');
      })
      .finally(() => setLoading(false));
  }, [slugList]);

  // Update page title when panels change
  useEffect(() => {
    if (panels.length >= 2) {
      const names = panels.map((p) => `${p.brand_name} ${p.model_name}`).join(' vs ');
      document.title = `${names} | Solar Panel Comparison | Solerz`;
    }
  }, [panels]);

  // Search when modal opens, query changes, or brand filter changes
  useEffect(() => {
    if (!isAddModalOpen) return;
    setIsSearching(true);

    const effectiveQuery =
      selectedBrandFilter !== 'All'
        ? `${selectedBrandFilter} ${searchQuery}`.trim()
        : searchQuery.trim();

    const timer = setTimeout(() => {
      searchPanelsForCompare(effectiveQuery, slugList, 40)
        .then(setSearchResults)
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [isAddModalOpen, searchQuery, selectedBrandFilter, slugList]);

  // Handle removing a panel
  const handleRemovePanel = (slugToRemove: string) => {
    const nextSlugs = slugList.filter((s) => s !== slugToRemove);
    if (nextSlugs.length < 2) {
      navigate('/solar-panels');
    } else {
      const sorted = [...nextSlugs].sort();
      navigate(`/compare/${sorted.join('-vs-')}`);
    }
  };

  // Handle adding a panel from modal
  const handleAddPanel = (newSlug: string) => {
    if (slugList.includes(newSlug) || slugList.length >= 4) return;
    const nextSlugs = [...slugList, newSlug].sort();
    setIsAddModalOpen(false);
    setSearchQuery('');
    setSelectedBrandFilter('All');
    navigate(`/compare/${nextSlugs.join('-vs-')}`);
  };

  // Build comparison sections
  const sections = useMemo(() => {
    if (panels.length < 2) return [];
    return buildMultiComparisonSections(panels);
  }, [panels]);

  // Calculate total wins per panel
  const winCounts = useMemo(() => {
    const counts = new Array(panels.length).fill(0);
    sections.forEach((sec) => {
      sec.specs.forEach((spec) => {
        spec.values.forEach((v, idx) => {
          if (v.isWinner) counts[idx]++;
        });
      });
    });
    return counts;
  }, [panels, sections]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-36 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  // --- Error State ---
  if (error || panels.length < 2) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Comparison Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {error || 'Unable to display the requested solar hardware comparison.'}
        </p>
        <Link
          to="/solar-panels"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Solar Panels
        </Link>
      </div>
    );
  }

  const columnCount = panels.length;
  const canAddMore = columnCount < 4;
  // Total slots on desktop grid (if 3 panels + Add button => 4 slots)
  const totalGridSlots = columnCount + (canAddMore ? 1 : 0);

  // Dynamic Tailwind Grid Classes for 100% synchronized column widths
  const gridColumnsClass =
    totalGridSlots === 2
      ? 'grid-cols-2'
      : totalGridSlots === 3
      ? 'grid-cols-3'
      : 'grid-cols-4';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/solar-panels"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Solar Panels
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {panels.length} Models Head-to-Head
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* GSMARENA UNIFIED TABLE HEADER (PRODUCT CARDS COLUMN ALIGNED) */}
      {/* ================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-4 sm:p-6 lg:p-7">
          {/* Unified Desktop Layout: Left Title Area (w-64) + Right Grid of Panel Cards */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Left Info Box */}
            <div className="w-full lg:w-72 flex-none p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Solerz Compare Engine
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  Photovoltaic Module Comparison
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Cross-analyzing STC electrical parameters, thermal coefficients, and SDM physics.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                <span>{panels.length} / 4 Selected</span>
                {canAddMore && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    + Add Model
                  </button>
                )}
              </div>
            </div>

            {/* Right Cards Grid: Exactly matches table values columns below */}
            <div className={`flex-1 grid gap-3.5 ${gridColumnsClass}`}>
              {panels.map((panel, idx) => (
                <div
                  key={panel.id}
                  className="relative flex flex-col justify-between p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 transition-all hover:border-emerald-400 dark:hover:border-emerald-600"
                >
                  {/* Remove button */}
                  {panels.length > 2 && (
                    <button
                      onClick={() => handleRemovePanel(panel.slug)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      title={`Remove ${panel.model_name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate pr-4">
                      {panel.brand_name}
                    </span>
                    <Link
                      to={`/solar-panels/${panel.slug}`}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 mt-0.5"
                    >
                      {panel.model_name}
                    </Link>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {techLabel(panel.technol)}
                      </span>
                      {panel.is_bifacial && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Layers className="w-2.5 h-2.5" />
                          Bifacial
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Power & Efficiency */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                          Power
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {Math.round(panel.pnom_w)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">Wp</span>
                        </div>
                      </div>

                      {panel.module_efficiency_pct != null && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                            Efficiency
                          </span>
                          <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                            <Zap className="w-3 h-3" />
                            <span className="text-base font-black">
                              {panel.module_efficiency_pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Best Specs Badge */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Top Specs</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {winCounts[idx]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Solar Panel Slot */}
              {canAddMore && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/50 dark:bg-slate-900/30 transition-all group cursor-pointer min-h-[190px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Add Solar Panel
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                    Slot {panels.length + 1} of 4
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
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm">
                {section.icon}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {/* Spec rows: Left label (w-72) + Right aligned values grid */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {section.specs.map((spec, i) => (
                <div
                  key={i}
                  className="p-4 sm:px-6 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                    {/* Left Spec Label & Explanation (w-72 exact match with top header) */}
                    <div className="w-full lg:w-72 flex-none pr-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {spec.label}
                        </span>
                        {spec.sub && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {spec.sub}
                          </span>
                        )}
                      </div>
                      {spec.desc && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                          {spec.desc}
                        </p>
                      )}
                    </div>

                    {/* Right Values Grid (100% aligned with header cards) */}
                    <div className={`flex-1 grid gap-3.5 ${gridColumnsClass}`}>
                      {spec.values.map((v, valIdx) => (
                        <div
                          key={valIdx}
                          className={`p-2.5 rounded-xl text-left flex items-center justify-between gap-1 transition-all ${
                            v.isWinner
                              ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700/60 font-bold text-emerald-800 dark:text-emerald-300 shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <span className="text-xs sm:text-sm tabular-nums truncate">
                            {v.formatted}
                          </span>
                          {v.isWinner && (
                            <Trophy
                              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-none ml-1"
                              title="Best in comparison"
                            />
                          )}
                        </div>
                      ))}

                      {/* Empty filler cell for alignment under the +Add Card */}
                      {canAddMore && (
                        <div className="p-2.5 rounded-xl border border-dashed border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 text-center text-xs flex items-center justify-center">
                          <Plus
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-500 transition-colors"
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
      {/* KEY ADVANTAGES SUMMARY FOR EACH PANEL */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
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
          {panels.map((panel, pIdx) => {
            const wins: string[] = [];
            sections.forEach((sec) => {
              sec.specs.forEach((sp) => {
                if (sp.values[pIdx]?.isWinner) {
                  wins.push(`${sp.label} (${sp.values[pIdx].formatted})`);
                }
              });
            });

            return (
              <div
                key={panel.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {panel.brand_name}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {panel.model_name}
                  </h4>
                </div>

                {wins.length > 0 ? (
                  <ul className="space-y-2">
                    {wins.map((w, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                      >
                        <Trophy className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-none" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    Competitive specs balanced across all metrics.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* RELATED COMPARISONS */}
      {/* ================================================================= */}
      {relatedPanels.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Related Comparisons
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedPanels.map((rp) => {
              const primary = panels[0];
              const pairSlugs = [primary.slug, rp.slug].sort().join('-vs-');
              return (
                <Link
                  key={rp.id}
                  to={`/compare/${pairSlugs}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200/60 dark:border-slate-800 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {primary.model_name} <span className="text-slate-400 font-normal">vs</span> {rp.model_name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {Math.round(primary.pnom_w)}W vs {Math.round(rp.pnom_w)}W
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-none" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* QUICK ADD MODAL (ENHANCED SEARCH WITH BRAND CHIPS) */}
      {/* ================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-none">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Solar Panel to Compare
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search solar modules by brand, model, or wattage
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedBrandFilter('All');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-none space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model or wattage (e.g. Longi 550, Tiger Neo, SEG 750)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  autoFocus
                />
              </div>

              {/* Quick Brand Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {TOP_BRANDS_FILTER.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrandFilter(brand)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedBrandFilter === brand
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {isSearching ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching database...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddPanel(p.slug)}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-between group transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        {p.brand_name}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate block">
                        {p.model_name}
                      </span>
                    </div>
                    <div className="text-right flex-none">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {Math.round(p.pnom_w)} Wp
                      </span>
                      {p.module_efficiency_pct && (
                        <span className="text-[11px] text-amber-500 font-semibold">
                          {p.module_efficiency_pct.toFixed(1)}% Eff
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-slate-400">
                  No panels found. Try typing a different model or power rating.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Build multi-panel comparison sections
// ---------------------------------------------------------------------------

function buildMultiComparisonSections(
  panels: SolarPanelDetail[]
): MultiCategorySection[] {
  const sections: MultiCategorySection[] = [];

  // 1. STC Electrical Specs
  const stcSpecs: SpecRowMulti[] = [
    {
      label: 'Max Power',
      sub: 'Pnom',
      desc: 'Higher is better — Generates more total kWh per module, reducing racking hardware and roof installation time.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.pnom_w),
        'W',
        1
      ),
    },
    {
      label: 'Module Efficiency',
      sub: 'η',
      desc: 'Higher is better — Maximizes electrical energy yield per square meter of roof space.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.module_efficiency_pct),
        '%',
        1
      ),
    },
    {
      label: 'Operating Voltage',
      sub: 'Vmp',
      desc: 'Optimal operating voltage under full sun — should align with your inverter MPPT peak efficiency voltage range.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.vmp_v),
        'V'
      ),
    },
    {
      label: 'Operating Current',
      sub: 'Imp',
      desc: 'Operating current under load (Vmp × Imp = Pnom) — ensure it does not exceed inverter MPPT max input current.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.imp_a),
        'A'
      ),
    },
    {
      label: 'Open Circuit Voltage',
      sub: 'Voc',
      desc: 'Lower is advantageous for string sizing — lower Voc allows connecting more modules in series per string without tripping inverter over-voltage limits in cold weather.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.voc_v),
        'V'
      ),
    },
    {
      label: 'Short Circuit Current',
      sub: 'Isc',
      desc: 'Higher reflects stronger light absorption and bifacial gain — determines DC breaker and cable cross-section sizing.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.isc_a),
        'A'
      ),
    },
    {
      label: 'Max System Voltage',
      sub: 'IEC',
      desc: 'Higher is better — 1500V rated commercial modules allow up to 33% longer strings than 1000V residential modules.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.vmax_iec_v),
        'V',
        0
      ),
    },
  ];

  sections.push({
    title: 'STC Electrical Performance (1000 W/m², 25°C)',
    icon: <Zap className="w-4 h-4" />,
    specs: stcSpecs,
  });

  // 2. Temperature Coefficients
  const tempSpecs: SpecRowMulti[] = [
    {
      label: 'Power Temp Coefficient',
      sub: 'γ_pmp',
      desc: 'Closer to 0%/°C is better (e.g. -0.29% is superior to -0.35%) — experiences significantly less power drop on hot summer roofs.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_pnom_spec_pct_c),
        '%/°C',
        3
      ),
    },
    {
      label: 'Voltage Temp Coefficient',
      sub: 'β_oc',
      desc: 'Closer to 0 is better — minimizes voltage drop as solar cells heat up during peak sunlight hours.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_voc_spec_mv_c),
        'mV/°C',
        2
      ),
    },
    {
      label: 'Current Temp Coefficient',
      sub: 'α_sc',
      desc: 'Slight positive coefficient is standard — current increases marginally as cell semiconductor bandgap narrows with temperature.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_isc_ma_c),
        'mA/°C',
        3
      ),
    },
  ];

  sections.push({
    title: 'Temperature Loss Coefficients (Thermal Resilience)',
    icon: <Thermometer className="w-4 h-4" />,
    specs: tempSpecs,
  });

  // 3. Single Diode Model (SDM)
  const sdmSpecs: SpecRowMulti[] = [
    {
      label: 'Series Resistance',
      sub: 'Rs',
      desc: 'Lower is better — indicates lower internal ohmic resistance in cell busbars and interconnections, generating less heat.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.r_serie_ohm),
        'Ω',
        3
      ),
    },
    {
      label: 'Shunt Resistance',
      sub: 'Rsh',
      desc: 'Higher is better — reflects lower leakage current across cell defects, delivering superior performance on overcast/cloudy days.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.r_shunt_ohm),
        'Ω',
        2
      ),
    },
    {
      label: 'Diode Ideality Factor',
      sub: 'γ',
      desc: 'Closer to 1.0 is ideal — reflects superior silicon crystal purity and reduced carrier recombination losses.',
      values: panels.map((p) => ({
        raw: p.gamma,
        formatted: p.gamma != null ? fmtVal(p.gamma, 3) : '—',
        isWinner: false,
      })),
    },
  ];

  if (panels.some((p) => p.is_bifacial)) {
    sdmSpecs.push({
      label: 'Bifaciality Factor',
      desc: 'Higher is better — captures more ground albedo reflected light on the rear glass (generating +5% to +25% extra energy).',
      values: compareMultiHigherBetter(
        panels.map((p) => p.bifaciality_factor),
        '',
        2
      ),
    });
  }

  sections.push({
    title: 'Single Diode Model (SDM Physical Parameters)',
    icon: <CircuitBoard className="w-4 h-4" />,
    specs: sdmSpecs,
  });

  // 4. Mechanical & Dimensions
  const areas = panels.map((p) =>
    p.length_m && p.width_m ? p.length_m * p.width_m : null
  );

  const mechSpecs: SpecRowMulti[] = [
    {
      label: 'Length',
      desc: 'Module length in meters — compact lengths fit residential rooftops, while >2.2m lengths are optimized for utility ground mounts.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.length_m),
        'm',
        3
      ),
    },
    {
      label: 'Width',
      desc: 'Module width in meters.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.width_m),
        'm',
        3
      ),
    },
    {
      label: 'Total Surface Area',
      desc: 'Smaller module area with equal power indicates superior power density per square meter.',
      values: compareMultiLowerBetter(areas, 'm²', 3),
    },
    {
      label: 'Module Weight',
      desc: 'Lighter is better — reduces structural roof dead load and enables single-person or faster installation handling.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.weight_kg),
        'kg',
        1
      ),
    },
    {
      label: 'Series Cells',
      sub: 'Ns',
      desc: 'Total number of solar cells connected in series (e.g. 108 half-cut for residential, 144 for utility).',
      values: panels.map((p) => ({
        raw: p.ncels,
        formatted: p.ncels != null ? String(p.ncels) : '—',
        isWinner: false,
      })),
    },
    {
      label: 'Bypass Diodes',
      desc: 'Prevents hot-spot degradation and fire risk during partial shading events.',
      values: panels.map((p) => ({
        raw: p.ndiodes,
        formatted: p.ndiodes != null ? String(p.ndiodes) : '—',
        isWinner: false,
      })),
    },
  ];

  sections.push({
    title: 'Mechanical Layout & Dimensions',
    icon: <Ruler className="w-4 h-4 text-orange-500" />,
    specs: mechSpecs,
  });

  // 5. NMOT / NOCT Real-World Operating Specs
  const nmotSpecs: SpecRowMulti[] = [
    {
      label: 'Nominal Cell Temp (NOCT)',
      sub: 'NOCT',
      desc: 'Lower is better — Real operating temperature inside the cell under 800 W/m² irradiance and 20°C ambient.',
      values: panels.map((p) => ({
        raw: p.noct_c || 45,
        formatted: p.noct_c != null ? `${p.noct_c}°C` : '45 ± 2°C',
        isWinner: false,
      })),
    },
    {
      label: 'NMOT Power Output',
      sub: 'Pmax_nmot',
      desc: 'Higher is better — Realistic electricity generation under real-world rooftop sun & heat (800 W/m², 20°C, 1 m/s wind).',
      values: compareMultiHigherBetter(
        panels.map((p) => p.pnom_nmot_w || p.pnom_w * 0.752),
        'W',
        1
      ),
    },
    {
      label: 'NMOT Operating Voltage',
      sub: 'Vmp_nmot',
      desc: 'Typical summer daytime voltage under load — helps verify inverter MPPT tracking voltage.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.vmp_nmot_v || p.vmp_v * 0.935),
        'V'
      ),
    },
    {
      label: 'NMOT Operating Current',
      sub: 'Imp_nmot',
      desc: 'Real-world continuous current delivered to the inverter under 800 W/m² irradiance.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.imp_nmot_a || p.imp_a * 0.805),
        'A'
      ),
    },
  ];

  sections.push({
    title: 'NMOT Real-World Specs (800 W/m², 20°C, 1m/s wind)',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
    specs: nmotSpecs,
  });

  // 6. Electrical Protection & Design Limits
  const protSpecs: SpecRowMulti[] = [
    {
      label: 'Max Series Fuse Rating',
      desc: 'Determines the required DC string fuse or circuit breaker amperage rating in the combiner box.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.max_series_fuse_a || (p.isc_a > 15 ? 30 : 25)),
        'A',
        0
      ),
    },
    {
      label: 'Power Sorting Tolerance',
      desc: 'Positive sorting (e.g. 0~+3% / 0~+5W) guarantees the panel will produce at or above its nameplate wattage.',
      values: panels.map((p) => ({
        raw: p.power_tolerance || '0~+3%',
        formatted: p.power_tolerance || '0 ~ +3% (Positive)',
        isWinner: false,
      })),
    },
    {
      label: 'Operating Temperature',
      desc: 'Permissible ambient operating environment limits.',
      values: panels.map((p) => ({
        raw: p.operating_temp_range || '-40°C~+85°C',
        formatted: p.operating_temp_range || '-40°C ~ +85°C',
        isWinner: false,
      })),
    },
  ];

  sections.push({
    title: 'Electrical Protection & Safety Limits',
    icon: <Shield className="w-4 h-4 text-purple-500" />,
    specs: protSpecs,
  });

  // 7. Structural Load & Materials
  const loadSpecs: SpecRowMulti[] = [
    {
      label: 'Front Static Snow Load',
      desc: 'Higher is better — 5,400 Pa withstands heavy snow pack and ice loading (approx. 550 kg/m²).',
      values: compareMultiHigherBetter(
        panels.map((p) => p.front_load_pa || 5400),
        'Pa',
        0
      ),
    },
    {
      label: 'Rear Static Wind Load',
      desc: 'Higher is better — 2,400 Pa withstands hurricane-force wind gusts up to 240 km/h.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.rear_load_pa || 2400),
        'Pa',
        0
      ),
    },
    {
      label: 'Glass Construction',
      desc: 'Dual-Glass modules offer superior resistance against micro-cracks and PID degradation.',
      values: panels.map((p) => ({
        raw: p.glass_type || (p.is_bifacial ? '2.0mm+2.0mm' : '3.2mm'),
        formatted: p.glass_type || (p.is_bifacial ? '2.0mm + 2.0mm Dual-Glass' : '3.2mm Tempered Glass'),
        isWinner: false,
      })),
    },
    {
      label: 'Junction Box & Protection',
      desc: 'IP68 enclosure provides complete dust tightness and protection against continuous water immersion.',
      values: panels.map((p) => ({
        raw: p.junction_box_ip || 'IP68',
        formatted: p.junction_box_ip || 'IP68 (3 Diodes)',
        isWinner: false,
      })),
    },
  ];

  sections.push({
    title: 'Structural Load & Materials Protection',
    icon: <Ruler className="w-4 h-4 text-cyan-500" />,
    specs: loadSpecs,
  });

  // 8. Bifacial Rear-side Gain (if applicable)
  if (panels.some((p) => p.is_bifacial)) {
    const bifacialGainSpecs: SpecRowMulti[] = [
      {
        label: '+5% Rear Albedo Gain',
        desc: 'Typical for grass, brown ground soil, and aged roofs.',
        values: compareMultiHigherBetter(
          panels.map((p) => p.bifacial_gain_5pct_w || p.pnom_w * 1.05),
          'W',
          1
        ),
      },
      {
        label: '+15% Rear Albedo Gain',
        desc: 'Standard for light concrete, gravel, and light-colored ground coverings.',
        values: compareMultiHigherBetter(
          panels.map((p) => p.bifacial_gain_15pct_w || p.pnom_w * 1.15),
          'W',
          1
        ),
      },
      {
        label: '+25% Rear Albedo Gain',
        desc: 'Maximum gain achieved over white TPO membranes, snow pack, or aluminum reflectors.',
        values: compareMultiHigherBetter(
          panels.map((p) => p.bifacial_gain_25pct_w || p.pnom_w * 1.25),
          'W',
          1
        ),
      },
    ];

    sections.push({
      title: 'Bifacial Rear-Side Energy Gain Scenarios',
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      specs: bifacialGainSpecs,
    });
  }

  // 9. Packaging & Container Logistics
  const logSpecs: SpecRowMulti[] = [
    {
      label: 'Modules per Pallet',
      desc: 'Number of stacked solar panels securely packed per shipping pallet.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.pcs_per_pallet || 36),
        'pcs',
        0
      ),
    },
    {
      label: "40' HQ Container Capacity",
      desc: 'Higher is better — allows packing more total modules and peak MW capacity per ocean freight container, lowering shipping cost per watt.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.pcs_per_40hq_container || 720),
        'pcs',
        0
      ),
    },
  ];

  sections.push({
    title: 'Packaging & Container Shipping Logistics',
    icon: <Scale className="w-4 h-4 text-cyan-500" />,
    specs: logSpecs,
  });

  // 10. Warranty & Reliability
  const warrantySpecs: SpecRowMulti[] = [
    {
      label: 'Product Workmanship Warranty',
      desc: 'Longer is better — guarantees protection against manufacturing and material defects (12 to 25 years).',
      values: compareMultiHigherBetter(
        panels.map((p) => p.warranty_product_years || 15),
        'years',
        0
      ),
    },
    {
      label: 'Linear Power Retention Warranty',
      desc: 'Longer is better — guarantees 80% to 88% minimum power output after 25 to 30 years of continuous operation.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.warranty_power_years || 25),
        'years',
        0
      ),
    },
  ];

  sections.push({
    title: 'Warranty Coverage & Long-Term Reliability',
    icon: <Shield className="w-4 h-4 text-emerald-500" />,
    specs: warrantySpecs,
  });

  return sections;
}

export default ComparePage;
