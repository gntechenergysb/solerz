import React from 'react';
import { Sun } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-10 mt-auto text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
              <Sun className="w-3 h-3 fill-amber-400/20" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">Solerz Arena</span>
            <span className="text-[11px] text-zinc-400">· Global Solar Yield Benchmarking</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a href="/checkin" className="hover:text-white transition-colors">Daily Log</a>
            <a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
            <a href="/profile" className="hover:text-white transition-colors">Station</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} Solerz Inc. Minimalist Specific Yield (kWh/kWp) Benchmark Platform.</p>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
