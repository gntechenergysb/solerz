import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Sun, Zap, Battery, ArrowRight } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 Page Not Found | Solerz';
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5">
        <Compass className="w-8 h-8" />
      </div>

      <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase px-3 py-1 rounded-full bg-amber-500/10 mb-3">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        The hardware specification or page you requested does not exist, has been permanently removed, or the link may be outdated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
        <Link
          to="/solar-panels"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Sun className="w-4 h-4 text-amber-500" />
          Solar Panels
        </Link>
      </div>

      <div className="w-full max-w-md border-t border-slate-200 dark:border-slate-800 pt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Popular Hardware Directories
        </p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Link
            to="/inverters"
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-blue-500" />
              Inverters
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            to="/batteries"
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Battery className="w-4 h-4 text-emerald-500" />
              Storage Batteries
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
