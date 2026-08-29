import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Battery,
  Sun,
  ArrowRight,
  Calculator,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import type { SolarPanelDetail, InverterDetail, BatteryDetail } from '../types';

interface CrossProductRecommenderProps {
  sourceType: 'panel' | 'inverter' | 'battery';
  panel?: SolarPanelDetail;
  inverter?: InverterDetail;
  battery?: BatteryDetail;
}

interface InverterSnippet {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  paco_w: number;
  efficiency_pct?: number;
  inverter_type?: string;
}

interface BatterySnippet {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  usable_capacity_kwh: number;
  battery_type?: string;
  warranty_years?: number;
}

interface PanelSnippet {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct?: number;
}

export const CrossProductRecommender: React.FC<CrossProductRecommenderProps> = ({
  sourceType,
  panel,
  inverter,
  battery,
}) => {
  const [recommendedInverters, setRecommendedInverters] = useState<InverterSnippet[]>([]);
  const [recommendedBatteries, setRecommendedBatteries] = useState<BatterySnippet[]>([]);
  const [recommendedPanels, setRecommendedPanels] = useState<PanelSnippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchRecommendations() {
      try {
        if (sourceType === 'panel' && panel) {
          // Find matching residential and C&I inverters
          const targetInverterKw = (panel.pnom_w * 20) / 1000; // ~8-12kW typical array
          const [invRes, batRes] = await Promise.all([
            supabase
              .from('inverters')
              .select('id, slug, brand_name, model_name, paco_w, efficiency_pct, inverter_type')
              .eq('is_active', true)
              .gte('paco_w', Math.max(3000, (targetInverterKw * 0.6) * 1000))
              .lte('paco_w', Math.max(10000, (targetInverterKw * 1.4) * 1000))
              .order('efficiency_pct', { ascending: false, nullsFirst: false })
              .limit(3),
            supabase
              .from('batteries')
              .select('id, slug, brand_name, model_name, usable_capacity_kwh, battery_type, warranty_years')
              .eq('is_active', true)
              .order('usable_capacity_kwh', { ascending: false })
              .limit(3),
          ]);

          if (active) {
            setRecommendedInverters((invRes.data || []) as InverterSnippet[]);
            setRecommendedBatteries((batRes.data || []) as BatterySnippet[]);
          }
        } else if (sourceType === 'inverter' && inverter) {
          const [panRes, batRes] = await Promise.all([
            supabase
              .from('solar_panels')
              .select('id, slug, brand_name, model_name, pnom_w, module_efficiency_pct')
              .eq('is_active', true)
              .gte('pnom_w', 430)
              .order('module_efficiency_pct', { ascending: false, nullsFirst: false })
              .limit(3),
            supabase
              .from('batteries')
              .select('id, slug, brand_name, model_name, usable_capacity_kwh, battery_type, warranty_years')
              .eq('is_active', true)
              .limit(3),
          ]);

          if (active) {
            setRecommendedPanels((panRes.data || []) as PanelSnippet[]);
            setRecommendedBatteries((batRes.data || []) as BatterySnippet[]);
          }
        } else if (sourceType === 'battery' && battery) {
          const invRes = await supabase
            .from('inverters')
            .select('id, slug, brand_name, model_name, paco_w, efficiency_pct, inverter_type')
            .eq('is_active', true)
            .eq('is_hybrid', true)
            .limit(3);

          if (active) {
            setRecommendedInverters((invRes.data || []) as InverterSnippet[]);
          }
        }
      } catch (err) {
        console.error('Error fetching cross recommendations:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => {
      active = false;
    };
  }, [sourceType, panel?.id, inverter?.id, battery?.id]);

  return (
    <div className="space-y-6 pt-2">
      {/* ----------------------------------------------------------------- */}
      {/* Compatible Hardware Ecosystem */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Compatible Hardware Ecosystem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tier-1 certified inverters and energy storage units matched for this configuration
              </p>
            </div>
          </div>

          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 transition-colors shrink-0"
          >
            <Calculator className="w-4 h-4" />
            Simulate Complete System
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Inverters / Panels column */}
          {sourceType === 'panel' && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                Recommended Matching String Inverters
              </span>
              <div className="space-y-2">
                {recommendedInverters.map((inv) => (
                  <Link
                    key={inv.id}
                    to={`/inverters/${inv.slug}`}
                    className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 flex items-center justify-between transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {inv.brand_name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {inv.model_name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {(inv.paco_w / 1000).toFixed(1)} kW AC • {inv.efficiency_pct ? `${inv.efficiency_pct.toFixed(1)}% Eff` : '98.5%'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {sourceType === 'inverter' && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Recommended High-Efficiency Modules
              </span>
              <div className="space-y-2">
                {recommendedPanels.map((pan) => (
                  <Link
                    key={pan.id}
                    to={`/solar-panels/${pan.slug}`}
                    className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 flex items-center justify-between transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {pan.brand_name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                        {pan.model_name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {pan.pnom_w} Wp • {pan.module_efficiency_pct ? `${pan.module_efficiency_pct.toFixed(1)}% Eff` : '22.0%'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Batteries column */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-purple-500" />
              Recommended Energy Storage Units
            </span>
            <div className="space-y-2">
              {recommendedBatteries.map((bat) => (
                <Link
                  key={bat.id}
                  to={`/batteries/${bat.slug}`}
                  className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 flex items-center justify-between transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {bat.brand_name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                      {bat.model_name}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {bat.usable_capacity_kwh.toFixed(1)} kWh • {bat.battery_type || 'LiFePO4'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossProductRecommender;
