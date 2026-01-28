import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Listing } from '../types';
import { MapPin, MessageSquare, ShieldCheck, ArrowLeft, Calendar, FileText, Check, AlertTriangle, Clock, Lock } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      if (id) {
        const data = await db.getListingById(id);
        setListing(data);
        if (data && data.images_url.length > 0) {
          setMainImage(data.images_url[0]);
        }
        db.updateViewCount(id);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="h-96 flex items-center justify-center text-forest-800">Loading asset details...</div>;
  if (!listing) return <div className="h-96 flex items-center justify-center text-stone-500">Asset not found.</div>;

  const now = new Date();
  const activeUntil = new Date(listing.active_until);
  const isExpired = now > activeUntil;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-stone-500 hover:text-forest-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-stone-100 rounded-3xl overflow-hidden shadow-soft border border-stone-100">
             <img 
              src={mainImage} 
              alt={listing.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {listing.images_url.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setMainImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-forest-600 shadow-md scale-95' : 'border-transparent hover:border-stone-200'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          {/* Description Section */}
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-stone-100 mt-8">
             <h3 className="font-display font-bold text-xl text-forest-900 mb-4">Product Overview</h3>
             <p className="text-stone-600 leading-relaxed">
                This {listing.brand} {listing.title} is available for immediate acquisition. 
                Sourced from a reputable commercial installation, these units have been inspected for quality and performance.
                Ideal for secondary market applications, repowering projects, or off-grid systems.
             </p>
          </div>
        </div>

        {/* Right Column: Details & Action */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl p-8 shadow-card border border-stone-100">
             <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-forest-50 text-forest-800 text-xs font-semibold rounded-full">{listing.category}</span>
                <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">{listing.brand}</span>
             </div>
             
             <h1 className="text-3xl font-display font-bold text-stone-900 mb-4 leading-tight">{listing.title}</h1>
             
             <div className="flex items-center gap-4 text-sm text-stone-500 mb-6 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                   <MapPin className="h-4 w-4" /> {listing.location_state}
                </div>
                <div className="flex items-center gap-1.5">
                   <Calendar className="h-4 w-4" /> Listed {new Date(listing.created_at).toLocaleDateString()}
                </div>
             </div>

             <div className="mb-8">
                <p className="text-sm text-stone-500 font-medium mb-1">Asking Price</p>
                <p className="text-4xl font-display font-bold text-earth-600">RM {listing.price_rm.toLocaleString()}</p>
             </div>

             {!isExpired && !listing.is_sold ? (
               <button 
                 onClick={() => alert("Redirecting to WhatsApp for " + listing.title)}
                 className="w-full bg-forest-900 text-white font-medium py-4 rounded-xl hover:bg-forest-800 transition-colors shadow-lg shadow-forest-900/10 flex items-center justify-center gap-2"
               >
                 <MessageSquare className="h-5 w-5" /> Contact Supplier
               </button>
             ) : (
                <button 
                 disabled
                 className="w-full bg-slate-100 text-slate-400 font-medium py-4 rounded-xl border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {listing.is_sold ? (
                    <>
                        <Check className="h-5 w-5" /> Asset Sold
                    </>
                 ) : (
                    <>
                        <Lock className="h-5 w-5" /> Listing Expired - Contact Hidden
                    </>
                 )}
               </button>
             )}
          </div>

          {/* Specs Card */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-stone-100">
             <h3 className="font-display font-bold text-lg text-forest-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-earth-500" /> Technical Specifications
             </h3>
             <div className="space-y-3">
                {Object.entries(listing.specs).map(([key, value]) => (
                   <div key={key} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                      <span className="text-stone-500 capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-stone-900 text-sm">{value}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Seller Card */}
          <div className="bg-forest-50/50 rounded-2xl p-6 border border-forest-100">
             <p className="text-xs font-bold text-forest-800 uppercase tracking-wide mb-3">Verified Supplier</p>
             <div className="flex items-start justify-between">
                <div>
                   <p className="font-display font-bold text-lg text-forest-900">{listing.seller_name}</p>
                   
                   <div className="flex items-center gap-1 mt-1 text-sm text-forest-700">
                      <ShieldCheck className="h-4 w-4" /> 
                      {listing.is_verified_seller ? 'SSM Registered Entity' : 'Unverified'}
                   </div>
                </div>
                
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-sm bg-white text-forest-600`}>
                   {listing.seller_name.charAt(0)}
                </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-forest-100/50 flex gap-4 text-xs text-forest-700">
                <div className="flex items-center gap-1"><Check className="h-3 w-3" /> Identity Verified</div>
                <div className="flex items-center gap-1"><Check className="h-3 w-3" /> Phone Verified</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;