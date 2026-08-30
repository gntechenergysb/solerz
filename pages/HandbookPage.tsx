import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Lightbulb,
  Search,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sun,
  Zap,
  Battery,
  Calculator,
  Shield,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SOLAR_TIPS, type SolarEngineeringTip } from '../data/solarTipsData';

const HandbookPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Solar PV Engineering Pocket Handbook & Design Formulas | Solerz';

    // Inject FAQPage Schema for AI Engine Optimization (AEO / Google AI Overviews / Perplexity / ChatGPT)
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SOLAR_TIPS.map((tip) => ({
        '@type': 'Question',
        name: tip.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${tip.summary} Formula: ${tip.formulaOrRule}. Standard: ${tip.standardRef}.`,
        },
      })),
    };

    let scriptTag = document.getElementById('aeo-handbook-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'aeo-handbook-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(faqJsonLd);

    return () => {
      const el = document.getElementById('aeo-handbook-schema');
      if (el) el.remove();
    };
  }, []);

  const categories = [
    { key: 'all', label: 'All Pocket Tips', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'modules', label: 'Solar Modules', icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'inverters', label: 'Inverters & Strings', icon: <Zap className="w-3.5 h-3.5" /> },
    { key: 'batteries', label: 'Energy Storage', icon: <Battery className="w-3.5 h-3.5" /> },
    { key: 'sizing', label: 'Sizing & Physics', icon: <Calculator className="w-3.5 h-3.5" /> },
    { key: 'safety', label: 'Codes & Safety', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  const filteredTips = SOLAR_TIPS.filter((tip) => {
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      tip.title.toLowerCase().includes(query) ||
      tip.question.toLowerCase().includes(query) ||
      tip.formulaOrRule.toLowerCase().includes(query) ||
      tip.summary.toLowerCase().includes(query) ||
      tip.standardRef.toLowerCase().includes(query) ||
      tip.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Header Banner */}
      {/* ----------------------------------------------------------------- */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Field Reference &amp; Engineering Rules
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Solar Engineering{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Pocket Handbook
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Bite-sized engineering formulas, NEC/IEC standard safety rules, and field troubleshooting tips. Grounded in certified physics and international standards.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Mobile-Friendly Search & Category Filter Bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="sticky top-16 z-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-3 space-y-3">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search formulas, NEC 690, MPPT, bifacial, cold Voc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full justify-start sm:justify-center no-scrollbar px-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Micro-Tip Cards Grid */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTips.map((tip) => {
          const isCopied = copiedId === tip.id;

          return (
            <div
              key={tip.id}
              id={tip.slug}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                {/* Badge & Standard Reference */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-[10px]">
                    {tip.categoryLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium truncate">
                    {tip.standardRef}
                  </span>
                </div>

                {/* Title & Core Question */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{tip.question}"
                  </p>
                </div>

                {/* Formula / Rule Code Block */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">
                    📐 {tip.formulaOrRule}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(tip.id, tip.formulaOrRule)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-500 shrink-0 transition-colors shadow-xs"
                    title="Copy Formula"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {tip.summary}
                </p>

                {/* Explanation */}
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Engineering Context:
                  </span>
                  {tip.explanation}
                </div>

                {/* Pitfall Box */}
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-amber-900 dark:text-amber-300">
                    <span className="font-bold block mb-0.5">Field Pitfall:</span>
                    <span className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
                      {tip.pitfall}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tag pills */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tip.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to="/calculator"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  Apply in Calculator <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No engineering tips found for "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500">
            Try searching for terms like "Voc", "MPPT", "Bifacial", "Tilt", or "LiFePO4".
          </p>
        </div>
      )}
    </div>
  );
};

export default HandbookPage;
