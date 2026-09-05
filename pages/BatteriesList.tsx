import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, SearchX, Battery } from 'lucide-react';
import type { BatteryFilters, BatterySummary } from '../types';
import { fetchBatteriesSummary, fetchBatteryBrands } from '../services/batteryService';
import BatteryCard from '../components/BatteryCard';
import BatteryFilterBar from '../components/BatteryFilterBar';
import BatteryComparisonTray from '../components/BatteryComparisonTray';

const PAGE_SIZE = 24;

const defaultFilters: BatteryFilters = {
  search: '',
  brandName: 'all',
  batteryType: 'all',
  applicationType: 'all',
  couplingType: 'all',
  capacityRange: 'all',
  sortBy: 'capacity_desc',
};

const BatteriesList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<BatteryFilters>(() => ({
    search: searchParams.get('q') || '',
    brandName: searchParams.get('brand') || 'all',
    batteryType: (searchParams.get('chemistry') as BatteryFilters['batteryType']) || 'all',
    applicationType: (searchParams.get('app') as BatteryFilters['applicationType']) || 'all',
    couplingType: (searchParams.get('coupling') as BatteryFilters['couplingType']) || 'all',
    capacityRange: (searchParams.get('cap') as BatteryFilters['capacityRange']) || 'all',
    sortBy: (searchParams.get('sort') as BatteryFilters['sortBy']) || 'capacity_desc',
  }));

  const [page, setPage] = useState<number>(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const [batteries, setBatteries] = useState<BatterySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state back to URL query params
  const updateUrlParams = useCallback(
    (f: BatteryFilters, p: number) => {
      const params = new URLSearchParams();
      if (f.search) params.set('q', f.search);
      if (f.brandName !== 'all') params.set('brand', f.brandName);
      if (f.batteryType !== 'all') params.set('chemistry', f.batteryType);
      if (f.applicationType !== 'all') params.set('app', f.applicationType);
      if (f.couplingType !== 'all') params.set('coupling', f.couplingType);
      if (f.capacityRange !== 'all') params.set('cap', f.capacityRange);
      if (f.sortBy !== 'capacity_desc') params.set('sort', f.sortBy);
      if (p > 1) params.set('page', p.toString());
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Load distinct brands once and set title
  useEffect(() => {
    document.title = 'Solar Energy Storage & Battery Systems Directory | Solerz';
    fetchBatteryBrands().then(setBrands);
  }, []);

  // Fetch batteries on filters or page change
  const loadBatteries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBatteriesSummary(filters, page, PAGE_SIZE);
      setBatteries(res.batteries);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch batteries data.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadBatteries();
    updateUrlParams(filters, page);
  }, [loadBatteries, updateUrlParams, filters, page]);

  const handleFilterChange = (newFilters: BatteryFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-purple-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Hardware Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Battery Systems & Energy Storage Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Browse certified residential, commercial, and off-grid battery energy storage systems (BESS). Compare usable kWh capacity, continuous kW power, round-trip efficiency, and cycle life.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Verified Database
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
              Battery Catalog
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <BatteryFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        brands={brands}
        totalResults={total}
      />

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 animate-pulse space-y-4 h-64"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-base font-bold text-red-500 mb-2">Failed to load batteries</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadBatteries}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all"
          >
            Retry
          </button>
        </div>
      ) : batteries.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No matching battery systems found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, selecting a different brand, or clearing the active filters.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:bg-slate-800 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {batteries.map((battery) => (
            <BatteryCard key={battery.id} battery={battery} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-bold text-slate-800 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-800 dark:text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page >= totalPages}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Comparison Tray */}
      <BatteryComparisonTray />
    </div>
  );
};

export default BatteriesList;
