import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Zap, GitCompareArrows, Check } from 'lucide-react';
import type { SolarPanelSummary } from '../types';
import { useCompare } from '../contexts/CompareContext';

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
    'Mono-c-Si': 'Mono-c-Si',
    'Multi-c-Si': 'Poly-c-Si',
    'CdTe': 'CdTe',
    'CIGS': 'CIS/CIGS',
    'HIT-Si': 'HIT/HJT',
    'a-Si': 'a-Si',
  };
  return map[t] ?? t;
};

const PanelCard: React.FC<PanelCardProps> = ({ panel }) => {
  const navigate = useNavigate();
  const { addPanel, removePanel, isSelected, isFull } = useCompare();

  const selected = isSelected(panel.id);

  const area =
    panel.length_m && panel.width_m
      ? (panel.length_m * panel.width_m).toFixed(2)
      : null;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) {
      removePanel(panel.id);
    } else if (!isFull) {
      addPanel(panel);
    }
  };

  return (
    <div
      onClick={() => navigate(`/solar-panels/${panel.slug}`)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:-translate-y-0.5 flex flex-col justify-between ${
        selected
          ? 'panel-card-selected border-emerald-400 dark:border-emerald-600'
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/solar-panels/${panel.slug}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Brand & tech tag row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[62%]">
              {panel.brand_name}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-none">
              {techLabel(panel.technol)}
            </span>
          </div>

          {/* Model name */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
            {panel.model_name}
          </h3>

          {/* Power & Efficiency — hero metrics */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.round(panel.pnom_w)}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Wp</span>
            </div>
            {panel.module_efficiency_pct != null && (
              <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-sm font-black">
                  {panel.module_efficiency_pct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mb-3">
            <div className="flex justify-between">
              <span className="text-[11px]">Vmp</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{panel.vmp_v.toFixed(1)}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]">Imp</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{panel.imp_a.toFixed(2)}A</span>
            </div>
            {area && (
              <div className="flex justify-between">
                <span className="text-[11px]">Area</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{area}m²</span>
              </div>
            )}
            {panel.weight_kg != null && (
              <div className="flex justify-between">
                <span className="text-[11px]">Weight</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{panel.weight_kg}kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Badges + Compare button (Clean Non-crowded Row) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {panel.is_bifacial && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 whitespace-nowrap flex-none">
                <Layers className="w-2.5 h-2.5" />
                Bifacial
              </span>
            )}
            {panel.warranty_product_years > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap flex-none">
                {panel.warranty_product_years}yr
              </span>
            )}
          </div>

          {/* Compare toggle button - Always fully visible */}
          <button
            onClick={handleCompareToggle}
            disabled={!selected && isFull}
            className={`flex-none inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${
              selected
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : isFull
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
            title={selected ? 'Remove from compare' : isFull ? 'Max 4 panels' : 'Add to compare'}
          >
            {selected ? (
              <>
                <Check className="w-3 h-3" />
                Added
              </>
            ) : (
              <>
                <GitCompareArrows className="w-3 h-3" />
                Compare
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelCard;
