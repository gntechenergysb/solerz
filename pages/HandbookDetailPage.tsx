import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  AlertTriangle,
  Calculator,
  Zap,
  Sun,
  Battery,
  Shield,
  Sparkles,
  ChevronRight,
  GitCompareArrows,
  Award,
  Share2,
} from 'lucide-react';
import { SOLAR_TIPS, type SolarEngineeringTip } from '../data/solarTipsData';

const categoryIcons: Record<string, React.ReactNode> = {
  modules: <Sun className="w-4 h-4 text-amber-500" />,
  inverters: <Zap className="w-4 h-4 text-cyan-500" />,
  batteries: <Battery className="w-4 h-4 text-purple-500" />,
  sizing: <Calculator className="w-4 h-4 text-emerald-500" />,
  safety: <Shield className="w-4 h-4 text-rose-500" />,
};

const HandbookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const tip = useMemo(() => {
    if (!slug) return null;
    return SOLAR_TIPS.find((t) => t.slug === slug || t.id === slug) || null;
  }, [slug]);

  // Related tips (same category, excluding current)
  const relatedTips = useMemo(() => {
    if (!tip) return [];
    return SOLAR_TIPS.filter((t) => t.id !== tip.id && t.category === tip.category).slice(0, 3);
  }, [tip]);

  useEffect(() => {
    if (!tip) return;

    document.title = `${tip.title} — Solar Engineering Handbook | Solerz`;

    // Inject Schema.org TechArticle & FAQ structured data
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: tip.title,
          description: tip.summary,
          proficiencyLevel: 'Expert',
          about: [
            { '@type': 'Thing', name: tip.categoryLabel },
            { '@type': 'Thing', name: 'Photovoltaic Engineering' },
          ],
          author: {
            '@type': 'Organization',
            name: 'Solerz Photovoltaic Engineering Specialists',
            url: 'https://solerz.com/about',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Solerz',
            logo: { '@type': 'ImageObject', url: 'https://solerz.com/theme_logo.png' },
          },
          datePublished: '2025-01-15T00:00:00Z',
          dateModified: '2026-03-10T00:00:00Z',
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: tip.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${tip.summary} Mathematical Rule: ${tip.formulaOrRule}.`,
              },
            },
          ],
        },
      ],
    };

    let scriptTag = document.getElementById('handbook-detail-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'handbook-detail-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById('handbook-detail-schema');
      if (el) el.remove();
    };
  }, [tip]);

  const handleCopyFormula = () => {
    if (!tip) return;
    navigator.clipboard.writeText(tip.formulaOrRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  if (!tip) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Engineering Article Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested engineering topic could not be located.
        </p>
        <Link
          to="/handbook"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Engineering Handbook
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/handbook" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Solar Handbook
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
            {tip.title}
          </li>
        </ol>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Copy Link to Article"
        >
          {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{shareCopied ? 'Copied Link' : 'Share'}</span>
        </button>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            {categoryIcons[tip.category]}
            {tip.categoryLabel}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            5 min read
          </span>
          <span className="text-xs text-slate-400">
            Field Engineering Guide
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
          {tip.title}
        </h1>

        {/* E-E-A-T Reviewer Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-none">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Peer-Reviewed Technical Whitepaper
            </span>
            <span className="text-slate-400 text-[11px]">
              Authored &amp; validated by Solerz Photovoltaic Engineering Specialists
            </span>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* 1. Direct Question & Quick Executive Answer Box */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <Sparkles className="w-4 h-4" />
          Executive Engineering Summary
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {tip.question}
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
          {tip.summary}
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Mathematical Rule & Governing Formula */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Governing Equation &amp; Calculation Formula
            </h2>
          </div>
          <button
            onClick={handleCopyFormula}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Formula'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner border border-slate-800">
          <code>{tip.formulaOrRule}</code>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Deep Physical Mechanism & In-Depth Technical Breakdown */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            First-Principles Physical Explanation &amp; Mechanism
          </h2>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p>{tip.explanation}</p>
          <p>
            In photovoltaic string design, electrical parameters are never static. Thermal coefficients,
            diffuse irradiance fractions, and silicon lattice recombination rates fluctuate dynamically throughout the day.
            Failing to size arrays with dynamic environmental buffers inevitably leads to inverter MPPT dropouts,
            accelerated thermal fatigue, and premature equipment degradation.
          </p>
        </div>

        {/* Tags */}
        {tip.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium mr-1">Topics:</span>
            {tip.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Engineering Pitfalls & Real-World Failure Modes Alert */}
      {/* ----------------------------------------------------------------- */}
      <section className="rounded-3xl border-2 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Critical Field Pitfall &amp; Safety Warning
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          What happens if this rule is violated on site?
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {tip.pitfall}
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. Contextual Call-to-Action: Apply to Real Hardware */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
          <Zap className="w-4 h-4" />
          Interactive Engineering Application
        </div>
        <h3 className="text-lg sm:text-xl font-black leading-snug">
          Validate This Principle on Real Hardware Specs
        </h3>
        <p className="text-xs sm:text-sm text-emerald-50 max-w-2xl leading-relaxed">
          Put this rule into practice. Simulate cold Voc surges, temperature deratings, and string sizing on over 20,000 verified solar panels, inverters, and battery models.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-md"
          >
            <Calculator className="w-4 h-4" />
            Launch Solar Sizing Calculator
          </Link>
          <Link
            to="/solar-panels"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs border border-white/20 transition-colors"
          >
            <GitCompareArrows className="w-4 h-4" />
            Compare Solar Panels Head-to-Head
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 6. Related Engineering Topics Grid */}
      {/* ----------------------------------------------------------------- */}
      {relatedTips.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Related Engineering Guides in {tip.categoryLabel}
            </h3>
            <Link
              to="/handbook"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All Topics &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTips.map((rt) => (
              <Link
                key={rt.id}
                to={`/handbook/${rt.slug}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    {rt.categoryLabel}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {rt.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {rt.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Read Guide</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default HandbookDetailPage;
