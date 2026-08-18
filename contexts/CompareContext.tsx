import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SolarPanelSummary } from '../types';

const MAX_COMPARE = 4;
const STORAGE_KEY = 'solerz_compare';

interface CompareContextType {
  selectedPanels: SolarPanelSummary[];
  addPanel: (panel: SolarPanelSummary) => void;
  removePanel: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export const useCompare = (): CompareContextType => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPanels, setSelectedPanels] = useState<SolarPanelSummary[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPanels));
    } catch { /* ignore */ }
  }, [selectedPanels]);

  const addPanel = useCallback((panel: SolarPanelSummary) => {
    setSelectedPanels((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((p) => p.id === panel.id)) return prev;
      return [...prev, panel];
    });
  }, []);

  const removePanel = useCallback((id: string) => {
    setSelectedPanels((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedPanels([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedPanels.some((p) => p.id === id),
    [selectedPanels]
  );

  const isFull = selectedPanels.length >= MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{ selectedPanels, addPanel, removePanel, clearAll, isSelected, isFull }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export default CompareContext;
