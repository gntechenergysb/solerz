import React from 'react';
import { Sun, ShieldCheck, Globe, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-lg font-black text-white tracking-tight">Solerz Global Arena</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              The premier Strava-style leaderboard for solar PV system owners in the US, EU, and worldwide. Log daily yields, compare normalized Specific Yield (kWh/kWp), and diagnose inverter performance.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Normalized Specific Yield Verification</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/checkin" className="hover:text-amber-400 transition-colors">Daily Solar Check-In</a></li>
              <li><a href="/leaderboard" className="hover:text-amber-400 transition-colors">Global Efficiency Arena</a></li>
              <li><a href="/profile" className="hover:text-amber-400 transition-colors">Station Diagnostics</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Standards</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Inverter Proofs</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>US & EU Regional Benchmarks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Solerz Global Arena. Built for Solar Owners Worldwide.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-mono text-[11px]">System Status: 🟢 All Functions Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
