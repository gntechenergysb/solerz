import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Listing } from '../types';
import { MALAYSIAN_STATES, CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, MapPin, ChevronDown, ShieldCheck, Users, ArrowUpDown, Tag } from 'lucide-react';

const PANEL_CELL_TYPES = [
  'Monocrystalline',
  'Polycrystalline',
  'N-type',
  'P-type',
  'IBC',
  'ABC',
  'TOPCon',
  'HJT',
  'PERC',
  'Bifacial',
  'Monofacial',
  'Thin-Film',
  'Standard Rigid',
  'Flexible',
  'BIPV',
  'Shingled'
];

const INVERTER_TYPES = ['String', 'Micro', 'Hybrid', 'Off-Grid', 'Grid-Tied', 'Central'];

const BATTERY_TYPES = ['Rack-mounted', 'Wall-mounted', 'Portable', 'Container', 'Floor-standing', 'All-in-one'];

const BATTERY_TECHNOLOGIES = [
  'LiFePO4',
  'NMC',
  'LTO',
  'Lead-Acid',
  'AGM',
  'Gel',
  'Sodium-Ion',
  'Flow',
  'Other'
];

const CABLE_TYPES = [
  'PV1-F',
  'H1Z2Z2-K',
  'USE-2',
  'PV Wire',
  'THHN',
  'H05VV-F',
  'N2XH',
  'Battery Cable',
  'MV Cable',
  'RHW-2',
  'THWN-2'
];

const CABLE_VOLTAGES = ['600V', '1000V', '1500V', '1800V', '2000V', '0.6/1kV', '450/750V', '1.8/3kV', '6.35/11kV', '19/33kV'];

const CABLE_MATERIALS = [
  'Copper',
  'Tinned Copper',
  'Aluminum',
  'Tinned Copper-Clad Aluminum (TCCA)',
  'Aluminum Alloy'
];

const CABLE_INSULATIONS = ['XLPE', 'XLPO', 'PVC', 'Halogen-Free', 'LSHF'];

const LISTING_CONDITIONS = ['New', 'Used', 'Refurbished'];

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const marketplaceLayerRef = useRef<'verified' | 'community'>('verified');
  const fetchSeqRef = useRef(0);

  // Marketplace Layer State: 'verified' | 'community'
  const [marketplaceLayer, setMarketplaceLayer] = useState<'verified' | 'community'>('verified');

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const [panelMinWattage, setPanelMinWattage] = useState('');
  const [panelMaxWattage, setPanelMaxWattage] = useState('');
  const [panelCellType, setPanelCellType] = useState('');
  const [panelMinEfficiency, setPanelMinEfficiency] = useState('');

  const [inverterPhase, setInverterPhase] = useState('');
  const [inverterType, setInverterType] = useState('');
  const [inverterMinPowerKw, setInverterMinPowerKw] = useState('');
  const [inverterMaxPowerKw, setInverterMaxPowerKw] = useState('');
  const [inverterMinEfficiency, setInverterMinEfficiency] = useState('');
  const [inverterMinInputVoltage, setInverterMinInputVoltage] = useState('');

  const [batteryTechnology, setBatteryTechnology] = useState('');
  const [batteryType, setBatteryType] = useState('');
  const [batteryMinCapacityKwh, setBatteryMinCapacityKwh] = useState('');
  const [batteryMaxCapacityKwh, setBatteryMaxCapacityKwh] = useState('');
  const [batteryNominalVoltage, setBatteryNominalVoltage] = useState('');

  const [cableCurrentType, setCableCurrentType] = useState('');
  const [cableType, setCableType] = useState('');
  const [cableVoltage, setCableVoltage] = useState('');
  const [cableMaterial, setCableMaterial] = useState('');
  const [cableInsulation, setCableInsulation] = useState('');
  const [cableSizeMm2, setCableSizeMm2] = useState('');
  const [cableCores, setCableCores] = useState('');

  const [protectiveDeviceType, setProtectiveDeviceType] = useState('');
  const [protectiveRatedCurrentA, setProtectiveRatedCurrentA] = useState('');
  const [protectiveRatedVoltageV, setProtectiveRatedVoltageV] = useState('');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const dedupeById = (rows: Listing[]) => {
    const seen = new Set<string>();
    const out: Listing[] = [];
    for (const r of rows) {
      if (!r?.id) continue;
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  };

  const toNumber = (v: unknown): number | null => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const normalizeInverterType = (t: string) => {
    if (t === 'Microinverter') return 'Micro';
    return t;
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    marketplaceLayerRef.current = marketplaceLayer;

    const cacheKey = `marketplace_cache_v1_${marketplaceLayer}_${sortBy}`;
    const isDefaultQuery = !searchQuery.trim() && !selectedState && !selectedCategory && !selectedCondition;

    const inferCategory = (q: string) => {
      const s = (q || '').toLowerCase();
      if (s.includes('inverter')) return 'Inverters';
      if (s.includes('battery')) return 'Batteries';
      if (s.includes('panel')) return 'Panels';
      return '';
    };

    if (isDefaultQuery) {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.listings)) {
            setListings(dedupeById(parsed.listings));
            setPage(0);
            setHasMore(!!parsed.hasMore);
            setIsLoading(false);
          }
        }
      } catch {
        // ignore cache errors
      }
    }

    const mySeq = ++fetchSeqRef.current;
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        if (!isDefaultQuery) {
          const inferred = inferCategory(searchQuery);
          const cat = selectedCategory || inferred;
          db.trackSearchEvent({
            searchQuery,
            category: cat,
            state: selectedState,
            condition: selectedCondition,
            marketplaceLayer
          });
        }
        const data = await db.getMarketplaceListings({
          from: 0,
          to: 4,
          marketplaceLayer,
          searchQuery,
          state: selectedState,
          condition: selectedCondition,
          category: selectedCategory,
          sortBy: sortBy as any
        });
        if (fetchSeqRef.current !== mySeq) return;
        const pageRows = data.slice(0, 4);
        const next = dedupeById(pageRows);
        setListings(next);
        setPage(0);
        setHasMore(data.length > 4);

        if (isDefaultQuery) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ listings: next, hasMore: data.length > 4 }));
          } catch {
            // ignore cache errors
          }
        }
      } finally {
        if (fetchSeqRef.current === mySeq) setIsLoading(false);
      }
    };
    fetchListings();
  }, [marketplaceLayer, sortBy, searchQuery, selectedState, selectedCategory, selectedCondition]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const from = nextPage * 4;
      const to = from + 4;
      const layerAtCall = marketplaceLayerRef.current;
      const next = await db.getMarketplaceListings({
        from,
        to,
        marketplaceLayer: layerAtCall,
        searchQuery,
        state: selectedState,
        condition: selectedCondition,
        category: selectedCategory,
        sortBy: sortBy as any
      });
      if (marketplaceLayerRef.current !== layerAtCall) return;
      if (next.length > 0) {
        const nextSlice = next.slice(0, 4);
        setListings(prev => dedupeById([...prev, ...nextSlice]));
        setPage(nextPage);
      }
      if (next.length <= 4) {
        setHasMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    let result = [...listings]; // Create a copy to sort safely

    // Server already applies marketplace layer, search, location, category, and sorting.

    if (selectedCondition) {
      result = result.filter(l => (l as any).condition === selectedCondition);
    }

    // 4b. Panel Specs Filters
    const shouldApplyPanelFilters = selectedCategory === '' || selectedCategory === 'Panels';
    if (shouldApplyPanelFilters) {
      const minW = panelMinWattage ? Number(panelMinWattage) : null;
      const maxW = panelMaxWattage ? Number(panelMaxWattage) : null;
      const minEff = panelMinEfficiency ? Number(panelMinEfficiency) : null;

      result = result.filter(l => {
        if (l.category !== 'Panels') return true;
        const s = (l.specs || {}) as any;
        const wattage = toNumber(s.wattage);
        const efficiency = toNumber(s.efficiency);
        const cellType = typeof s.cell_type === 'string' ? s.cell_type : '';

        if (minW !== null && (wattage === null || wattage < minW)) return false;
        if (maxW !== null && (wattage === null || wattage > maxW)) return false;
        if (minEff !== null && (efficiency === null || efficiency < minEff)) return false;
        if (panelCellType && cellType !== panelCellType) return false;

        return true;
      });
    }

    // 4c. Inverter Specs Filters
    const shouldApplyInverterFilters = selectedCategory === '' || selectedCategory === 'Inverters';
    if (shouldApplyInverterFilters) {
      const minPower = inverterMinPowerKw ? Number(inverterMinPowerKw) : null;
      const maxPower = inverterMaxPowerKw ? Number(inverterMaxPowerKw) : null;
      const minEff = inverterMinEfficiency ? Number(inverterMinEfficiency) : null;
      const minVin = inverterMinInputVoltage ? Number(inverterMinInputVoltage) : null;

      result = result.filter(l => {
        if (l.category !== 'Inverters') return true;
        const s = (l.specs || {}) as any;
        const phase = typeof s.phase === 'string' ? s.phase : '';
        const invTypeRaw = typeof s.inverter_type === 'string' ? s.inverter_type : '';
        const invType = normalizeInverterType(invTypeRaw);
        const powerKw = toNumber(s.rated_ac_power_kw) ?? toNumber(s.max_ac_power_kw);
        const eff = toNumber(s.efficiency);
        const vin = toNumber(s.max_input_voltage);

        if (inverterType && invType !== inverterType) return false;
        if (inverterPhase && phase !== inverterPhase) return false;
        if (minPower !== null && (powerKw === null || powerKw < minPower)) return false;
        if (maxPower !== null && (powerKw === null || powerKw > maxPower)) return false;
        if (minEff !== null && (eff === null || eff < minEff)) return false;
        if (minVin !== null && (vin === null || vin < minVin)) return false;

        return true;
      });
    }

    // 4d. Battery Specs Filters
    const shouldApplyBatteryFilters = selectedCategory === '' || selectedCategory === 'Batteries';
    if (shouldApplyBatteryFilters) {
      const minCap = batteryMinCapacityKwh ? Number(batteryMinCapacityKwh) : null;
      const maxCap = batteryMaxCapacityKwh ? Number(batteryMaxCapacityKwh) : null;
      const nominalV = batteryNominalVoltage ? Number(batteryNominalVoltage) : null;

      result = result.filter(l => {
        if (l.category !== 'Batteries') return true;
        const s = (l.specs || {}) as any;
        const tech = typeof s.technology === 'string' ? s.technology : '';
        const type = typeof s.battery_type === 'string' ? s.battery_type : '';
        const cap = toNumber(s.capacity_kwh);
        const v = toNumber(s.nominal_voltage);

        if (batteryTechnology && tech !== batteryTechnology) return false;
        if (batteryType && type !== batteryType) return false;
        if (minCap !== null && (cap === null || cap < minCap)) return false;
        if (maxCap !== null && (cap === null || cap > maxCap)) return false;
        if (nominalV !== null && (v === null || v !== nominalV)) return false;

        return true;
      });
    }

    // 4e. Cable Specs Filters
    const shouldApplyCableFilters = selectedCategory === '' || selectedCategory === 'Cable';
    if (shouldApplyCableFilters) {
      const size = cableSizeMm2 ? Number(cableSizeMm2) : null;
      const cores = cableCores ? Number(cableCores) : null;

      result = result.filter(l => {
        if (l.category !== 'Cable') return true;
        const s = (l.specs || {}) as any;
        const currentType = typeof s.current_type === 'string' ? s.current_type : '';
        const type = typeof s.cable_type === 'string' ? s.cable_type : '';
        const voltage = typeof s.voltage_rating === 'string' ? s.voltage_rating : (typeof s.voltage === 'string' ? s.voltage : '');
        const material = typeof s.conductor === 'string' ? s.conductor : (typeof s.material === 'string' ? s.material : '');
        const insulation = typeof s.insulation === 'string' ? s.insulation : '';
        const sizeMm2 = toNumber(s.size_mm2);
        const coresVal = toNumber(s.cores);

        if (cableCurrentType && currentType !== cableCurrentType) return false;
        if (cableType && type !== cableType) return false;
        if (cableVoltage && voltage !== cableVoltage) return false;
        if (cableMaterial && material !== cableMaterial) return false;
        if (cableInsulation && insulation !== cableInsulation) return false;
        if (size !== null && (sizeMm2 === null || sizeMm2 !== size)) return false;
        if (cores !== null && (coresVal === null || coresVal !== cores)) return false;

        return true;
      });
    }

    // 4f. Protective Specs Filters
    const shouldApplyProtectiveFilters = selectedCategory === '' || selectedCategory === 'Protective';
    if (shouldApplyProtectiveFilters) {
      const ratedA = protectiveRatedCurrentA ? Number(protectiveRatedCurrentA) : null;
      const ratedV = protectiveRatedVoltageV ? Number(protectiveRatedVoltageV) : null;

      result = result.filter(l => {
        if (l.category !== 'Protective') return true;
        const s = (l.specs || {}) as any;
        const deviceType = typeof s.device_type === 'string' ? s.device_type : '';
        const a = toNumber(s.rated_current_a);
        const v = toNumber(s.rated_voltage_v);

        if (protectiveDeviceType && deviceType !== protectiveDeviceType) return false;
        if (ratedA !== null && (a === null || a !== ratedA)) return false;
        if (ratedV !== null && (v === null || v !== ratedV)) return false;

        return true;
      });
    }

    setFilteredListings(result);
  }, [
    listings,
    selectedCondition,
    panelMinWattage,
    panelMaxWattage,
    panelCellType,
    panelMinEfficiency,
    inverterPhase,
    inverterType,
    inverterMinPowerKw,
    inverterMaxPowerKw,
    inverterMinEfficiency,
    inverterMinInputVoltage,
    batteryTechnology,
    batteryType,
    batteryMinCapacityKwh,
    batteryMaxCapacityKwh,
    batteryNominalVoltage,
    cableCurrentType,
    cableType,
    cableVoltage,
    cableMaterial,
    cableInsulation,
    cableSizeMm2,
    cableCores,
    protectiveDeviceType,
    protectiveRatedCurrentA,
    protectiveRatedVoltageV
  ]);

  const activeFilterCount = [
    panelMinWattage,
    panelMaxWattage,
    panelCellType,
    panelMinEfficiency,
    inverterPhase,
    inverterType,
    inverterMinPowerKw,
    inverterMaxPowerKw,
    inverterMinEfficiency,
    inverterMinInputVoltage,
    batteryTechnology,
    batteryType,
    batteryMinCapacityKwh,
    batteryMaxCapacityKwh,
    batteryNominalVoltage,
    cableCurrentType,
    cableType,
    cableVoltage,
    cableMaterial,
    cableInsulation,
    cableSizeMm2,
    cableCores,
    protectiveDeviceType,
    protectiveRatedCurrentA,
    protectiveRatedVoltageV
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setPanelMinWattage('');
    setPanelMaxWattage('');
    setPanelCellType('');
    setPanelMinEfficiency('');

    setInverterPhase('');
    setInverterType('');
    setInverterMinPowerKw('');
    setInverterMaxPowerKw('');
    setInverterMinEfficiency('');
    setInverterMinInputVoltage('');

    setBatteryTechnology('');
    setBatteryType('');
    setBatteryMinCapacityKwh('');
    setBatteryMaxCapacityKwh('');
    setBatteryNominalVoltage('');

    setCableCurrentType('');
    setCableType('');
    setCableVoltage('');
    setCableMaterial('');
    setCableInsulation('');
    setCableSizeMm2('');
    setCableCores('');

    setProtectiveDeviceType('');
    setProtectiveRatedCurrentA('');
    setProtectiveRatedVoltageV('');
  };

  useEffect(() => {
    setShowAdvancedFilters(false);
    clearAllFilters();
  }, [selectedCategory]);

  const renderAdvancedFilters = () => {
    if (!selectedCategory) return null;

    if (selectedCategory === 'Panels') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Panel Min (W)</label>
            <input
              type="number"
              value={panelMinWattage}
              onChange={(e) => setPanelMinWattage(e.target.value)}
              placeholder="450"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Panel Max (W)</label>
            <input
              type="number"
              value={panelMaxWattage}
              onChange={(e) => setPanelMaxWattage(e.target.value)}
              placeholder="600"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Cell Type</label>
            <select
              value={panelCellType}
              onChange={(e) => setPanelCellType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {PANEL_CELL_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Eff. (%)</label>
            <input
              type="number"
              value={panelMinEfficiency}
              onChange={(e) => setPanelMinEfficiency(e.target.value)}
              placeholder="20"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCategory === 'Inverters') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Type</label>
            <select
              value={inverterType}
              onChange={(e) => setInverterType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {INVERTER_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Phase</label>
            <select
              value={inverterPhase}
              onChange={(e) => setInverterPhase(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="Single">Single</option>
              <option value="Three">Three</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Power (kW)</label>
            <input
              type="number"
              value={inverterMinPowerKw}
              onChange={(e) => setInverterMinPowerKw(e.target.value)}
              placeholder="5"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Max Power (kW)</label>
            <input
              type="number"
              value={inverterMaxPowerKw}
              onChange={(e) => setInverterMaxPowerKw(e.target.value)}
              placeholder="100"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Eff. (%)</label>
            <input
              type="number"
              value={inverterMinEfficiency}
              onChange={(e) => setInverterMinEfficiency(e.target.value)}
              placeholder="98"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Vin (V)</label>
            <input
              type="number"
              value={inverterMinInputVoltage}
              onChange={(e) => setInverterMinInputVoltage(e.target.value)}
              placeholder="600"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCategory === 'Batteries') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Type</label>
            <select
              value={batteryType}
              onChange={(e) => setBatteryType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {BATTERY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Technology</label>
            <select
              value={batteryTechnology}
              onChange={(e) => setBatteryTechnology(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {BATTERY_TECHNOLOGIES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Capacity (kWh)</label>
            <input
              type="number"
              value={batteryMinCapacityKwh}
              onChange={(e) => setBatteryMinCapacityKwh(e.target.value)}
              placeholder="5"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Max Capacity (kWh)</label>
            <input
              type="number"
              value={batteryMaxCapacityKwh}
              onChange={(e) => setBatteryMaxCapacityKwh(e.target.value)}
              placeholder="20"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Nominal V</label>
            <select
              value={batteryNominalVoltage}
              onChange={(e) => setBatteryNominalVoltage(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="48">48V</option>
              <option value="51.2">51.2V</option>
            </select>
          </div>
        </div>
      );
    }

    if (selectedCategory === 'Cable') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Cable Type</label>
            <select
              value={cableType}
              onChange={(e) => setCableType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {CABLE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Current Type</label>
            <select
              value={cableCurrentType}
              onChange={(e) => setCableCurrentType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="DC">DC</option>
              <option value="AC">AC</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Voltage</label>
            <select
              value={cableVoltage}
              onChange={(e) => setCableVoltage(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {CABLE_VOLTAGES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Material</label>
            <select
              value={cableMaterial}
              onChange={(e) => setCableMaterial(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {CABLE_MATERIALS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Insulation</label>
            <select
              value={cableInsulation}
              onChange={(e) => setCableInsulation(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              {CABLE_INSULATIONS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Size (mm²)</label>
            <input
              type="number"
              value={cableSizeMm2}
              onChange={(e) => setCableSizeMm2(e.target.value)}
              placeholder="6"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Cores</label>
            <input
              type="number"
              value={cableCores}
              onChange={(e) => setCableCores(e.target.value)}
              placeholder="2"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      );
    }

    if (selectedCategory === 'Protective') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Device</label>
            <select
              value={protectiveDeviceType}
              onChange={(e) => setProtectiveDeviceType(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="">Any</option>
              <option value="Fuse">Fuse</option>
              <option value="Breaker">Breaker</option>
              <option value="SPD">SPD</option>
              <option value="Isolator">Isolator</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Rated A</label>
            <input
              type="number"
              value={protectiveRatedCurrentA}
              onChange={(e) => setProtectiveRatedCurrentA(e.target.value)}
              placeholder="16"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Rated V</label>
            <input
              type="number"
              value={protectiveRatedVoltageV}
              onChange={(e) => setProtectiveRatedVoltageV(e.target.value)}
              placeholder="1000"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">No advanced filters for this category.</div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Solar Marketplace</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Buy and sell solar equipment in Malaysia.</p>
            </div>

            {/* Marketplace Layer Tabs */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center font-medium text-sm border border-transparent dark:border-slate-800">
              <button
                onClick={() => setMarketplaceLayer('verified')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  marketplaceLayer === 'verified'
                    ? 'bg-white dark:bg-slate-950 text-emerald-700 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Verified Assets
              </button>
              <button
                onClick={() => setMarketplaceLayer('community')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  marketplaceLayer === 'community'
                    ? 'bg-white dark:bg-slate-950 text-amber-600 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'
                }`}
              >
                <Users className="h-4 w-4" />
                Community Marketplace
              </button>
            </div>
         </div>

         {/* Search & Filter Row */}
         <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-shadow shadow-sm"
                  placeholder="Search for inverters, panels, or brands..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
               />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Location Dropdown */}
                <div className="relative w-full sm:min-w-[160px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-500" />
                   </div>
                   <select 
                      className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 font-medium appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                   >
                      <option value="">All Locations</option>
                      {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </div>
                </div>

                {/* Condition Dropdown */}
                <div className="relative w-full sm:min-w-[160px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 text-slate-500" />
                   </div>
                   <select 
                      className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 font-medium appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                   >
                      <option value="">Any Condition</option>
                      {LISTING_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </div>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative w-full sm:min-w-[160px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                   </div>
                   <select 
                      className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 font-medium appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                   >
                      <option value="latest">Latest Listed</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </div>
                </div>

                {(selectedCategory !== '') && (
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFilters(v => !v)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-slate-100 hover:border-emerald-500 shadow-sm w-full sm:w-auto"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {showAdvancedFilters && (
                      <>
                        <button
                          type="button"
                          className="hidden sm:block fixed inset-0 z-40"
                          onClick={() => setShowAdvancedFilters(false)}
                          aria-label="Close advanced filters"
                        />
                        <div className="hidden sm:block absolute right-0 top-full mt-2 z-50 w-[min(820px,calc(100vw-2rem))] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100">Advanced filters</div>
                            {(activeFilterCount > 0) && (
                              <button
                                type="button"
                                onClick={clearAllFilters}
                                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          {renderAdvancedFilters()}
                        </div>

                        <div className="sm:hidden fixed inset-0 z-50">
                          <button
                            type="button"
                            className="absolute inset-0 bg-slate-900/40"
                            onClick={() => setShowAdvancedFilters(false)}
                            aria-label="Close advanced filters"
                          />
                          <div className="absolute left-0 right-0 bottom-0 bg-white dark:bg-slate-950 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 shadow-xl p-4 max-h-[80vh] overflow-auto">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-bold text-slate-900 dark:text-slate-100">Filters</div>
                              <button
                                type="button"
                                onClick={() => setShowAdvancedFilters(false)}
                                className="text-sm font-semibold text-slate-600 dark:text-slate-300"
                              >
                                Close
                              </button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                              {renderAdvancedFilters()}
                            </div>
                            {(activeFilterCount > 0) && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={clearAllFilters}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold px-4 py-3 rounded-xl"
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowAdvancedFilters(false)}
                                  className="bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-xl dark:bg-slate-100 dark:text-slate-900"
                                >
                                  Apply
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
            </div>
         </div>

         {/* Category Pills (Filter Chips) */}
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
              <button 
               onClick={() => setSelectedCategory('')}
               className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === '' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600'
               }`}
            >
               All Equipment
            </button>
            {CATEGORIES.map(cat => (
               <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                     selectedCategory === cat 
                     ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
               >
                  {cat}
               </button>
            ))}
            </div>
         </div>
      </div>

      {/* Product Grid */}
      <div className="min-h-[400px]">
        {isLoading && listings.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-5 w-4/5 bg-slate-100 rounded animate-pulse" />
                    <div className="h-5 w-3/5 bg-slate-100 rounded animate-pulse" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {dedupeById(filteredListings).map(listing => (
                  <ProductCard key={listing.id} listing={listing} />
               ))}
            </div>
            {isLoading && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 shadow-sm">
                  <span className="w-3 h-3 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                  Updating…
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore || !hasMore}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-xl shadow-sm hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors disabled:opacity-60"
              >
                {isLoadingMore ? 'Loading...' : hasMore ? 'Load more' : 'No more'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
             <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No matches found</h3>
             <p className="text-slate-500 dark:text-slate-300 mt-1">
                {marketplaceLayer === 'verified' 
                   ? "No verified assets found matching your criteria." 
                   : "No community listings found matching your criteria."}
             </p>
             <button 
               onClick={() => { setSelectedState(''); setSelectedCategory(''); setSearchInput(''); setSearchQuery(''); }}
               className="mt-6 text-emerald-600 font-medium hover:text-emerald-700 dark:hover:text-emerald-400"
             >
               Clear all filters
             </button>
           </div>
        )}
      </div>

    </div>
  );
};

export default Marketplace;