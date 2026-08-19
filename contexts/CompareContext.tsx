import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SolarPanelSummary, InverterSummary, BatterySummary } from '../types';

const MAX_COMPARE = 4;
const PANELS_STORAGE_KEY = 'solerz_compare_panels';
const INVERTERS_STORAGE_KEY = 'solerz_compare_inverters';
const BATTERIES_STORAGE_KEY = 'solerz_compare_batteries';

interface CompareContextType {
  // Solar Panels
  selectedPanels: SolarPanelSummary[];
  addPanel: (panel: SolarPanelSummary) => void;
  removePanel: (id: string) => void;
  clearAllPanels: () => void;
  isPanelSelected: (id: string) => boolean;
  isPanelsFull: boolean;

  // Inverters
  selectedInverters: InverterSummary[];
  addInverter: (inverter: InverterSummary) => void;
  removeInverter: (id: string) => void;
  clearAllInverters: () => void;
  isInverterSelected: (id: string) => boolean;
  isInvertersFull: boolean;

  // Batteries
  selectedBatteries: BatterySummary[];
  addBattery: (battery: BatterySummary) => void;
  removeBattery: (id: string) => void;
  clearAllBatteries: () => void;
  isBatterySelected: (id: string) => boolean;
  isBatteriesFull: boolean;

  // Backward compatibility aliases
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
  // 1. Panels State
  const [selectedPanels, setSelectedPanels] = useState<SolarPanelSummary[]>(() => {
    try {
      const stored = sessionStorage.getItem(PANELS_STORAGE_KEY) || sessionStorage.getItem('solerz_compare');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 2. Inverters State
  const [selectedInverters, setSelectedInverters] = useState<InverterSummary[]>(() => {
    try {
      const stored = sessionStorage.getItem(INVERTERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 3. Batteries State
  const [selectedBatteries, setSelectedBatteries] = useState<BatterySummary[]>(() => {
    try {
      const stored = sessionStorage.getItem(BATTERIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(selectedPanels));
      sessionStorage.setItem('solerz_compare', JSON.stringify(selectedPanels));
    } catch { /* ignore */ }
  }, [selectedPanels]);

  useEffect(() => {
    try {
      sessionStorage.setItem(INVERTERS_STORAGE_KEY, JSON.stringify(selectedInverters));
    } catch { /* ignore */ }
  }, [selectedInverters]);

  useEffect(() => {
    try {
      sessionStorage.setItem(BATTERIES_STORAGE_KEY, JSON.stringify(selectedBatteries));
    } catch { /* ignore */ }
  }, [selectedBatteries]);

  // Panels operations
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

  const clearAllPanels = useCallback(() => {
    setSelectedPanels([]);
  }, []);

  const isPanelSelected = useCallback(
    (id: string) => selectedPanels.some((p) => p.id === id),
    [selectedPanels]
  );

  // Inverters operations
  const addInverter = useCallback((inverter: InverterSummary) => {
    setSelectedInverters((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((i) => i.id === inverter.id)) return prev;
      return [...prev, inverter];
    });
  }, []);

  const removeInverter = useCallback((id: string) => {
    setSelectedInverters((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAllInverters = useCallback(() => {
    setSelectedInverters([]);
  }, []);

  const isInverterSelected = useCallback(
    (id: string) => selectedInverters.some((i) => i.id === id),
    [selectedInverters]
  );

  // Batteries operations
  const addBattery = useCallback((battery: BatterySummary) => {
    setSelectedBatteries((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((b) => b.id === battery.id)) return prev;
      return [...prev, battery];
    });
  }, []);

  const removeBattery = useCallback((id: string) => {
    setSelectedBatteries((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearAllBatteries = useCallback(() => {
    setSelectedBatteries([]);
  }, []);

  const isBatterySelected = useCallback(
    (id: string) => selectedBatteries.some((b) => b.id === id),
    [selectedBatteries]
  );

  return (
    <CompareContext.Provider
      value={{
        selectedPanels,
        addPanel,
        removePanel,
        clearAllPanels,
        isPanelSelected,
        isPanelsFull: selectedPanels.length >= MAX_COMPARE,

        selectedInverters,
        addInverter,
        removeInverter,
        clearAllInverters,
        isInverterSelected,
        isInvertersFull: selectedInverters.length >= MAX_COMPARE,

        selectedBatteries,
        addBattery,
        removeBattery,
        clearAllBatteries,
        isBatterySelected,
        isBatteriesFull: selectedBatteries.length >= MAX_COMPARE,

        // Aliases
        clearAll: clearAllPanels,
        isSelected: isPanelSelected,
        isFull: selectedPanels.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export default CompareContext;
