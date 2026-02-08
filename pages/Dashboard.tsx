import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Listing, UserTier } from '../types';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, RefreshCw, AlertCircle, RotateCcw, TrendingUp, DollarSign, Target, CheckCircle, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// --- KYC FORM COMPONENT ---
// (We keep it in same file for simplicity, or could extract to components/KYCForm.tsx)
import { supabase } from '../services/supabaseClient';
import { compressImageFile } from '../services/imageCompression';

const FileSelector = ({ onSelect, accept = ".pdf", label }: { onSelect: (file: File) => void, accept?: string, label?: string }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onSelect(event.target.files[0]);
    }
  };

  return (
    <div className="mb-2">
      {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
      />
    </div>
  );
};

const AvatarUpload = ({ user, onUpdate }: { user: any, onUpdate: () => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    let file = e.target.files[0];
    setUploading(true);
    try {
      file = await compressImageFile(file, {
        maxBytes: 300 * 1024,
        maxWidth: 800,
        maxHeight: 800,
        outputType: 'image/webp'
      });
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('listing-images') // Reusing public bucket for avatars
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      const { success, error } = await db.updateProfile({ id: user.id, avatar_url: publicUrl });
      if (!success) throw error || new Error('Profile update failed');
      onUpdate();
      toast.success("Avatar updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-slate-400">{user?.company_name?.charAt(0) || user?.email?.charAt(0)}</span>
        )}
        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><RefreshCw className="text-white animate-spin h-3 w-3" /></div>}
      </div>
      <label className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
        <PlusCircle className="h-3 w-3 text-slate-600 dark:text-slate-200" />
      </label>
    </div>
  );
}

const SampleModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full p-4 animate-in zoom-in-50 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">SSM e-Profile Sample</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
        </div>
        <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded flex justify-center">
          <img src="/ssm-sample.png" alt="SSM Sample" className="max-h-[70vh] w-auto object-contain rounded border border-slate-200 dark:border-slate-800 shadow-sm" />
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-bold text-red-600">Important:</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">We only accept the LATEST version of SSM e-Profile (PDF Format).</p>
        </div>
      </div>
    </div>
  );
};

const KYCForm = ({ onSubmit, isSubmitting }: { onSubmit: (data: any, file: File) => void, isSubmitting: boolean }) => {
  const [formData, setFormData] = useState({
    ssm_new_no: '',
    ssm_old_no: '',
    handphone_no: '',
    business_address: '',
    incorporation_date: '',
    nature_of_business: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Validate PDF file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Please upload a valid PDF file');
      setSelectedFile(null);
      return;
    }
    
    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValid = formData.ssm_new_no && formData.handphone_no && formData.business_address && formData.incorporation_date && selectedFile;

  return (
    <div className="space-y-3 max-w-2xl animate-in slide-in-from-bottom-2 duration-300">
      <SampleModal isOpen={showSample} onClose={() => setShowSample(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">New SSM No.</label>
          <input required name="ssm_new_no" value={formData.ssm_new_no} onChange={handleChange}
            placeholder="e.g. 201901001234" className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Old SSM No. (Optional)</label>
          <input name="ssm_old_no" value={formData.ssm_old_no} onChange={handleChange}
            placeholder="e.g. 123456-X" className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
        <input required name="handphone_no" value={formData.handphone_no} onChange={handleChange}
          placeholder="e.g. 0123456789" className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Business Address (As in SSM)</label>
        <textarea required name="business_address" value={formData.business_address} onChange={handleChange}
          rows={2} className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary resize-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Incorp. Date</label>
          <input required type="date" name="incorporation_date" value={formData.incorporation_date} onChange={handleChange}
            className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nature of Business</label>
          <input required name="nature_of_business" value={formData.nature_of_business} onChange={handleChange}
            placeholder="e.g. Solar Installation" className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-primary bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
      </div>

      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 dashed-border">
        <div className="flex justify-between items-start mb-2">
          <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300">Upload SSM e-Profile (PDF Only)</label>
          <button onClick={() => setShowSample(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline flex items-center gap-1">
            <Eye className="h-3 w-3" /> View Sample
          </button>
        </div>

        <FileSelector accept=".pdf" onSelect={handleFileSelect} />

        {fileError && <div className="mt-2 text-xs text-red-600 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> {fileError}</div>}

        {selectedFile && <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-bold"><CheckCircle className="h-3 w-3" /> Ready to submit: {selectedFile.name}</div>}
      </div>

      <button
        onClick={() => selectedFile && onSubmit(formData, selectedFile)}
        disabled={isSubmitting || !isValid}
        className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 shadow-sm"
      >
        {isSubmitting ? 'Submitting Application...' : 'Submit for Verification'}
      </button>
      <p className="text-[10px] text-slate-400 text-center">By submitting, you declare that the information provided is accurate.</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const paymentHandledRef = useRef(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketDemand, setMarketDemand] = useState<{ inverters: number; panels: number; batteries: number }>({
    inverters: 0,
    panels: 0,
    batteries: 0
  });
  const [funnel, setFunnel] = useState<{ impressions: number; views: number; contacts: number }>({
    impressions: 0,
    views: 0,
    contacts: 0
  });

  // SSM Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  // Real-time subscription data from Stripe
  const [subscriptionData, setSubscriptionData] = useState<{
    current_period_end?: number;
    billing_interval?: 'month' | 'year';
    cancel_at_period_end?: boolean;
    status?: string;
  }>({});

  // Fetch real-time subscription data from Stripe
  const fetchSubscriptionSync = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      
      const res = await fetch('/api/stripe/subscription/sync', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubscriptionData({
            current_period_end: data.subscription.current_period_end,
            billing_interval: data.subscription.billing_interval,
            cancel_at_period_end: data.subscription.cancel_at_period_end,
            status: data.subscription.status
          });
        }
        // If profile was updated, refresh user context
        if (data.profile) {
          await refreshUser();
        }
      }
    } catch (e) {
      console.error('Failed to sync subscription:', e);
    }
  };

  useEffect(() => {
    fetchSubscriptionSync();
  }, [user?.id]);

  useEffect(() => {
    const fetchMyData = async () => {
      if (user) {
        const mine = await db.getListingsBySellerId(user.id);
        setMyListings(mine);

        const [demandRows, funnelRow] = await Promise.all([
          db.getMarketDemand(7),
          db.getSellerFunnel(user.id, 7)
        ]);

        const map: Record<string, number> = {};
        for (const r of demandRows || []) {
          const k = String((r as any).category || '').trim();
          const v = Number((r as any).searches || 0);
          if (!k) continue;
          map[k] = v;
        }
        setMarketDemand({
          inverters: map['Inverters'] || 0,
          panels: map['Panels'] || 0,
          batteries: map['Batteries'] || 0
        });
        setFunnel({
          impressions: Number((funnelRow as any)?.impressions || 0),
          views: Number((funnelRow as any)?.views || 0),
          contacts: Number((funnelRow as any)?.contacts || 0)
        });
      }
      setLoading(false);
    };
    fetchMyData();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') !== 'success') return;
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;

    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      const toastId = toast.loading('Payment received. Updating subscription...');
      try {
        // Sync with Stripe once to get latest status
        await fetchSubscriptionSync();
        
        // Check if updated
        for (let i = 0; i < 3; i += 1) {
          if (cancelled) return;
          await refreshUser();
          // If tier updated, we're done
          if (user?.tier && user.tier !== 'UNSUBSCRIBED') {
            toast.success('Subscription updated!');
            break;
          }
          await wait(2000);
        }
      } finally {
        toast.dismiss(toastId);
        // Clean URL so refresh loop doesn't repeat on reload.
        navigate('/dashboard', { replace: true });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [location.search, refreshUser, navigate]);



  const handleRenew = async (id: string) => {
    const listing = myListings.find(l => l.id === id);
    if (!listing) return;

    // Strict 30-day rule from NOW
    const now = new Date();
    const newExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();

    const updatedListing = { ...listing, active_until: newExpiry, archive_until: newExpiry };

    // Update Local State Optimistically
    setMyListings(prev => prev.map(l => l.id === id ? updatedListing : l));

    // Update DB
    const renewed = await db.renewListing(id);
    if (renewed) {
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, ...renewed } : l));
      toast.success("Listing renewed for 30 days!");
    } else {
      setMyListings(prev => prev.map(l => l.id === id ? listing : l));
      toast.error("Failed to renew listing.");
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error('Please login again to continue.');
        navigate('/login');
        return;
      }

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ returnPath: '/dashboard' })
      });

      const json = (await res.json().catch(() => null)) as any;
      const url = String(json?.url || '').trim();
      if (!res.ok || !url) {
        toast.error('Failed to open billing portal.');
        return;
      }

      window.location.href = url;
    } catch (e) {
      console.error(e);
      toast.error('Failed to open billing portal.');
    }
  };

  const handleCancelSubscriptionAtPeriodEnd = async () => {
    try {
      if (!window.confirm('Cancel your subscription at the end of the current billing period?')) return;

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error('Please login again to continue.');
        navigate('/login');
        return;
      }

      const res = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ atPeriodEnd: true })
      });

      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        throw new Error(String(json?.error || 'cancel_failed'));
      }

      toast.success('Cancellation scheduled at period end.');
      await fetchSubscriptionSync();
      await refreshUser();
    } catch (e) {
      console.error(e);
      toast.error('Failed to schedule cancellation.');
    }
  };

  const getListingLimit = (tier: UserTier) => {
    switch (tier) {
      case 'UNSUBSCRIBED': return 0;
      case 'STARTER': return 1;
      case 'PRO': return 10;
      case 'MERCHANT': return 30;
      case 'ENTERPRISE': return 100;
      default: return 0;
    }
  };

  const nowMs = Date.now();
  const listingLimit = getListingLimit(user?.tier || 'STARTER');
  const activeUsedCount = myListings.filter(l => {
    const activeUntilMs = new Date((l as any).active_until).getTime();
    return !(l as any).is_hidden && !(l as any).is_sold && activeUntilMs > nowMs;
  }).length;
  const overLimitCount = Math.max(0, activeUsedCount - listingLimit);

  // Calculate Profile Strength
  const profileStrengthItems = user ? ([
    {
      key: 'avatar',
      label: 'Upload profile photo / logo',
      hint: 'Add a photo/logo to look more trustworthy.',
      points: 10,
      done: !!user.avatar_url
    },
    {
      key: 'phone',
      label: 'Add phone number',
      hint: 'Buyers contact you faster when a phone number is available.',
      points: 10,
      done: !!(user.whatsapp_no || user.handphone_no)
    },
    {
      key: 'first_listing',
      label: 'Post your first listing',
      hint: 'Create Listing is unlocked after you subscribe to a plan.',
      points: 10,
      done: myListings.length > 0
    },
    {
      key: 'ssm_no',
      label: 'Add SSM number',
      hint: 'Fill in your New SSM No. in verification section.',
      points: 10,
      done: !!(user.ssm_new_no || user.ssm_no)
    },
    {
      key: 'ssm_doc',
      label: 'Upload SSM document (PDF)',
      hint: 'Upload your SSM e-Profile for admin review.',
      points: 10,
      done: !!user.ssm_file_path
    },
    {
      key: 'business_address',
      label: 'Business address',
      hint: 'Use the same address as in SSM.',
      points: 10,
      done: !!user.business_address
    },
    {
      key: 'incorp_date',
      label: 'Incorporation date',
      hint: 'Add your registered incorporation date.',
      points: 10,
      done: !!user.incorporation_date
    },
    {
      key: 'business_nature',
      label: 'Nature of business',
      hint: 'E.g. solar installation, trading, O&M services.',
      points: 10,
      done: !!user.nature_of_business
    },
    {
      key: 'verified',
      label: 'Get verified',
      hint: 'Submit verification and wait for approval.',
      points: 20,
      done: !!user.is_verified
    }
  ] as const) : [];

  const completedStrengthPoints = profileStrengthItems.reduce((acc, item) => acc + (item.done ? item.points : 0), 0);
  const profileStrength = Math.min(100, completedStrengthPoints);
  const missingStrengthItems = profileStrengthItems
    .filter(i => !i.done)
    .sort((a, b) => b.points - a.points);
  const nextStrengthItem = missingStrengthItems[0] || null;
  const showSubscribeCta = nextStrengthItem?.key === 'first_listing' && user?.tier === 'UNSUBSCRIBED';

  if (authLoading && !isAuthenticated) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  // --- ANALYTICS LOGIC ---
  const totalViewsAllTime = myListings.reduce((acc, curr) => acc + Number((curr as any).view_count || 0), 0);

  // Pricing Logic (Panels)
  const myActivePanelListings = myListings.filter(l =>
    l.category === 'Panels' &&
    !(l as any).is_hidden &&
    !(l as any).is_sold &&
    new Date((l as any).active_until).getTime() > nowMs
  );
  const hasPanels = myActivePanelListings.length > 0;

  const myAvgPrice = hasPanels
    ? myActivePanelListings.reduce((acc, curr) => acc + Number((curr as any).price_rm || 0), 0) / myActivePanelListings.length
    : 0;
  const myMinPrice = hasPanels ? Math.min(...myActivePanelListings.map(l => Number((l as any).price_rm || 0))) : 0;
  const myMaxPrice = hasPanels ? Math.max(...myActivePanelListings.map(l => Number((l as any).price_rm || 0))) : 0;

  // Top Category Pricing Logic (auto-detect user's most active category)
  const categoryCount: Record<string, number> = {};
  const activeListings = myListings.filter(l =>
    !(l as any).is_hidden &&
    !(l as any).is_sold &&
    new Date((l as any).active_until).getTime() > nowMs
  );
  for (const l of activeListings) {
    const cat = l.category || 'Other';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }
  const topCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  const topCategoryListings = topCategory
    ? activeListings.filter(l => l.category === topCategory)
    : [];
  const topCategoryAvgPrice = topCategoryListings.length > 0
    ? topCategoryListings.reduce((acc, curr) => acc + Number((curr as any).price_rm || 0), 0) / topCategoryListings.length
    : 0;
  const topCategoryMinPrice = topCategoryListings.length > 0
    ? Math.min(...topCategoryListings.map(l => Number((l as any).price_rm || 0)))
    : 0;
  const topCategoryMaxPrice = topCategoryListings.length > 0
    ? Math.max(...topCategoryListings.map(l => Number((l as any).price_rm || 0)))
    : 0;

  const maxDemand = Math.max(marketDemand.inverters, marketDemand.panels, marketDemand.batteries, 0);
  const demandWidth = (count: number) => {
    if (count <= 0 || maxDemand <= 0) return '0%';
    const pct = Math.round((count / maxDemand) * 100);
    return `${Math.max(10, pct)}%`;
  };
  const demandLabel = (count: number) => {
    if (count <= 0 || maxDemand <= 0) return 'No Data';
    const ratio = count / maxDemand;
    if (ratio >= 0.75) return 'High Demand';
    if (ratio >= 0.4) return 'Med Demand';
    return 'Low Demand';
  };

  const ctr = funnel.views > 0 ? (funnel.contacts / funnel.views) * 100 : 0;
  const viewRate = funnel.impressions > 0 ? (funnel.views / funnel.impressions) * 100 : 0;
  const contactRate = funnel.views > 0 ? (funnel.contacts / funnel.views) * 100 : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">

  {/* Welcome Section */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Seller Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-300">Welcome back, {user?.company_name}</p>
    </div>
    {(user?.is_verified && user?.tier !== 'UNSUBSCRIBED') ? (
      <Link to="/create">
        <button className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-sm font-medium">
          <PlusCircle className="h-5 w-5" />
          <span>Create New Listing</span>
        </button>
      </Link>
    ) : (
      user?.is_verified && (
        <div className="w-full md:w-auto bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 dark:text-emerald-200 font-bold truncate">Account Verified</span>
          </div>
          {user?.tier !== 'UNSUBSCRIBED' ? (
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                TIER: {user.tier}
              </span>
              {user?.pending_tier && user?.tier_effective_at ? (
                <span className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-200/80">
                  Next: {user.pending_tier} ({new Date(user.tier_effective_at * 1000).toLocaleDateString()})
                </span>
              ) : null}
            </div>
          ) : (
            <Link to="/pricing" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-slate-800 shrink-0">
              Subscribe
            </Link>
          )}
        </div>
      )
    )}
  </div>

      {/* Top Section: Company Profile + Verification Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Company Profile - Compact Horizontal Layout */}
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${!user?.is_verified ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Top Row: Company Info (Left) + Subscription (Right) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Left: Avatar + Company Name + Verified + Email */}
            <div className="flex items-center gap-3">
              <AvatarUpload user={user} onUpdate={refreshUser} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{user?.company_name || 'User'}</h2>
                  {user?.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
            
            {/* Right: Subscription Info + Actions */}
            {user?.tier && user.tier !== 'UNSUBSCRIBED' ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Subscription</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {user.tier.toLowerCase()}
                  </span>
                </div>
                <span className="text-slate-400">|</span>
                <span>
                  <span className="text-slate-400">Started:</span>{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </span>
                <span>
                  <span className="text-slate-400">Next billing:</span>{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {(subscriptionData.current_period_end || user?.stripe_current_period_end)
                      ? new Date((subscriptionData.current_period_end || user?.stripe_current_period_end) * 1000).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </span>
                </span>
                <span>
                  <span className="text-slate-400">Period:</span>{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {(subscriptionData.billing_interval || user?.stripe_billing_interval) === 'year' ? 'Yearly' : 'Monthly'}
                  </span>
                </span>
                
                {/* Change History inline */}
                {user?.pending_tier && user?.tier_effective_at && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Changing to <span className="font-medium capitalize">{user.pending_tier.toLowerCase()}</span> on{' '}
                      <span className="font-medium">{new Date(user.tier_effective_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  </>
                )}
                
                {/* Cancel Notice inline */}
                {(subscriptionData.cancel_at_period_end || user?.stripe_cancel_at_period_end) && (subscriptionData.current_period_end || user?.stripe_current_period_end) && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      Cancelling on <span className="font-medium">{new Date((subscriptionData.current_period_end || user?.stripe_current_period_end) * 1000).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  </>
                )}
                
                <span className="text-slate-400">|</span>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Change Plan
                </Link>
                {!user?.pending_tier && (
                  <button
                    onClick={handleCancelSubscriptionAtPeriodEnd}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Subscription
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">UNSUBSCRIBED</span>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
          
          {/* 3x2 Grid - Company Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Email</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.email || '-'}</div>
            </div>
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">WhatsApp</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.whatsapp_no || user?.handphone_no || '-'}</div>
            </div>
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">SSM No.</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.ssm_new_no || user?.ssm_no || '-'}</div>
            </div>
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Seller Type</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.seller_type || '-'}</div>
            </div>
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Incorp. Date</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.incorporation_date || '-'}</div>
            </div>
            <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Nature of Business</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.nature_of_business || '-'}</div>
            </div>
          </div>
        </div>

        {/* Complete Your Verification - Only when not verified, side panel */}
        {!user?.is_verified && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Complete Your Verification</h2>
            {(user?.ssm_file_path || submitted) ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-4 flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm shrink-0">
                  <RefreshCw className="h-5 w-5 text-amber-600 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">Verification in Progress</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-200/80 mt-1">
                    We are reviewing your application for <strong>{user?.company_name}</strong>.
                    SSM: <span className="font-mono font-bold">{submittedData?.ssm_new_no || user?.ssm_new_no || user?.ssm_no || '-'}</span>
                  </p>
                </div>
              </div>
            ) : (
              <KYCForm
                onSubmit={async (data, file) => {
                  if (!user) return;
                  setIsVerifying(true);
                  try {
                    // Validate file type before upload (security)
                    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                      throw new Error('Only PDF files are allowed for SSM documents');
                    }
                    // Validate file size (max 10MB)
                    const MAX_SIZE = 10 * 1024 * 1024;
                    if (file.size > MAX_SIZE) {
                      throw new Error('File size must be less than 10MB');
                    }
                    setSubmittedData({ ...data, ssm_file_path: 'Uploading...' });
                    setSubmitted(true);
                    const fileExt = file.name.split('.').pop();
                    const filePath = `${user.id}/kyc_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                      .from('ssm-documents')
                      .upload(filePath, file);
                    if (uploadError) throw uploadError;
                    const { success, error } = await db.updateProfile({
                      id: user.id,
                      ...data,
                      handphone_no: data.handphone_no,
                      ssm_file_path: filePath,
                      is_verified: false,
                      ssm_no: data.ssm_new_no
                    });
                    if (success) {
                      await refreshUser();
                      toast.success("Application submitted successfully!");
                    } else {
                      throw error || new Error("Profile update failed");
                    }
                  } catch (error: any) {
                    console.error("Submission Error:", error);
                    setSubmitted(false);
                    toast.error(`Submission Failed: ${error.message || 'Unknown error'}`);
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                isSubmitting={isVerifying}
              />
            )}
          </div>
        )}

        {/* Floating Profile Strength Detail - When not 100% and verified */}
        {!loading && profileStrength < 100 && user?.is_verified && (
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 p-5 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Complete Your Profile
              </h2>
              <span className="text-sm font-bold text-amber-600">{profileStrength}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700" style={{ width: `${profileStrength}%` }} />
            </div>
            {nextStrengthItem && (
              <p className="text-xs text-slate-500 dark:text-slate-300 mb-3">
                Next step: <span className="font-bold text-slate-700 dark:text-slate-100">{nextStrengthItem.label}</span>
                <span className="font-bold text-amber-600"> (+{nextStrengthItem.points} pts)</span>
              </p>
            )}
            <div className="space-y-2">
              {missingStrengthItems.slice(0, 3).map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1.5 px-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">+{item.points}</span>
                </div>
              ))}
              {missingStrengthItems.length > 3 && (
                <p className="text-xs text-slate-400 pt-1">+{missingStrengthItems.length - 3} more items</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: My Listing Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">My Listing Performance</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {funnel.views > 0 ? ((funnel.contacts / funnel.views) * 100).toFixed(1) : 0}% <span className="text-sm text-slate-400 font-normal">Conversion</span>
              </h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-300">Active Listings</span>
              <span className="font-bold text-slate-700 dark:text-slate-100">{activeUsedCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-300">Avg Views / Listing</span>
              <span className="font-bold text-slate-700 dark:text-slate-100">{activeUsedCount > 0 ? (funnel.views / activeUsedCount).toFixed(1) : 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-300">Views (7d)</span>
              <span className="font-bold text-slate-700 dark:text-slate-100">{funnel.views}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-300">Contacts</span>
              <span className="font-bold text-slate-700 dark:text-slate-100">{funnel.contacts}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Traffic */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">Total Traffic</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalViewsAllTime} <span className="text-sm text-slate-400 font-normal">Views</span></h3>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-200" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-4">
            All-time accumulated views across all your listings.
          </p>
        </div>

        {/* Card 3: My Pricing Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">My Pricing Overview</p>
                <p className="text-xs text-slate-400">
                  {topCategory ? topCategory : 'No active listings'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-200" />
              </div>
            </div>
            {topCategory ? (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    RM {topCategoryAvgPrice.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-300">avg</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                  RM {topCategoryMinPrice.toFixed(0)} - RM {topCategoryMaxPrice.toFixed(0)} · {topCategoryListings.length} listings
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4">Create listings to see your pricing insights.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Listings + Alerts */}
        <div className="lg:col-span-8 space-y-6">
          {user?.is_verified && user?.tier !== 'UNSUBSCRIBED' && overLimitCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-amber-900 dark:text-amber-200">You are over your plan limit</div>
                <div className="text-sm text-amber-800 dark:text-amber-200/80">
                  Your plan allows {listingLimit} active listings. Please deactivate {overLimitCount} listing(s) to stay within your limit.
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">My Listings Inventory</h3>
              <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-2 py-1 rounded">
                {activeUsedCount} / {listingLimit} Slots Used
              </span>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-300 font-medium">
                  <tr>
                    <th className="px-6 py-3 w-1/4">Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 w-1/3">Active Duration</th>
                    <th className="px-6 py-3 text-right">Views</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                  ) : myListings.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-300">No listings yet.</td></tr>
                  ) : (
                    myListings.map(l => {
                      const created = new Date(l.created_at).getTime();
                      const activeUntil = new Date(l.active_until).getTime();
                      const now = new Date().getTime();

                      const totalDuration = activeUntil - created;
                      const elapsed = now - created;

                      const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                      const isExpired = now > activeUntil;
                      const isHidden = !!(l as any).is_hidden;

                      return (
                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            <div className="truncate max-w-[150px]" title={l.title}>{l.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{l.category}</div>
                          </td>
                          <td className="px-6 py-4">
                            {isHidden ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                                Deactivated
                              </span>
                            ) : l.is_sold ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Sold
                              </span>
                            ) : !isExpired ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="w-full max-w-[180px]">
                              <div className="flex justify-between items-center text-[10px] mb-1.5 uppercase tracking-wide font-bold">
                                <span className={isExpired ? 'text-red-600' : 'text-emerald-600'}>
                                  {isExpired ? 'Expired' : 'Active'}
                                </span>
                                <span className="text-slate-400">
                                  {isExpired ? '100%' : `${Math.round(percent)}%`}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>

                              {isExpired && !l.is_sold && (
                                <button
                                  onClick={() => handleRenew(l.id)}
                                  className="text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-md shadow-sm hover:border-emerald-500 transition-colors"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Renew
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Eye className="h-3 w-3" />
                              {l.view_count}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-3">
                              {!l.is_sold && (
                                <button
                                  onClick={async () => {
                                    const next = !isHidden;
                                    setMyListings(prev => prev.map(x => x.id === l.id ? ({ ...x, is_hidden: next } as any) : x));
                                    const ok = await db.setListingHidden(l.id, next);
                                    if (!ok) {
                                      setMyListings(prev => prev.map(x => x.id === l.id ? (l as any) : x));
                                      toast.error('Failed to update listing status.');
                                      return;
                                    }
                                    toast.success(next ? 'Listing deactivated.' : 'Listing activated.');
                                  }}
                                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400"
                                >
                                  {isHidden ? 'Activate' : 'Deactivate'}
                                </button>
                              )}
                              <Link
                                to={`/edit/${l.id}`}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:hover:text-emerald-400"
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions - Simplified */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/create"
                className="bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-center"
              >
                Create Listing
              </Link>
              {user?.tier && user.tier !== 'UNSUBSCRIBED' ? (
                <a
                  href={`mailto:support@solerz.com?subject=Priority Support Request - Account: ${user?.email}`}
                  className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-sm font-bold px-4 py-3 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Priority Email Support
                </a>
              ) : (
                <Link
                  to="/pricing"
                  className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-sm font-bold px-4 py-3 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-center"
                >
                  Upgrade to Pro
                </Link>
              )}
              <Link
                to="/"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-center"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;