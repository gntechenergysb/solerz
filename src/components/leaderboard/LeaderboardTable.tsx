import React, { useState } from 'react';
import { Award, Trophy, Medal, Search, Leaf, Zap, Crown, Sparkles } from 'lucide-react';
import { LeaderboardEntry, TimePeriod } from '../../types/leaderboard';
import { formatNumber } from '../../utils/format';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  period?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  period = 'weekly',
  onPeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(period);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePeriodClick = (p: TimePeriod) => {
    setSelectedPeriod(p);
    if (onPeriodChange) onPeriodChange(p);
  };

  const filteredEntries = entries.filter(e =>
    e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.solarSystemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = filteredEntries.slice(0, 3);
  const restEntries = filteredEntries.slice(3);

  return (
    <div className="space-y-8">
      {/* Filters and Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { key: 'daily', label: '今日發電榜' },
            { key: 'weekly', label: '本週累積榜' },
            { key: 'monthly', label: '本月英雄榜' },
            { key: 'all-time', label: '歷史總貢獻' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handlePeriodClick(tab.key as TimePeriod)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriod === tab.key
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋站點名稱、業主或地區..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Top 3 Podium Honor Cards */}
      {topThree.length > 0 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-400/30 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
              <div className="absolute top-3 right-3 text-slate-300 font-mono font-black text-2xl opacity-40">
                #2
              </div>
              <div className="relative mb-3">
                <img
                  src={topThree[1].userAvatar}
                  alt={topThree[1].userName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-400 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-1 bg-slate-700 text-slate-200 p-1.5 rounded-full shadow">
                  <Medal className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              <h3 className="font-extrabold text-lg text-white mb-0.5">{topThree[1].userName}</h3>
              <p className="text-xs text-slate-400 mb-3">{topThree[1].solarSystemName} ({topThree[1].capacitykWp} kWp)</p>
              
              <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center mt-auto">
                <div>
                  <span className="text-[10px] text-slate-400 block">累積發電</span>
                  <span className="text-base font-black text-amber-300 font-mono">{formatNumber(topThree[1].totalKWh)} <span className="text-[10px]">kWh</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">減碳估算</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{formatNumber(topThree[1].co2SavedKg)} <span className="text-[10px]">kg</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold Crown) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-amber-500/20 md:-translate-y-3">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />
              <div className="absolute top-3 right-4 flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-xs font-black">
                <Crown className="w-3.5 h-3.5" /> 冠軍榜首
              </div>

              <div className="relative mb-3 mt-2">
                <img
                  src={topThree[0].userAvatar}
                  alt={topThree[0].userName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-500/30 animate-pulse"
                />
                <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 p-2 rounded-full shadow-lg">
                  <Trophy className="w-5 h-5 fill-slate-950" />
                </div>
              </div>

              <h3 className="font-black text-xl text-amber-300 mb-0.5">{topThree[0].userName}</h3>
              <p className="text-xs text-slate-300 mb-4">{topThree[0].solarSystemName} ({topThree[0].capacitykWp} kWp)</p>

              <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-amber-500/30 grid grid-cols-2 gap-2 text-center mt-auto">
                <div>
                  <span className="text-[10px] text-slate-400 block">冠軍發電</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{formatNumber(topThree[0].totalKWh)} <span className="text-[10px]">kWh</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">減碳量</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{formatNumber(topThree[0].co2SavedKg)} <span className="text-[10px]">kg</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="order-3 bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-700/30 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
              <div className="absolute top-3 right-3 text-amber-600 font-mono font-black text-2xl opacity-40">
                #3
              </div>
              <div className="relative mb-3">
                <img
                  src={topThree[2].userAvatar}
                  alt={topThree[2].userName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/60 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-1 bg-amber-800 text-amber-200 p-1.5 rounded-full shadow">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-extrabold text-lg text-white mb-0.5">{topThree[2].userName}</h3>
              <p className="text-xs text-slate-400 mb-3">{topThree[2].solarSystemName} ({topThree[2].capacitykWp} kWp)</p>
              
              <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center mt-auto">
                <div>
                  <span className="text-[10px] text-slate-400 block">累積發電</span>
                  <span className="text-base font-black text-amber-300 font-mono">{formatNumber(topThree[2].totalKWh)} <span className="text-[10px]">kWh</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">減碳估算</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{formatNumber(topThree[2].co2SavedKg)} <span className="text-[10px]">kg</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Leaderboard List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">太陽能發電榜單明細</h3>
          </div>
          <span className="text-xs text-slate-400">即時計算 · 每小時更新</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-6 font-semibold">名次</th>
                <th className="py-3.5 px-6 font-semibold">發電業主 / 案場</th>
                <th className="py-3.5 px-6 font-semibold">地理地區</th>
                <th className="py-3.5 px-6 font-semibold">容量 (kWp)</th>
                <th className="py-3.5 px-6 font-semibold">發電量 (kWh)</th>
                <th className="py-3.5 px-6 font-semibold">減碳貢獻 (kg)</th>
                <th className="py-3.5 px-6 font-semibold text-right">成就徽章</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    entry.isCurrentUser ? 'bg-amber-500/10 font-medium' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-6 font-mono font-bold text-base">
                    {entry.rank === 1 && <span className="text-amber-400 flex items-center gap-1">🥇 1</span>}
                    {entry.rank === 2 && <span className="text-slate-300 flex items-center gap-1">🥈 2</span>}
                    {entry.rank === 3 && <span className="text-amber-600 flex items-center gap-1">🥉 3</span>}
                    {entry.rank > 3 && <span className="text-slate-400 pl-2">{entry.rank}</span>}
                  </td>

                  {/* User & System */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.userAvatar}
                        alt={entry.userName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white hover:text-amber-300 transition-colors">
                            {entry.userName}
                          </span>
                          {entry.isCurrentUser && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                              你
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block">{entry.solarSystemName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 text-xs text-slate-300">{entry.location}</td>

                  {/* Capacity */}
                  <td className="py-4 px-6 font-mono text-xs text-slate-300">{entry.capacitykWp} kWp</td>

                  {/* Total KWh */}
                  <td className="py-4 px-6 font-mono font-bold text-amber-300">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {formatNumber(entry.totalKWh)} kWh
                    </div>
                  </td>

                  {/* CO2 Saved */}
                  <td className="py-4 px-6 font-mono text-emerald-400 font-bold">
                    <div className="flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      {formatNumber(entry.co2SavedKg)} kg
                    </div>
                  </td>

                  {/* Badges */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {entry.badges.map((b) => (
                        <span
                          key={b.id}
                          title={`${b.name}: ${b.description}`}
                          className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        >
                          {b.icon}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;
