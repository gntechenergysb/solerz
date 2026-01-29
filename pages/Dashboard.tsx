import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Listing, UserTier } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { PlusCircle, Eye, RefreshCw, AlertCircle, RotateCcw, TrendingUp, TrendingDown, DollarSign, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// --- KYC FORM COMPONENT ---
// (We keep it in same file for simplicity, or could extract to components/KYCForm.tsx)
import { supabase } from '../services/supabaseClient';

const UploadOne = ({ onUpload, label }: { onUpload: (url: string) => void, label: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('ssm-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // For private buckets, we store path, admin generates signed URL
      onUpload(filePath);
      toast.success("File uploaded!");
    } catch (error) {
      toast.error('Error uploading file!');
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input
        type="file"
        accept=".pdf, .jpg, .jpeg, .png"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
      />
      {uploading && <span className="text-xs text-indigo-600">Uploading...</span>}
    </div>
  );
}

const KYCForm = ({ onSubmit, isSubmitting }: { onSubmit: (data: any) => void, isSubmitting: boolean }) => {
  const [formData, setFormData] = useState({
    ssm_new_no: '',
    ssm_old_no: '',
    business_address: '',
    incorporation_date: '',
    nature_of_business: '',
    ssm_file_path: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValid = formData.ssm_new_no && formData.business_address && formData.incorporation_date && formData.ssm_file_path;

  return (
    <div className="space-y-4 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">New SSM No.</label>
          <input required name="ssm_new_no" value={formData.ssm_new_no} onChange={handleChange}
            placeholder="e.g. 201901001234" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Old SSM No. (Optional)</label>
          <input name="ssm_old_no" value={formData.ssm_old_no} onChange={handleChange}
            placeholder="e.g. 123456-X" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Business Address (As in SSM)</label>
        <textarea required name="business_address" value={formData.business_address} onChange={handleChange}
          rows={2} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary"></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Incorp. Date</label>
          <input required type="date" name="incorporation_date" value={formData.incorporation_date} onChange={handleChange}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nature of Business</label>
          <input required name="nature_of_business" value={formData.nature_of_business} onChange={handleChange}
            placeholder="e.g. Solar Installation" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary" />
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded border border-slate-200">
        <UploadOne label="Upload SSM Certificate (PDF/Image)" onUpload={(path) => setFormData({ ...formData, ssm_file_path: path })} />
        {formData.ssm_file_path && <div className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Document attached</div>}
      </div>

      <button
        onClick={() => onSubmit(formData)}
        disabled={isSubmitting || !isValid}
        className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {isSubmitting ? 'Submitting Application...' : 'Submit for Verification'}
      </button>
      <p className="text-[10px] text-slate-400 text-center">By submitting, you declare that the information provided is accurate.</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // SSM Verification State
  const [ssmInput, setSsmInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchMyData = async () => {
      if (user) {
        const allListings = await db.getListings();
        const mine = allListings.filter(l => l.seller_id === user.id);
        setMyListings(mine);
      }
      setLoading(false);
    };
    fetchMyData();
  }, [user]);

  const handleVerify = async () => {
    if (!user || !ssmInput) return;
    setIsVerifying(true);

    // Update user profile with SSM number but keep verified as false until admin approves
    const updatedProfile = {
      ...user,
      ssm_no: ssmInput,
      is_verified: false
    };

    await db.updateProfile(updatedProfile);
    await refreshUser();

    setIsVerifying(false);
    toast.success("SSM submitted for review. Our team will verify it shortly.");
  };

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
    await db.updateListing(updatedListing);
    toast.success("Listing renewed for 30 days!");
  };

  const getListingLimit = (tier: UserTier) => {
    switch (tier) {
      case 'STARTER': return 1;
      case 'PRO': return 10;
      case 'MERCHANT': return 30;
      case 'ENTERPRISE': return 100;
      default: return 1;
    }
  };

  // Calculate Profile Strength
  const getProfileStrength = () => {
    if (!user) return 0;
    let score = 10; // Avatar/Default
    if (user.company_name) score += 20;
    if (user.whatsapp_no) score += 20;
    if (user.email) score += 20; // Proxy for address/contact details
    if (user.is_verified) score += 30;
    return Math.min(100, score);
  };
  const profileStrength = getProfileStrength();

  if (authLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const totalViews = myListings.reduce((acc, curr) => acc + curr.view_count, 0);

  // --- ANALYTICS LOGIC ---
  const chartData = [
    { name: 'Mon', views: Math.floor(totalViews * 0.1) },
    { name: 'Tue', views: Math.floor(totalViews * 0.15) },
    { name: 'Wed', views: Math.floor(totalViews * 0.12) },
    { name: 'Thu', views: Math.floor(totalViews * 0.2) },
    { name: 'Fri', views: Math.floor(totalViews * 0.25) },
    { name: 'Sat', views: Math.floor(totalViews * 0.3) },
    { name: 'Sun', views: Math.floor(totalViews * 0.18) },
  ];

  // Market Price Intelligence Logic
  const myPanelListings = myListings.filter(l => l.category === 'Panels');
  const hasPanels = myPanelListings.length > 0;

  const myAvgPrice = hasPanels
    ? myPanelListings.reduce((acc, curr) => acc + curr.price_rm, 0) / myPanelListings.length
    : 0;

  const marketAvgPrice = 480;
  const priceDiff = myAvgPrice - marketAvgPrice;
  const isCheaper = priceDiff < 0;
  const percentageDiff = Math.abs((priceDiff / marketAvgPrice) * 100).toFixed(1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Seller Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.company_name}</p>
        </div>
        {user?.is_verified ? (
          <Link to="/create">
            <button className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-sm font-medium">
              <PlusCircle className="h-5 w-5" />
              <span>Create New Listing</span>
            </button>
          </Link>
        ) : (
          <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Verification Required to Post</span>
          </div>
        )}
      </div>

      {/* Verification & Profile Strength Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!user?.is_verified ? (
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Complete Your Verification</h2>
            {user?.ssm_new_no || user?.ssm_no ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col md:flex-row items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
                  <RefreshCw className="h-6 w-6 text-amber-600 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-lg">Verification in Progress</h4>
                  <p className="text-sm text-amber-700 mt-2 mb-4 leading-relaxed">
                    We have received your application for <strong>{user?.company_name}</strong> details.
                    <br />SSM No: <span className="font-mono font-bold">{user?.ssm_new_no || user?.ssm_no}</span>
                    <br />Our compliance team is currently reviewing your documents.
                  </p>

                  {/* Read-only view of submitted data */}
                  <div className="bg-white/50 rounded-lg p-3 text-xs text-amber-900 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold block">Business Address:</span>
                      {user.business_address || '-'}
                    </div>
                    <div>
                      <span className="font-bold block">Incorporation Date:</span>
                      {user.incorporation_date || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <KYCForm
                onSubmit={async (data) => {
                  setIsVerifying(true);
                  await db.updateProfile({
                    ...user,
                    ...data,
                    // Compatibility fallback
                    ssm_no: data.ssm_new_no,
                    is_verified: false
                  } as any);
                  await refreshUser();
                  setIsVerifying(false);
                  toast.success("Application submitted successfully!");
                }}
                isSubmitting={isVerifying}
              />
            )}
          </div>
        ) : (
          <div className="md:col-span-2 bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-emerald-900 font-bold text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" /> Account Verified
              </h3>
              <p className="text-emerald-700 text-sm mt-1">You have full access to post listings and access market analytics.</p>
            </div>
            <div className="hidden sm:block">
              <span className="bg-white text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                TIER: {user.tier}
              </span>
            </div>
          </div>
        )}

        {/* Profile Strength Widget */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700">Profile Strength</span>
            <span className={`text-sm font-bold ${profileStrength === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {profileStrength}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ${profileStrength === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">
            {profileStrength < 100
              ? "Add more details to build trust."
              : "Excellent! Your profile is trustworthy."}
          </p>
        </div>
      </div>

      {/* --- ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Traffic Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">7-Day Traffic</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalViews} <span className="text-sm text-slate-400 font-normal">Views</span></h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip cursor={false} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Price Competitiveness */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-slate-500 font-medium">Price Competitiveness</p>
              <p className="text-xs text-slate-400">Based on your Panel listings</p>
            </div>
            <div className={`p-2 rounded-lg ${isCheaper ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <DollarSign className={`h-5 w-5 ${isCheaper ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
          </div>

          {hasPanels ? (
            <div className="mt-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-bold ${isCheaper ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {isCheaper ? '-' : '+'}{percentageDiff}%
                </span>
                <span className="text-sm text-slate-600 font-medium">
                  vs Market Avg
                </span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                {isCheaper
                  ? "Great job! Your average pricing is lower than 70% of competitors in Selangor."
                  : "Your pricing is slightly above market average. Consider highlighting warranty or condition to justify premium."}
              </p>

              {/* Visual Bar */}
              <div className="mt-4 relative h-2 bg-slate-100 rounded-full">
                {/* Market Marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 z-10"></div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">MKT</div>

                {/* User Marker */}
                <div
                  className={`absolute top-0 bottom-0 w-4 h-4 rounded-full border-2 border-white shadow-sm -mt-1 transition-all
                        ${isCheaper ? 'bg-emerald-500 left-[35%]' : 'bg-amber-500 left-[65%]'}`}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase">
                <span>Cheaper</span>
                <span>Expensive</span>
              </div>

            </div>
          ) : (
            <div className="mt-8 text-center text-slate-400 text-sm">
              Post a Panel listing to unlock price comparison data.
            </div>
          )}
        </div>

        {/* Card 3: Listing Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Conversion Funnel</p>
              <h3 className="text-2xl font-bold text-slate-900">3.5% <span className="text-sm text-slate-400 font-normal">CTR</span></h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="space-y-3 mt-2">
            {/* Step 1: Impressions */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Impressions (Search)</span>
                <span>1,240</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-300 h-full w-[100%]"></div>
              </div>
            </div>

            {/* Step 2: Views */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Detail Views</span>
                <span>{totalViews}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[25%]"></div>
              </div>
            </div>

            {/* Step 3: Contacts */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Contacts Reveal</span>
                <span>{Math.floor(totalViews * 0.08)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[8%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">My Listings Inventory</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {myListings.length} / {getListingLimit(user?.tier || 'STARTER')} Slots Used
            </span>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3 w-1/4">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 w-1/3">Active Duration</th>
                  <th className="px-6 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
                ) : myListings.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-500">No listings yet.</td></tr>
                ) : (
                  myListings.map(l => {
                    // Unified Lifecycle Logic
                    const created = new Date(l.created_at).getTime();
                    // active_until and archive_until are now identical
                    const activeUntil = new Date(l.active_until).getTime();
                    const now = new Date().getTime();

                    const totalDuration = activeUntil - created; // 30 days usually
                    const elapsed = now - created;

                    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                    const isExpired = now > activeUntil;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div className="truncate max-w-[150px]" title={l.title}>{l.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{l.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          {l.is_sold ? (
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

                        {/* Lifecycle Column */}
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
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>

                            {/* Renew Button Interaction */}
                            {isExpired && !l.is_sold && (
                              <button
                                onClick={() => handleRenew(l.id)}
                                className="text-xs flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-medium bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm hover:border-emerald-500 transition-colors"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Renew
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1 text-slate-600">
                            <Eye className="h-3 w-3" />
                            {l.view_count}
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

        {/* Top Selling Categories (Mini Chart) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-slate-800 mb-6">Market Demand (My State)</h3>
          <div className="space-y-4">
            {/* Mock Demand Bars */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">Inverters</span>
                <span className="text-emerald-600 font-bold">High Demand</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">Panels (Mono)</span>
                <span className="text-emerald-600 font-bold">Med Demand</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full w-[60%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">Batteries</span>
                <span className="text-slate-400 font-bold">Low Supply</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full w-[30%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-1">Tip:</span>
            Demand for Used Inverters in Selangor has risen by 15% this week. Consider stocking up.
          </div>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;