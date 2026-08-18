import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';

const ComparisonTray: React.FC = () => {
  const { selectedPanels, removePanel, clearAll } = useCompare();
  const navigate = useNavigate();

  const visible = selectedPanels.length > 0;
  const canCompare = selectedPanels.length >= 2;

  const handleCompare = () => {
    if (!canCompare) return;
    // Sort all selected panel slugs alphabetically so the URL is 100% deterministic & canonical for SEO
    const sortedSlugs = selectedPanels.map((p) => p.slug).sort();
    navigate(`/compare/${sortedSlugs.join('-vs-')}`);
  };

  return (
    <div className={`comparison-tray ${visible ? 'visible' : ''}`}>
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Selected panels */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {selectedPanels.map((panel) => (
                <div
                  key={panel.id}
                  className="flex-none flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 animate-scale-in"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                      {panel.brand_name}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {panel.model_name}
                    </p>
                  </div>
                  <button
                    onClick={() => removePanel(panel.id)}
                    className="flex-none p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label={`Remove ${panel.model_name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Placeholder slots */}
              {selectedPanels.length < 2 && (
                <div className="flex-none flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {selectedPanels.length === 0
                      ? 'Select 2 panels to compare'
                      : 'Select 1 more panel'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-none flex items-center gap-2">
              <button
                onClick={clearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                aria-label="Clear all"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
              >
                <GitCompareArrows className="w-4 h-4" />
                Compare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTray;
