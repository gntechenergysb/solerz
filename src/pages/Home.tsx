import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Leaf, Award, PlusCircle, ArrowRight, Users, TrendingUp, Trophy } from 'lucide-react';
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
      .select(`*, profiles!inner (id, username, display_name, avatar_url, city_region, equipment_brand, role)`)
      .order('created_at', { ascending: false })
      .limit(6);

    // Fetch today's top 5 by efficiency
    const { data: topToday } = await supabase
      .from('check_ins')
      .select(`*, profiles!inner (id, username, display_name, avatar_url, city_region, equipment_brand, role)`)
      .eq('check_in_date', today)
      .order('efficiency_kwh_per_kwp', { ascending: false })
      .limit(5);

    if (recent) setRecentCheckIns(recent as CheckIn[]);
    if (topToday) setTopRankings(topToday as CheckIn[]);
    setLoading(false);
  };

  // Aggregate stats from recent check-ins
  const totalKWh = recentCheckIns.reduce((acc, c) => acc + Number(c.kwh_generated), 0);
  const totalCO2 = (totalKWh * 0.495);
  const bestEfficiency = topRankings.length > 0 ? Number(topRankings[0]?.efficiency_kwh_per_kwp || 0) : 0;

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>全民太陽能綠電打卡與排行榜 MVP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            讓每一度太陽能綠電<br />
            都轉化為看得見的<span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">永續榮譽</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            歡迎來到 Solerz 太陽能打卡與發電效率排行榜！記錄您每日發電量與系統容量，以公平的 <strong className="text-amber-300">kWh/kWp 效率指標</strong> 與全台綠電業主一較高下。
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/checkin"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-base hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              立即太陽能打卡
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 hover:border-amber-400/50 transition-all"
            >
              <Award className="w-5 h-5 text-emerald-400" />
              查看發電排行榜
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-10 border-t border-slate-800/80 relative">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Zap className="w-4 h-4" /> 近期總發電量
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalKWh.toFixed(1)} <span className="text-xs text-slate-400">kWh</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Leaf className="w-4 h-4" /> 預估減碳貢獻
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {totalCO2.toFixed(1)} <span className="text-xs text-slate-400">kg CO₂</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Users className="w-4 h-4" /> 近期打卡數
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {recentCheckIns.length} <span className="text-xs text-slate-400">筆</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" /> 今日最佳效率
            </div>
            <div className="text-2xl font-black text-purple-300 font-mono">
              {bestEfficiency.toFixed(3)} <span className="text-xs text-slate-400">kWh/kWp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Recent Checkins + Top Rankings Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white">最新打卡紀錄</h2>
            </div>
            <Link to="/checkin" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              前往打卡 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">載入中...</div>
          ) : recentCheckIns.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              尚無打卡紀錄，成為第一位打卡的太陽能業主吧！
            </div>
          ) : (
            <div className="space-y-4">
              {recentCheckIns.map((chk) => (
                <div
                  key={chk.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-all shadow-lg hover:shadow-amber-950/10 flex flex-col sm:flex-row gap-5"
                >
                  {chk.image_url && (
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                      <img src={chk.image_url} alt="打卡照片" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                          alt={chk.profiles?.display_name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{chk.profiles?.display_name || '太陽能屋主'}</h4>
                          <span className="text-xs text-slate-400">{chk.profiles?.city_region} · {chk.system_kwp} kWp</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{chk.check_in_date}</span>
                    </div>

                    {chk.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 italic">
                        "{chk.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.kwh_generated} kWh
                        </span>
                        <span className="font-mono font-bold text-cyan-300 flex items-center gap-1">
                          ⚡ {chk.efficiency_kwh_per_kwp} kWh/kWp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Top 5 Efficiency */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">今日效率 Top 5</h2>
            </div>
            <Link to="/leaderboard" className="text-xs font-bold text-emerald-400 hover:underline">
              完整榜單
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm">載入中...</div>
            ) : topRankings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">今日尚無打卡紀錄</div>
            ) : (
              topRankings.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <img
                      src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profiles?.display_name || 'S'}`}
                      alt={item.profiles?.display_name}
                      className="w-9 h-9 rounded-full object-cover bg-slate-800"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white">{item.profiles?.display_name || '太陽能屋主'}</h5>
                      <span className="text-[10px] text-slate-400">{item.profiles?.city_region}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-300 text-sm block">
                      {item.efficiency_kwh_per_kwp} <span className="text-[10px]">kWh/kWp</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {item.kwh_generated} kWh
                    </span>
                  </div>
                </div>
              ))
            )}

            <Link
              to="/leaderboard"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 flex items-center justify-center gap-1 transition-colors text-center mt-2"
            >
              進入榮譽排行榜專頁 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
