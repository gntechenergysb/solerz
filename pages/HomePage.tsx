import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Sun,
  Battery,
  ArrowRight,
  BarChart3,
  Users,
  Database,
  GitCompareArrows,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  Sparkles,
  Flame,
  Layers,
  Thermometer,
  CircuitBoard,
  Ruler,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Product Category Card Component
// ---------------------------------------------------------------------------
interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  count: string;
  badge?: string;
  to?: string;
  comingSoon?: boolean;
  theme: 'emerald' | 'amber' | 'purple';
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  count,
  badge,
  to,
  comingSoon,
  theme,
}) => {
  const themeStyles = {
    emerald: {
      border: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25',
    },
    amber: {
      border: 'hover:border-amber-400 dark:hover:border-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: 'from-amber-500/15 via-orange-500/5 to-transparent',
      textAccent: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25',
    },
    purple: {
      border: 'hover:border-purple-400 dark:hover:border-purple-500',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      glow: 'from-purple-500/15 via-indigo-500/5 to-transparent',
      textAccent: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25',
    },
  }[theme];

  const content = (
    <div
      className={`relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        comingSoon
          ? 'opacity-85'
          : `group hover:-translate-y-1 hover:shadow-2xl ${themeStyles.border}`
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${themeStyles.glow} blur-3xl pointer-events-none transition-opacity duration-300`}
      />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${themeStyles.iconBg} transition-transform duration-300 group-hover:scale-105`}
          >
            {icon}
          </div>
          {badge && (
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeStyles.badge}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textAccent} block mb-1`}>
          {subtitle}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
            Coverage
          </span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {count}
          </span>
        </div>

        {!comingSoon && to ? (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${themeStyles.textAccent} group-hover:gap-2.5 transition-all`}
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            In Development
          </span>
        )}
      </div>
    </div>
  );

  if (comingSoon || !to) return content;
  return <Link to={to} className="block">{content}</Link>;
};

// ---------------------------------------------------------------------------
// Popular Comparison Card
// ---------------------------------------------------------------------------
interface PopularCompareProps {
  panelA: { name: string; brand: string; power: number; eff: number };
  panelB: { name: string; brand: string; power: number; eff: number };
  tag: string;
  slug: string;
}

const PopularCompareCard: React.FC<PopularCompareProps> = ({
  panelA,
  panelB,
  tag,
  slug,
}) => (
  <Link
    to={slug}
    className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
  >
    {/* Tag */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
        {tag}
      </span>
      <GitCompareArrows className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
    </div>

    {/* Side by side preview */}
    <div className="space-y-2.5">
      {/* Panel A */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {panelA.brand}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
            {panelA.name}
          </span>
        </div>
        <div className="text-right flex-none">
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            {panelA.power}W
          </span>
          <span className="text-[10px] font-semibold text-amber-500">
            {panelA.eff}%
          </span>
        </div>
      </div>

      {/* VS divider */}
      <div className="flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-900 px-2">
          VS
        </span>
      </div>

      {/* Panel B */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {panelB.brand}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
            {panelB.name}
          </span>
        </div>
        <div className="text-right flex-none">
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            {panelB.power}W
          </span>
          <span className="text-[10px] font-semibold text-amber-500">
            {panelB.eff}%
          </span>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
      <span>Compare Specs</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

// ---------------------------------------------------------------------------
// Main Homepage Component
// ---------------------------------------------------------------------------
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/solar-panels?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/solar-panels');
    }
  };

  const trendingComparisons: PopularCompareProps[] = [
    {
      panelA: { name: 'JAM72S30-545/MR', brand: 'JA Solar', power: 545, eff: 21.6 },
      panelB: { name: 'LR5-72HPH-555M', brand: 'LONGi Solar', power: 555, eff: 22.3 },
      tag: '550W Utility Class',
      slug: '/compare/ja-solar-ja-solar-jam72s30-545-mr-vs-longi-green-energy-technology-co-ltd-longi-green-energy-technology-co-ltd-lr5-72hph-555m',
    },
    {
      panelA: { name: 'SPR-A410 Maxeon', brand: 'SunPower', power: 410, eff: 21.9 },
      panelB: { name: 'TSM-415NE09RC05', brand: 'Trina Solar', power: 415, eff: 21.5 },
      tag: '410W Residential Rooftop',
      slug: '/compare/sunpower-sunpower-spr-a410-vs-trina-solar-trina-solar-tsm-415ne09rc05',
    },
    {
      panelA: { name: 'ET-N866TBH700GB', brand: 'ELITE Solar', power: 700, eff: 22.5 },
      panelB: { name: 'SEG-750-BHC-BG', brand: 'SEG Solar', power: 750, eff: 24.8 },
      tag: '700W+ Ultra High Power',
      slug: '/compare/elite-solar-elite-solar-et-n866tbh700gb-vs-seg-solar-inc-seg-solar-inc-seg-750-bhc-bg',
    },
  ];

  const quickPillSearches = [
    { label: '⚡ 550W+ Utility', query: '550' },
    { label: '🏠 420W-440W Residential', query: '420' },
    { label: '🔥 700W+ Commercial', query: '700' },
    { label: 'LONGi Solar', query: 'LONGi' },
    { label: 'JinkoSolar', query: 'Jinko' },
    { label: 'Trina Solar', query: 'Trina' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ================================================================= */}
      {/* HERO SECTION: MODERN AURORA GLOW + FAST SEARCH ENGINE */}
      {/* ================================================================= */}
      <section className="relative text-center pt-6 sm:pt-14 pb-8 overflow-hidden">
        {/* Subtle decorative background light gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-2">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/80 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
              Global Solar &amp; Storage Hardware Directory • Datasheets &amp; PVsyst .PAN Files
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Compare Solar Hardware.
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Engineered for Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            The definitive technical directory for solar engineers, procurement specialists, and installers.
            Access certified electrical curves, PVsyst .PAN simulation files, and official OEM datasheets across 280+ manufacturers.
          </p>

          {/* Interactive Fast Search Bar (Direct Action in Hero) */}
          <div className="max-w-2xl mx-auto mb-6">
            <form
              onSubmit={handleHeroSearchSubmit}
              className="relative flex items-center p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-none" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search by brand, model, or wattage (e.g., Hi-MO 6, Tiger Neo, 550W)..."
                className="w-full px-3 py-2 text-sm sm:text-base bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all"
              >
                Search
              </button>
            </form>

            {/* Quick Pill Searches */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Popular:
              </span>
              {quickPillSearches.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(`/solar-panels?search=${encodeURIComponent(item.query)}`)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3 CORE PRODUCT CATEGORIES */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              Hardware Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Product Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Explore verified technical datasheets and cross-compare specifications side-by-side.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            theme="emerald"
            icon={<Sun className="w-7 h-7" />}
            subtitle="Category 01 • Available Now"
            title="Solar Panels"
            description="Explore technical datasheets for photovoltaic modules. Compare STC electrical ratings, thermal loss coefficients, cell counts, and single-diode physics."
            count="Verified Hardware Catalog"
            badge="Full Data Available"
            to="/solar-panels"
          />

          <CategoryCard
            theme="amber"
            icon={<Zap className="w-7 h-7" />}
            subtitle="Category 02 • Available Now"
            title="Solar Inverters"
            description="String, micro, and hybrid storage inverters. Compare Sandia peak efficiency, MPPT operating windows, and AC grid voltages."
            count="Verified Hardware Catalog"
            badge="Full Data Available"
            to="/inverters"
          />

          <CategoryCard
            theme="purple"
            icon={<Battery className="w-7 h-7" />}
            subtitle="Category 03 • Available Now"
            title="Battery Systems"
            description="Residential, commercial, and off-grid battery energy storage systems (BESS). Compare usable kWh capacity, continuous kW power, RTE efficiency, and LFP cycle life."
            count="Verified Hardware Catalog"
            badge="Full Data Available"
            to="/batteries"
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* TRENDING HARDWARE COMPARISONS */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Head-to-Head Comparisons
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Trending Hardware Battles
              </h2>
            </div>
          </div>
          <Link
            to="/solar-panels"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            Create Custom Comparison <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingComparisons.map((item, idx) => (
            <PopularCompareCard key={idx} {...item} />
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5 PILLARS OF HARDWARE DATA ENGINE */}
      {/* ================================================================= */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Data Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Solerz is the Industry Standard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Every specification is structured for high-performance retrieval and instant cross-module analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Zap className="w-6 h-6 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              STC Electrical Precision
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Standard Test Conditions (1000 W/m², 25°C) power ratings, Vmp, Imp, Voc, and Isc curves for inverter MPPT matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Layers className="w-6 h-6 text-purple-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Bifacial &amp; Cell Chemistry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Differentiates TOPCon, HJT, Mono PERC, and CdTe thin-film with bifaciality factors for albedo energy gain calculations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Thermometer className="w-6 h-6 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Thermal Loss Coefficients
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detailed γ_pmp, β_oc, and α_sc temperature gradients to accurately model hot-climate power degradation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CircuitBoard className="w-6 h-6 text-blue-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Single Diode Model (SDM)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates series resistance (Rs), shunt resistance (Rsh), and diode ideality factor (γ) for simulation accuracy.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Ruler className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Dimensions &amp; Structural Load
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Module dimensions, surface area, and weight specifications for roof structural engineering and racking layouts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Shield className="w-6 h-6 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Linear Warranty Coverage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              12–25 year product workmanship warranties and 25–30 year linear power retention guarantees across all manufacturers.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STATS STRIP & CALL TO ACTION */}
      {/* ================================================================= */}
      <section className="text-center space-y-6 pt-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Ready to Compare Hardware?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Search our global catalog of verified solar modules and inverters to generate multi-column technical comparisons.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/solar-panels"
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              Browse Solar Panels
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
