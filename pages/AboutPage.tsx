import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Cpu, ShieldCheck, Database, Calculator, BookOpen, GitCompareArrows, Mail, ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us | Solerz Solar Engineering Intelligence Platform';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Hardware Catalog
      </Link>

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sun className="w-3.5 h-3.5" />
          Mission & Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          About Solerz
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-3 leading-relaxed">
          The open engineering intelligence platform and digital hardware vault built for solar photovoltaic designers, EPC contractors, and clean energy researchers worldwide.
        </p>
      </div>

      <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        {/* Origin Story / Mission */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-blue-500" />
            Our Mission: Democratizing Solar Hardware Intelligence
          </h2>
          <p>
            Designing utility-scale, commercial, and residential solar energy systems requires accurate, granular hardware specifications. Historically, solar engineers, developers, and students have had to navigate fragmented manufacturer websites, pay for opaque closed databases, or manually transcribe datasheets into simulation software.
          </p>
          <p>
            <strong>Solerz</strong> was founded to solve this bottleneck. We unify global photovoltaic modules, grid-tie/hybrid string inverters, and battery energy storage systems (BESS) into a standardized, lightning-fast digital catalog. Our mission is to accelerate global solar adoption by providing engineers with instant access to STC/NMOT parameters, temperature coefficients, verified manufacturer datasheets, and simulation-ready models.
          </p>
        </section>

        {/* 4 Core Pillars */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            The Four Core Pillars of Solerz
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Comprehensive Hardware Vault
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Over 20,000 verified photovoltaic modules, central & string inverters, and lithium storage solutions with complete electrical and mechanical parameters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Solar System Sizer & ROI Calculator
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Interactive computational modeling of string voltage sizing, temperature-corrected Voc, DC/AC oversizing ratios, and levelized financial payback.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <GitCompareArrows className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Side-by-Side Comparison Engine
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Rigorous benchmarking of degradation rates, bifaciality coefficients, weighted CEC efficiency, and warranty terms across competing manufacturers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Engineering Standards Handbook
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Practical guides and formulas cross-referenced with international standards including IEC 61215, IEC 61730, NEC Article 690, and UL 9540.
              </p>
            </div>
          </div>
        </div>

        {/* Data Curation & Engineering Integrity */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            First-Principles Engineering Benchmarking Methodology
          </h3>
          <p className="text-sm">
            Unlike commercial sales directories or subjective review aggregators, every quantitative comparison, Solerz Rating score (0–100), and climate degradation projection on <strong>Solerz</strong> is mathematically computed from first-principles semiconductor physics and published laboratory test certificates:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>Photovoltaic Module Qualification (IEC 61215:2021 &amp; IEC 61730:2023)</strong>: Thermal cycling fatigue, damp heat encapsulant stability, and mechanical wind/snow load endurance (2400 Pa / 5400 Pa).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>Inverter &amp; Grid Interconnection (IEEE 1547-2018 &amp; UL 1741 SB)</strong>: MPPT voltage boundaries, Volt-VAR autonomous grid regulation, and Sandia weighted conversion efficiency modeling.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>Energy Storage Fire Safety (UL 9540 &amp; NFPA 855)</strong>: 4-tier thermal runaway propagation evaluation, cell chemistry stability, and C-rate continuous load discharge limits.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>National Electrical Code (NEC Article 690 &amp; 705)</strong>: Temperature-adjusted Voc string sizing calculations down to -35°C and 120% busbar interconnection safety compliance.</span>
            </li>
          </ul>
        </section>

        {/* Editorial Independence & Non-Bias Declaration */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Editorial Independence &amp; Academic Integrity
          </h3>
          <p className="text-sm">
            Solerz operates as an independent clean energy intelligence repository. We do not accept sponsored product placements or paid ranking enhancements. All hardware comparisons, Solerz Ratings, and Arena leaderboards are strictly deterministic and reproducible by any certified NABCEP professional engineer.
          </p>
          <p className="text-sm">
            We actively invite engineering feedback, corrections, and datasheet submissions from manufacturers, EPC installers, and academic researchers to keep Solerz the most reliable open solar repository on the web.
          </p>
        </section>

        {/* Contact info */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-emerald-500/5 dark:from-blue-500/10 dark:to-emerald-500/10 border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Get in Touch with the Solerz Team
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Have technical inquiries, catalog feedback, or manufacturer data updates?
            </p>
          </div>
          <a
            href="mailto:support@solerz.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            <Mail className="w-4 h-4" />
            support@solerz.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
