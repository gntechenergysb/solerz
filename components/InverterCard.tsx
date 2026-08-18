import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Battery, Cpu, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import type { InverterSummary } from '../types';

interface InverterCardProps {
  inverter: InverterSummary;
}

const fmtPower = (pacoW: number): { value: string; unit: string } => {
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
  const power = fmtPower(inverter.paco_w);

  const typeBadgeStyles: Record<string, string> = {
    'Hybrid Storage Inverter':
      'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Microinverter':
      'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'String Inverter':
      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Utility Central Inverter':
      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  const badgeClass =
    typeBadgeStyles[inverter.inverter_type] ||
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

  return (
    <div
      onClick={() => navigate(`/inverters/${inverter.slug}`)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-500/10 hover:-translate-y-0.5 flex flex-col justify-between"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/inverters/${inverter.slug}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Brand & Type tag row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[60%]">
              {inverter.brand_name}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-none truncate max-w-[40%] ${badgeClass}`}
            >
              {inverter.inverter_type.replace(' Inverter', '')}
            </span>
          </div>

          {/* Model name */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
            {inverter.model_name}
          </h3>

          {/* AC Continuous Power & Conversion Efficiency */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Rated AC Power
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {power.value}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {power.unit}
                </span>
              </div>
            </div>

            {inverter.efficiency_pct != null && (
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Efficiency
                </span>
                <div className="flex items-baseline gap-0.5 text-amber-600 dark:text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-sm font-black">
                    {inverter.efficiency_pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mb-3">
            <div className="flex justify-between">
              <span className="text-[11px]">AC Grid</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.vac_v)}V
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]">Max DC</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.vdcmax_v)}V
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-[11px]">MPPT Range</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(inverter.mppt_low_v)}V – {Math.round(inverter.mppt_high_v)}V
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges & Link */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {inverter.is_hybrid && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 whitespace-nowrap flex-none border border-purple-200 dark:border-purple-800">
                <Battery className="w-3 h-3" />
                Battery Ready
              </span>
            )}
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              CEC Listed
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex-none">
            View Specs
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default InverterCard;
