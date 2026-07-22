import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Trophy, Plus, ArrowRight, Activity, Globe, ShieldCheck, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';import { FALLBACK_MOCK_CHECKINS } from '../utils/mockData';

export const Home: React.FC = () => {
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [topRankings, setTopRankings] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    try {
      // Fetch recent check-ins (latest 6)
      const { data: recent } = await supabase
        .from('check_ins')
        .select(`*, profiles!inner (id, username, display_name, avatar_url, country_code, city_region, panel_brand, inverter_brand, role)`)
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch today's top 5 by efficiency
      const { data: topToday } = await supabase
        .from('check_ins')
        .select(`*, profiles!inner (id, username, display_name, avatar_url, country_code, city_region, panel_brand, inverter_brand, role)`)
        .eq('check_in_date', today)
        .order('efficiency_kwh_per_kwp', { ascending: false })
        .limit(5);

      if (recent && recent.length > 0) {
        setRecentCheckIns(recent as CheckIn[]);
      } else {
        setRecentCheckIns(FALLBACK_MOCK_CHECKINS.slice(0, 6));
      }

      if (topToday && topToday.length > 0) {
        setTopRankings(topToday as CheckIn[]);
      } else {
        setTopRankings(FALLBACK_MOCK_CHECKINS.slice(0, 5));
      }
    } catch (err) {
      console.warn('Home data fetch warning, using fallback arena data:', err);
      setRecentCheckIns(FALLBACK_MOCK_CHECKINS.slice(0, 6));
      setTopRankings(FALLBACK_MOCK_CHECKINS.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalKWh = recentCheckIns.reduce((acc, c) => acc + Number(c.kwh_generated), 0);
  const bestEfficiency = topRankings.length > 0 ? Number(topRankings[0]?.efficiency_kwh_per_kwp || 0) : 0;

  return (
    <div className="space-y-10 pb-12 text-zinc-100">
      {/* Hero Section - Vercel / Minimalist Style */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 p-8 sm:p-12 rounded-2xl shadow-sm space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium tracking-wide">
            <Sun className="w-3 h-3 text-amber-400 fill-amber-400/20" />
            <span>Global Solar Yield Benchmark</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Benchmark Your Solar Yield.<br />
            Compare Normalized Specific Yield.
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Solerz provides a minimalist platform for solar system owners worldwide to log daily kWh generation and compare normalized Specific Yield (<strong className="text-zinc-200 font-semibold font-mono">kWh / kWp</strong>) across regions and inverter brands.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/checkin"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Log Generation
            </Link>

            <Link
              to="/leaderboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 text-zinc-200 font-semibold text-xs border border-zinc-800 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-zinc-400" />
              View Leaderboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-amber-400" /> Total Logged Yield
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {totalKWh.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">kWh</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Today's Peak Yield
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {bestEfficiency.toFixed(3)} <span className="text-xs text-zinc-400 font-normal">kWh/kWp</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3 text-zinc-400" /> Recent Entries
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {recentCheckIns.length} <span className="text-xs text-zinc-400 font-normal">Logs</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-1">
              <Globe className="w-3 h-3 text-zinc-400" /> Metric Formula
            </div>
            <div className="text-xl font-bold text-white font-mono">
              kWh / kWp
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Recent Generation Stream</h2>
            </div>
            <Link to="/checkin" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-medium">
              Log Generation <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-medium">Loading live feed...</div>
          ) : recentCheckIns.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/80 rounded-xl text-zinc-500 text-xs">
              No recent check-ins logged. Be the first to submit today's yield!
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckIns.map((chk) => (
                <div
                  key={chk.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 transition-colors flex flex-col sm:flex-row gap-4"
                >
                  {chk.image_url && (
                    <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950">
                      <img src={chk.image_url} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                          alt={chk.profiles?.display_name}
                          className="w-8 h-8 rounded-full object-cover bg-zinc-800 border border-zinc-700"
                        />
                        <div>
                          <h4 className="font-semibold text-white text-xs">{chk.profiles?.display_name || 'Solar Owner'}</h4>
                          <span className="text-[11px] text-zinc-400">
                            {chk.profiles?.city_region}, {chk.profiles?.country_code} · {chk.system_kwp} kWp ({chk.profiles?.inverter_brand})
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">{chk.check_in_date}</span>
                    </div>

                    {chk.notes && (
                      <p className="text-xs text-zinc-300 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 italic">
                        "{chk.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-zinc-300 font-semibold">{chk.kwh_generated} kWh</span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-white font-semibold">{chk.efficiency_kwh_per_kwp} kWh/kWp</span>
                      </div>

                      {chk.image_url && (
                        <a
                          href={chk.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                        >
                          Proof <ExternalLink className="w-3 h-3"/>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Leaders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Today's Leaders</h2>
            </div>
            <Link to="/leaderboard" className="text-xs text-zinc-400 hover:text-white font-medium">
              Full Arena
            </Link>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            {loading ? (
              <div className="text-center py-6 text-zinc-500 text-xs font-medium">Loading rankings...</div>
            ) : topRankings.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">No check-ins logged for today yet</div>
            ) : (
              topRankings.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-mono font-semibold text-xs ${
                      idx === 0 ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img
                      src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profiles?.display_name || 'S'}`}
                      alt={item.profiles?.display_name}
                      className="w-7 h-7 rounded-full object-cover bg-zinc-800 border border-zinc-700"
                    />
                    <div>
                      <h5 className="font-semibold text-xs text-white">{item.profiles?.display_name || 'Solar Owner'}</h5>
                      <span className="text-[10px] text-zinc-400">{item.profiles?.city_region}, {item.profiles?.country_code}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-semibold text-white text-xs block">
                      {item.efficiency_kwh_per_kwp} <span className="text-[10px] text-zinc-400 font-normal">kWh/kWp</span>
                    </span>
                  </div>
                </div>
              ))
            )}

            <Link
              to="/leaderboard"
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-xs font-medium text-zinc-300 rounded-lg flex items-center justify-center gap-1 transition-colors text-center mt-2 border border-zinc-800"
            >
              Full Leaderboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
