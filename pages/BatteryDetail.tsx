import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Battery,
  Zap,
  Shield,
  Activity,
  CircuitBoard,
  Cpu,
  Layers,
  Check,
  GitCompareArrows,
  Thermometer,
  Box,
  Scale,
  Award,
  ChevronRight,
} from 'lucide-react';
import { fetchBatteryBySlug, fetchRelatedBatteries, fetchBatteryCompetitorComparisons, type BatteryCompetitorComparison } from '../services/batteryService';
import type { BatteryDetail, BatterySummary } from '../types';
import { useCompare } from '../contexts/CompareContext';
import BatteryCard from '../components/BatteryCard';
import DatasheetSection from '../components/DatasheetSection';
import ExpertAnalysisSection from '../components/ExpertAnalysisSection';
import CrossProductRecommender from '../components/CrossProductRecommender';
import ContextualTipCard from '../components/ContextualTipCard';
import AdSlotPlaceholder from '../components/AdSlotPlaceholder';
import { generateBatteryExpertInsights, getRelatedNewsAndResourceLinks } from '../services/seoInsightsService';

/** Null-safe format: returns the value with unit, or '—' */
const fmt = (
  val: number | null | undefined,
  unit: string,
  decimals = 2
): string => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)} ${unit}`;
};

const fmtInt = (val: number | null | undefined, unit: string): string => {
  if (val == null) return '—';
  return `${Math.round(Number(val))} ${unit}`;
};

// ---------------------------------------------------------------------------
// Spec row sub-component (matching PanelDetail & InverterDetail clean 1-line style)
// ---------------------------------------------------------------------------
interface SpecRowProps {
  label: string;
  value: string;
  sub?: string;
}

const SpecRow: React.FC<SpecRowProps> = ({ label, value, sub }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">
      {label}
      {sub && (
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1 font-mono">
          ({sub})
        </span>
      )}
    </span>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
      {value}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Section Card (matching PanelDetail & InverterDetail)
// ---------------------------------------------------------------------------
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {title}
      </h2>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Detail Page
// ---------------------------------------------------------------------------
const BatteryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Check SSR initial state hydration
  const initialBattery = React.useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_BATTERY__) {
      const init = (window as any).__INITIAL_BATTERY__ as BatteryDetail;
      if (init && init.slug === slug) return init;
    }
    return null;
  }, [slug]);

  const [battery, setBattery] = useState<BatteryDetail | null>(initialBattery);
  const [related, setRelated] = useState<BatterySummary[]>([]);
  const [competitors, setCompetitors] = useState<BatteryCompetitorComparison[]>([]);
  const [loading, setLoading] = useState(!initialBattery);
  const [notFound, setNotFound] = useState(false);

  const { addBattery, removeBattery, isBatterySelected, isBatteriesFull } = useCompare();

  useEffect(() => {
    if (!slug) return;
    if (battery && battery.slug === slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    fetchBatteryBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else {
          setBattery(data);
          fetchRelatedBatteries(data, 4).then(setRelated);
          fetchBatteryCompetitorComparisons(data)
            .then(setCompetitors)
            .catch(() => setCompetitors([]));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Dynamic document title
  useEffect(() => {
    if (battery) {
      document.title = `${battery.brand_name} ${battery.model_name} (${battery.usable_capacity_kwh} kWh) Specs & Datasheet | Solerz`;
    }
  }, [battery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !battery) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
          <Battery className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Battery System Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested battery storage system model could not be found in our database.
        </p>
        <Link
          to="/batteries"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Battery Catalog
        </Link>
      </div>
    );
  }

  const isSelected = isBatterySelected(battery.id);

  const handleCompareToggle = () => {
    if (isSelected) {
      removeBattery(battery.id);
    } else if (!isBatteriesFull) {
      addBattery(battery);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/batteries" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          Batteries
        </Link>
        {battery.brand_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/brands/${encodeURIComponent(battery.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
            >
              {battery.brand_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-xs">
          {battery.model_name}
        </span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Background gradient blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg">
                {battery.brand_name}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {battery.battery_type}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {battery.coupling_type}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Verified Spec
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {battery.model_name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {battery.application_type} Energy Storage System • {battery.nominal_voltage_v}V Architecture
            </p>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCompareToggle}
              disabled={!isSelected && isBatteriesFull}
              className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-purple-600/30'
                  : isBatteriesFull
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Comparison</span>
                </>
              ) : (
                <>
                  <GitCompareArrows className="w-4 h-4" />
                  <span>Add to Compare</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Stat Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">
              Usable Capacity
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {battery.usable_capacity_kwh}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">kWh</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">
              Continuous Power
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {battery.continuous_power_kw}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">kW</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">
              Round-Trip Efficiency
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {battery.round_trip_efficiency_pct.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">RTE</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-0.5">
              Nominal DC Voltage
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {Math.round(battery.nominal_voltage_v)}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">V</span>
          </div>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Energy Capacity & Power */}
        <SectionCard icon={<Zap className="w-4 h-4 text-purple-500" />} title="Energy Capacity & Power Ratings">
          <SpecRow label="Usable Energy Storage Capacity" value={fmt(battery.usable_capacity_kwh, 'kWh', 2)} sub="E_usable" />
          <SpecRow label="Nominal Nameplate Capacity" value={fmt(battery.nominal_capacity_kwh, 'kWh', 2)} sub="E_nom" />
          <SpecRow label="Continuous Output Power" value={fmt(battery.continuous_power_kw, 'kW', 2)} sub="P_cont" />
          <SpecRow label="Peak / Surge Power Output" value={fmt(battery.peak_power_kw, 'kW', 2)} sub="P_peak (10s)" />
          <SpecRow label="System Coupling Architecture" value={battery.coupling_type} />
        </SectionCard>

        {/* Section 2: Electrical & Voltage Specifications */}
        <SectionCard icon={<CircuitBoard className="w-4 h-4 text-indigo-500" />} title="Electrical & Operating Voltage">
          <SpecRow label="Nominal Battery DC Voltage" value={fmt(battery.nominal_voltage_v, 'V', 1)} sub="V_nom" />
          <SpecRow
            label="Operating Voltage Window"
            value={
              battery.operating_voltage_min_v && battery.operating_voltage_max_v
                ? `${battery.operating_voltage_min_v}V – ${battery.operating_voltage_max_v}V`
                : '—'
            }
            sub="V_min – V_max"
          />
          <SpecRow label="Max Continuous Current" value={fmt(battery.max_continuous_current_a, 'A', 1)} sub="I_max" />
          <SpecRow label="Application Segment" value={battery.application_type} />
          <SpecRow label="Battery Chemistry" value={battery.battery_type} />
        </SectionCard>

        {/* Section 3: Efficiency, Degradation & Lifecycle */}
        <SectionCard icon={<Activity className="w-4 h-4 text-emerald-500" />} title="Efficiency, Lifecycle & Warranty">
          <SpecRow label="Round-Trip Efficiency" value={fmt(battery.round_trip_efficiency_pct, '%', 1)} sub="RTE" />
          <SpecRow label="Depth of Discharge" value={fmt(battery.depth_of_discharge_pct, '%', 0)} sub="DoD" />
          <SpecRow
            label="Rated Cycle Life"
            value={battery.cycle_life_count ? `${battery.cycle_life_count.toLocaleString()} Cycles (@ 80% EoL)` : '—'}
          />
          <SpecRow label="Product & Performance Warranty" value={fmtInt(battery.warranty_years, 'Years')} />
          <SpecRow label="Guaranteed Energy Throughput" value={fmt(battery.warranty_energy_throughput_mwh, 'MWh', 1)} />
        </SectionCard>

        {/* Section 4: Scalability, Physical & Environmental */}
        <SectionCard icon={<Layers className="w-4 h-4 text-amber-500" />} title="Scalability, Physical & Enclosure">
          <SpecRow label="Max Parallel Scaling" value={battery.max_parallel_units ? `Up to ${battery.max_parallel_units} Units` : 'Single Unit'} />
          <SpecRow label="Enclosure Protection Rating" value={battery.ip_rating || 'IP65'} sub="Ingress Rating" />
          <SpecRow
            label="Operating Temperature Range"
            value={
              battery.operating_temp_min_c != null && battery.operating_temp_max_c != null
                ? `${battery.operating_temp_min_c}°C to ${battery.operating_temp_max_c}°C`
                : '—'
            }
          />
          <SpecRow label="Net System Weight" value={fmt(battery.weight_kg, 'kg', 1)} />
          <SpecRow label="Physical Dimensions" value={battery.dimensions_mm || '—'} sub="H x W x D" />
          <SpecRow label="Safety Standards & Certs" value={battery.certifications || 'UL 9540, UL 9540A, CE'} />
        </SectionCard>
      </div>

      {/* ================================================================= */}
      {/* Official Datasheet & Technical Documents */}
      {/* ================================================================= */}
      <DatasheetSection
        category="Battery Storage"
        brandName={battery.brand_name}
        modelName={battery.model_name}
        powerOrCapacity={`${battery.usable_capacity_kwh} kWh`}
        datasheetUrl={battery.datasheet_url}
      />

      {/* Ad / Battery Storage Partner Promotion Slot */}
      <AdSlotPlaceholder
        format="horizontal"
        customText={`Compare battery storage availability, UL 9540 compliance packs & volume stock for ${battery.brand_name}.`}
      />

      {/* Contextual Pro Engineering Tip */}
      <ContextualTipCard
        category="batteries"
      />

      {/* ================================================================= */}
      {/* Expert Analysis & Engineering Review (Solerz Deep Dive) */}
      {/* ================================================================= */}
      <ExpertAnalysisSection
        insights={generateBatteryExpertInsights(battery)}
        newsLinks={getRelatedNewsAndResourceLinks(battery.brand_name, battery.model_name, 'Battery Storage')}
        category="Battery Storage"
        brandName={battery.brand_name}
        modelName={battery.model_name}
      />

      {/* ================================================================= */}
      {/* Cross-Product Hardware Recommender (Ecosystem Internal Links) */}
      {/* ================================================================= */}
      <CrossProductRecommender sourceType="battery" battery={battery} />

      {/* ================================================================= */}
      {/* Direct Competitor Head-to-Head Comparisons (Programmatic SEO) */}
      {/* ================================================================= */}
      {competitors.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-400/10 dark:text-purple-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Top Rival Comparisons
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Similar Capacity Tier
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare {battery.model_name} side-by-side with rival storage systems in the same usable capacity tier
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {competitors.map(({ competitor, compareUrl }) => {
              const capDiff = (competitor.usable_capacity_kwh - battery.usable_capacity_kwh);
              const capDiffLabel = Math.abs(capDiff) < 0.2 ? 'Exact Match' : (capDiff > 0 ? `+${capDiff.toFixed(1)}kWh` : `${capDiff.toFixed(1)}kWh`);
              
              return (
                <Link
                  key={competitor.id}
                  to={compareUrl}
                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      VS
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block truncate">
                        {competitor.brand_name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                        {competitor.model_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {competitor.usable_capacity_kwh.toFixed(1)} kWh Usable
                        </span>
                        <span>•</span>
                        <span>{competitor.continuous_power_kw ? `${competitor.continuous_power_kw}kW` : 'BESS'}</span>
                        <span>•</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${Math.abs(capDiff) < 0.2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : (capDiff > 0 ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400')}`}>
                          {capDiffLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white text-slate-700 dark:text-slate-300 transition-all">
                      Compare
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Batteries Recommendations */}
      {related.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Similar Battery Energy Storage Systems
            </h2>
            <Link
              to="/batteries"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Full Catalog →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((item) => (
              <BatteryCard key={item.id} battery={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatteryDetailPage;
