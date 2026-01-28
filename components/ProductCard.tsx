import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';
import { CheckCircle, MapPin, ArrowRight, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
}

const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const isSold = listing.is_sold;
  const isVerified = listing.is_verified_listing;

  // Extract key specs for tags based on category
  const getSpecsTags = () => {
    const specs = listing.specs as any;
    const tags = [];
    
    if (listing.category === 'Panels' && specs.wattage) tags.push(`⚡ ${specs.wattage}W`);
    if (listing.category === 'Inverters' && specs.phase) tags.push(`🔌 ${specs.phase} Phase`);
    if (listing.category === 'Batteries' && specs.capacity_kwh) tags.push(`🔋 ${specs.capacity_kwh}kWh`);
    
    // Brand is always good
    tags.push(`🏷️ ${listing.brand}`);
    
    return tags.slice(0, 3); // Max 3 tags
  };

  return (
    <Link to={`/listing/${listing.id}`} className="group block h-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative">
        
        {/* Top Section: Image & Status */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
          <img 
            src={listing.images_url[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Verification Badges (Absolute Top Left) */}
          {isVerified ? (
             <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center gap-1 z-10">
                <CheckCircle className="h-3 w-3" />
                SSM VERIFIED
             </div>
          ) : (
             <div className="absolute top-0 left-0 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center gap-1 z-10">
                <AlertTriangle className="h-3 w-3" />
                UNVERIFIED SELLER
             </div>
          )}

          {/* Sold Overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px] z-20">
              <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm tracking-wide shadow-lg border border-white/20">
                SOLD
              </span>
            </div>
          )}
        </div>

        {/* Middle Section: Info */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-3">
             <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">{listing.category}</div>
             <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {listing.title}
             </h3>
          </div>

          {/* Technical Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
             {getSpecsTags().map((tag, idx) => (
                <span key={idx} className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">
                   {tag}
                </span>
             ))}
             <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {listing.location_state}
             </span>
          </div>

          {/* Bottom Section: Action */}
          <div className="mt-auto pt-4 border-t border-slate-100">
             <div className="flex items-end justify-between mb-4">
                <div>
                   <p className="text-xs text-slate-400 font-medium">Asking Price</p>
                   <p className="text-2xl font-bold text-slate-900">
                      RM {listing.price_rm.toLocaleString()}
                   </p>
                </div>
             </div>
             
             <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg shadow-sm shadow-amber-200 transition-colors flex items-center justify-center gap-2 group/btn">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
             </button>

             {/* Unverified Disclaimer */}
             {!isVerified && (
               <div className="mt-3 text-center">
                 <p className="text-[10px] text-amber-600 font-medium bg-amber-50 py-1 px-2 rounded border border-amber-100/50">
                    ⚠️ Individual seller. Deal with caution.
                 </p>
               </div>
             )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;