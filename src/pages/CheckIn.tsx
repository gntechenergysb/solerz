import React, { useState, useEffect } from 'react';
import { Sun, History, Zap, ExternalLink } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto space-y-8 pb-12 text-zinc-100">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium tracking-wide">
          <Sun className="w-3 h-3 text-amber-400 fill-amber-400/20" />
          <span>Daily Generation Log</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Solar Yield Check-In Station
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Log today's yield (kWh) & system capacity (kWp). Specific Yield (<span className="text-zinc-200 font-mono font-semibold">kWh/kWp</span>) is automatically updated.
        </p>
      </div>

      {/* Form */}
      <CheckInForm onSuccess={refreshCheckIns} />

      {/* Community Stream */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <History className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">Global Community Stream</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checkIns.map((chk) => (
            <div
              key={chk.id}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                    alt={chk.profiles?.display_name}
                    className="w-7 h-7 rounded-full object-cover bg-zinc-800 border border-zinc-700"
                  />
                  <div>
                    <h5 className="font-semibold text-xs text-white">{chk.profiles?.display_name || 'Solar Owner'}</h5>
                    <span className="text-[10px] text-zinc-400">{chk.profiles?.city_region}, {chk.profiles?.country_code} · {chk.system_kwp} kWp</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">{chk.check_in_date}</span>
              </div>

              {chk.image_url && (
                <div className="h-28 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                  <img src={chk.image_url} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-xs font-mono">
                <span className="text-zinc-300 font-medium">{chk.kwh_generated} kWh</span>
                <span className="text-white font-semibold">{chk.efficiency_kwh_per_kwp} kWh/kWp</span>
                {chk.image_url && (
                  <a href={chk.image_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white" title="Proof">
                    <ExternalLink className="w-3 h-3"/>
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
