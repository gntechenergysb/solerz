import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Listing } from '../types';
import ProductCard from '../components/ProductCard';
import { Bookmark, Clock, Search, AlertCircle } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'saved' | 'recent' | 'inquiries' | 'profile'>('saved');

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
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16">

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/30">
            {user?.company_name?.charAt(0) || user?.email?.charAt(0) || 'B'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.company_name || 'Buyer'}</h1>
            <p className="text-slate-400">Manage your saved listings, track inquiries, and update your profile.</p>
          </div>
        </div>
        <Link
          to="/"
          className="relative z-10 inline-flex items-center justify-center bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
        >
          Browse Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'saved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
          >
            <span className="flex items-center gap-3"><Bookmark className="h-4 w-4" /> Saved Listings</span>
            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{savedIds.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'recent' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
          >
            <span className="flex items-center gap-3"><Clock className="h-4 w-4" /> Recently Viewed</span>
            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{recentIds.length}</span>
          </button>

          <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
          >
            <span className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Contact History
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
          >
            <span className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile Settings
            </span>
          </button>

          <div className="mt-8 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-2">Coming Soon</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed mb-3">
              Price drop alerts for your saved categories will be available in the next platform update.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">

          {/* TAB: SAVED LISTINGS */}
          {activeTab === 'saved' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100">Saved Listings</h2>
                <div className="relative w-full sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    value={savedSearch}
                    onChange={(e) => setSavedSearch(e.target.value)}
                    placeholder="Search your saved items..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading your saved items...</div>
                ) : filteredSaved.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No saved listings found.</p>
                    <p className="text-sm text-slate-400 mb-6">Click the bookmark icon on any listing to save it here for later.</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
                      <Search className="h-4 w-4" /> Explore Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSaved.map(l => (
                      <ProductCard key={l.id} listing={l} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RECENT VIEWS */}
          {activeTab === 'recent' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100">Recently Viewed</h2>
                <p className="text-sm text-slate-500 mt-1">Items you've looked at in the past 24 hours.</p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading history...</div>
                ) : recentListings.length === 0 ? (
                  <div className="text-slate-500 text-sm">No views yet. Start browsing the listings.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentListings.map(l => (
                      <ProductCard key={l.id} listing={l} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INQUIRIES HISTORY (MOCKUP) */}
          {activeTab === 'inquiries' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Contact History
                </h2>
                <p className="text-sm text-slate-500 mt-1">Keep track of the sellers you've recently reached out to via WhatsApp or Phone.</p>
              </div>
              <div className="p-8 text-center flex-grow flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">No Contact History Yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  When you click the WhatsApp or Phone buttons on a listing, it will automatically be recorded here so you can easily follow up.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-6 py-2.5 rounded-xl">
                  Find Equipment
                </Link>
              </div>
            </div>
          )}

          {/* TAB: PROFILE MANAGEMENT (MOCKUP) */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-6">Account Information</h2>

                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-emerald-200 dark:border-emerald-800">
                    {user?.company_name?.charAt(0) || user?.email?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{user?.company_name || 'Individual Buyer'}</p>
                    <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
                    <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Display Name</label>
                    <input type="text" value={user?.company_name || ''} readOnly className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 focus:outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                    <input type="text" value={user?.email || ''} readOnly className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 focus:outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button disabled className="bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl opacity-50 cursor-not-allowed text-sm hover:opacity-100 transition-opacity" onClick={() => toast('Profile update coming soon!', { icon: '🚧' })}>
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6 flex items-start gap-4">
                <div className="bg-rose-100 dark:bg-rose-900/40 p-2 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-900 dark:text-rose-400 mb-1">Danger Zone</h3>
                  <p className="text-sm text-rose-700 dark:text-rose-400/80 mb-4 max-w-lg">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="text-sm font-bold text-rose-600 bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
