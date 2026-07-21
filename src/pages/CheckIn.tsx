import React, { useState, useEffect } from 'react';
import { Sun, CheckCircle2, History, Zap, Leaf } from 'lucide-react';
import CheckInForm from '../components/checkin/CheckInForm';
import { getCheckIns } from '../services/api';
import { CheckInRecord } from '../types/checkin';
import { getWeatherLabel } from '../utils/format';

export const CheckIn: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);

  const refreshCheckIns = () => {
    setCheckIns(getCheckIns());
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
          填寫您的案場容量與今日發電度數 (kWh)，即時換算減碳量，系統將自動累計至排行榜成就。
        </p>
      </div>

      {/* Main Check-In Form Component */}
      <CheckInForm onSuccess={refreshCheckIns} />

      {/* History Stream */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">個人與社群最新打卡紀錄</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {checkIns.map((chk) => (
            <div
              key={chk.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-amber-400/30 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={chk.userAvatar} alt={chk.userName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-xs text-white">{chk.userName}</h5>
                    <span className="text-[10px] text-slate-400">{chk.systemName}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{chk.checkInDate}</span>
              </div>

              {chk.photoUrl && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                  <img src={chk.photoUrl} alt="Checkin" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> {chk.dailyKWh} kWh
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> {chk.co2SavedKg} kg CO₂
                </span>
                <span className="text-slate-400">{getWeatherLabel(chk.weather).icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
