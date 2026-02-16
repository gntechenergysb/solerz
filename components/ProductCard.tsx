import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';
import { CheckCircle, MapPin, ArrowRight, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
}

const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const isSold = listing.is_sold;
  const isVerified = listing.is_verified_listing;
  const categoryLabel = listing.category === 'Accessories' ? 'Miscellaneous' : listing.category;

  const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f1f5f9"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="32" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
  const initialImage = useMemo(() => {
    const first = Array.isArray((listing as any).images_url) ? (listing as any).images_url[0] : '';
    return typeof first === 'string' && first.trim().length > 0 ? first : fallbackImage;
  }, [listing]);
  const [imgSrc, setImgSrc] = useState<string>(initialImage);

  useEffect(() => {
    setImgSrc(initialImage);
  }, [initialImage]);

  // Extract key specs for tags based on category
  const getSpecsTags = () => {
    const specs = listing.specs as any;
    const tags = [];
    
    if (listing.category === 'Panels' && specs.wattage) tags.push(`⚡ ${specs.wattage}W`);
    if (listing.category === 'Inverters' && specs.phase) tags.push(`🔌 ${specs.phase} Phase`);
    if (listing.category === 'Batteries' && specs.capacity_kwh) tags.push(`🔋 ${specs.capacity_kwh}kWh`);
    if (categoryLabel === 'Cable' && specs.size_mm2) tags.push(`🧵 ${specs.size_mm2}mm²`);
    if (categoryLabel === 'Cable' && specs.current_type) tags.push(`⚡ ${specs.current_type}`);
    if (categoryLabel === 'Protective' && specs.device_type) tags.push(`🛡️ ${specs.device_type}`);
    if (categoryLabel === 'Protective' && specs.rated_current_a) tags.push(`🔧 ${specs.rated_current_a}A`);
    
    // Brand is always good
    tags.push(`🏷️ ${listing.brand}`);
    
    return tags.slice(0, 3); // Max 3 tags
  };

  return (
    <Link to={`/listing/${listing.id}`} className="group block h-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative">
        
        {/* Top Section: Image & Status */}
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
          <img 
            src={imgSrc} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={() => setImgSrc(fallbackImage)}
          />
          
          {/* Verification Badges (Absolute Top Left) */}
          {isVerified ? (
             <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center gap-1 z-10">
                <CheckCircle className="h-3 w-3" />
                SSM VERIFIED
             </div>
          ) : (
             <div className="absolute top-0 left-0 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center gap-1 z-10">
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
             <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">{categoryLabel}</div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {listing.title}
             </h3>
          </div>

          {/* Technical Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
             {getSpecsTags().map((tag, idx) => (
                <span key={idx} className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                   {tag}
                </span>
             ))}
             <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {listing.location_state}
             </span>
          </div>

          {/* Bottom Section: Action */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-end justify-between mb-4">
                <div>
                   <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Asking Price</p>
                   <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      RM {listing.price_rm.toLocaleString()}
                   </p>
                </div>
             </div>
             
             <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg shadow-sm shadow-amber-200 dark:shadow-none transition-colors flex items-center justify-center gap-2 group/btn">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
             </button>

             {/* Unverified Disclaimer */}
             {!isVerified && (
               <div className="mt-3 text-center">
                 <p className="text-[10px] text-amber-600 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/30 py-1 px-2 rounded border border-amber-100/50 dark:border-amber-900/40">
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