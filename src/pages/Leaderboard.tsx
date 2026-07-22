import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';
import { calculateCO2SavedKg, calculateTreesEquivalent } from '../utils/carbon';
import { TOP_INVERTER_BRANDS, TOP_PANEL_BRANDS, GLOBAL_COUNTRIES } from '../utils/equipment';
import { Trophy, Flame, Globe, Filter, ExternalLink, Leaf, ShieldCheck } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [inverterFilter, setInverterFilter] = useState<string>('All');
  const [panelFilter, setPanelFilter] = useState<string>('All');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDate, countryFilter, inverterFilter, panelFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let query = supabase
      .from('check_ins')
      .select(`
        *,
        profiles!inner (
          id, username, display_name, avatar_url, country_code, city_region, panel_brand, inverter_brand, role, is_dummy
        )
      `)
      .eq('check_in_date', selectedDate)
      .order('efficiency_kwh_per_kwp', { ascending: false });

    if (countryFilter !== 'All') {
      query = query.eq('profiles.country_code', countryFilter);
    }
    if (inverterFilter !== 'All') {
      query = query.eq('profiles.inverter_brand', inverterFilter);
    }
    if (panelFilter !== 'All') {
      query = query.eq('profiles.panel_brand', panelFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRankings(data as CheckIn[]);
    }
    setLoading(false);
  };

  const totalKwhToday = rankings.reduce((acc, curr) => acc + (Number(curr.kwh_generated) || 0), 0);
  const totalCo2SavedKg = rankings.reduce((acc, curr) => {
    return acc + calculateCO2SavedKg(curr.kwh_generated, curr.profiles?.country_code);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5"/> Global Specific Yield Arena
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Daily Solar Efficiency Leaderboard
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Normalized ranking based on Specific Yield (<span className="text-amber-400 font-semibold">kWh / kWp</span>)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 p-2 rounded-xl">
            <span className="text-xs text-slate-400 font-medium px-2">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Impact Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Today's Generation</p>
            <p className="text-xl font-black text-white mt-0.5">{totalKwhToday.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kWh</span></p>
          </div>
          <div>
            <p className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5"/> CO2 Avoided
            </p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{totalCo2SavedKg.toFixed(1)} <span className="text-xs text-emerald-600 font-normal">kg</span></p>
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Trees Offset</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{calculateTreesEquivalent(totalCo2SavedKg)} <span className="text-xs text-slate-500 font-normal">trees/yr</span></p>
          </div>
        </div>
      </div>

      {/* Worldwide Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-amber-500"/> Filter Arena:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="All">🌐 All Countries</option>
            {GLOBAL_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>

          {/* Inverter Brand Filter */}
          <select
            value={inverterFilter}
            onChange={(e) => setInverterFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="All">⚡ All Inverters</option>
            {TOP_INVERTER_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Panel Brand Filter */}
          <select
            value={panelFilter}
            onChange={(e) => setPanelFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="All">☀️ All Panels</option>
            {TOP_PANEL_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm font-medium">Recalculating Specific Yield Rankings...</div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          No check-ins found for these filters on {selectedDate}. Log today's yield first!
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((item, index) => {
            const rank = index + 1;
            const co2Saved = calculateCO2SavedKg(item.kwh_generated, item.profiles?.country_code);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${
                  rank === 1
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : rank === 3
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {item.profiles?.display_name || 'Solar Owner'}
                      </span>
                      {item.profiles?.role === 'installer' && (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3"/> PRO
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Globe className="w-3 h-3 text-slate-500"/>
                        {item.profiles?.city_region}, {item.profiles?.country_code}
                      </span>
                      <span>•</span>
                      <span>{item.profiles?.inverter_brand}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.profiles?.panel_brand}</span>
                      <span>•</span>
                      <span className="text-slate-300">{item.system_kwp} kWp</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">-{co2Saved}kg CO2</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500"/>
                      {item.efficiency_kwh_per_kwp}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {item.kwh_generated} kWh Total
                    </div>
                  </div>

                  {item.image_url && (
                    <a
                      href={item.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                      title="View Inverter App Screenshot"
                    >
                      <ExternalLink className="w-4 h-4"/>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
