import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertCircle,
  Newspaper,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Globe2,
} from 'lucide-react';
import type { ExpertAnalysisResult, NewsAndResourceLink } from '../services/seoInsightsService';

interface ExpertAnalysisSectionProps {
  insights: ExpertAnalysisResult;
  newsLinks: NewsAndResourceLink[];
  category: 'Solar Panel' | 'Inverter' | 'Battery Storage';
  brandName: string;
  modelName: string;
}

export const ExpertAnalysisSection: React.FC<ExpertAnalysisSectionProps> = ({
  insights,
  newsLinks,
  category,
  brandName,
  modelName,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden relative">
      {/* Top ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                Engineering Assessment
              </span>
              <span className="text-[11px] text-slate-400">Solerz Technical Review</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Technical Analysis &amp; System Integration Guide
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {expanded ? 'Collapse Insights' : 'Expand Full Review'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        {insights.summary}
      </div>

      {expanded && (
        <div className="space-y-6 pt-2">
          {/* 3-Column Engineering Deep-Dive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Technology Breakdown */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                Cell &amp; Material Architecture
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {insights.technologyBreakdown}
              </p>
            </div>

            {/* 2. Thermal & Climate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Thermometer className="w-4 h-4" />
                Thermal Stability &amp; NOCT Loss
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {insights.thermalAndClimateAnalysis}
              </p>
            </div>

            {/* 3. Electrical & MPPT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                Electrical &amp; Inverter Sizing
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {insights.electricalAndInverterMatching}
              </p>
            </div>
          </div>

          {/* Climate Suitability Rating Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-emerald-500" />
                Regional Climate Suitability Index
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Based on Temperature Coefficients &amp; Diode Parameters
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Desert */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">☀️ Hot Desert</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {insights.climateSuitability.hotDesert}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${insights.climateSuitability.hotDesert}%` }}
                  />
                </div>
              </div>

              {/* Tropical */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">🌴 Tropical Humid</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {insights.climateSuitability.tropicalHumid}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${insights.climateSuitability.tropicalHumid}%` }}
                  />
                </div>
              </div>

              {/* Temperate */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">⛅ Temperate</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {insights.climateSuitability.temperateFourSeasons}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${insights.climateSuitability.temperateFourSeasons}%` }}
                  />
                </div>
              </div>

              {/* Cold */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">❄️ Cold Alpine</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {insights.climateSuitability.coldAlpine}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${insights.climateSuitability.coldAlpine}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pros & Considerations Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Key Engineering Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {insights.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Considerations */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Installation &amp; Design Considerations
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {insights.considerations.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Real-time News & Technical Resources */}
          {newsLinks.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-purple-500" />
                  Live Industry News &amp; OEM Portals for {brandName}
                </h4>
                <span className="text-[10px] text-slate-400">External verified sources</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {newsLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 flex items-center justify-between transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.source}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate block transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Standards & Engineering Disclaimer Note */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Calculated using standard single-diode physics models (SDM) and manufacturer STC test ratings (1000W/m², 25°C, AM1.5). For site-specific electrical engineering and permit submission, always verify with official OEM documentation and local licensed solar engineers.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertAnalysisSection;
