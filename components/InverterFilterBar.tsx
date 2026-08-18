import React from 'react';
import { Search, X, SlidersHorizontal, Battery } from 'lucide-react';
import type { InverterFilters, InverterType } from '../types';

interface InverterFilterBarProps {
  filters: InverterFilters;
  onFilterChange: (filters: InverterFilters) => void;
  onReset: () => void;
  brands: string[];
  totalResults: number;
}

const InverterFilterBar: React.FC<InverterFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  brands,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.brandName !== 'all' ||
    filters.inverterType !== 'all' ||
    filters.powerRange !== 'all' ||
    filters.isHybridOnly;

  const typeOptions: { label: string; value: InverterFilters['inverterType'] }[] = [
    { label: 'All Inverters', value: 'all' },
    { label: 'String', value: 'String Inverter' },
    { label: 'Microinverter', value: 'Microinverter' },
    { label: 'Hybrid Storage', value: 'Hybrid Storage Inverter' },
    { label: 'Central', value: 'Utility Central Inverter' },
  ];

  const powerOptions: { label: string; value: InverterFilters['powerRange'] }[] = [
    { label: 'All Power', value: 'all' },
    { label: '< 3 kW', value: 'lt3k' },
    { label: '3–10 kW', value: '3kto10k' },
    { label: '10–50 kW', value: '10kto50k' },
    { label: '> 50 kW', value: 'gt50k' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Row 1: Search & Brand Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search inverter by model, brand, or power (e.g. SE7600H, IQ8, 5000)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Brand Dropdown */}
        <div className="sm:w-56 flex-none">
          <select
            value={filters.brandName}
            onChange={(e) => onFilterChange({ ...filters, brandName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Inverter Type Pills, Power Range, Hybrid Toggle & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Type selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Type:
          </span>
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ ...filters, inverterType: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filters.inverterType === opt.value
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Power range & Hybrid toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Power dropdown */}
          <select
            value={filters.powerRange}
            onChange={(e) =>
              onFilterChange({ ...filters, powerRange: e.target.value as InverterFilters['powerRange'] })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
          >
            {powerOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Hybrid battery only toggle */}
          <button
            onClick={() => onFilterChange({ ...filters, isHybridOnly: !filters.isHybridOnly })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              filters.isHybridOnly
                ? 'bg-purple-500/15 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400'
            }`}
          >
            <Battery className="w-3.5 h-3.5" />
            Battery Ready
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          {/* Counter */}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums ml-auto sm:ml-2">
            {totalResults.toLocaleString()} inverters
          </span>
        </div>
      </div>
    </div>
  );
};

export default InverterFilterBar;
