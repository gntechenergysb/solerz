import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';

const BatteryComparisonTray: React.FC = () => {
  const { selectedBatteries, removeBattery, clearAllBatteries } = useCompare();
  const navigate = useNavigate();

  const visible = selectedBatteries.length > 0;
  const canCompare = selectedBatteries.length >= 2;

  const handleCompare = () => {
    if (!canCompare) return;
    // Sort all selected battery slugs alphabetically so the URL is 100% deterministic & canonical for SEO
    const sortedSlugs = selectedBatteries.map((b) => b.slug).sort();
    navigate(`/compare/batteries/${sortedSlugs.join('-vs-')}`);
  };

  return (
    <div className={`comparison-tray ${visible ? 'visible' : ''}`}>
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Selected batteries */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {selectedBatteries.map((battery) => (
                <div
                  key={battery.id}
                  className="flex-none flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800 animate-scale-in"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
                      {battery.brand_name}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {battery.model_name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBattery(battery.id)}
                    className="flex-none p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label={`Remove ${battery.model_name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Placeholder slots */}
              {selectedBatteries.length < 2 && (
                <div className="flex-none flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {selectedBatteries.length === 0
                      ? 'Select 2 batteries to compare'
                      : 'Select 1 more battery'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-none flex items-center gap-2">
              <button
                onClick={clearAllBatteries}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                aria-label="Clear all"
                title="Clear all batteries"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
              >
                <GitCompareArrows className="w-4 h-4" />
                Compare Batteries
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryComparisonTray;
