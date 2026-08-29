import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Sun,
  Zap,
  Battery,
  Calculator,
  Search,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { SOLAR_GUIDES, type SolarGuideArticle } from '../data/guidesData';

const GuidesList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Solar Panels', 'Inverters', 'Batteries', 'System Sizing'];

  const filteredGuides = SOLAR_GUIDES.filter((guide) => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredGuide = SOLAR_GUIDES[0];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Header Banner */}
      {/* ----------------------------------------------------------------- */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Engineering Knowledge Hub &amp; Research Library
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Photovoltaic Engineering &amp;{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Hardware Guides
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          In-depth technical analyses, cell physics comparisons, inverter sizing formulas, and energy storage chemistry guides authored by licensed photovoltaic engineers.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Search & Category Filter Bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Featured Hero Guide (If No Search Query) */}
      {/* ----------------------------------------------------------------- */}
      {searchQuery === '' && selectedCategory === 'All' && featuredGuide && (
        <Link
          to={`/guides/${featuredGuide.slug}`}
          className="group relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl overflow-hidden block transition-all hover:border-emerald-500/50"
        >
          {/* Ambient light glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {featuredGuide.featuredBadge || 'Featured Research'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredGuide.readTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight group-hover:text-emerald-400 transition-colors leading-tight">
              {featuredGuide.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 line-clamp-2">
              {featuredGuide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {featuredGuide.author.name}
              </span>
              <span>•</span>
              <span>Updated {featuredGuide.updatedAt}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                Read Full Engineering Paper <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. Guides Grid */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guides/${guide.slug}`}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                  {guide.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                  <Clock className="w-3 h-3" />
                  {guide.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                {guide.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {guide.subtitle}
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{guide.author.name}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Read Guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No guides found matching "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or select "All" categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuidesList;
