import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SOLAR_TIPS, type SolarEngineeringTip } from '../data/solarTipsData';

interface ContextualTipCardProps {
  category?: 'modules' | 'inverters' | 'batteries' | 'sizing' | 'safety';
  specificTipId?: string;
  isBifacial?: boolean;
  isHybrid?: boolean;
  className?: string;
}

export const ContextualTipCard: React.FC<ContextualTipCardProps> = ({
  category,
  specificTipId,
  isBifacial,
  isHybrid,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Find matching tip
  let tip: SolarEngineeringTip | undefined;

  if (specificTipId) {
    tip = SOLAR_TIPS.find((t) => t.id === specificTipId);
  } else if (isBifacial) {
    tip = SOLAR_TIPS.find((t) => t.id === 'bifacial-mounting-height-rule');
  } else if (isHybrid) {
    tip = SOLAR_TIPS.find((t) => t.id === 'high-voltage-vs-low-voltage-battery-loss');
  } else if (category) {
    tip = SOLAR_TIPS.find((t) => t.category === category);
  } else {
    tip = SOLAR_TIPS[0];
  }

  if (!tip) return null;

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(tip?.formulaOrRule || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-emerald-500/5 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 border border-amber-200/60 dark:border-slate-800 p-4 sm:p-5 transition-all shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                Engineering Tip
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {tip.standardRef}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {tip.title}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 shrink-0 transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Formula Box */}
      <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <code className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
          📐 {tip.formulaOrRule}
        </code>
        <button
          type="button"
          onClick={handleCopyFormula}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 shrink-0 transition-colors"
          title="Copy Formula"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
        {tip.summary}
      </p>

      {/* Expanded deep-dive & pitfall */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2.5 text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Physical Mechanism:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {tip.explanation}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                Field Pitfall:
              </span>
              <p className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
                {tip.pitfall}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer link to handbook */}
      <div className="mt-3 pt-2 flex items-center justify-between text-[11px]">
        <Link
          to="/handbook"
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          Browse All 16 Engineering Tips <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-slate-400">Verified Engineering Reference</span>
      </div>
    </div>
  );
};

export default ContextualTipCard;
