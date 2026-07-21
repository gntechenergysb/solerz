import React, { useState, useEffect } from 'react';
import { Sun, History, Zap, Leaf } from 'lucide-react';
import CheckInForm from '../components/checkin/CheckInForm';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';

export const CheckInPage: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const refreshCheckIns = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select(`*, profiles!inner (id, username, display_name, avatar_url, city_region, equipment_brand, role)`)
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) setCheckIns(data as CheckIn[]);
  };

  useEffect(() => {
    refreshCheckIns();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>太陽能每日發電紀錄</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          太陽能發電打卡站
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          填寫您的案場容量與今日發電度數 (kWh)，系統自動計算效率 (kWh/kWp) 並同步至排行榜。
        </p>
      </div>

      {/* Main Check-In Form Component */}
      <CheckInForm onSuccess={refreshCheckIns} />

      {/* History Stream */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">社群最新打卡紀錄</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {checkIns.map((chk) => (
            <div
              key={chk.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-amber-400/30 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={chk.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${chk.profiles?.display_name || 'S'}`}
                    alt={chk.profiles?.display_name}
                    className="w-8 h-8 rounded-full object-cover bg-slate-800"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-white">{chk.profiles?.display_name || '太陽能屋主'}</h5>
                    <span className="text-[10px] text-slate-400">{chk.profiles?.city_region} · {chk.system_kwp} kWp</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{chk.check_in_date}</span>
              </div>

              {chk.image_url && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                  <img src={chk.image_url} alt="打卡照片" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.kwh_generated} kWh
                </span>
                <span className="text-cyan-300 font-bold">
                  ⚡ {chk.efficiency_kwh_per_kwp} kWh/kWp
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> {(Number(chk.kwh_generated) * 0.495).toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
