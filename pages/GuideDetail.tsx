import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Calculator,
  Share2,
  Check,
  Zap,
} from 'lucide-react';
import { SOLAR_GUIDES, type SolarGuideArticle } from '../data/guidesData';

const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const guide = SOLAR_GUIDES.find((g) => g.slug === slug);

  useEffect(() => {
    if (guide) {
      document.title = `${guide.title} | Solerz Engineering Guides`;
      window.scrollTo(0, 0);
    }
  }, [guide]);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Other related guides
  const otherGuides = SOLAR_GUIDES.filter((g) => g.slug !== slug).slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Navigation & Breadcrumb */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides &amp; Research
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 shadow-sm transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? 'Link Copied!' : 'Share Article'}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Article Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
            {guide.category}
          </span>
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {guide.readTime}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">Updated {guide.updatedAt}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {guide.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {guide.subtitle}
        </p>

        {/* Author Byline */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
            {guide.author.name[0]}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {guide.author.name}
            </span>
            <span className="text-xs text-slate-400">{guide.author.role}</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Key Takeaways Callout Box */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-transparent dark:from-emerald-950/20 dark:via-slate-900 dark:to-transparent border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Key Engineering Takeaways
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {guide.keyTakeaways.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Article Body Content */}
      {/* ----------------------------------------------------------------- */}
      <article className="prose dark:prose-invert max-w-none space-y-8 text-slate-800 dark:text-slate-200">
        {guide.sections.map((sec, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {sec.heading}
            </h2>
            <div className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {sec.content}
            </div>
          </section>
        ))}
      </article>

      {/* ----------------------------------------------------------------- */}
      {/* 5. In-Article CTA Banner */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Interactive Hardware Database
          </span>
          <h3 className="text-xl font-bold text-white">
            {guide.relatedHardwareCategory}
          </h3>
          <p className="text-xs text-slate-400">
            Filter, compare single-diode specs, and simulate full systems in real time.
          </p>
        </div>

        <Link
          to={guide.relatedCategoryUrl}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shrink-0 shadow-lg shadow-emerald-500/20"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 6. FAQ Section */}
      {/* ----------------------------------------------------------------- */}
      {guide.faq.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            Frequently Asked Engineering Questions
          </h3>

          <div className="space-y-3">
            {guide.faq.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.question}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 7. Continue Reading Other Guides */}
      {/* ----------------------------------------------------------------- */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Continue Exploring Knowledge Base
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {otherGuides.map((other) => (
            <Link
              key={other.slug}
              to={`/guides/${other.slug}`}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {other.category} • {other.readTime}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2">
                  {other.title}
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 pt-3 inline-flex items-center gap-1">
                Read Next <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideDetailPage;
