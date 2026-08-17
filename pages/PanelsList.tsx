import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SearchX } from 'lucide-react';
import type { Brand, PanelFilters, SolarPanelSummary } from '../types';
import { fetchBrands, fetchPanelsSummary } from '../services/panelService';
import FilterBar from '../components/FilterBar';
import PanelCard from '../components/PanelCard';
import SkeletonCard from '../components/SkeletonCard';

const DEFAULT_FILTERS: PanelFilters = {
  search: '',
  brandId: '',
  powerRange: 'all',
  bifacialOnly: false,
};

const PAGE_SIZE = 24;

const PanelsList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [panels, setPanels] = useState<SolarPanelSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PanelFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref for search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The actual search value sent to the API (debounced)
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Load brands once
  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch((err) => console.error('Failed to load brands:', err));
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

  // Fetch panels when filters or page change
  const loadPanels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const effectiveFilters: PanelFilters = { ...filters, search: debouncedSearch };
      const result = await fetchPanelsSummary(effectiveFilters, page);
      setPanels(result.panels);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load panels');
      setPanels([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters.brandId, filters.powerRange, filters.bifacialOnly, debouncedSearch, page]);

  useEffect(() => {
    loadPanels();
  }, [loadPanels]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.brandId, filters.powerRange, filters.bifacialOnly, debouncedSearch]);

  const handleFilterChange = (next: Partial<PanelFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="text-center mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Solar Panel{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Database
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Browse {total > 0 ? total.toLocaleString() : '21,000+'} photovoltaic modules — STC specs, temperature coefficients &amp; SDM parameters.
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        brands={brands}
        totalResults={total}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={loadPanels}
            className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && panels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && panels.length === 0 && (
        <div className="text-center py-20">
          <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No panels found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {generatePageNumbers(page, totalPages).map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === p
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

/** Generate page number array with ellipsis for large page counts */
function generatePageNumbers(
  current: number,
  total: number
): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  }
  return pages;
}

export default PanelsList;
