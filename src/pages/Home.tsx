import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Trophy, PlusCircle, ArrowRight, Flame, Globe, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';

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

    // Fetch recent check-ins (latest 6)
    const { data: recent } = await supabase
      .from('check_ins')
      .select(`*, profiles!inner (id, username, display_name, avatar_url, country_code, city_region, equipment_brand, role)`)
      .order('created_at', { ascending: false })
      .limit(6);

    // Fetch today's top 5 by efficiency
    const { data: topToday } = await supabase
      .from('check_ins')
      .select(`*, profiles!inner (id, username, display_name, avatar_url, country_code, city_region, equipment_brand, role)`)
      .eq('check_in_date', today)
      .order('efficiency_kwh_per_kwp', { ascending: false })
      .limit(5);

    if (recent) setRecentCheckIns(recent as CheckIn[]);
    if (topToday) setTopRankings(topToday as CheckIn[]);
    setLoading(false);
  };

  // Aggregate stats
  const totalKWh = recentCheckIns.reduce((acc, c) => acc + Number(c.kwh_generated), 0);
  const bestEfficiency = topRankings.length > 0 ? Number(topRankings[0]?.efficiency_kwh_per_kwp || 0) : 0;

  return (
    <div className="space-y-12 pb-12 text-slate-100">
      {/* Hero Section - Linear / Strava Style */}
      <section className="relative rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>The Global Arena for Solar Owners</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Benchmark Your Solar Yield.<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
              Compete on Specific Yield.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Solerz is the Strava for solar system owners in the US, EU, and worldwide. Log your daily kWh, compare normalized Specific Yield (<strong className="text-amber-400 font-semibold">kWh / kWp</strong>), and showcase your system performance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/checkin"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Log Generation
            </Link>

            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:border-amber-500/50 transition-all tracking-wide"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Explore Arena Leaderboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-10 border-t border-slate-800 relative">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" /> Recent Total Yield
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalKWh.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kWh</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" /> Peak Specific Yield
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {bestEfficiency.toFixed(3)} <span className="text-xs text-slate-500 font-normal">kWh/kWp</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Recent Check-Ins
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {recentCheckIns.length} <span className="text-xs text-slate-500 font-normal">Logs</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Globe className="w-3.5 h-3.5" /> Benchmark Standard
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              kWh / kWp
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Recent Feed, Right Top Arena Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Arena Feed</h2>
            </div>
            <Link to="/checkin" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              Log Generation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm font-medium">Loading live feed...</div>
          ) : recentCheckIns.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              No recent solar check-ins logged yet. Be the first to check in!
            </div>
          ) : (
            <div className="space-y-4">
              {recentCheckIns.map((chk) => (
                <div
                  key={chk.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-all shadow-xl flex flex-col sm:flex-row gap-5"
                >
                  {chk.image_url && (
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                      <img src={chk.image_url} alt="Proof" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                          alt={chk.profiles?.display_name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{chk.profiles?.display_name || 'Solar Owner'}</h4>
                          <span className="text-xs text-slate-400">
                            {chk.profiles?.city_region}, {chk.profiles?.country_code} · {chk.system_kwp} kWp ({chk.profiles?.equipment_brand})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{chk.check_in_date}</span>
                    </div>

                    {chk.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 italic">
                        "{chk.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.kwh_generated} kWh Total
                        </span>
                        <span className="font-mono font-black text-amber-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {chk.efficiency_kwh_per_kwp} kWh/kWp
                        </span>
                      </div>

                      {chk.image_url && (
                        <a
                          href={chk.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
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

        {/* Right: Today's Top 5 Specific Yield */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Today's Leaders</h2>
            </div>
            <Link to="/leaderboard" className="text-xs font-bold text-amber-400 hover:underline">
              Full Arena
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm font-medium">Loading rankings...</div>
            ) : topRankings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No check-ins logged for today yet</div>
            ) : (
              topRankings.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img
                      src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profiles?.display_name || 'S'}`}
                      alt={item.profiles?.display_name}
                      className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white">{item.profiles?.display_name || 'Solar Owner'}</h5>
                      <span className="text-[10px] text-slate-400">{item.profiles?.city_region}, {item.profiles?.country_code}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-amber-400 text-sm block">
                      {item.efficiency_kwh_per_kwp} <span className="text-[10px] text-slate-500 font-normal">kWh/kWp</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.kwh_generated} kWh
                    </span>
                  </div>
                </div>
              ))
            )}

            <Link
              to="/leaderboard"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-amber-400 flex items-center justify-center gap-1 transition-colors text-center mt-2 uppercase tracking-wider"
            >
              Enter Global Arena <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
