import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdSlotProps {
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  label?: string;
  customLink?: string;
  customText?: string;
  sponsorName?: string;
  className?: string;
}

export const AdSlotPlaceholder: React.FC<AdSlotProps> = ({
  format = 'horizontal',
  label = 'Sponsored / Verified Partner',
  customLink,
  customText,
  sponsorName,
  className = '',
}) => {
  if (format === 'rectangle') {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between text-center min-h-[250px] relative overflow-hidden group ${className}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
          {label}
        </span>

        <div className="my-auto space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {sponsorName || 'Direct Solar Hardware Procurement'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {customText || 'Connect with Tier-1 certified manufacturers & authorized wholesale distributors.'}
          </p>
        </div>

        {customLink ? (
          <a
            href={customLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            Visit Partner Store
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Official Hardware Distribution Channel
          </span>
        )}
      </div>
    );
  }

  // Horizontal Leaderboard Banner
  return (
    <div className={`w-full p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {label}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/50">
              Verified Stock
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {customText || 'Looking for container-load or pallet pricing on certified solar hardware?'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
        {customLink ? (
          <a
            href={customLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            Check Availability
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            Ad Space • Sponsor / Google AdSense
          </span>
        )}
      </div>
    </div>
  );
};

export default AdSlotPlaceholder;
