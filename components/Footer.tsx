import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Shield, Mail, Scale, FileText, Info, Calculator, BookOpen, GitCompareArrows } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm mt-auto">
      {/* Main 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission (takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white group">
              <Logo className="w-7 h-7 text-amber-500 transition-transform group-hover:scale-105" />
              <span className="text-xl font-black tracking-tight font-sans">
                SOLERZ<span className="text-amber-500">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Open engineering intelligence platform and digital specification vault for photovoltaic modules, string inverters, and battery storage systems. Accelerating clean energy design worldwide.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified OEM Datasheet & PAN Archive
              </span>
            </div>
          </div>

          {/* Col 2: Hardware Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Hardware Directory
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/solar-panels" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Solar PV Modules
                </Link>
              </li>
              <li>
                <Link to="/inverters" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Solar Inverters
                </Link>
              </li>
              <li>
                <Link to="/batteries" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Storage Batteries (BESS)
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Manufacturer Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Engineering Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Engineering Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/calculator" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  Solar System Sizer
                </Link>
              </li>
              <li>
                <Link to="/handbook" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Engineering Handbook
                </Link>
              </li>
              <li>
                <Link to="/compare" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <GitCompareArrows className="w-3.5 h-3.5 text-purple-500" />
                  Versus Comparisons
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance (MANDATORY FOR ADSENSE) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/privacy" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  Terms & Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  About Solerz
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" />
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Fair Use Warning */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] leading-relaxed text-slate-500 dark:text-slate-500 space-y-2">
          <p>
            <strong>Engineering Disclaimer:</strong> All technical specifications, single-diode simulation parameters, PAN models, and calculation algorithms are compiled from manufacturer public documentation for preliminary research and informational purposes only. Solerz makes no warranties regarding electrical code compliance, structural safety, or performance accuracy. Always verify specifications with certified OEM datasheets and licensed Professional Engineers (PE) prior to system installation.
          </p>
          <p>
            <strong>Nominative Fair Use:</strong> All brand names, logos, trademarks, and model designations are the property of their respective holders. Their mention on Solerz is strictly for identification and cataloging under the doctrine of nominative fair use. Solerz is an independent platform and is not sponsored or endorsed by any referenced manufacturer.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Contact */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-600">
          <div>
            &copy; {currentYear} Solerz. All rights reserved. Built for clean energy engineers.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <span>&bull;</span>
            <a href="mailto:support@solerz.com" className="text-blue-500 hover:underline">
              support@solerz.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
