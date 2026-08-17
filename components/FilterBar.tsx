import React from 'react';
import { Search, X, Layers } from 'lucide-react';
import type { Brand, PanelFilters } from '../types';

interface FilterBarProps {
  filters: PanelFilters;
  brands: Brand[];
  totalResults: number;
  onFilterChange: (next: Partial<PanelFilters>) => void;
  onReset: () => void;
}

const POWER_OPTIONS: { value: PanelFilters['powerRange']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lt400', label: '< 400 W' },
  { value: '400to550', label: '400–550 W' },
  { value: 'gt550', label: '> 550 W' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  brands,
  totalResults,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.search || filters.brandId || filters.powerRange !== 'all' || filters.bifacialOnly;

  return (
    <div className="space-y-4">
      {/* Search + Brand row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="panel-search"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search model or brand..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Brand dropdown */}
        <select
          id="brand-filter"
          value={filters.brandId}
          onChange={(e) => onFilterChange({ brandId: e.target.value })}
          className="sm:w-56 py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
        >
          <option value="">All Brands ({brands.length})</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Power range + Bifacial toggle + Results count */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Power range pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
          {POWER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ powerRange: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filters.powerRange === opt.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Bifacial toggle */}
        <button
          onClick={() => onFilterChange({ bifacialOnly: !filters.bifacialOnly })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
            filters.bifacialOnly
              ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Bifacial
        </button>

        {/* Spacer + result count */}
        <div className="ml-auto flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Reset filters
            </button>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {totalResults.toLocaleString()} panels
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
