import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Zap } from 'lucide-react';
import type { SolarPanelSummary } from '../types';

interface PanelCardProps {
  panel: SolarPanelSummary;
}

/** Maps DB technol codes to human-readable labels */
const techLabel = (t: string | null): string => {
  if (!t) return '—';
  const map: Record<string, string> = {
    'mtSiMono': 'Mono-c-Si',
    'mtSiPoly': 'Poly-c-Si',
    'mtCdTe': 'CdTe',
    'mtCIS': 'CIS/CIGS',
    'mtHIT': 'HIT/HJT',
    'mtSiAmorp': 'a-Si',
  };
  return map[t] ?? t;
};

const PanelCard: React.FC<PanelCardProps> = ({ panel }) => {
  const navigate = useNavigate();

  const area =
    panel.length_m && panel.width_m
      ? (panel.length_m * panel.width_m).toFixed(2)
      : null;

  return (
    <div
      onClick={() => navigate(`/panels/${panel.slug}`)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-700"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/panels/${panel.slug}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">
        {/* Brand & tech tag row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[60%]">
            {panel.brand_name}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {techLabel(panel.technol)}
          </span>
        </div>

        {/* Model name */}
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-4 line-clamp-2 min-h-[2.5rem]">
          {panel.model_name}
        </h3>

        {/* Power & Efficiency — hero metrics */}
        <div className="flex items-end gap-3 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {Math.round(panel.pnom_w)}
            </span>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">W</span>
          </div>
          {panel.module_efficiency_pct != null && (
            <div className="flex items-baseline gap-0.5 ml-auto">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {panel.module_efficiency_pct.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Vmp</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{panel.vmp_v.toFixed(1)} V</span>
          </div>
          <div className="flex justify-between">
            <span>Imp</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{panel.imp_a.toFixed(2)} A</span>
          </div>
          {area && (
            <div className="flex justify-between">
              <span>Area</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{area} m²</span>
            </div>
          )}
          {panel.weight_kg != null && (
            <div className="flex justify-between">
              <span>Weight</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{panel.weight_kg} kg</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {panel.is_bifacial && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-3 h-3" />
              Bifacial
            </span>
          )}
          {panel.warranty_product_years > 0 && (
            <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {panel.warranty_product_years}yr warranty
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelCard;
