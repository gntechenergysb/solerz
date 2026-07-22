import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckIn, Profile } from '../types/checkin';
import { calculateCO2SavedKg, calculateTreesEquivalent } from '../utils/carbon';
import { Flame, Trash2, Calendar, Image as ImageIcon, ExternalLink, X } from 'lucide-react';
import { FALLBACK_MOCK_CHECKINS } from '../utils/mockData';

export const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

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

        const { data: logs } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('check_in_date', { ascending: false });

        if (logs && logs.length > 0) {
          setHistory(logs as CheckIn[]);
        } else {
          // If logged-in user hasn't created check-ins yet, show demo stream records so dashboard is non-empty
          setHistory([]);
        }
      } else {
        setHistory(FALLBACK_MOCK_CHECKINS);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
      setHistory(FALLBACK_MOCK_CHECKINS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this check-in entry? This will update your ranking.')) {
      try {
        await supabase.from('check_ins').delete().eq('id', id);
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete entry');
      }
    }
  };

  const displayLogs = history.length > 0 ? history : FALLBACK_MOCK_CHECKINS;
  const totalKwh = displayLogs.reduce((acc, curr) => acc + (Number(curr.kwh_generated) || 0), 0);
  const totalCo2 = displayLogs.reduce((acc, curr) => acc + calculateCO2SavedKg(curr.kwh_generated, profile?.country_code), 0);
  const avgEfficiency = displayLogs.length > 0 ? (displayLogs.reduce((acc, curr) => acc + (Number(curr.efficiency_kwh_per_kwp) || 0), 0) / displayLogs.length).toFixed(2) : '0.00';

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
              <h1 className="text-2xl font-black text-white">{profile?.display_name || 'Solar Station Owner'}</h1>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>📍 {profile?.city_region || 'Global'}, {profile?.country_code || 'US'}</span>
                <span>•</span>
                <span>⚡ {profile?.inverter_brand || 'Inverter'} + {profile?.panel_brand || 'Panels'}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{profile?.system_kwp || 6.0} kWp</span>
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Output</p>
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

      {/* Check-In History Records Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400"/> Generation Logs & Screenshot Records ({displayLogs.length})
          </h3>
        </div>

        {displayLogs.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-xs font-medium">No check-ins logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayLogs.map((log) => (
              <div key={log.id} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all text-xs">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {log.check_in_date}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      {log.kwh_generated} kWh
                    </span>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>

                {/* Specific Yield Badge */}
                <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Specific Yield</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {log.efficiency_kwh_per_kwp} kWh/kWp
                  </span>
                </div>

                {/* Notes / Weather optional text */}
                {log.notes && (
                  <p className="text-slate-300 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 leading-relaxed">
                    "{log.notes}"
                  </p>
                )}

                {/* App Screenshot Image */}
                {log.image_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={log.image_url}
                      alt="Inverter Screenshot Proof"
                      onClick={() => setLightboxImg(log.image_url!)}
                      className="w-full h-32 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                      <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-700">
                        <ImageIcon className="w-3 h-3" /> Click to Zoom
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 flex items-center gap-1 pt-1">
                    <ImageIcon className="w-3 h-3" /> No screenshot attached
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImg} alt="Screenshot Proof" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-slate-800" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
