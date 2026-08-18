import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Battery, GitCompareArrows, Check, ShieldCheck } from 'lucide-react';
import type { InverterSummary } from '../types';
import { useCompare } from '../contexts/CompareContext';

interface InverterCardProps {
  inverter: InverterSummary;
}

const fmtPower = (pacoW: number): { value: string; unit: string } => {
  if (pacoW >= 1000000) {
    const mw = pacoW / 1000000;
    return {
      value: mw >= 10 ? Math.round(mw).toString() : mw.toFixed(1),
      unit: 'MW',
    };
  }
  if (pacoW >= 1000) {
    const kw = pacoW / 1000;
    return {
      value: kw >= 100 ? Math.round(kw).toString() : kw.toFixed(1),
      unit: 'kW',
    };
  }
  return {
    value: Math.round(pacoW).toString(),
    unit: 'W',
  };
};

const InverterCard: React.FC<InverterCardProps> = ({ inverter }) => {
  const navigate = useNavigate();
  const { addInverter, removeInverter, isInverterSelected, isInvertersFull } = useCompare();

  const selected = isInverterSelected(inverter.id);
  const power = fmtPower(inverter.paco_w);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) {
      removeInverter(inverter.id);
    } else if (!isInvertersFull) {
      addInverter(inverter);
    }
  };

  return (
    <div
      onClick={() => navigate(`/inverters/${inverter.slug}`)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-500/10 hover:-translate-y-0.5 flex flex-col justify-between ${
        selected
          ? 'panel-card-selected border-amber-400 dark:border-amber-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
      }`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/inverters/${inverter.slug}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Brand & Type tag row (Matching PanelCard) */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[62%]">
              {inverter.brand_name}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-none">
              {inverter.inverter_type.replace(' Inverter', '')}
            </span>
          </div>

          {/* Model name (Matching PanelCard) */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
            {inverter.model_name}
          </h3>

          {/* Power & Efficiency — hero metrics (Matching PanelCard) */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {power.value}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {power.unit}
              </span>
            </div>
            {inverter.efficiency_pct != null && (
              <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-sm font-black">
                  {inverter.efficiency_pct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Specs grid (Matching PanelCard) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mb-3">
            <div className="flex justify-between">
              <span className="text-[11px]">Vac</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.vac_v)}V
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]">Vdcmax</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.vdcmax_v)}V
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-[11px]">MPPT</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.mppt_low_v)}V – {Math.round(inverter.mppt_high_v)}V
              </span>
            </div>
          </div>
        </div>

        {/* Badges + Compare button (100% Identical to PanelCard) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {inverter.is_hybrid && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 whitespace-nowrap flex-none">
                <Battery className="w-2.5 h-2.5" />
                Battery
              </span>
            )}
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap flex-none">
              Verified
            </span>
          </div>

          {/* Compare toggle button - 100% Identical to Solar Panel */}
          <button
            onClick={handleCompareToggle}
            disabled={!selected && isInvertersFull}
            className={`flex-none inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${
              selected
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : isInvertersFull
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
            title={selected ? 'Remove from compare' : isInvertersFull ? 'Max 4 inverters' : 'Add to compare'}
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

export default InverterCard;
