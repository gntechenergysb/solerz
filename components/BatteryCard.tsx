import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, Zap, GitCompareArrows, Check, ShieldCheck } from 'lucide-react';
import type { BatterySummary } from '../types';
import { useCompare } from '../contexts/CompareContext';

interface BatteryCardProps {
  battery: BatterySummary;
}

const BatteryCard: React.FC<BatteryCardProps> = ({ battery }) => {
  const navigate = useNavigate();
  const { addBattery, removeBattery, isBatterySelected, isBatteriesFull } = useCompare();

  const selected = isBatterySelected(battery.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) {
      removeBattery(battery.id);
    } else if (!isBatteriesFull) {
      addBattery(battery);
    }
  };

  return (
    <div
      onClick={() => navigate(`/batteries/${battery.slug}`)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 hover:-translate-y-0.5 flex flex-col justify-between ${
        selected
          ? 'panel-card-selected border-purple-400 dark:border-purple-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/batteries/${battery.slug}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Brand & Type tag row (Matching PanelCard & InverterCard) */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[62%]">
              {battery.brand_name}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-none">
              {battery.battery_type}
            </span>
          </div>

          {/* Model name (Matching PanelCard & InverterCard) */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
            {battery.model_name}
          </h3>

          {/* Capacity & Efficiency — hero metrics (Matching PanelCard & InverterCard) */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {battery.usable_capacity_kwh >= 100
                  ? Math.round(battery.usable_capacity_kwh)
                  : battery.usable_capacity_kwh.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                kWh
              </span>
            </div>
            {battery.round_trip_efficiency_pct != null && (
              <div className="flex items-baseline gap-0.5 text-purple-600 dark:text-purple-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-sm font-black">
                  {battery.round_trip_efficiency_pct.toFixed(1)}% RTE
                </span>
              </div>
            )}
          </div>

          {/* Specs grid (Matching PanelCard & InverterCard) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mb-3">
            <div className="flex justify-between">
              <span className="text-[11px]">Power</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {battery.continuous_power_kw >= 100
                  ? Math.round(battery.continuous_power_kw)
                  : battery.continuous_power_kw.toFixed(1)} kW
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]">Voltage</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(battery.nominal_voltage_v)}V
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-[11px]">Cycle Life</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {battery.cycle_life_count ? `${battery.cycle_life_count.toLocaleString()} Cycles` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Badges + Compare button (100% Identical to PanelCard & InverterCard) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {battery.warranty_years && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 whitespace-nowrap flex-none">
                <ShieldCheck className="w-2.5 h-2.5" />
                {battery.warranty_years}yr
              </span>
            )}
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap flex-none">
              Verified
            </span>
          </div>

          {/* Compare toggle button */}
          <button
            onClick={handleCompareToggle}
            disabled={!selected && isBatteriesFull}
            aria-label={selected ? 'Remove from compare' : 'Add to compare'}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              selected
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : isBatteriesFull
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400'
            }`}
          >
            {selected ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <GitCompareArrows className="w-3 h-3" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatteryCard;
