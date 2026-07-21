import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Leaf, Search } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CheckIn } from '../types/checkin';

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDate]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        profiles!inner (
          id, username, display_name, avatar_url, city_region, equipment_brand, role
        )
      `)
      .eq('check_in_date', selectedDate)
      .order('efficiency_kwh_per_kwp', { ascending: false });

    if (!error && data) {
      setRankings(data as CheckIn[]);
    }
    setLoading(false);
  };

  const filteredRankings = rankings.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.profiles?.display_name || '').toLowerCase().includes(q) ||
      (item.profiles?.city_region || '').toLowerCase().includes(q) ||
      (item.profiles?.equipment_brand || '').toLowerCase().includes(q)
    );
  });

  const topThree = filteredRankings.slice(0, 3);
  const restItems = filteredRankings.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-amber-800/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">🏆 每日太陽能效率競技場</h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">公平 PK 基準：特定發電量 (kWh / kWp) — 不論系統大小，效率至上</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-amber-600/80 border border-amber-400/60 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          />
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋用戶名稱、地區或設備品牌..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">載入排行榜中...</p>
        </div>
      ) : filteredRankings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-2xl mb-2">🌤️</p>
          <p className="text-slate-300 font-bold">今日尚無打卡紀錄</p>
          <p className="text-slate-500 text-sm mt-1">快來搶第一吧！前往打卡頁面記錄今日發電量。</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && !searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Silver #2 */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-400/30 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
                  <div className="absolute top-3 right-3 text-slate-300 font-mono font-black text-2xl opacity-40">#2</div>
                  <div className="relative mb-3">
                    <img
                      src={topThree[1].profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${topThree[1].profiles?.display_name || 'S'}`}
                      alt={topThree[1].profiles?.display_name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-400 shadow-lg bg-slate-800"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-slate-300 text-slate-900 p-1 rounded-full text-lg shadow">🥈</div>
                  </div>
                  <h3 className="font-extrabold text-lg text-white">{topThree[1].profiles?.display_name || '太陽能屋主'}</h3>
                  <p className="text-xs text-slate-400 mb-3">{topThree[1].profiles?.city_region} · {topThree[1].profiles?.equipment_brand} · {topThree[1].system_kwp} kWp</p>
                  <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">效率</span>
                      <span className="text-base font-black text-cyan-300 font-mono">{topThree[1].efficiency_kwh_per_kwp} <span className="text-[10px]">kWh/kWp</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">發電</span>
                      <span className="text-base font-black text-amber-300 font-mono">{topThree[1].kwh_generated} <span className="text-[10px]">kWh</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gold #1 */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-amber-500/20 md:-translate-y-3">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />
                  <div className="absolute top-3 right-4 flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-xs font-black">
                    👑 冠軍榜首
                  </div>
                  <div className="relative mb-3 mt-2">
                    <img
                      src={topThree[0].profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${topThree[0].profiles?.display_name || 'S'}`}
                      alt={topThree[0].profiles?.display_name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-500/30 bg-slate-800"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 p-1.5 rounded-full shadow-lg">
                      <Trophy className="w-5 h-5 fill-slate-950" />
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-amber-300">{topThree[0].profiles?.display_name || '太陽能屋主'}</h3>
                  <p className="text-xs text-slate-300 mb-4">{topThree[0].profiles?.city_region} · {topThree[0].profiles?.equipment_brand} · {topThree[0].system_kwp} kWp</p>
                  <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-amber-500/30 grid grid-cols-2 gap-2 text-center mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">冠軍效率</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">{topThree[0].efficiency_kwh_per_kwp} <span className="text-[10px]">kWh/kWp</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">發電量</span>
                      <span className="text-lg font-black text-amber-400 font-mono">{topThree[0].kwh_generated} <span className="text-[10px]">kWh</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bronze #3 */}
              {topThree[2] && (
                <div className="order-3 bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-700/30 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
                  <div className="absolute top-3 right-3 text-amber-600 font-mono font-black text-2xl opacity-40">#3</div>
                  <div className="relative mb-3">
                    <img
                      src={topThree[2].profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${topThree[2].profiles?.display_name || 'S'}`}
                      alt={topThree[2].profiles?.display_name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/60 shadow-lg bg-slate-800"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-amber-800 text-amber-200 p-1 rounded-full text-lg shadow">🥉</div>
                  </div>
                  <h3 className="font-extrabold text-lg text-white">{topThree[2].profiles?.display_name || '太陽能屋主'}</h3>
                  <p className="text-xs text-slate-400 mb-3">{topThree[2].profiles?.city_region} · {topThree[2].profiles?.equipment_brand} · {topThree[2].system_kwp} kWp</p>
                  <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">效率</span>
                      <span className="text-base font-black text-cyan-300 font-mono">{topThree[2].efficiency_kwh_per_kwp} <span className="text-[10px]">kWh/kWp</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">發電</span>
                      <span className="text-base font-black text-amber-300 font-mono">{topThree[2].kwh_generated} <span className="text-[10px]">kWh</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Leaderboard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">太陽能效率排行榜明細</h3>
              </div>
              <span className="text-xs text-slate-400">{selectedDate} · 共 {filteredRankings.length} 人</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-6 font-semibold">名次</th>
                    <th className="py-3.5 px-6 font-semibold">發電業主</th>
                    <th className="py-3.5 px-6 font-semibold">地區</th>
                    <th className="py-3.5 px-6 font-semibold">設備品牌</th>
                    <th className="py-3.5 px-6 font-semibold">容量 (kWp)</th>
                    <th className="py-3.5 px-6 font-semibold">發電量 (kWh)</th>
                    <th className="py-3.5 px-6 font-semibold text-right">效率 (kWh/kWp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredRankings.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Rank */}
                      <td className="py-4 px-6 font-mono font-bold text-base">
                        {idx === 0 && <span className="text-amber-400">🥇 1</span>}
                        {idx === 1 && <span className="text-slate-300">🥈 2</span>}
                        {idx === 2 && <span className="text-amber-600">🥉 3</span>}
                        {idx > 2 && <span className="text-slate-400 pl-2">{idx + 1}</span>}
                      </td>

                      {/* User */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profiles?.display_name || 'S'}`}
                            alt={item.profiles?.display_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <span className="font-bold text-white">{item.profiles?.display_name || '太陽能屋主'}</span>
                            {item.profiles?.role === 'installer' && (
                              <span className="ml-1.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded">安裝商</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-6 text-xs text-slate-300">{item.profiles?.city_region}</td>

                      {/* Equipment */}
                      <td className="py-4 px-6 text-xs text-slate-400">{item.profiles?.equipment_brand}</td>

                      {/* Capacity */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">{item.system_kwp} kWp</td>

                      {/* kWh */}
                      <td className="py-4 px-6 font-mono font-bold text-amber-300">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {item.kwh_generated} kWh
                        </div>
                      </td>

                      {/* Efficiency */}
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono font-black text-lg text-cyan-400">{item.efficiency_kwh_per_kwp}</span>
                        <span className="text-xs text-slate-400 ml-1">kWh/kWp</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
