import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, Award, Zap, Battery, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import type { Brand } from '../types';

interface ExtendedBrand extends Brand {
  panel_count?: number;
  inverter_count?: number;
  battery_count?: number;
}

const BrandsListPage: React.FC = () => {
  const [brands, setBrands] = useState<ExtendedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState<string>('all');

  useEffect(() => {
    document.title = 'Global Solar & Energy Storage Brands Directory (437 Manufacturers) | Solerz';
    
    async function loadBrands() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('id, name, slug, tier_rating, headquarters_country, solar_panels(count), inverters(count), batteries(count)')
          .order('name', { ascending: true });

        if (!error && data) {
          const list: ExtendedBrand[] = data.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            tier_rating: b.tier_rating,
            panel_count: b.solar_panels ? b.solar_panels[0]?.count || 0 : 0,
            inverter_count: b.inverters ? b.inverters[0]?.count || 0 : 0,
            battery_count: b.batteries ? b.batteries[0]?.count || 0 : 0,
          }));
          setBrands(list);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase().trim());
      if (!matchSearch) return false;
      if (activeTier === 'tier1') return b.tier_rating === 'Tier 1' || b.name.toLowerCase().includes('jinko') || b.name.toLowerCase().includes('longi') || b.name.toLowerCase().includes('trina') || b.name.toLowerCase().includes('ja solar') || b.name.toLowerCase().includes('huawei') || b.name.toLowerCase().includes('tesla') || b.name.toLowerCase().includes('byd');
      if (activeTier === 'panels') return (b.panel_count || 0) > 0;
      if (activeTier === 'inverters') return (b.inverter_count || 0) > 0;
      if (activeTier === 'batteries') return (b.battery_count || 0) > 0;
      return true;
    });
  }, [brands, search, activeTier]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-12 text-white border border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Global Manufacturer Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Explore 437 Solar, Inverter & Storage Brands
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Browse certified photovoltaic module makers, inverter manufacturers, and battery energy storage brands. Access full datasheets, single-diode simulation parameters, and head-to-head spec comparisons.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 437 brands (e.g. Jinko, Huawei, BYD, Tesla)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm border-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Brands' },
            { id: 'panels', label: '☀️ PV Modules' },
            { id: 'inverters', label: '⚡ Inverters' },
            { id: 'batteries', label: '🔋 Batteries' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTier(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTier === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((b) => {
            const totalProducts = (b.panel_count || 0) + (b.inverter_count || 0) + (b.battery_count || 0);
            return (
              <Link
                key={b.id}
                to={`/brands/${b.slug}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {b.tier_rating === 'Tier 1' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Award className="w-3 h-3" /> Tier 1
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {b.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {(b.panel_count || 0) > 0 && <span>☀️ {b.panel_count}</span>}
                    {(b.inverter_count || 0) > 0 && <span>⚡ {b.inverter_count}</span>}
                    {(b.battery_count || 0) > 0 && <span>🔋 {b.battery_count}</span>}
                    {totalProducts === 0 && <span>Registered Brand</span>}
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-emerald-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandsListPage;
