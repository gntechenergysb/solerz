import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Trophy, Plus, User, LayoutGrid, Menu, X, LogIn, LogOut, LayoutDashboard, MessageSquare, Moon } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { AuthModal } from '../auth/AuthModal';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    }).catch((err) => {
      console.warn('Navbar getUser warning:', err);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-200 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 transition-colors shadow-sm">
                <Sun className="w-4 h-4 fill-amber-400/20 text-amber-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white dark:text-white light:text-slate-900 tracking-tight">
                  Solerz
                </span>
                <span className="text-[10px] font-extrabold tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase">
                  Arena
                </span>
              </div>
            </Link>

            {/* Organized Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100/80 p-1 rounded-xl border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                    : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                }`}
              >
                Overview
              </Link>

              <Link
                to="/leaderboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/leaderboard')
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                    : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                }`}
              >
                Leaderboard
              </Link>

              <Link
                to="/discussion"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/discussion')
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                    : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                }`}
              >
                Community
              </Link>

              {user && (
                <>
                  <div className="w-px h-3.5 bg-slate-700/50 light:bg-slate-300 mx-0.5" />
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                        : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive('/profile')
                        ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                        : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                    }`}
                  >
                    Station
                  </Link>
                </>
              )}
            </nav>

            {/* Right Control Cluster: Theme Switcher & Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle Button (Light/Dark Mode) */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-400 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 transition-all shadow-sm"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Action Buttons */}
              <Link
                to="/checkin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Log Yield
              </Link>

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900/50 border border-slate-800/80 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-all border border-slate-700"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Controls Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 dark:bg-slate-950 light:bg-white border-b border-slate-800 dark:border-slate-800 light:border-slate-200 px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100"
            >
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              Overview
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100"
            >
              <Trophy className="w-4 h-4 text-slate-400" />
              Leaderboard
            </Link>
            <Link
              to="/discussion"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Community
            </Link>
            <Link
              to="/checkin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-400 hover:bg-slate-900 light:hover:bg-slate-100"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Log Yield
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Station
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-slate-800 light:border-slate-200">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 bg-rose-950/20 border border-rose-800/40"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuth('login'); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
