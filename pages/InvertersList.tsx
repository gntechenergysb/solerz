import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchX, Zap, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import type { InverterFilters, InverterSummary } from '../types';
import { fetchInvertersSummary, fetchInverterBrands } from '../services/inverterService';
import InverterCard from '../components/InverterCard';
import InverterFilterBar from '../components/InverterFilterBar';
import InverterComparisonTray from '../components/InverterComparisonTray';

const PAGE_SIZE = 24;

const DEFAULT_FILTERS: InverterFilters = {
  search: '',
  brandName: 'all',
  inverterType: 'all',
  powerRange: 'all',
  isHybridOnly: false,
};

const InvertersList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [brands, setBrands] = useState<string[]>([]);
  const [inverters, setInverters] = useState<InverterSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<InverterFilters>({
    ...DEFAULT_FILTERS,
    search: initialSearch,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search timer
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Load brands list once and set title
  useEffect(() => {
    document.title = 'Solar Inverters Specifications & Efficiency Directory | Solerz';
    fetchInverterBrands()
      .then(setBrands)
      .catch((err) => console.error('Failed to load inverter brands:', err));
  }, []);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

  // Fetch inverters
  const loadInverters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const effectiveFilters: InverterFilters = {
        ...filters,
        search: debouncedSearch,
      };
      const result = await fetchInvertersSummary(effectiveFilters, page, PAGE_SIZE);
      setInverters(result.inverters);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load inverters data');
      setInverters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => {
    loadInverters();
  }, [loadInverters]);

  // Reset page to 1 when filters change
  const handleFilterChange = (newFilters: InverterFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Hardware Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Solar Inverters Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Browse certified string, micro, and battery-hybrid storage inverters. Compare continuous AC power, MPPT voltage windows, and Sandia conversion efficiency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Verified Database
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
              {total.toLocaleString()} Inverters Listed
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <InverterFilterBar
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
          <p className="text-base font-bold text-red-500 mb-2">Failed to load inverters</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadInverters}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all"
          >
            Retry
          </button>
        </div>
      ) : inverters.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No matching inverters found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, selecting a different brand, or clearing the active filters.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Inverter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {inverters.map((inv) => (
              <InverterCard key={inv.id} inverter={inv} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Page {page} of {totalPages} ({total.toLocaleString()} items)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page;
                    if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          page === pageNum
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Inverter Comparison Tray */}
      <InverterComparisonTray />
    </div>
  );
};

export default InvertersList;
