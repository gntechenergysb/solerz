import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Listing } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlusCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
     // Simulate API call
     setTimeout(async () => {
        const updatedProfile = { ...user, ssm_no: ssmInput, is_verified: true };
        await db.updateProfile(updatedProfile);
        await refreshUser();
        setIsVerifying(false);
        toast.success("SSM Verified successfully! You can now post ads.");
     }, 1500);
  };

  if (authLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  // Prepare chart data (Last 7 days mock)
  const chartData = [
    { name: 'Mon', views: 12 },
    { name: 'Tue', views: 19 },
    { name: 'Wed', views: 15 },
    { name: 'Thu', views: 25 },
    { name: 'Fri', views: 32 },
    { name: 'Sat', views: 45 },
    { name: 'Sun', views: 28 },
  ];

  const totalViews = myListings.reduce((acc, curr) => acc + curr.view_count, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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

      {!user?.is_verified && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
           <h2 className="text-lg font-bold mb-4">Complete Your Verification</h2>
           <p className="text-sm text-slate-500 mb-4">To ensure quality, Solerz requires all sellers to provide a valid SSM Registration Number.</p>
           <div className="flex gap-4 max-w-md">
              <input 
                type="text" 
                placeholder="Enter SSM Number (e.g. 202301001234)"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                value={ssmInput}
                onChange={(e) => setSsmInput(e.target.value)}
              />
              <button 
                onClick={handleVerify}
                disabled={isVerifying || !ssmInput}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isVerifying ? 'Verifying...' : 'Verify Now'}
              </button>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm text-slate-500 mb-1">Total Views</p>
           <p className="text-3xl font-bold text-slate-900">{totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm text-slate-500 mb-1">Active Listings</p>
           <p className="text-3xl font-bold text-emerald-600">{myListings.filter(l => !l.is_sold && !l.is_hidden).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm text-slate-500 mb-1">Items Sold</p>
           <p className="text-3xl font-bold text-blue-600">{myListings.filter(l => l.is_sold).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">My Listings</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                     <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
                   ) : myListings.length === 0 ? (
                     <tr><td colSpan={4} className="p-6 text-center text-slate-500">No listings yet.</td></tr>
                   ) : (
                     myListings.map(l => (
                       <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs">{l.title}</td>
                          <td className="px-6 py-4 text-slate-500">{l.category}</td>
                          <td className="px-6 py-4">
                            {l.is_sold ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Sold
                              </span>
                            ) : new Date() < new Date(l.active_until) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                 Archived
                               </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end items-center gap-1 text-slate-600">
                             <Eye className="h-3 w-3" />
                             {l.view_count}
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
           </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-6">Weekly Traffic</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="views" fill="#10B981" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center">
                 <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                 <span>Page Views</span>
              </div>
              <button className="flex items-center hover:text-primary transition-colors">
                 <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;