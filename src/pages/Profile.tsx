import React, { useState, useEffect } from 'react';
import { Sun, Zap, Award, TrendingUp, ShieldCheck, ExternalLink, Flame } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CheckIn, Profile } from '../types/checkin';

interface UserStats {
  totalKWh: number;
  totalCheckIns: number;
  avgEfficiency: number;
  bestEfficiency: number;
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
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-100">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm font-medium">Loading Solar Station Diagnostics...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4 text-slate-100">
        <Sun className="w-16 h-16 text-amber-400 fill-amber-400 mx-auto" />
        <h2 className="text-2xl font-black text-white">Station Not Authenticated</h2>
        <p className="text-slate-400 text-sm">Please sign in or create an account to view your station yield analytics and history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-slate-100">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.display_name}`}
            alt={profile.display_name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl bg-slate-800 border border-slate-700"
          />
          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {profile.role === 'installer' ? 'PRO Installer' : profile.role === 'supplier' ? 'Supplier' : 'Solar Owner'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <span>@{profile.username}</span>
              <span>•</span>
              <span>{profile.city_region}, {profile.country_code}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{profile.system_kwp} kWp ({profile.equipment_brand})</span>
            </p>
            <p className="text-xs text-slate-500">
              Registered Station · Logged {stats?.totalCheckIns || 0} times
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Lifetime Generation
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalKWh.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kWh</span></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-4 h-4" /> Peak Specific Yield
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{stats.bestEfficiency} <span className="text-xs text-slate-500 font-normal">kWh/kWp</span></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Avg Specific Yield
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">{stats.avgEfficiency} <span className="text-xs text-slate-500 font-normal">kWh/kWp</span></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Logs
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">{stats.totalCheckIns} <span className="text-xs text-slate-500 font-normal">Check-Ins</span></div>
          </div>
        </div>
      )}

      {/* Check-in History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Station Generation Log History</h3>
          </div>
          <span className="text-xs text-slate-400">Recent {recentCheckIns.length} Entries</span>
        </div>

        {recentCheckIns.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No check-ins logged yet. Go to Daily Check-In to log your first generation!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Today's Yield</th>
                  <th className="py-3.5 px-6 font-semibold">System Size</th>
                  <th className="py-3.5 px-6 font-semibold">Specific Yield</th>
                  <th className="py-3.5 px-6 font-semibold text-right">App Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentCheckIns.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-300 text-xs">{chk.check_in_date}</td>
                    <td className="py-4 px-6 font-mono font-bold text-white">{chk.kwh_generated} kWh</td>
                    <td className="py-4 px-6 font-mono text-slate-400 text-xs">{chk.system_kwp} kWp</td>
                    <td className="py-4 px-6 font-mono font-black text-amber-400">{chk.efficiency_kwh_per_kwp} kWh/kWp</td>
                    <td className="py-4 px-6 text-right">
                      {chk.image_url ? (
                        <a
                          href={chk.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
                        >
                          Proof <ExternalLink className="w-3 h-3"/>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">None</span>
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
