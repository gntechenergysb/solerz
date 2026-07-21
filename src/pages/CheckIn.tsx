import React, { useState, useEffect } from 'react';
import { Sun, History, Zap, ExternalLink, Flame } from 'lucide-react';
import CheckInForm from '../components/checkin/CheckInForm';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';

export const CheckInPage: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const refreshCheckIns = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select(`*, profiles!inner (id, username, display_name, avatar_url, country_code, city_region, equipment_brand, role)`)
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) setCheckIns(data as CheckIn[]);
  };

  useEffect(() => {
    refreshCheckIns();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Daily Solar Benchmark</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Daily Solar Check-In Station
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Log your today's kWh and system size. Specific Yield (<strong className="text-amber-400">kWh/kWp</strong>) is auto-computed and live-ranked on the Global Arena.
        </p>
      </div>

      {/* Main Check-In Form Component */}
      <CheckInForm onSuccess={refreshCheckIns} />

      {/* Recent Activity Stream */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Global Community Stream</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {checkIns.map((chk) => (
            <div
              key={chk.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-amber-500/30 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                    alt={chk.profiles?.display_name}
                    className="w-8 h-8 rounded-full object-cover bg-slate-800 border border-slate-700"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-white">{chk.profiles?.display_name || 'Solar Owner'}</h5>
                    <span className="text-[10px] text-slate-400">{chk.profiles?.city_region}, {chk.profiles?.country_code} · {chk.system_kwp} kWp</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{chk.check_in_date}</span>
              </div>

              {chk.image_url && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={chk.image_url} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.kwh_generated} kWh Total
                </span>
                <span className="text-amber-400 font-black flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {chk.efficiency_kwh_per_kwp} kWh/kWp
                </span>
                {chk.image_url && (
                  <a href={chk.image_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white" title="Proof">
                    <ExternalLink className="w-3.5 h-3.5"/>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
