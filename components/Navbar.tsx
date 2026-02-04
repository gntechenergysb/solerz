import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { Sun, Moon, LogIn, PlusCircle, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading, authEmail } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logoSrc, setLogoSrc] = useState('/solerz-logo-light.png?v=20260202');

  const ASSET_VER = '20260202';
  const logoLightSrc = `/solerz-logo-light.png?v=${ASSET_VER}`;
  const logoDarkSrc = `/solerz-logo-dark.png?v=${ASSET_VER}`;

  const faviconLight = '/icon.png?v=20260202';
  const faviconDark = '/icon-dark.png?v=20260202';

  const applyTheme = (t: 'light' | 'dark') => {
    try {
      const root = document.documentElement;
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');

      localStorage.setItem('solerz_theme', t);

      const favicon = document.getElementById('app-favicon');
      if (favicon) {
        favicon.setAttribute('href', t === 'dark' ? faviconDark : faviconLight);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const saved = (() => {
      try {
        const v = localStorage.getItem('solerz_theme');
        return v === 'light' || v === 'dark' ? v : null;
      } catch {
        return null;
      }
    })();

    if (saved) {
      setTheme(saved);
      applyTheme(saved);
      return;
    }

    const mq = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
    const initial: 'light' | 'dark' = mq?.matches ? 'dark' : 'light';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    setLogoSrc(theme === 'dark' ? logoDarkSrc : logoLightSrc);
    setLogoFailed(false);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  const nextTheme = useMemo(() => (theme === 'dark' ? 'light' : 'dark'), [theme]);
  const nextThemeLabel = useMemo(() => (nextTheme === 'dark' ? 'Dark' : 'Light'), [nextTheme]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    void (async () => {
      await logout();
      navigate('/', { replace: true });
    })();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {logoFailed ? (
              <>
                <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm group-hover:bg-emerald-600 transition-colors">
                  <Sun className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Solerz</span>
              </>
            ) : (
              <img
                src={logoSrc}
                alt="Solerz"
                className="h-7 w-auto"
                onError={() => {
                  setLogoFailed(true);
                }}
              />
            )}
          </Link>

          {/* Center: Optional Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors">
              Marketplace
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-emerald-600 transition-colors">
              Pricing
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-full text-sm font-semibold hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-sm"
              aria-label={`Switch to ${nextTheme} mode`}
              title={`Switch to ${nextThemeLabel} mode`}
            >
              {nextTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="hidden md:inline">{nextThemeLabel}</span>
            </button>
            
            {user ? (
              <>
                {/* Create Listing Button (Visible if Verified + Subscribed) */}
                {user.is_verified && user.tier !== 'UNSUBSCRIBED' && (
                  <Link to="/create" className="hidden sm:flex">
                     <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm dark:shadow-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        <PlusCircle className="h-4 w-4" />
                        <span>Post Asset</span>
                     </button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                   <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none"
                   >
                      <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-500/20">
                         {user.company_name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.company_name}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                   </button>

                   {/* Dropdown Menu */}
                   {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                         <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.company_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                         </div>
                         <Link 
                            to="/dashboard" 
                            className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-emerald-600"
                            onClick={() => setIsProfileOpen(false)}
                         >
                            <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                         </Link>
                         <button 
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                         >
                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                         </button>
                      </div>
                   )}
                </div>
              </>
            ) : (isLoading || isAuthenticated) ? (
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                 <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-500/20">
                   {(authEmail || 'U').charAt(0).toUpperCase()}
                 </div>
                 <span className="text-sm font-medium hidden sm:block max-w-[140px] truncate">
                   {authEmail ? authEmail.split('@')[0] : 'Loading...'}
                 </span>
                 <ChevronDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                 <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600">
                    Log In
                 </Link>
                 <Link to="/login">
                    <button className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full text-sm font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
                       <User className="h-4 w-4" />
                       <span>Partner Access</span>
                    </button>
                 </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;