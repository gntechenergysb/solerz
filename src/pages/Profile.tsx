import React, { useState, useEffect } from 'react';
import { User, Sun, Zap, Leaf, Award, Flame, Shield, CheckCircle2 } from 'lucide-react';
import { getUserStats } from '../services/api';
import { UserStats } from '../types/leaderboard';
import { formatNumber } from '../utils/format';

export const Profile: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
          />

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">我的太陽能案場站點</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                綠電發電認證中
              </span>
            </div>
            <p className="text-xs text-slate-400">屏東萬丹 10.5 kWp 頂樓光電系統</p>
            <p className="text-xs text-slate-500">加入時間：2026 年 2 月 · 已打卡 {stats.totalCheckIns} 次</p>
          </div>

          <div className="sm:ml-auto bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center min-w-32">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">全網名次</span>
            <span className="text-3xl font-black text-amber-400 font-mono">#{stats.rank}</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Zap className="w-4 h-4" /> 累積發電量
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatNumber(stats.totalKWh)} <span className="text-xs text-slate-400">kWh</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Leaf className="w-4 h-4" /> 累積減碳量
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{formatNumber(stats.co2SavedKg)} <span className="text-xs text-slate-400">kg</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
            <Sun className="w-4 h-4" /> 相當造樹
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{stats.treesEquivalent} <span className="text-xs text-slate-400">棵</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <Flame className="w-4 h-4" /> 連續打卡
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">{stats.streakDays} <span className="text-xs text-slate-400">天</span></div>
        </div>
      </div>

      {/* Badges Collection Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">成就徽章館</h3>
          </div>
          <span className="text-xs text-slate-400">已解鎖 {stats.badgesCount} 面徽章</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { name: '太陽能先鋒', icon: '☀️', desc: '完成首次發電打卡', unlocked: true },
            { name: '綠電百大王', icon: '⚡', desc: '累積發電量突破 100 度', unlocked: true },
            { name: '減碳英雄', icon: '🌿', desc: '成功減碳超過 50 kg CO₂', unlocked: true },
            { name: '日光無間斷', icon: '🔥', desc: '連續發電打卡達 7 天', unlocked: true },
            { name: '農電合作家', icon: '🌾', desc: '註冊首座農電共生站點', unlocked: true },
            { name: '綠能千度皇', icon: '👑', desc: '累積發電突破 1,000 度', unlocked: false }
          ].map((b, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                b.unlocked
                  ? 'bg-slate-950/80 border-amber-500/30'
                  : 'bg-slate-950/30 border-slate-800 opacity-50 grayscale'
              }`}
            >
              <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                {b.icon}
              </span>
              <div>
                <h4 className="font-bold text-xs text-white">{b.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.desc}</p>
                <span className="text-[9px] text-emerald-400 font-semibold mt-1 inline-block">
                  {b.unlocked ? '✓ 已解鎖' : '未解鎖'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
