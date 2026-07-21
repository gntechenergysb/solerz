import React, { useState, useEffect } from 'react';
import { Sun, Zap, TrendingUp, ShieldCheck, ExternalLink } from 'lucide-react';
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
      <div className="text-center py-20 text-zinc-100">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-500 text-xs font-medium">Loading station diagnostics...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-3 text-zinc-100">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mx-auto">
          <Sun className="w-5 h-5 fill-amber-400/20" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Station Not Authenticated</h2>
        <p className="text-zinc-400 text-xs">Sign in or create an account to view your station yield analytics and history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-zinc-100">
      {/* Profile Header */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.display_name}`}
            alt={profile.display_name}
            className="w-16 h-16 rounded-full object-cover bg-zinc-800 border border-zinc-700"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{profile.display_name}</h1>
              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded">
                {profile.role === 'installer' ? 'PRO Installer' : profile.role === 'supplier' ? 'Supplier' : 'Solar Owner'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-2 font-mono">
              <span>@{profile.username}</span>
              <span>·</span>
              <span>{profile.city_region}, {profile.country_code}</span>
              <span>·</span>
              <span className="text-zinc-200 font-semibold">{profile.system_kwp} kWp ({profile.equipment_brand})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Total Yield
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.totalKWh.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">kWh</span></div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Peak Yield
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.bestEfficiency} <span className="text-xs text-zinc-400 font-normal">kWh/kWp</span></div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" /> Avg Yield
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.avgEfficiency} <span className="text-xs text-zinc-400 font-normal">kWh/kWp</span></div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Total Logs
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.totalCheckIns} <span className="text-xs text-zinc-400 font-normal">Logs</span></div>
          </div>
        </div>
      )}

      {/* Check-in History */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-white text-sm tracking-tight">Station Generation History</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Recent {recentCheckIns.length} Logs</span>
        </div>

        {recentCheckIns.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No check-ins logged yet. Log today's yield to populate your station history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <th className="py-3 px-5 font-medium">Date</th>
                  <th className="py-3 px-5 font-medium">Daily Yield</th>
                  <th className="py-3 px-5 font-medium">Capacity</th>
                  <th className="py-3 px-5 font-medium">Specific Yield</th>
                  <th className="py-3 px-5 font-medium text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
                {recentCheckIns.map((chk) => (
                  <tr key={chk.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-5 text-zinc-300">{chk.check_in_date}</td>
                    <td className="py-3 px-5 font-semibold text-white">{chk.kwh_generated} kWh</td>
                    <td className="py-3 px-5 text-zinc-400">{chk.system_kwp} kWp</td>
                    <td className="py-3 px-5 font-semibold text-white">{chk.efficiency_kwh_per_kwp} kWh/kWp</td>
                    <td className="py-3 px-5 text-right">
                      {chk.image_url ? (
                        <a
                          href={chk.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3"/>
                        </a>
                      ) : (
                        <span className="text-zinc-600">None</span>
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
