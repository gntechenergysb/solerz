import React from 'react';
import { Sun, Leaf, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400" />
              <span className="text-xl font-bold text-white tracking-tight">Solerz Solar MVP</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              專為太陽能發電業主、農電共生與屋頂光電愛好者打造的零碳打卡社群平台。透過每日光電打卡與綠電排行榜，記錄每一度電的永續貢獻！
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
              <Leaf className="w-4 h-4" />
              <span>全網累積發電已減碳 12,450 kg CO₂e</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">快捷功能</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/checkin" className="hover:text-amber-400 transition-colors">每日發電打卡</a></li>
              <li><a href="/leaderboard" className="hover:text-amber-400 transition-colors">發電榮譽排行榜</a></li>
              <li><a href="/profile" className="hover:text-amber-400 transition-colors">個人綠電統計面板</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">平台使命</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>真實光電發電驗證</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>全民參與永續淨零碳排</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Solerz. All rights reserved. 太陽能打卡與排行榜 MVP</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500 font-mono">系統狀態: 🟢 在線正常運作中</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
