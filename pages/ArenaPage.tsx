import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Zap,
  Thermometer,
  Sun,
  Shield,
  Layers,
  Sparkles,
  GitCompareArrows,
  ChevronRight,
  ExternalLink,
  Award,
  Vote,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Cpu,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  fetchArenaLeaderboard,
  type ArenaRankItem,
  type ArenaDimension,
  SAMPLE_MATCHUPS,
} from '../services/arenaService';
import { useCompare } from '../contexts/CompareContext';

const ArenaPage: React.FC = () => {
  const navigate = useNavigate();
  const { addPanel, selectedPanels } = useCompare();

  const [dimension, setDimension] = useState<ArenaDimension>('overall');
  const [items, setItems] = useState<ArenaRankItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Blind Arena Matchup State
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'matchup'>('leaderboard');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [votedChoice, setVotedChoice] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(SAMPLE_MATCHUPS[0].initialVotesA);
  const [votesB, setVotesB] = useState(SAMPLE_MATCHUPS[0].initialVotesB);

  useEffect(() => {
    document.title = 'Solerz Arena — Global Solar Hardware Leaderboard & Benchmarks | Solerz';

    // Inject Schema.org ItemList Structured Data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Solerz Global Photovoltaic Hardware Leaderboard',
      description: 'Comprehensive engineering benchmark ratings and rankings for commercial and residential solar panels.',
      itemListOrder: 'Descending',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 10).map((item) => ({
        '@type': 'ListItem',
        position: item.rank,
        item: {
          '@type': 'Product',
          name: `${item.brand_name} ${item.model_name}`,
          description: `${item.pnom_w}W ${item.technol} solar panel with ${item.module_efficiency_pct}% efficiency. Solerz Rating: ${item.solerzRating}/100.`,
          url: `https://solerz.com/solar-panels/${item.slug}`,
        },
      })),
    };

    let script = document.getElementById('arena-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'arena-schema';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById('arena-schema');
      if (el) el.remove();
    };
  }, [items]);

  // Load Leaderboard items when dimension changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchArenaLeaderboard(dimension)
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dimension]);

  // Handle blind voting
  const handleVote = (choice: 'A' | 'B') => {
    if (votedChoice) return;
    setVotedChoice(choice);
    if (choice === 'A') setVotesA((prev) => prev + 1);
    else setVotesB((prev) => prev + 1);
  };

  const totalVotes = votesA + votesB;
  const pctA = Math.round((votesA / totalVotes) * 100);
  const pctB = Math.round((votesB / totalVotes) * 100);

  const dimensionTabs: { id: ArenaDimension; label: string; icon: React.ReactNode }[] = [
    { id: 'overall', label: 'Overall Solerz Rating', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
    { id: 'efficiency', label: 'Efficiency Champions', icon: <Zap className="w-4 h-4 text-cyan-500" /> },
    { id: 'thermal', label: 'Hot-Climate Kings', icon: <Thermometer className="w-4 h-4 text-rose-500" /> },
    { id: 'residential', label: 'Residential (400W~490W)', icon: <Sun className="w-4 h-4 text-emerald-500" /> },
    { id: 'commercial', label: 'Commercial (500W~630W)', icon: <BarChart3 className="w-4 h-4 text-purple-500" /> },
    { id: 'bifacial', label: 'Dual-Glass Bifacial', icon: <Layers className="w-4 h-4 text-blue-500" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The LM Arena for Solar Hardware
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Solerz Arena: Global Hardware Leaderboard
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Deterministic, physics-based evaluation metrics across 20,000+ certified photovoltaic modules.
            Scored on STC conversion efficiency, 65°C thermal resilience, 25-year degradation warranties, and BOS density.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Benchmark Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('matchup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'matchup'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Vote className="w-4 h-4" />
              Community Blind Arena Matchup
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* VIEW A: INTERACTIVE BLIND ARENA MATCHUP (COMMUNITY CONSENSUS)     */}
      {/* ================================================================= */}
      {activeTab === 'matchup' && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Installer Blind Scenario
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {SAMPLE_MATCHUPS[scenarioIdx].scenarioTitle}
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold self-start sm:self-center">
              {SAMPLE_MATCHUPS[scenarioIdx].climateZone}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {SAMPLE_MATCHUPS[scenarioIdx].description}
          </p>

          {/* Side-by-Side Blind Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option A */}
            <div
              className={`rounded-2xl border-2 p-6 transition-all flex flex-col justify-between ${
                votedChoice
                  ? votedChoice === 'A'
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                    Hardware Option A
                  </span>
                  {votedChoice && (
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {pctA}% Votes ({votesA})
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {votedChoice ? 'AIKO Neostar 2S+ (455W ABC)' : 'Option A (All-Back-Contact Architecture)'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Efficiency</span>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-sm">22.8%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Temp Coeff</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">-0.26 %/°C</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Cell Technology</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">N-Type ABC Mono</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Power Warranty</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">30 Years (88.85%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                {!votedChoice ? (
                  <button
                    onClick={() => handleVote('A')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
                  >
                    Vote for Option A
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Chosen by commercial installers for highest power density and lowest temperature loss in hot roofs.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Option B */}
            <div
              className={`rounded-2xl border-2 p-6 transition-all flex flex-col justify-between ${
                votedChoice
                  ? votedChoice === 'B'
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-600 text-white">
                    Hardware Option B
                  </span>
                  {votedChoice && (
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {pctB}% Votes ({votesB})
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {votedChoice ? 'LONGi Hi-MO 6 Explorer (435W HPBC)' : 'Option B (Hybrid Passivated Back Contact)'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Efficiency</span>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-sm">22.3%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Temp Coeff</span>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-sm">-0.29 %/°C</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Cell Technology</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">HPBC Mono</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Power Warranty</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">25 Years (88.90%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                {!votedChoice ? (
                  <button
                    onClick={() => handleVote('B')}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors shadow-md shadow-cyan-600/20"
                  >
                    Vote for Option B
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Preferred for global tier-1 bankability, mature supply chain availability, and cost-per-watt balance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {votedChoice && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-none" />
                <span>Thank you for voting! Your engineering choice has been recorded in the community Elo engine.</span>
              </div>
              <Link
                to="/compare/aiko-solar-energy-ak-a455-mah54db-vs-longi-green-energy-technology-lr5-54htb-435m"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex-none"
              >
                <span>Full Head-to-Head Physics Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ================================================================= */}
      {/* VIEW B: MAIN LEADERBOARD TABLE                                    */}
      {/* ================================================================= */}
      {activeTab === 'leaderboard' && (
        <section className="space-y-6">
          {/* Dimension Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {dimensionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDimension(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  dimension === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Leaderboard Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Computing hardware physics benchmarks...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No ranking data available for this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-4 w-16 text-center">Rank</th>
                      <th className="py-4 px-4">Solar Hardware Model</th>
                      <th className="py-4 px-4">STC Output</th>
                      <th className="py-4 px-4">Efficiency</th>
                      <th className="py-4 px-4">Temp Coeff</th>
                      <th className="py-4 px-4">Solerz Score</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {items.map((item) => {
                      const isTop3 = item.rank <= 3;
                      const rankBadge =
                        item.rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mx-auto shadow-sm">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-950 dark:text-white font-black flex items-center justify-center mx-auto">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-600/80 text-white font-black flex items-center justify-center mx-auto">
                            3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400">{item.rank}</span>
                        );

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">{rankBadge}</td>

                          {/* Model & Brand */}
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {item.brand_name}
                              </span>
                              <Link
                                to={`/solar-panels/${item.slug}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
                              >
                                {item.model_name}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {item.technol}
                                </span>
                                {item.is_bifacial && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold">
                                    Bifacial
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* STC Watts */}
                          <td className="py-4 px-4">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              {item.pnom_w}
                            </span>
                            <span className="text-slate-400 text-[10px] ml-0.5">Wp</span>
                          </td>

                          {/* Efficiency */}
                          <td className="py-4 px-4">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {item.module_efficiency_pct.toFixed(2)}%
                            </span>
                          </td>

                          {/* Temp Coeff */}
                          <td className="py-4 px-4">
                            <span
                              className={`font-semibold tabular-nums ${
                                item.mu_pnom_spec_pct_c >= -0.30
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {item.mu_pnom_spec_pct_c.toFixed(3)}%/°C
                            </span>
                          </td>

                          {/* Solerz Rating */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {item.solerzRating}
                                </span>
                                <span className="text-[10px] text-slate-400">/ 100</span>
                              </div>
                              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                                  style={{ width: `${item.solerzRating}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/solar-panels/${item.slug}`}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
                                title="View Datasheet"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  addPanel(item as any);
                                  navigate('/solar-panels');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-semibold text-[11px] transition-colors"
                              >
                                <GitCompareArrows className="w-3 h-3" />
                                <span>Compare</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArenaPage;
