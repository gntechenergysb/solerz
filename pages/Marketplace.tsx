import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Listing } from '../types';
import { MALAYSIAN_STATES, CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const data = await db.getListings();
      const now = new Date();
      // Only show listings that aren't completely expired/hidden
      const validListings = data.filter(l => {
        const archiveUntil = new Date(l.archive_until);
        return !l.is_hidden && now < archiveUntil;
      });
      
      setListings(validListings);
      setFilteredListings(validListings);
      setIsLoading(false);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    let result = listings;

    if (searchQuery) {
      result = result.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedState) {
      result = result.filter(l => l.location_state === selectedState);
    }

    if (selectedCategory) {
      result = result.filter(l => l.category === selectedCategory);
    }

    setFilteredListings(result);
  }, [searchQuery, selectedState, selectedCategory, listings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section (Mentoree Style) */}
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold text-slate-900">Industrial Solar Equipment</h1>
            <p className="text-slate-500 mt-1">Source verified secondary market assets from across Malaysia.</p>
         </div>

         {/* Search Bar Row */}
         <div className="flex flex-col md:flex-row gap-4">
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
            
            {/* Location Dropdown as a Button */}
            <div className="relative min-w-[200px]">
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
             <p className="text-slate-500 mt-1">Try adjusting your filters or search query to find what you need.</p>
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