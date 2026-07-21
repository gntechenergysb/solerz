import React, { useState, useEffect } from 'react';
import { Award, Trophy, Sparkles, Leaf } from 'lucide-react';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import { getLeaderboard } from '../services/api';
import { LeaderboardEntry, TimePeriod } from '../types/leaderboard';

export const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard(period));
  }, [period]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>太陽能榮譽殿堂</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          太陽能綠電發電排行榜
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          表彰致力於太陽能綠電發電與減碳排放的優秀業主與農電團隊。每日打卡上傳發電數據，角逐榜首殊榮！
        </p>
      </div>

      {/* Main Leaderboard Table */}
      <LeaderboardTable
        entries={entries}
        period={period}
        onPeriodChange={(p) => setPeriod(p)}
      />
    </div>
  );
};

export default Leaderboard;
