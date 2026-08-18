import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';

const InverterComparisonTray: React.FC = () => {
  const { selectedInverters, removeInverter, clearAllInverters } = useCompare();
  const navigate = useNavigate();

  const visible = selectedInverters.length > 0;
  const canCompare = selectedInverters.length >= 2;

  const handleCompare = () => {
    if (!canCompare) return;
    // Sort all selected inverter slugs alphabetically so the URL is 100% deterministic & canonical for SEO
    const sortedSlugs = selectedInverters.map((i) => i.slug).sort();
    navigate(`/compare/inverters/${sortedSlugs.join('-vs-')}`);
  };

  return (
    <div className={`comparison-tray ${visible ? 'visible' : ''}`}>
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Selected inverters */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {selectedInverters.map((inv) => (
                <div
                  key={inv.id}
                  className="flex-none flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 animate-scale-in"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                      {inv.brand_name}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {inv.model_name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeInverter(inv.id)}
                    className="flex-none p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label={`Remove ${inv.model_name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Placeholder slots */}
              {selectedInverters.length < 2 && (
                <div className="flex-none flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {selectedInverters.length === 0
                      ? 'Select 2 inverters to compare'
                      : 'Select 1 more inverter'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-none flex items-center gap-2">
              <button
                onClick={clearAllInverters}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                aria-label="Clear all"
                title="Clear all inverters"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
              >
                <GitCompareArrows className="w-4 h-4" />
                Compare Inverters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InverterComparisonTray;
