import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckIn, Profile } from '../types/checkin';
import { calculateCO2SavedKg, calculateTreesEquivalent } from '../utils/carbon';
import { Flame, Trash2, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof) setProfile(prof as Profile);

        const { data: logs } = await supabase.from('check_ins').select('*').eq('user_id', user.id).order('check_in_date', { ascending: false });
        if (logs) setHistory(logs as CheckIn[]);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this check-in entry?')) {
      await supabase.from('check_ins').delete().eq('id', id);
      loadUserData();
    }
  };

  const totalKwh = history.reduce((acc, curr) => acc + (Number(curr.kwh_generated) || 0), 0);
  const totalCo2 = history.reduce((acc, curr) => acc + calculateCO2SavedKg(curr.kwh_generated, profile?.country_code), 0);
  const avgEfficiency = history.length > 0 ? (history.reduce((acc, curr) => acc + (Number(curr.efficiency_kwh_per_kwp) || 0), 0) / history.length).toFixed(2) : '0.00';

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading user profile & history...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Profile Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl">
              {profile?.display_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{profile?.display_name || 'Solar Owner'}</h1>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>📍 {profile?.city_region}, {profile?.country_code}</span>
                <span>•</span>
                <span>⚡ {profile?.inverter_brand} + {profile?.panel_brand}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{profile?.system_kwp} kWp</span>
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Output</p>
            <p className="text-lg font-black text-white mt-0.5">{totalKwh.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kWh</span></p>
          </div>
          <div>
            <p className="text-[10px] text-amber-400 uppercase font-semibold">Avg Yield</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">{avgEfficiency} <span className="text-xs text-slate-500 font-normal">kWh/kWp</span></p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-400 uppercase font-semibold">CO2 Offset</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{totalCo2.toFixed(1)} <span className="text-xs text-emerald-600 font-normal">kg</span></p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Trees Equivalent</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">{calculateTreesEquivalent(totalCo2)} <span className="text-xs text-slate-500 font-normal">trees</span></p>
          </div>
        </div>
      </div>

      {/* Check-In History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400"/> Your Solar Generation Logs
        </h3>

        {history.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-xs font-medium">No check-ins logged yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-300">{log.check_in_date}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 font-bold">{log.kwh_generated} kWh</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500"/>
                    {log.efficiency_kwh_per_kwp} kWh/kWp
                  </span>
                  <button onClick={() => handleDelete(log.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
