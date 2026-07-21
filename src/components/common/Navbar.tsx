import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Trophy, PlusCircle, User, Zap, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 bg-clip-text text-transparent tracking-tight">
                  Solerz
                </span>
                <span className="text-[10px] font-bold tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full uppercase">
                  Arena
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wide font-medium">
                Global Solar Yield Benchmark
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Overview
            </Link>

            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/leaderboard')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Efficiency Arena
            </Link>

            <Link
              to="/checkin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/checkin')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              Daily Check-In
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/profile')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              My Station
            </Link>
          </nav>

          {/* Quick Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/checkin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all tracking-wide uppercase"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Log Generation
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Overview
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Efficiency Arena
          </Link>
          <Link
            to="/checkin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            Daily Check-In
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            <User className="w-4 h-4 text-slate-400" />
            My Station
          </Link>
          <div className="pt-2">
            <Link
              to="/checkin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 uppercase text-xs tracking-wider"
            >
              <PlusCircle className="w-4 h-4" />
              Log Generation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
