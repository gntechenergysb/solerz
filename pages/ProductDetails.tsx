import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Listing } from '../types';
import { MapPin, MessageSquare, ShieldCheck, ArrowLeft, Calendar, FileText, Check, AlertTriangle, Clock, Lock, Bookmark, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../services/authContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (id) {
        const data = await db.getListingById(id);
        setListing(data);
        const fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"%3E%3Crect width="1200" height="900" fill="%23f1f5f9"/%3E%3Ctext x="600" y="450" font-family="Arial" font-size="48" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        const first = (data && Array.isArray(data.images_url) && data.images_url.length > 0) ? data.images_url[0] : '';
        setMainImage(first || fallback);
        db.updateViewCount(id);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      if (!user) return;
      const saved = await db.isListingSaved(id);
      setIsSaved(saved);
    };
    run();
  }, [id, user]);

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-700 dark:text-slate-300">Loading asset details...</div>;
  if (!listing) return <div className="h-96 flex items-center justify-center text-stone-500">Asset not found.</div>;

  const now = new Date();
  const activeUntil = new Date(listing.active_until);
  const isExpired = now > activeUntil;

  const specsEntries = Object.entries(listing.specs || {}).sort(([a], [b]) => a.localeCompare(b));
  const visibleSpecs = showAllSpecs ? specsEntries : specsEntries.slice(0, 10);

  const normalizeMsisdn = (raw: string) => {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('60')) return digits;
    if (digits.startsWith('0')) return `60${digits.slice(1)}`;
    return digits;
  };

  const canContact = !isExpired && !listing.is_sold;
  const phoneRaw = (listing.seller_phone || '').trim();
  const phoneMsisdn = normalizeMsisdn(phoneRaw);
  const hasPhone = !!phoneRaw;
  const hasEmail = !!(listing.seller_email || '').trim();
  const ssmNo = (listing.seller_ssm_new_no || listing.seller_ssm_old_no || listing.seller_ssm_no || '').trim();

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
             <img 
              src={mainImage} 
              alt={listing.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setMainImage('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"%3E%3Crect width="1200" height="900" fill="%23f1f5f9"/%3E%3Ctext x="600" y="450" font-family="Arial" font-size="48" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E')}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(Array.isArray(listing.images_url) ? listing.images_url : []).filter(Boolean).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setMainImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-emerald-500 shadow-md scale-95' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f1f5f9"/%3E%3Ctext x="150" y="150" font-family="Arial" font-size="24" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </button>
            ))}
          </div>
          
          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 mt-6">
             <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-4">Product Overview</h3>
             <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This {listing.brand} {listing.title} is available for immediate acquisition. 
                Sourced from a reputable commercial installation, these units have been inspected for quality and performance.
                Ideal for secondary market applications, repowering projects, or off-grid systems.
             </p>
          </div>
        </div>

        {/* Right Column: Details & Action */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-full">{listing.category}</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-xs font-semibold rounded-full">{listing.brand}</span>
             </div>
             
             <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">{listing.title}</h1>
             
             <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                   <MapPin className="h-4 w-4" /> {listing.location_state}
                </div>
                <div className="flex items-center gap-1.5">
                   <Calendar className="h-4 w-4" /> Listed {new Date(listing.created_at).toLocaleDateString()}
                </div>
             </div>

             <div className="mb-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Asking Price</p>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">RM {listing.price_rm.toLocaleString()}</p>
             </div>

             <div className="flex gap-3 mb-4">
               <button
                 onClick={async () => {
                   if (!id) return;
                   if (!user) {
                     toast.error('Please log in to save listings');
                     return;
                   }
                   const res = await db.toggleSavedListing(id);
                   if (!res) {
                     toast.error('Failed to update saved list');
                     return;
                   }
                   setIsSaved(res.saved);
                   toast.success(res.saved ? 'Saved' : 'Removed');
                 }}
                 className={`flex-1 border rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                 <Bookmark className="h-5 w-5" />
                 {isSaved ? 'Saved' : 'Save'}
               </button>
             </div>

             {canContact ? (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <button
                   type="button"
                   disabled={!hasPhone}
                   onClick={() => {
                    if (!hasPhone) {
                      toast.error('Supplier phone not available');
                      return;
                    }
                    db.trackListingContactEvent(listing.id, 'whatsapp');
                    const text = encodeURIComponent(`Hi, I'm interested in: ${listing.title}`);
                    const url = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phoneMsisdn)}&text=${text}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                   className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border ${hasPhone ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'}`}
                 >
                   <MessageSquare className="h-5 w-5" /> WhatsApp
                 </button>

                 <button
                   type="button"
                   disabled={!hasPhone}
                   onClick={() => {
                    if (!hasPhone) {
                      toast.error('Supplier phone not available');
                      return;
                    }
                    if (!isPhoneRevealed) {
                      db.trackListingContactEvent(listing.id, 'phone_reveal');
                      setIsPhoneRevealed(true);
                      return;
                    }
                    window.location.href = `tel:${phoneRaw.replace(/\s+/g, '')}`;
                  }}
                   className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border ${hasPhone ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'}`}
                 >
                   <Phone className="h-5 w-5" /> {hasPhone ? (isPhoneRevealed ? phoneRaw : 'Phone') : 'Phone'}
                 </button>

                 <button
                   type="button"
                   disabled={!hasEmail}
                   onClick={() => {
                    const email = (listing.seller_email || '').trim();
                    if (!email) {
                      toast.error('Supplier email not available');
                      return;
                    }
                    db.trackListingContactEvent(listing.id, 'email');
                    const subject = encodeURIComponent(`Inquiry: ${listing.title}`);
                    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}`;
                  }}
                   className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border ${hasEmail ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'}`}
                 >
                   <Mail className="h-5 w-5" /> Email
                 </button>
               </div>
             ) : (
               <button 
                 disabled
                 className="w-full bg-slate-100 dark:bg-slate-900/40 text-slate-400 font-medium py-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
             <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Technical Specifications
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {visibleSpecs.map(([key, value]) => (
                   <div key={key} className="flex items-baseline justify-between gap-4 border-b border-slate-50 dark:border-slate-800 py-2">
                      <span className="text-slate-500 dark:text-slate-400 capitalize text-sm truncate">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm text-right whitespace-nowrap">{String(value)}</span>
                   </div>
                ))}
             </div>

             {specsEntries.length > 10 && (
               <div className="mt-4">
                 <button
                   onClick={() => setShowAllSpecs(v => !v)}
                   className="text-sm font-semibold text-forest-800 hover:text-forest-900"
                 >
                   {showAllSpecs ? 'Show less' : `Show all (${specsEntries.length})`}
                 </button>
               </div>
             )}
          </div>

          {/* Seller Card */}
          <div className="bg-emerald-50/50 dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-slate-800">
             <p className="text-xs font-bold text-emerald-800 dark:text-slate-300 uppercase tracking-wide mb-3">{listing.is_verified_seller ? 'Verified Supplier' : 'Supplier'}</p>
             <div className="flex items-start justify-between">
                <div>
                   <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{listing.seller_name}</p>
                   
                   <div className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="h-4 w-4" /> 
                      {listing.is_verified_seller ? 'Registered Company' : 'Unverified'}
                   </div>
                </div>
                
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-sm bg-white dark:bg-slate-800 text-emerald-600`}>
                   {listing.seller_name.charAt(0)}
                </div>
             </div>

             {/* Security Warning for Unverified Sellers */}
             {!listing.is_verified_seller && (
               <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                 <div className="flex items-start gap-2">
                   <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                   <div className="text-xs text-amber-700 dark:text-amber-300">
                     <p className="font-semibold mb-1">⚠️ Safety Notice</p>
                     <p className="leading-relaxed">
                       This seller is unverified. Please exercise caution and consider face-to-face transactions. 
                       Do not make advance payments. The platform is not responsible for any disputes.
                     </p>
                   </div>
                 </div>
               </div>
             )}

             <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-400">
               <div className="flex items-center justify-between gap-3">
                 <span className="font-semibold">Company Reg. No</span>
                 <span className="font-medium text-right">{listing.seller_company_reg_no || '-'}</span>
               </div>
               <div className="flex items-center justify-between gap-3">
                 <span className="font-semibold">Address</span>
                 <span className="font-medium text-right">{listing.seller_business_address ? listing.seller_business_address : '-'}</span>
               </div>
             </div>
             
             {listing.is_verified_seller && (
               <div className="mt-4 pt-4 border-t border-emerald-100/50 dark:border-slate-800 flex gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1"><Check className="h-3 w-3" /> Identity Verified</div>
                  {listing.seller_phone && (
                    <div className="flex items-center gap-1"><Check className="h-3 w-3" /> Phone Verified</div>
                  )}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;