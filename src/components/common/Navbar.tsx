import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Trophy, Plus, User, LayoutGrid, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 transition-colors">
              <Sun className="w-4 h-4 fill-amber-400/20 text-amber-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white tracking-tight">
                Solerz
              </span>
              <span className="text-[10px] font-medium tracking-wide text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                Arena
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/')
                  ? 'bg-zinc-800/80 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-zinc-800/80 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              Leaderboard
            </Link>

            <Link
              to="/checkin"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/checkin')
                  ? 'bg-zinc-800/80 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              Log Yield
            </Link>

            <Link
              to="/profile"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-zinc-800/80 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              Station
            </Link>
          </nav>

          {/* Quick Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/checkin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Check In
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
          >
            <LayoutGrid className="w-4 h-4 text-zinc-400" />
            Overview
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
          >
            <Trophy className="w-4 h-4 text-zinc-400" />
            Leaderboard
          </Link>
          <Link
            to="/checkin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
          >
            <Sun className="w-4 h-4 text-zinc-400" />
            Log Yield
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
          >
            <User className="w-4 h-4 text-zinc-400" />
            Station
          </Link>
          <div className="pt-2">
            <Link
              to="/checkin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950"
            >
              <Plus className="w-4 h-4" />
              Check In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
