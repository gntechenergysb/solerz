import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sun,
  Battery,
  DollarSign,
  Layers,
  Ruler,
  TrendingUp,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Printer,
  Sparkles,
  Home,
  Building2,
  HelpCircle,
  Mail,
  Send,
  X,
} from 'lucide-react';
import {
  calculateSystemSizing,
  fetchRecommendedHardware,
  type SizingInputs,
  type SizingResults,
  type MatchedHardwareSet,
} from '../services/calculatorService';
import CustomDiySimulator from '../components/CustomDiySimulator';
import ContextualTipCard from '../components/ContextualTipCard';
import { submitLeadInquiry } from '../services/leadService';

const SolarCalculatorPage: React.FC = () => {
  // --- Mode State (Auto-Sizer vs Custom DIY Simulator) ---
  const [calculatorMode, setCalculatorMode] = useState<'auto-sizer' | 'diy-simulator'>('auto-sizer');

  // --- Inputs state ---
  const [systemType, setSystemType] = useState<'residential' | 'commercial'>('residential');
  const [monthlyBill, setMonthlyBill] = useState<number>(250);
  const [inputMode, setInputMode] = useState<'bill' | 'kwh'>('bill');
  const [monthlyKwhInput, setMonthlyKwhInput] = useState<number>(1400);
  const [tariffRate, setTariffRate] = useState<number>(0.18);
  const [sunHours, setSunHours] = useState<number>(4.5);
  const [includeBattery, setIncludeBattery] = useState<boolean>(false);
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // --- Hardware solutions & loading ---
  const [solutions, setSolutions] = useState<MatchedHardwareSet[]>([]);
  const [loadingHardware, setLoadingHardware] = useState<boolean>(true);

  // --- Quote Modal state ---
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', postalCode: '', comments: '' });

  // Update defaults when switching residential / commercial
  const handleSystemTypeChange = (type: 'residential' | 'commercial') => {
    setSystemType(type);
    if (type === 'commercial' && monthlyBill < 800) {
      setMonthlyBill(2000);
      setMonthlyKwhInput(11000);
    } else if (type === 'residential' && monthlyBill > 800) {
      setMonthlyBill(250);
      setMonthlyKwhInput(1400);
    }
  };

  // Sizing inputs memo
  const inputs: SizingInputs = useMemo(
    () => ({
      monthlyBill,
      tariffRate,
      monthlyKwh: inputMode === 'kwh' ? monthlyKwhInput : undefined,
      sunHours,
      systemType,
      includeBattery,
      batteryHours: 12,
    }),
    [monthlyBill, tariffRate, inputMode, monthlyKwhInput, sunHours, systemType, includeBattery]
  );

  // Calculate sizing
  const sizing: SizingResults = useMemo(() => calculateSystemSizing(inputs), [inputs]);

  // Fetch recommended hardware from Supabase when sizing changes
  useEffect(() => {
    let active = true;
    setLoadingHardware(true);

    fetchRecommendedHardware(sizing, inputs)
      .then((data) => {
        if (active) {
          setSolutions(data);
          setActiveSolutionIdx(0);
          setLoadingHardware(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load solutions:', err);
        if (active) setLoadingHardware(false);
      });

    return () => {
      active = false;
    };
  }, [sizing.targetKwp, systemType, includeBattery]);

  const activeSolution = solutions[activeSolutionIdx] || solutions[0];

  const handlePrint = () => {
    window.print();
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const summary = activeSolution
      ? `${activeSolution.panelCount}x ${activeSolution.panel?.brand_name} ${activeSolution.panel?.model_name} (${activeSolution.panel?.pnom_w}W) + ${activeSolution.inverter?.brand_name} ${activeSolution.inverter?.model_name}${activeSolution.battery ? ` + ${activeSolution.batteryCount}x ${activeSolution.battery.brand_name} ${activeSolution.battery.model_name}` : ''}`
      : `${sizing.targetKwp} kWp system`;
    await submitLeadInquiry({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      postalCode: formData.postalCode || undefined,
      comments: formData.comments || undefined,
      source: 'auto-sizer',
      systemSummary: summary,
      systemKwp: sizing.targetKwp,
    });
    setQuoteSubmitted(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Hero Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Intelligent PV System Sizer &amp; Hardware Matcher
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Solar System Sizer &amp;{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Hardware Matcher
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Calculate your optimal photovoltaic system capacity based on your electricity consumption and automatically match top-tier certified solar panels, inverters, and battery storage from our 24,000+ hardware database.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Mode Switcher Tabs */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner gap-2">
          <button
            type="button"
            onClick={() => setCalculatorMode('auto-sizer')}
            className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              calculatorMode === 'auto-sizer'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Smart Auto-Sizer (By Bill / Usage)
          </button>
          <button
            type="button"
            onClick={() => setCalculatorMode('diy-simulator')}
            className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              calculatorMode === 'diy-simulator'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-500" />
            Custom DIY Builder &amp; Safety Simulator
          </button>
        </div>
      </div>

      {calculatorMode === 'diy-simulator' ? (
        <CustomDiySimulator />
      ) : (
        <>
          {/* ----------------------------------------------------------------- */}
          {/* 2. Interactive Input Panel */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Core Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* System Type Selector (Residential vs Commercial) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                System Scope:
              </span>
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleSystemTypeChange('residential')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    systemType === 'residential'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Residential Home
                </button>
                <button
                  type="button"
                  onClick={() => handleSystemTypeChange('commercial')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    systemType === 'commercial'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Commercial &amp; Industrial (C&amp;I)
                </button>
              </div>
            </div>

            {/* Bill / kWh input section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  {inputMode === 'bill' ? 'Average Monthly Electricity Bill' : 'Monthly Electricity Usage (kWh)'}
                </label>
                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'bill' ? 'kwh' : 'bill')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Switch to {inputMode === 'bill' ? 'kWh Input' : 'Currency ($) Input'}
                </button>
              </div>

              {inputMode === 'bill' ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="20"
                        max={systemType === 'commercial' ? '50000' : '3000'}
                        step="10"
                        value={monthlyBill}
                        onChange={(e) => setMonthlyBill(Math.max(10, Number(e.target.value)))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {(systemType === 'residential'
                      ? [100, 180, 250, 380, 500]
                      : [1000, 2500, 5000, 10000, 20000]
                    ).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMonthlyBill(val)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          monthlyBill === val
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        ${val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="100"
                    max="200000"
                    step="50"
                    value={monthlyKwhInput}
                    onChange={(e) => setMonthlyKwhInput(Math.max(50, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    kWh / month
                  </span>
                </div>
              )}
            </div>

            {/* Sun Hours & Battery Toggle Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Sun hours selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Peak Sun Hours (PSH) / Location
                </label>
                <select
                  value={sunHours}
                  onChange={(e) => setSunHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  <optgroup label="☀️ 5.5 – 6.0+ hrs/day — Very High Sun">
                    <option value={6.0}>6.0 hrs — Middle East, UAE, Saudi, Australia (WA/QLD), Desert SW US</option>
                    <option value={5.5}>5.5 hrs — Southwest US (TX, AZ, SoCal), Spain, Portugal, South Africa</option>
                  </optgroup>
                  <optgroup label="🌤️ 4.5 – 5.0 hrs/day — High / Tropical Sun">
                    <option value={5.0}>5.0 hrs — Latin America (Mexico, Brazil), India, US (Florida, CA), Italy, Greece</option>
                    <option value={4.5}>4.5 hrs — SE Asia (Malaysia, SG, TH, PH, VN, ID), Southern China, Turkey</option>
                  </optgroup>
                  <optgroup label="⛅ 3.5 – 4.0 hrs/day — Moderate / Temperate Sun">
                    <option value={4.0}>4.0 hrs — US (NY, PA, Midwest), Japan, South Korea, Taiwan, Central China</option>
                    <option value={3.5}>3.5 hrs — Central Europe (France, Germany, Poland, Switzerland, Austria)</option>
                  </optgroup>
                  <optgroup label="☁️ 2.5 – 3.0 hrs/day — Low / Northern Sun">
                    <option value={3.0}>3.0 hrs — UK, Ireland, Netherlands, Belgium, Northern US, Canada</option>
                    <option value={2.5}>2.5 hrs — Scandinavia (Sweden, Norway, Finland), Baltic, Scotland</option>
                  </optgroup>
                </select>
              </div>

              {/* Battery Storage Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-purple-500" />
                  Battery Energy Storage
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeBattery(!includeBattery)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    includeBattery
                      ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{includeBattery ? 'Solar + Battery Backup' : 'Grid-Tied Solar Only'}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      includeBattery ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-400'
                    }`}
                  >
                    {includeBattery && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings (Tariff & Derate)'}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Electricity Rate ($/kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="1.50"
                      value={tariffRate}
                      onChange={(e) => setTariffRate(Math.max(0.01, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Custom Sun Hours
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.5"
                      max="7.5"
                      value={sunHours}
                      onChange={(e) => setSunHours(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sizing Summary Dashboard */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden border border-slate-800">
            {/* Background ambient gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Recommended System Capacity
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {sizing.targetKwp}
                  </span>
                  <span className="text-xl font-bold text-emerald-400">kWp DC</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Covers ~100% of your {sizing.monthlyKwhNeeded.toLocaleString()} kWh/mo consumption
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Est. Annual Output
                  </span>
                  <span className="text-lg font-extrabold text-white mt-1 block">
                    {sizing.annualGenerationKwh.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">kWh/yr</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    Roof Area Needed
                  </span>
                  <span className="text-lg font-extrabold text-white mt-1 block">
                    {activeSolution ? activeSolution.requiredAreaM2 : Math.round(sizing.targetKwp * 4.8)}{' '}
                    <span className="text-xs font-normal text-slate-400">m²</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    25-Yr Savings
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                    ${sizing.est25YearSavings.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-teal-400" />
                    CO₂ Avoided
                  </span>
                  <span className="text-lg font-extrabold text-teal-400 mt-1 block">
                    {sizing.co2OffsetTonsPerYear}{' '}
                    <span className="text-xs font-normal text-slate-400">tons/yr</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="relative z-10 pt-5 mt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <Mail className="w-4 h-4" />
                Request Equipment Quote
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
                title="Print Sizing Sheet"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Auto-Matched Hardware Packages (Tabs & Live Cards) */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-500" />
              Auto-Matched Certified Hardware Configurations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Matched from our database of 21,750+ CEC certified modules and Tier-1 inverters
            </p>
          </div>

          {/* Solution Tabs */}
          {solutions.length > 0 && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 overflow-x-auto">
              {solutions.map((sol, idx) => (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => setActiveSolutionIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeSolutionIdx === idx
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {sol.tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loadingHardware && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <Calculator className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Auto-matching certified modules &amp; inverters...
            </p>
          </div>
        )}

        {/* Selected Package Hardware Grid */}
        {!loadingHardware && activeSolution && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  {activeSolution.title}
                </span>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  {activeSolution.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <span>DC/AC Ratio: {activeSolution.dcAcRatio}</span>
                <span>•</span>
                <span>Array: {activeSolution.totalArrayKwp} kWp</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Solar Panels Card */}
              {activeSolution.panel && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        <Zap className="w-3 h-3" />
                        Solar Modules ({activeSolution.panelCount}x)
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {activeSolution.totalArrayKwp} kWp Total
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {activeSolution.panel.brand_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {activeSolution.panel.model_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Per Module Power</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activeSolution.panel.pnom_w} W
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Efficiency</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {activeSolution.panel.module_efficiency_pct
                            ? `${activeSolution.panel.module_efficiency_pct.toFixed(1)}%`
                            : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Dimensions</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSolution.panel.length_m && activeSolution.panel.width_m
                            ? `${activeSolution.panel.length_m}m × ${activeSolution.panel.width_m}m`
                            : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Array Area</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSolution.requiredAreaM2} m² ({activeSolution.requiredAreaSqFt} sq ft)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/solar-panels/${activeSolution.panel.slug}`}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      target="_blank"
                    >
                      Technical Specs <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      to="/solar-panels"
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    >
                      Swap Panel
                    </Link>
                  </div>
                </div>
              )}

              {/* 2. Inverter Card */}
              {activeSolution.inverter && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        <Zap className="w-3 h-3" />
                        Inverter ({activeSolution.inverterCount}x)
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {((activeSolution.inverter.paco_w * activeSolution.inverterCount) / 1000).toFixed(1)} kW AC
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {activeSolution.inverter.brand_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {activeSolution.inverter.model_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rated AC Power</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {(activeSolution.inverter.paco_w / 1000).toFixed(1)} kW
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Peak Efficiency</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {activeSolution.inverter.efficiency_pct ? `${activeSolution.inverter.efficiency_pct.toFixed(1)}%` : '98.5%'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Max DC Input</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSolution.inverter.vdcmax_v ? `${activeSolution.inverter.vdcmax_v} V` : '600V / 1000V'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Warranty</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSolution.inverter.warranty_years ? `${activeSolution.inverter.warranty_years} yrs` : '10 yrs'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/inverters/${activeSolution.inverter.slug}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      target="_blank"
                    >
                      Inverter Datasheet <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      to="/inverters"
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    >
                      Swap Inverter
                    </Link>
                  </div>
                </div>
              )}

              {/* 3. Battery Storage Card (If selected) */}
              {activeSolution.battery ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                        <Battery className="w-3 h-3" />
                        Storage Battery ({activeSolution.batteryCount}x)
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {(activeSolution.battery.usable_capacity_kwh * activeSolution.batteryCount).toFixed(1)} kWh Total
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {activeSolution.battery.brand_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {activeSolution.battery.model_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Usable Energy</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activeSolution.battery.usable_capacity_kwh} kWh
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Technology</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {activeSolution.battery.battery_type || 'LiFePO4'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Backup Duration</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          ~12–18 Hours
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cycle Warranty</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSolution.battery.warranty_years ? `${activeSolution.battery.warranty_years} yrs` : '10 yrs'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/batteries/${activeSolution.battery.slug}`}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                      target="_blank"
                    >
                      Battery Specs <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      to="/batteries"
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    >
                      Swap Battery
                    </Link>
                  </div>
                </div>
              ) : (
                /* Battery Add Promo card */
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 flex flex-col justify-between items-center text-center">
                  <div className="my-auto space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                      <Battery className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Add Energy Storage Backup
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      Store surplus daytime generation for nighttime consumption and outage resilience.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeBattery(true)}
                    className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
                  >
                    + Add Battery Storage Option
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Professional Engineering Spec Breakdown */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Technical Sizing &amp; Compliance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Array Architecture
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {activeSolution?.panelCount || 0} Modules × {activeSolution?.panel?.pnom_w || 0} Wp
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Estimated 2–4 MPPT strings with operating voltage well within standard inverter window (180V ~ 550V DC).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              DC / AC Sizing Ratio
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {activeSolution?.dcAcRatio || 1.20} : 1.0 (Optimal)
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Standard 1.15 ~ 1.25 oversizing ratio delivers maximum inverter utilization during shoulder hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Lifetime Warranty Protection
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              25–30 Years Linear Power
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              CEC-verified Tier-1 components guaranteed to maintain at least 85% of initial power at Year 25.
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Pro Engineering Tip */}
      <ContextualTipCard category="sizing" />
    </>
  )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. Request Quote Modal */}
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
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Hardware Package Inquiry
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Request Pricing for {sizing.targetKwp} kWp System
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect with verified regional distributors and EPCs for wholesale hardware pricing and turnkey installation.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Selected Package: {activeSolution?.title}
                  </div>
                  <div className="text-slate-500">
                    {activeSolution?.panelCount}x {activeSolution?.panel?.brand_name} {activeSolution?.panel?.pnom_w}W +{' '}
                    {activeSolution?.inverter?.brand_name} {activeSolution?.inverter?.paco_w ? `${activeSolution.inverter.paco_w / 1000}kW` : ''}
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
                  Submit Inquiry for Wholesale Pricing
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
                  Thank you, {formData.name}. We have logged your {sizing.targetKwp} kWp hardware sizing configuration. Regional suppliers will be in touch shortly.
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

export default SolarCalculatorPage;
