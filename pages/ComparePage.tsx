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

/**
 * Compare an array of numeric values where higher is better.
 * Returns array of formatted strings and whether each is the winner.
 */
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

/**
 * Compare an array of numeric values where lower is better (e.g. series resistance, weight).
 */
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
// Main Multi-Column Compare Page (GSMarena style)
// ---------------------------------------------------------------------------

const ComparePage: React.FC = () => {
  const { slugs: routeSlugs } = useParams<{ slugs: string }>();
  const navigate = useNavigate();

  const [panels, setPanels] = useState<SolarPanelDetail[]>([]);
  const [relatedPanels, setRelatedPanels] = useState<RelatedPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick-add search modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedPanel[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Parse 2, 3, or 4 slugs from URL (split by '-vs-')
  const slugList = useMemo(() => {
    if (!routeSlugs) return [];
    return routeSlugs
      .split('-vs-')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [routeSlugs]);

  // Load panels data
  useEffect(() => {
    if (slugList.length < 2) {
      setError('Please select at least 2 solar panels to compare.');
      setLoading(false);
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

  // Search when modal opens or query changes
  useEffect(() => {
    if (!isAddModalOpen) return;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchPanelsForCompare(searchQuery, slugList, 8)
        .then(setSearchResults)
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [isAddModalOpen, searchQuery, slugList]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/solar-panels"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Solar Panels
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Comparing {panels.length} Models
        </span>
      </div>

      {/* ================================================================= */}
      {/* GSMarena STYLE HEADER: DEVICE CARDS (STICKY / TOP OVERVIEW) */}
      {/* ================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div
            className={`grid gap-4 items-stretch ${
              columnCount === 2
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : columnCount === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {/* Panel Header Cards */}
            {panels.map((panel, idx) => (
              <div
                key={panel.id}
                className="relative flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 transition-all hover:border-emerald-400 dark:hover:border-emerald-600"
              >
                {/* Remove button */}
                {panels.length > 2 && (
                  <button
                    onClick={() => handleRemovePanel(panel.slug)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title={`Remove ${panel.model_name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    {panel.brand_name}
                  </span>
                  <Link
                    to={`/solar-panels/${panel.slug}`}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
                  >
                    {panel.model_name}
                  </Link>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {techLabel(panel.technol)}
                    </span>
                    {panel.is_bifacial && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Layers className="w-3 h-3" />
                        Bifacial
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-700/50 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Power Rating
                    </span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {Math.round(panel.pnom_w)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Wp</span>
                    </div>
                  </div>

                  {panel.module_efficiency_pct != null && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        Efficiency
                      </span>
                      <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-lg font-black">
                          {panel.module_efficiency_pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score badge */}
                <div className="mt-3 flex items-center justify-between text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Top Specs
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {winCounts[idx]} wins
                  </span>
                </div>
              </div>
            ))}

            {/* Quick Add Slot (like GSMarena's "+ Add device to compare") */}
            {canAddMore && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/50 dark:bg-slate-900/30 transition-all group cursor-pointer min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Add Solar Panel
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">
                  Compare up to 4 models side-by-side
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* DETAILED MULTI-COLUMN COMPARISON TABLE (GSMARENA STYLE) */}
      {/* ================================================================= */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm">
                {section.icon}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {/* Spec rows table */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 overflow-x-auto">
              {section.specs.map((spec, i) => (
                <div
                  key={i}
                  className="px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Spec Label & Explanation */}
                    <div className="lg:col-span-4 pr-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {spec.label}
                        </span>
                        {spec.sub && (
                          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
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

                    {/* Values Columns */}
                    <div
                      className={`lg:col-span-8 grid gap-3 ${
                        columnCount === 2
                          ? 'grid-cols-2'
                          : columnCount === 3
                          ? 'grid-cols-3'
                          : 'grid-cols-4'
                      }`}
                    >
                      {spec.values.map((v, valIdx) => (
                        <div
                          key={valIdx}
                          className={`p-2.5 rounded-xl text-center sm:text-left flex items-center justify-between gap-1 transition-all ${
                            v.isWinner
                              ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700/60 font-bold text-emerald-800 dark:text-emerald-300 shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <span className="text-sm tabular-nums truncate">
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
      {/* QUICK ADD MODAL (SEARCH & SELECT) */}
      {/* ================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Panel to Compare
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search by model name or manufacturer
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model (e.g. Tiger Neo, Hi-MO 6, Vertex)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results List */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-1">
              {isSearching ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Searching database...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddPanel(p.slug)}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {p.brand_name}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {p.model_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {Math.round(p.pnom_w)} W
                      </span>
                      {p.module_efficiency_pct && (
                        <span className="text-[11px] text-amber-500 font-semibold">
                          {p.module_efficiency_pct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center text-sm text-slate-400">
                  No panels found matching your query.
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

  // 1. STC Electrical
  const stcSpecs: SpecRowMulti[] = [
    {
      label: 'Max Power',
      sub: 'Pnom',
      desc: 'Higher power means more electricity generated per panel, reducing total racking & balance-of-system costs.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.pnom_w),
        'W',
        1
      ),
    },
    {
      label: 'Module Efficiency',
      sub: 'η',
      desc: 'Higher efficiency converts more sunlight into electricity — critical for space-constrained rooftops.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.module_efficiency_pct),
        '%',
        1
      ),
    },
    {
      label: 'Max Power Voltage',
      sub: 'Vmp',
      desc: 'Operating voltage at peak power. Higher Vmp enables optimal string inverter MPPT sizing.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.vmp_v),
        'V'
      ),
    },
    {
      label: 'Max Power Current',
      sub: 'Imp',
      desc: 'Operating current at peak power output under standard test conditions.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.imp_a),
        'A'
      ),
    },
    {
      label: 'Open Circuit Voltage',
      sub: 'Voc',
      desc: 'Maximum open-circuit voltage. Used to calculate cold-weather maximum voltage for inverter safety.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.voc_v),
        'V'
      ),
    },
    {
      label: 'Short Circuit Current',
      sub: 'Isc',
      desc: 'Maximum current under short circuit. Determines fuse ratings and cable cross-section requirements.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.isc_a),
        'A'
      ),
    },
    {
      label: 'Max System Voltage (IEC)',
      desc: 'Maximum certified series string voltage. 1500V allows 33% longer strings than 1000V.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.vmax_iec_v),
        'V',
        0
      ),
    },
  ];

  sections.push({
    title: 'STC Electrical Specs (1000 W/m², 25°C)',
    icon: <Zap className="w-5 h-5" />,
    specs: stcSpecs,
  });

  // 2. Temperature Coefficients
  const tempSpecs: SpecRowMulti[] = [
    {
      label: 'Power Temp Coeff',
      sub: 'γ_pmp',
      desc: 'Closer to 0 is better — less power loss per °C rise above 25°C. Critical in hot climates.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_pnom_spec_pct_c),
        '%/°C',
        3
      ),
    },
    {
      label: 'Voltage Temp Coeff',
      sub: 'β_oc',
      desc: 'Closer to 0 is better — less voltage drop during hot summer afternoons.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_voc_spec_mv_c),
        'mV/°C',
        2
      ),
    },
    {
      label: 'Current Temp Coeff',
      sub: 'α_sc',
      desc: 'Slightly positive is normal — current increases slightly as cell temperature rises.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.mu_isc_ma_c),
        'mA/°C',
        3
      ),
    },
  ];

  sections.push({
    title: 'Temperature Coefficients & Thermal Behavior',
    icon: <Thermometer className="w-5 h-5" />,
    specs: tempSpecs,
  });

  // 3. Single Diode Model (SDM)
  const sdmSpecs: SpecRowMulti[] = [
    {
      label: 'Series Resistance',
      sub: 'Rs',
      desc: 'Lower is better — less internal ohmic resistance loss in busbars and cell contacts.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.r_serie_ohm),
        'Ω',
        3
      ),
    },
    {
      label: 'Shunt Resistance',
      sub: 'Rsh',
      desc: 'Higher is better — less internal leakage current through manufacturing micro-defects.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.r_shunt_ohm),
        'Ω',
        2
      ),
    },
    {
      label: 'Diode Ideality Factor',
      sub: 'γ',
      desc: 'Closer to 1.0 is ideal — reflects pure recombination dynamics without defect trap states.',
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
      desc: 'Ratio of rear-side to front-side power. Higher yields more energy from ground albedo reflection.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.bifaciality_factor),
        '',
        2
      ),
    });
  }

  sections.push({
    title: 'Single Diode Model (SDM Physical Parameters)',
    icon: <CircuitBoard className="w-5 h-5" />,
    specs: sdmSpecs,
  });

  // 4. Mechanical & Dimensions
  const areas = panels.map((p) =>
    p.length_m && p.width_m ? p.length_m * p.width_m : null
  );

  const mechSpecs: SpecRowMulti[] = [
    {
      label: 'Length',
      desc: 'Module length in meters. Smaller modules provide greater flexibility on complex roofs.',
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
      desc: 'Smaller module area with equal power indicates higher power density (W/m²).',
      values: compareMultiLowerBetter(areas, 'm²', 3),
    },
    {
      label: 'Weight',
      desc: 'Lighter panels reduce structural roof loading and ease installer handling.',
      values: compareMultiLowerBetter(
        panels.map((p) => p.weight_kg),
        'kg',
        1
      ),
    },
    {
      label: 'Series Cells',
      sub: 'Ns',
      desc: 'Number of individual PV cells wired in series.',
      values: panels.map((p) => ({
        raw: p.ncels,
        formatted: p.ncels != null ? String(p.ncels) : '—',
        isWinner: false,
      })),
    },
    {
      label: 'Bypass Diodes',
      desc: 'Prevents hot-spot damage during partial shading. More diodes offer finer shade granularity.',
      values: panels.map((p) => ({
        raw: p.ndiodes,
        formatted: p.ndiodes != null ? String(p.ndiodes) : '—',
        isWinner: false,
      })),
    },
  ];

  sections.push({
    title: 'Mechanical Specifications & Dimensions',
    icon: <Ruler className="w-5 h-5" />,
    specs: mechSpecs,
  });

  // 5. Warranty & Reliability
  const warrantySpecs: SpecRowMulti[] = [
    {
      label: 'Product Workmanship Warranty',
      desc: 'Covers manufacturer mechanical & material defects. Longer warranty reflects high build quality.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.warranty_product_years),
        'years',
        0
      ),
    },
    {
      label: 'Linear Performance Warranty',
      desc: 'Guarantees minimum power output over 25–30 years. Industry standard is ≥80-87% at year 25-30.',
      values: compareMultiHigherBetter(
        panels.map((p) => p.warranty_power_years),
        'years',
        0
      ),
    },
  ];

  sections.push({
    title: 'Warranty & Reliability',
    icon: <Shield className="w-5 h-5" />,
    specs: warrantySpecs,
  });

  return sections;
}

export default ComparePage;
