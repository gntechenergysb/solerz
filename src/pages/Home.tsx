import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Leaf, Award, PlusCircle, ArrowRight, Shield, Globe, Users, TrendingUp } from 'lucide-react';
import { getCheckIns, getLeaderboard } from '../services/api';
import { CheckInRecord } from '../types/checkin';
import { LeaderboardEntry } from '../types/leaderboard';
import { formatNumber, getWeatherLabel } from '../utils/format';

export const Home: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setCheckIns(getCheckIns());
    setLeaderboard(getLeaderboard('weekly'));
  }, []);

  const totalGridKWh = checkIns.reduce((acc, c) => acc + c.dailyKWh, 0);
  const totalCO2Saved = checkIns.reduce((acc, c) => acc + c.co2SavedKg, 0);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow Spheres */}
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
            歡迎來到 Solerz 太陽能打卡與發電排行榜！記錄您的屋頂光電與太陽能案場每日發電數據，即時試算減碳量，與全台綠電業主一同登上榮譽排行榜。
          </p>

          {/* Action CTAs */}
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

        {/* Global Impact Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-10 border-t border-slate-800/80 relative">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Zap className="w-4 h-4" /> 總記錄發電量
            </div>
            <div className="text-2xl font-black text-white font-mono">{formatNumber(totalGridKWh)} <span className="text-xs text-slate-400">kWh</span></div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Leaf className="w-4 h-4" /> 總減碳貢獻
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">{formatNumber(totalCO2Saved)} <span className="text-xs text-slate-400">kg</span></div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Users className="w-4 h-4" /> 綠電參與案場
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">{checkIns.length * 3 + 12} <span className="text-xs text-slate-400">座</span></div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" /> 最佳光電效率
            </div>
            <div className="text-2xl font-black text-purple-300 font-mono">5.2 <span className="text-xs text-slate-400">kWh/kWp</span></div>
          </div>
        </div>
      </section>

      {/* Grid Layout: Left Live Check-in Feed, Right Leaderboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Live Solar Check-In Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white">最新太陽能打卡紀錄</h2>
            </div>
            <Link to="/checkin" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              前往打卡頁面 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {checkIns.map((chk) => (
              <div
                key={chk.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-all shadow-lg hover:shadow-amber-950/10 flex flex-col sm:flex-row gap-5"
              >
                {/* Photo Thumbnail */}
                {chk.photoUrl && (
                  <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    <img src={chk.photoUrl} alt={chk.systemName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={chk.userAvatar} alt={chk.userName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{chk.userName}</h4>
                        <span className="text-xs text-slate-400">{chk.systemName} · {chk.capacitykWp} kWp</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{chk.checkInDate} {chk.checkInTime}</span>
                      <span className="text-[11px] text-amber-400 font-medium">
                        {getWeatherLabel(chk.weather).text}
                      </span>
                    </div>
                  </div>

                  {chk.note && (
                    <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 italic">
                      “{chk.note}”
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.dailyKWh} kWh
                      </span>
                      <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" /> -{chk.co2SavedKg} kg CO₂
                      </span>
                    </div>

                    <span className="text-slate-400">{chk.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard Preview Widget */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">本週發電 Top 5</h2>
            </div>
            <Link to="/leaderboard" className="text-xs font-bold text-emerald-400 hover:underline">
              完整榜單
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            {leaderboard.slice(0, 5).map((item) => (
              <div
                key={item.userId}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                    item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                    item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                    item.rank === 3 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.rank}
                  </span>

                  <img src={item.userAvatar} alt={item.userName} className="w-9 h-9 rounded-full object-cover" />

                  <div>
                    <h5 className="font-bold text-xs text-white">{item.userName}</h5>
                    <span className="text-[10px] text-slate-400">{item.solarSystemName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-amber-300 text-sm block">
                    {formatNumber(item.totalKWh)} <span className="text-[10px]">kWh</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    -{formatNumber(item.co2SavedKg)} kg
                  </span>
                </div>
              </div>
            ))}

            <Link
              to="/leaderboard"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-amber-300 flex items-center justify-center gap-1 transition-colors block text-center mt-2"
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
