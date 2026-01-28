import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Listing } from '../types';
import { MALAYSIAN_STATES, CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, MapPin, ChevronDown, ShieldCheck, Users, ArrowUpDown } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Marketplace Layer State: 'verified' | 'community'
  const [marketplaceLayer, setMarketplaceLayer] = useState<'verified' | 'community'>('verified');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const data = await db.getListings();
      const now = new Date();
      // Only show listings that aren't expired (now < active_until) and not hidden
      const validListings = data.filter(l => {
        const activeUntil = new Date(l.active_until);
        return !l.is_hidden && now < activeUntil;
      });
      
      setListings(validListings);
      // Filter logic will run in the next effect
      setIsLoading(false);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    let result = [...listings]; // Create a copy to sort safely

    // 1. Filter by Marketplace Layer
    if (marketplaceLayer === 'verified') {
      result = result.filter(l => l.is_verified_listing === true);
    } else {
      result = result.filter(l => l.is_verified_listing === false);
    }

    // 2. Filter by Search
    if (searchQuery) {
      result = result.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Filter by Location
    if (selectedState) {
      result = result.filter(l => l.location_state === selectedState);
    }

    // 4. Filter by Category
    if (selectedCategory) {
      result = result.filter(l => l.category === selectedCategory);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price_rm - b.price_rm;
      } else if (sortBy === 'price-high') {
        return b.price_rm - a.price_rm;
      } else {
        // 'latest'
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredListings(result);
  }, [searchQuery, selectedState, selectedCategory, listings, marketplaceLayer, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Industrial Solar Equipment</h1>
              <p className="text-slate-500 mt-1">Source verified secondary market assets from across Malaysia.</p>
            </div>

            {/* Marketplace Layer Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center font-medium text-sm">
              <button
                onClick={() => setMarketplaceLayer('verified')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  marketplaceLayer === 'verified'
                    ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Verified Assets
              </button>
              <button
                onClick={() => setMarketplaceLayer('community')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  marketplaceLayer === 'community'
                    ? 'bg-white text-amber-600 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Community Marketplace
              </button>
            </div>
         </div>

         {/* Search & Filter Row */}
         <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-shadow shadow-sm"
                  placeholder="Search for inverters, panels, or brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            
            <div className="flex gap-4">
                {/* Location Dropdown */}
                <div className="relative min-w-[160px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-500" />
                   </div>
                   <select 
                      className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                   >
                      <option value="">All Locations</option>
                      {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </div>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative min-w-[160px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                   </div>
                   <select 
                      className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                   >
                      <option value="latest">Latest Listed</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </div>
                </div>
            </div>
         </div>

         {/* Category Pills (Filter Chips) */}
         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
               onClick={() => setSelectedCategory('')}
               className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === '' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
               }`}
            >
               All Equipment
            </button>
            {CATEGORIES.map(cat => (
               <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                     selectedCategory === cat 
                     ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>
      </div>

      {/* Product Grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
             <p>Loading inventory...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredListings.map(listing => (
                <ProductCard key={listing.id} listing={listing} />
             ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
             <p className="text-slate-500 mt-1">
                {marketplaceLayer === 'verified' 
                   ? "No verified assets found matching your criteria." 
                   : "No community listings found matching your criteria."}
             </p>
             <button 
               onClick={() => { setSelectedState(''); setSelectedCategory(''); setSearchQuery(''); }}
               className="mt-6 text-emerald-600 font-medium hover:text-emerald-700"
             >
               Clear all filters
             </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Marketplace;