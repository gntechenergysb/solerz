import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';
import { Trophy, Globe, Filter, ExternalLink, ShieldCheck } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDate, countryFilter, brandFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let query = supabase
      .from('check_ins')
      .select(`
        *,
        profiles!inner (
          id, username, display_name, avatar_url, country_code, city_region, equipment_brand, role
        )
      `)
      .eq('check_in_date', selectedDate)
      .order('efficiency_kwh_per_kwp', { ascending: false });

    if (countryFilter !== 'All') {
      query = query.eq('profiles.country_code', countryFilter);
    }
    if (brandFilter !== 'All') {
      query = query.eq('profiles.equipment_brand', brandFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRankings(data as CheckIn[]);
    } else {
      console.error('Leaderboard Fetch Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-zinc-100">
      {/* Hero Header */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded-full text-[11px] font-medium tracking-wide mb-3">
              <Trophy className="w-3 h-3 text-amber-400" />
              Specific Yield Benchmarking
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Daily Solar Specific Yield Arena
            </h1>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Normalized system performance measured in <span className="text-zinc-200 font-semibold font-mono">kWh / kWp</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl">
            <span className="text-xs text-zinc-400 px-2 font-medium">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-white text-xs font-mono font-medium focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/30 border border-zinc-800/80 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-zinc-700"
          >
            <option value="All">All Countries</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="MY">Malaysia</option>
            <option value="SG">Singapore</option>
            <option value="DE">Germany</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-zinc-700"
          >
            <option value="All">All Inverter Brands</option>
            <option value="SolarEdge">SolarEdge</option>
            <option value="Enphase">Enphase</option>
            <option value="Growatt">Growatt</option>
            <option value="Huawei">Huawei</option>
            <option value="Sungrow">Sungrow</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Rows */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs font-medium">
          Calculating yield rankings...
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl text-zinc-500 text-xs">
          No check-ins logged for this date. Log your generation to claim today's rank.
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-semibold text-xs ${
                      rank === 1
                        ? 'bg-white text-zinc-950 font-bold'
                        : rank === 2
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : rank === 3
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                        : 'bg-zinc-950 text-zinc-500 border border-zinc-900'
                    }`}
                  >
                    #{rank}
                  </div>

                  {/* Profile Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {item.profiles?.display_name || 'Solar Owner'}
                      </span>
                      {item.profiles?.role === 'installer' && (
                        <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400"/> Installer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-zinc-500"/>
                        {item.profiles?.city_region}, {item.profiles?.country_code}
                      </span>
                      <span>·</span>
                      <span>{item.profiles?.equipment_brand}</span>
                      <span>·</span>
                      <span className="font-mono text-zinc-300">{item.system_kwp} kWp</span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Metric */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-semibold font-mono text-white">
                      {item.efficiency_kwh_per_kwp} <span className="text-xs text-zinc-400 font-normal">kWh/kWp</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {item.kwh_generated} kWh Total
                    </div>
                  </div>

                  {item.image_url && (
                    <a
                      href={item.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="View App Screenshot Proof"
                    >
                      <ExternalLink className="w-3.5 h-3.5"/>
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
