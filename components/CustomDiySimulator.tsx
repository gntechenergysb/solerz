import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Zap,
  Sun,
  Battery,
  Sliders,
  Sparkles,
  Search,
  CheckCircle2,
  Printer,
  ExternalLink,
  Layers,
  Ruler,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  X,
  Mail,
  Send,
} from 'lucide-react';
import type { SolarPanelDetail, InverterDetail, BatteryDetail } from '../types';
import {
  simulateDiySystem,
  autoOptimizeStrings,
  searchPanelsForDiy,
  searchInvertersForDiy,
  searchBatteriesForDiy,
  type DiySystemConfig,
  type DiySimulationResult,
} from '../services/diySimulatorService';
import { submitLeadInquiry } from '../services/leadService';

export const CustomDiySimulator: React.FC = () => {
  // --- Selected Hardware State ---
  const [selectedPanel, setSelectedPanel] = useState<SolarPanelDetail | null>(null);
  const [selectedInverter, setSelectedInverter] = useState<InverterDetail | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<BatteryDetail | null>(null);

  // --- Array Layout State ---
  const [totalPanels, setTotalPanels] = useState<number>(16);
  const [seriesPerString, setSeriesPerString] = useState<number>(8);
  const [parallelStrings, setParallelStrings] = useState<number>(2);
  const [inverterQuantity, setInverterQuantity] = useState<number>(1);
  const [batteryQuantity, setBatteryQuantity] = useState<number>(1);
  const [minTempC, setMinTempC] = useState<number>(-10);
  const [sunHours, setSunHours] = useState<number>(4.5);

  // --- Search Modals ---
  const [panelModalOpen, setPanelModalOpen] = useState(false);
  const [inverterModalOpen, setInverterModalOpen] = useState(false);
  const [batteryModalOpen, setBatteryModalOpen] = useState(false);

  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [inverterSearchQuery, setInverterSearchQuery] = useState('');
  const [batterySearchQuery, setBatterySearchQuery] = useState('');

  const [panelSearchResults, setPanelSearchResults] = useState<SolarPanelDetail[]>([]);
  const [inverterSearchResults, setInverterSearchResults] = useState<InverterDetail[]>([]);
  const [batterySearchResults, setBatterySearchResults] = useState<BatteryDetail[]>([]);

  // --- Quote Modal ---
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', postalCode: '' });

  // Initial load of sample top-tier hardware
  useEffect(() => {
    searchPanelsForDiy().then((res) => {
      if (res.length > 0 && !selectedPanel) {
        setSelectedPanel(res[0]);
      }
      setPanelSearchResults(res);
    });

    searchInvertersForDiy().then((res) => {
      if (res.length > 0 && !selectedInverter) {
        setSelectedInverter(res[0]);
      }
      setInverterSearchResults(res);
    });

    searchBatteriesForDiy().then((res) => {
      setBatterySearchResults(res);
    });
  }, []);

  // Live search debounces for modals
  useEffect(() => {
    if (panelModalOpen) {
      const timer = setTimeout(() => searchPanelsForDiy(panelSearchQuery).then(setPanelSearchResults), 200);
      return () => clearTimeout(timer);
    }
  }, [panelSearchQuery, panelModalOpen]);

  useEffect(() => {
    if (inverterModalOpen) {
      const timer = setTimeout(() => searchInvertersForDiy(inverterSearchQuery).then(setInverterSearchResults), 200);
      return () => clearTimeout(timer);
    }
  }, [inverterSearchQuery, inverterModalOpen]);

  useEffect(() => {
    if (batteryModalOpen) {
      const timer = setTimeout(() => searchBatteriesForDiy(batterySearchQuery).then(setBatterySearchResults), 200);
      return () => clearTimeout(timer);
    }
  }, [batterySearchQuery, batteryModalOpen]);

  // Sizing configuration
  const config: DiySystemConfig = useMemo(
    () => ({
      panel: selectedPanel,
      totalPanels,
      seriesPerString,
      parallelStrings,
      inverter: selectedInverter,
      inverterQuantity,
      battery: selectedBattery,
      batteryQuantity,
      minTempC,
      sunHours,
    }),
    [
      selectedPanel,
      totalPanels,
      seriesPerString,
      parallelStrings,
      selectedInverter,
      inverterQuantity,
      selectedBattery,
      batteryQuantity,
      minTempC,
      sunHours,
    ]
  );

  // Live simulation results
  const simulation: DiySimulationResult = useMemo(() => simulateDiySystem(config), [config]);

  // Handle 1-Click Auto Optimize Strings
  const handleAutoOptimize = () => {
    if (selectedPanel && selectedInverter) {
      const { series, parallel } = autoOptimizeStrings(selectedPanel, selectedInverter, totalPanels, minTempC);
      setSeriesPerString(series);
      setParallelStrings(parallel);
    }
  };

  const handleTotalPanelsChange = (val: number) => {
    const nextTotal = Math.max(2, val);
    setTotalPanels(nextTotal);
    if (selectedPanel && selectedInverter) {
      const { series, parallel } = autoOptimizeStrings(selectedPanel, selectedInverter, nextTotal, minTempC);
      setSeriesPerString(series);
      setParallelStrings(parallel);
    }
  };

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Header & Intro */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Solar DIY System Builder
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Custom Hardware Pair &amp;{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Electrical Safety Simulator
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Freely select any certified solar panel, inverter, and battery from our 24,000+ database. Configure string layouts and simulate cold voltage safety (Voc), MPPT operating window (Vmp), and DC/AC capacity ratios in real time.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Hardware Pickers Bar (Panels, Inverter, Battery) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Box 1: Solar Panel Picker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                Selected Solar Panel
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedPanel ? `${selectedPanel.pnom_w} Wp` : '—'}
              </span>
            </div>

            {selectedPanel ? (
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                  {selectedPanel.brand_name}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {selectedPanel.model_name}
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Voc: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPanel.voc_v}V</span></div>
                  <div>Vmp: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPanel.vmp_v}V</span></div>
                  <div>Imp: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPanel.imp_a}A</span></div>
                  <div>Eff: <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPanel.module_efficiency_pct ? `${selectedPanel.module_efficiency_pct.toFixed(1)}%` : '—'}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No panel selected</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPanelModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Change Panel ({selectedPanel ? 'Switch Model' : 'Browse Panels'})
          </button>
        </div>

        {/* Box 2: Inverter Picker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Selected Inverter
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedInverter ? `${(selectedInverter.paco_w / 1000).toFixed(1)} kW AC` : '—'}
              </span>
            </div>

            {selectedInverter ? (
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                  {selectedInverter.brand_name}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {selectedInverter.model_name}
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Max DC: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInverter.vdcmax_v}V</span></div>
                  <div>MPPT: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInverter.mppt_low_v}~{selectedInverter.mppt_high_v}V</span></div>
                  <div>Type: <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">{selectedInverter.inverter_type || 'String Inverter'}</span></div>
                  <div>Eff: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInverter.efficiency_pct ? `${selectedInverter.efficiency_pct.toFixed(1)}%` : '98.5%'}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No inverter selected</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setInverterModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Change Inverter ({selectedInverter ? 'Switch Model' : 'Browse Inverters'})
          </button>
        </div>

        {/* Box 3: Battery Storage Picker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5" />
                Battery Storage (Optional)
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {selectedBattery ? `${selectedBattery.usable_capacity_kwh} kWh` : 'None'}
              </span>
            </div>

            {selectedBattery ? (
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                  {selectedBattery.brand_name}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {selectedBattery.model_name}
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Usable: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBattery.usable_capacity_kwh} kWh</span></div>
                  <div>Power: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBattery.continuous_power_kw || '—'} kW</span></div>
                  <div>Type: <span className="font-bold text-purple-600 dark:text-purple-400 truncate block">{selectedBattery.battery_type}</span></div>
                  <div>Warranty: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBattery.warranty_years || 10} yrs</span></div>
                </div>
              </div>
            ) : (
              <div className="py-3 text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Grid-tied solar setup without battery storage.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBatteryModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {selectedBattery ? 'Switch Battery' : '+ Add Battery'}
            </button>
            {selectedBattery && (
              <button
                type="button"
                onClick={() => setSelectedBattery(null)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700"
                title="Remove Battery"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Array Layout & String Sizing Configuration Controls */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              Array String Configuration &amp; Environmental Factors
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust total module count and series/parallel grouping to match inverter string inputs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoOptimize}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-Optimize String Layout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Panels Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Modules:
              </label>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {totalPanels} panels ({simulation.totalArrayKwp} kWp)
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="60"
              step="1"
              value={totalPanels}
              onChange={(e) => handleTotalPanelsChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Array DC Power: {totalPanels} × {selectedPanel ? Math.round(selectedPanel.pnom_w) : 0}W
            </p>
          </div>

          {/* Series per string */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Series per String:
              </label>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {seriesPerString} in series
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={seriesPerString}
              onChange={(e) => setSeriesPerString(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Nominal Vmp: {simulation.vmpStringV}V (MPPT Window)
            </p>
          </div>

          {/* Parallel Strings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Parallel Strings:
              </label>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {parallelStrings} strings
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={parallelStrings}
              onChange={(e) => setParallelStrings(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Total Current: ~{selectedPanel ? (selectedPanel.isc_a * parallelStrings).toFixed(1) : 0}A Isc
            </p>
          </div>

          {/* Lowest Winter Temp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lowest Winter Temp:
              </label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {minTempC} °C
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="15"
              step="5"
              value={minTempC}
              onChange={(e) => setMinTempC(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-slate-400">
              NEC 690.7(A) Cold Voc: {simulation.vocColdV}V
            </p>
          </div>
        </div>

        {/* Row 2: PSH Selector + Inverter Qty + Battery Qty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
          {/* Peak Sun Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              ☀️ Peak Sun Hours / Location
            </label>
            <select
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              <optgroup label="☀️ 5.5 – 6.0+ hrs — Very High Sun">
                <option value={6.0}>6.0h — Desert, Middle East, Australia</option>
                <option value={5.5}>5.5h — SW US, Spain, South Africa</option>
              </optgroup>
              <optgroup label="🌤️ 4.5 – 5.0 hrs — High / Tropical">
                <option value={5.0}>5.0h — Latin America, India, Italy</option>
                <option value={4.5}>4.5h — SE Asia, S. China, Turkey</option>
              </optgroup>
              <optgroup label="⛅ 3.5 – 4.0 hrs — Moderate">
                <option value={4.0}>4.0h — US East, Japan, Korea</option>
                <option value={3.5}>3.5h — Central Europe (DE, FR, PL)</option>
              </optgroup>
              <optgroup label="☁️ 2.5 – 3.0 hrs — Low / Northern">
                <option value={3.0}>3.0h — UK, Netherlands, Canada</option>
                <option value={2.5}>2.5h — Scandinavia, Baltic</option>
              </optgroup>
            </select>
          </div>

          {/* Inverter Quantity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Inverter Quantity:
              </label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {inverterQuantity}x
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={inverterQuantity}
              onChange={(e) => setInverterQuantity(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Battery Quantity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Battery Quantity:
              </label>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {selectedBattery ? `${batteryQuantity}x` : 'N/A'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={batteryQuantity}
              onChange={(e) => setBatteryQuantity(Number(e.target.value))}
              className="w-full accent-purple-500"
              disabled={!selectedBattery}
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Live Compatibility & Safety Status Banner */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`rounded-3xl p-6 border transition-all ${
          simulation.status === 'safe'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60'
            : simulation.status === 'warning'
            ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
            : 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-700/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">
              {simulation.status === 'safe' && (
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {simulation.status === 'warning' && (
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              {simulation.status === 'danger' && (
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
              )}
            </div>
            <div className="space-y-1">
              <h3
                className={`text-lg sm:text-xl font-extrabold ${
                  simulation.status === 'safe'
                    ? 'text-emerald-950 dark:text-emerald-300'
                    : simulation.status === 'warning'
                    ? 'text-amber-950 dark:text-amber-300'
                    : 'text-red-950 dark:text-red-300'
                }`}
              >
                {simulation.statusTitle}
              </h3>
              <p
                className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                  simulation.status === 'safe'
                    ? 'text-emerald-800 dark:text-emerald-400'
                    : simulation.status === 'warning'
                    ? 'text-amber-800 dark:text-amber-400'
                    : 'text-red-800 dark:text-red-400'
                }`}
              >
                {simulation.statusDescription}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Safety Score
            </span>
            <span
              className={`text-3xl font-black ${
                simulation.status === 'safe'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : simulation.status === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {simulation.score}%
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. Four Key Electrical Verification Gauges */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Cold Voc Safety */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cold Voc vs Inverter Ceiling
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {simulation.vocColdV} V
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Max: {selectedInverter?.vdcmax_v || 600} V
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                simulation.vocColdV > (selectedInverter?.vdcmax_v || 600)
                  ? 'bg-red-500'
                  : simulation.vocColdV > (selectedInverter?.vdcmax_v || 600) * 0.9
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (simulation.vocColdV / (selectedInverter?.vdcmax_v || 600)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Estimated at lowest {minTempC}°C winter morning ambient.
          </p>
        </div>

        {/* Gauge 2: MPPT Operating Window */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            MPPT Operating Voltage (Vmp)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {simulation.vmpStringV} V
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {selectedInverter?.mppt_low_v || 160} ~ {selectedInverter?.mppt_high_v || 550} V
            </span>
          </div>
          {/* Status badge */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                simulation.vmpStringV < (selectedInverter?.mppt_low_v || 160) ||
                simulation.vmpStringV > (selectedInverter?.mppt_high_v || 550)
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, ((simulation.vmpStringV - (selectedInverter?.mppt_low_v || 160)) / (Math.max(1, (selectedInverter?.mppt_high_v || 550) - (selectedInverter?.mppt_low_v || 160)))) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Nominal STC operating point on inverter tracker.
          </p>
        </div>

        {/* Gauge 3: DC/AC Oversizing Ratio */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            DC / AC Capacity Sizing Ratio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {simulation.dcAcRatio} : 1.0
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              1.15~1.30 Ideal
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                simulation.dcAcRatio >= 1.1 && simulation.dcAcRatio <= 1.35
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(100, (simulation.dcAcRatio / 1.5) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {simulation.totalArrayKwp} kWp DC on {simulation.inverterTotalKw} kW Inverter.
          </p>
        </div>

        {/* Gauge 4: Energy & Roof Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Est. Annual Generation
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {simulation.estAnnualGenerationKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">kWh / year</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span>Roof Area:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {simulation.totalAreaM2} m² ({simulation.totalAreaSqFt} sq ft)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Based on {sunHours} PSH average irradiance.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 6. Itemized Engineering Checklist */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Electrical Compliance &amp; Engineering Checklist
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {simulation.checks.map((c) => (
            <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      c.severity === 'safe'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : c.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {c.severity === 'safe' && <CheckCircle2 className="w-3 h-3" />}
                    {c.severity === 'warning' && <AlertTriangle className="w-3 h-3" />}
                    {c.severity === 'danger' && <XCircle className="w-3 h-3" />}
                    {c.severity}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.message}</p>
                {c.tip && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold">💡 Recommendation: {c.tip}</p>
                )}
              </div>

              <div className="sm:text-right shrink-0 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Actual / Limit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{c.actualValue}</span>
                <span className="text-slate-400 block text-[10px]">{c.expectedLimit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setQuoteModalOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Request Pricing for this Custom DIY Configuration
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Export Engineering Spec Sheet
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Search Modal 1: Solar Panels */}
      {/* ----------------------------------------------------------------- */}
      {panelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-emerald-500" />
                Select Solar Panel (21,750+ Models)
              </h3>
              <button onClick={() => setPanelModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand or model (e.g. Trina 440W, Jinko Tiger, LONGi LR5)..."
                value={panelSearchQuery}
                onChange={(e) => setPanelSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {panelSearchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPanel(p);
                    setPanelModalOpen(false);
                  }}
                  className="py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{p.brand_name}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.model_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Voc: {p.voc_v}V</span>
                      <span>Vmp: {p.vmp_v}V</span>
                      <span>Imp: {p.imp_a}A</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{p.pnom_w} W</span>
                    <span className="text-[10px] text-slate-400 block">{p.module_efficiency_pct ? `${p.module_efficiency_pct.toFixed(1)}% Eff` : ''}</span>
                  </div>
                </div>
              ))}
              {panelSearchResults.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p className="font-semibold">No panels found matching your search.</p>
                  <p>Try a different keyword (e.g. brand name, wattage, or model).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Search Modal 2: Inverters */}
      {/* ----------------------------------------------------------------- */}
      {inverterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Select Inverter (2,343+ Models)
              </h3>
              <button onClick={() => setInverterModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand or model (e.g. Huawei SUN2000, GoodWe, SMA, Deye)..."
                value={inverterSearchQuery}
                onChange={(e) => setInverterSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {inverterSearchResults.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => {
                    setSelectedInverter(inv);
                    setInverterModalOpen(false);
                  }}
                  className="py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{inv.brand_name}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{inv.model_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Max DC: {inv.vdcmax_v}V</span>
                      <span>MPPT: {inv.mppt_low_v}~{inv.mppt_high_v}V</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">{(inv.paco_w / 1000).toFixed(1)} kW</span>
                    <span className="text-[10px] text-slate-400 block">{inv.inverter_type || 'String'}</span>
                  </div>
                </div>
              ))}
              {inverterSearchResults.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p className="font-semibold">No inverters found matching your search.</p>
                  <p>Try a different keyword (e.g. Huawei, SMA, Deye, GoodWe).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Search Modal 3: Batteries */}
      {/* ----------------------------------------------------------------- */}
      {batteryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Battery className="w-5 h-5 text-purple-500" />
                Select Battery Storage System
              </h3>
              <button onClick={() => setBatteryModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search battery model (e.g. Tesla Powerwall, BYD, Pylontech)..."
                value={batterySearchQuery}
                onChange={(e) => setBatterySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {batterySearchResults.map((bat) => (
                <div
                  key={bat.id}
                  onClick={() => {
                    setSelectedBattery(bat);
                    setBatteryModalOpen(false);
                  }}
                  className="py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{bat.brand_name}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bat.model_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{bat.battery_type}</span>
                      <span>Power: {bat.continuous_power_kw || '—'} kW</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-purple-600 dark:text-purple-400">{bat.usable_capacity_kwh} kWh</span>
                    <span className="text-[10px] text-slate-400 block">{bat.warranty_years || 10} yrs warranty</span>
                  </div>
                </div>
              ))}
              {batterySearchResults.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p className="font-semibold">No batteries found matching your search.</p>
                  <p>Try a different keyword (e.g. Tesla, BYD, Pylontech).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Lead Quote Modal */}
      {/* ----------------------------------------------------------------- */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setQuoteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            {!quoteSubmitted ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const summary = `${totalPanels}x ${selectedPanel?.brand_name} ${selectedPanel?.model_name} (${seriesPerString}S × ${parallelStrings}P) + ${inverterQuantity}x ${selectedInverter?.brand_name} ${selectedInverter?.model_name}${selectedBattery ? ` + ${batteryQuantity}x ${selectedBattery.brand_name} ${selectedBattery.model_name}` : ''}`;
                  await submitLeadInquiry({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    postalCode: formData.postalCode || undefined,
                    source: 'diy-simulator',
                    systemSummary: summary,
                    systemKwp: simulation.totalArrayKwp,
                  });
                  setQuoteSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Custom DIY Build Inquiry
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Request Pricing for {simulation.totalArrayKwp} kWp Custom Build
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get wholesale hardware quotes and certified installer review for your custom system layout.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Configuration Summary:
                  </div>
                  <div className="text-slate-500">
                    • {totalPanels}x {selectedPanel?.brand_name} {selectedPanel?.model_name} ({seriesPerString}S × {parallelStrings}P)<br />
                    • {inverterQuantity}x {selectedInverter?.brand_name} {selectedInverter?.model_name}<br />
                    {selectedBattery && `• ${batteryQuantity}x ${selectedBattery.brand_name} ${selectedBattery.model_name}`}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Installation Postal Code / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 90210 Los Angeles / Madrid / Sydney"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Custom Configuration Inquiry
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Inquiry Received Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you, {formData.name}. We have logged your {simulation.totalArrayKwp} kWp custom DIY configuration. Regional suppliers will be in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteModalOpen(false);
                    setQuoteSubmitted(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDiySimulator;
