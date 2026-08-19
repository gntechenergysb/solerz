import React from 'react';
import { Search, X, SlidersHorizontal, Battery, Zap } from 'lucide-react';
import type { BatteryFilters } from '../types';

interface BatteryFilterBarProps {
  filters: BatteryFilters;
  onFilterChange: (filters: BatteryFilters) => void;
  onReset: () => void;
  brands: string[];
  totalResults: number;
}

const BatteryFilterBar: React.FC<BatteryFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  brands,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.brandName !== 'all' ||
    filters.batteryType !== 'all' ||
    filters.capacityRange !== 'all' ||
    filters.applicationType !== 'all' ||
    filters.couplingType !== 'all' ||
    filters.sortBy !== 'capacity_desc';

  const chemistryOptions: { label: string; value: BatteryFilters['batteryType'] }[] = [
    { label: 'All Chemistries', value: 'all' },
    { label: 'LiFePO4 (LFP)', value: 'LiFePO4' },
    { label: 'NMC Lithium', value: 'NMC' },
    { label: 'Lead-Carbon / LTO', value: 'Lead-Carbon' },
  ];

  const capacityOptions: { label: string; value: BatteryFilters['capacityRange'] }[] = [
    { label: 'All Capacities', value: 'all' },
    { label: '< 5 kWh', value: 'lt5k' },
    { label: '5–10 kWh', value: '5kto10k' },
    { label: '10–20 kWh', value: '10kto20k' },
    { label: '> 20 kWh', value: 'gt20k' },
  ];

  const sortOptions: { label: string; value: BatteryFilters['sortBy'] }[] = [
    { label: 'Highest Capacity (kWh)', value: 'capacity_desc' },
    { label: 'Highest Power (kW)', value: 'power_desc' },
    { label: 'Highest Efficiency (% RTE)', value: 'efficiency_desc' },
    { label: 'Longest Warranty (Years)', value: 'warranty_desc' },
    { label: 'Brand Name (A–Z)', value: 'brand_asc' },
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
            placeholder="Search battery by model, brand, or capacity (e.g. Powerwall, IQ 5P, 13.5, LFP)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:w-56 flex-none">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as BatteryFilters['sortBy'] })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all cursor-pointer font-medium"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Chemistry Type Pills & Capacity Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Chemistry Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {chemistryOptions.map((opt) => {
            const active = filters.batteryType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ ...filters, batteryType: opt.value })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Capacity Range Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {capacityOptions.map((opt) => {
            const active = filters.capacityRange === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ ...filters, capacityRange: opt.value })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors flex items-center gap-1 ml-auto sm:ml-2"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryFilterBar;
