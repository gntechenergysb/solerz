import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Zap, Menu, X, GitCompareArrows } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { selectedPanels } = useCompare();
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('solerz_theme', next ? 'dark' : 'light');
    // Update favicon
    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (favicon) {
      favicon.setAttribute('href', next ? '/icon-dark.png?v=20260202' : '/icon.png?v=20260202');
    }
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { path: '/', label: 'Home', exact: true },
    { path: '/solar-panels', label: 'Solar Panels' },
    { path: '/inverters', label: 'Inverters' },
    { path: '/batteries', label: 'Batteries' },
    { path: '/brands', label: 'Brands' },
    { path: '/handbook', label: 'Handbook' },
    { path: '/calculator', label: 'System Sizer' },
  ];

  const compareCount = selectedPanels.length;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Preloaded & Zero CLS */}
            <Link to="/" className="flex items-center gap-2 group flex-none focus:outline-none" aria-label="Solerz Home">
              <img
                src="/solerz-logo-light.png"
                alt="Solerz Logo"
                width="613"
                height="158"
                className="h-7 sm:h-8 md:h-9 w-auto max-w-[120px] sm:max-w-[145px] md:max-w-[165px] dark:hidden transition-transform duration-300 group-hover:scale-[1.02]"
                decoding="async"
                // @ts-ignore
                fetchpriority="high"
              />
              <img
                src="/solerz-logo-dark.png"
                alt="Solerz Logo"
                width="613"
                height="158"
                className="h-7 sm:h-8 md:h-9 w-auto max-w-[120px] sm:max-w-[145px] md:max-w-[165px] hidden dark:block transition-transform duration-300 group-hover:scale-[1.02]"
                decoding="async"
                // @ts-ignore
                fetchpriority="high"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = link.exact
                  ? location.pathname === link.path
                  : isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Compare indicator */}
              {compareCount > 0 && (
                <div className="relative ml-1">
                  <Link
                    to="/solar-panels"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    <GitCompareArrows className="w-4 h-4" />
                    Compare
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      {compareCount}
                    </span>
                  </Link>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="ml-2 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
            </div>

            {/* Mobile & Tablet: right side buttons */}
            <div className="flex lg:hidden items-center gap-1.5">
              {compareCount > 0 && (
                <Link
                  to="/solar-panels"
                  className="relative p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400"
                >
                  <GitCompareArrows className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {compareCount}
                  </span>
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        ref={menuRef}
        className={`mobile-menu bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 ${
          mobileOpen ? 'open' : ''
        }`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" onClick={() => setMobileOpen(false)} aria-label="Solerz Home">
              <img
                src="/solerz-logo-light.png"
                alt="Solerz Logo"
                width="613"
                height="158"
                className="h-7 w-auto dark:hidden"
              />
              <img
                src="/solerz-logo-dark.png"
                alt="Solerz Logo"
                width="613"
                height="158"
                className="h-7 w-auto hidden dark:block"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {navLinks.map((link) => {
              const active = link.exact
                ? location.pathname === link.path
                : isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Database directory footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="block px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Verified Hardware Catalog
              </span>
              <p className="px-4 py-1 text-xs text-slate-400 dark:text-slate-500">
                Solar Panels • Inverters • Battery Energy Storage
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;