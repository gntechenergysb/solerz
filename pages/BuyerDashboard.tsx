import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Listing } from '../types';
import ProductCard from '../components/ProductCard';
import { Bookmark, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const BuyerDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);

  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);

  const [savedSearch, setSavedSearch] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [saved, recent] = await Promise.all([
          db.getSavedListingIds(),
          db.getRecentlyViewedListingIds(24)
        ]);

        setSavedIds(saved);
        setRecentIds(recent);

        const [savedRows, recentRows] = await Promise.all([
          db.getListingsByIds(saved),
          db.getListingsByIds(recent)
        ]);

        setSavedListings(savedRows);
        setRecentListings(recentRows);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load buyer dashboard');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user]);

  const filteredSaved = useMemo(() => {
    if (!savedSearch) return savedListings;
    const q = savedSearch.toLowerCase();
    return savedListings.filter(l =>
      l.title.toLowerCase().includes(q) ||
      (l.brand || '').toLowerCase().includes(q)
    );
  }, [savedSearch, savedListings]);

  if (authLoading && !isAuthenticated) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'BUYER') return <Navigate to="/dashboard" />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buyer Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Track saved equipment and recently viewed listings.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Browse Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">Saved Listings</h2>
                <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded-full">{savedIds.length}</span>
              </div>

              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  value={savedSearch}
                  onChange={(e) => setSavedSearch(e.target.value)}
                  placeholder="Search saved"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="text-sm text-slate-400 dark:text-slate-500">Loading...</div>
              ) : filteredSaved.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  You have no saved listings yet. Open a listing and tap Save.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredSaved.map(l => (
                    <ProductCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">Recently Viewed</h2>
                <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded-full">{recentIds.length}</span>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="text-sm text-slate-400 dark:text-slate-500">Loading...</div>
              ) : recentListings.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">No views yet. Start browsing the listings.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {recentListings.map(l => (
                    <ProductCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Tips</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Save listings to compare price and specs later. Recently viewed helps you return to equipment you checked before.
          </p>
          <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Future: alerts for price drops, seller response tracking.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
