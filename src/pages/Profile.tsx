import React, { useState, useEffect } from 'react';
import { Sun, Zap, Leaf, Award, Flame, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CheckIn, Profile } from '../types/checkin';

interface UserStats {
  totalKWh: number;
  totalCheckIns: number;
  avgEfficiency: number;
  bestEfficiency: number;
  co2SavedKg: number;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) setProfile(profileData as Profile);

    // Fetch user's check-ins
    const { data: checkInsData } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(20);

    if (checkInsData) {
      const checkins = checkInsData as CheckIn[];
      setRecentCheckIns(checkins);

      const totalKWh = checkins.reduce((acc, c) => acc + Number(c.kwh_generated), 0);
      const efficiencies = checkins.map(c => Number(c.efficiency_kwh_per_kwp));
      const avgEff = efficiencies.length > 0 ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length : 0;
      const bestEff = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;

      setStats({
        totalKWh,
        totalCheckIns: checkins.length,
        avgEfficiency: Number(avgEff.toFixed(3)),
        bestEfficiency: Number(bestEff.toFixed(3)),
        co2SavedKg: Number((totalKWh * 0.495).toFixed(1)),
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">載入個人資料中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <Sun className="w-16 h-16 text-amber-400 mx-auto" />
        <h2 className="text-2xl font-black text-white">尚未登入</h2>
        <p className="text-slate-400 text-sm">請先登入或註冊帳號以查看個人太陽能發電紀錄與成就。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.display_name}`}
            alt={profile.display_name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl bg-slate-800"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {profile.role === 'installer' ? '安裝商' : profile.role === 'supplier' ? '供應商' : '太陽能業主'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              @{profile.username} · {profile.city_region} · {profile.system_kwp} kWp · {profile.equipment_brand}
            </p>
            <p className="text-xs text-slate-500">
              已打卡 {stats?.totalCheckIns || 0} 次 · 加入時間 {new Date(profile.created_at).toLocaleDateString('zh-TW')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Zap className="w-4 h-4" /> 累積發電量
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalKWh.toFixed(1)} <span className="text-xs text-slate-400">kWh</span></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Leaf className="w-4 h-4" /> 累積減碳量
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">{stats.co2SavedKg} <span className="text-xs text-slate-400">kg CO₂</span></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <TrendingUp className="w-4 h-4" /> 平均效率
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">{stats.avgEfficiency} <span className="text-xs text-slate-400">kWh/kWp</span></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <Award className="w-4 h-4" /> 最佳效率
            </div>
            <div className="text-2xl font-black text-rose-300 font-mono">{stats.bestEfficiency} <span className="text-xs text-slate-400">kWh/kWp</span></div>
          </div>
        </div>
      )}

      {/* Recent Check-in History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">我的打卡歷程</h3>
          </div>
          <span className="text-xs text-slate-400">最近 {recentCheckIns.length} 筆</span>
        </div>

        {recentCheckIns.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            尚未開始打卡，前往打卡頁面記錄您的首次太陽能發電吧！
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-6 font-semibold">日期</th>
                  <th className="py-3 px-6 font-semibold">發電量</th>
                  <th className="py-3 px-6 font-semibold">系統容量</th>
                  <th className="py-3 px-6 font-semibold">效率</th>
                  <th className="py-3 px-6 font-semibold">減碳</th>
                  <th className="py-3 px-6 font-semibold">截圖</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentCheckIns.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-mono text-slate-300 text-xs">{chk.check_in_date}</td>
                    <td className="py-3 px-6 font-mono font-bold text-amber-300">{chk.kwh_generated} kWh</td>
                    <td className="py-3 px-6 font-mono text-slate-400 text-xs">{chk.system_kwp} kWp</td>
                    <td className="py-3 px-6 font-mono font-bold text-cyan-300">{chk.efficiency_kwh_per_kwp} kWh/kWp</td>
                    <td className="py-3 px-6 font-mono text-emerald-400 text-xs">{(Number(chk.kwh_generated) * 0.495).toFixed(1)} kg</td>
                    <td className="py-3 px-6">
                      {chk.image_url ? (
                        <img src={chk.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                      ) : (
                        <span className="text-[10px] text-slate-500">無</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
