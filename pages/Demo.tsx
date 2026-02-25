import React, { useState } from 'react';
import {
    Building2, Search, BarChart2, TrendingUp, Users, Package,
    MapPin, CheckCircle, Flame, Star, Zap, Clock, Bookmark, X, Eye, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DUMMY_LISTINGS = [
    {
        id: 'd1',
        title: 'Jinko Solar Tiger Pro 54HC (415W)',
        category: 'Panels',
        price: 450,
        condition: 'New',
        brand: 'Jinko Solar',
        wattage: 415,
        location: 'Kuala Lumpur',
        images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80'],
        seller: {
            company_name: 'Example Solar Test Sdn Bhd',
            is_verified: true,
            tier: 'PRO'
        }
    },
    {
        id: 'd2',
        title: 'Growatt MIN 5000TL-X',
        category: 'Inverters',
        price: 2800,
        condition: 'New',
        brand: 'Growatt',
        wattage: 5000,
        location: 'Selangor',
        images: ['https://images.unsplash.com/photo-1582218414457-3f33de8eecdf?w=800&q=80'],
        seller: {
            company_name: 'Green Energy Hub',
            is_verified: true,
            tier: 'STARTER'
        }
    },
    {
        id: 'd3',
        title: 'Huawei LUNA2000 5kWh Battery',
        category: 'Batteries',
        price: 12500,
        condition: 'New',
        brand: 'Huawei',
        location: 'Penang',
        images: ['https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=800&q=80'],
        seller: {
            company_name: 'PowerHouse Electronics',
            is_verified: false,
            tier: 'STARTER'
        }
    }
];

const Demo: React.FC = () => {
    const [activeMode, setActiveMode] = useState<'buyer' | 'seller'>('buyer');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'contact' | 'save' | 'pause' | 'insight' | 'dummy_contact'>('save');
    const [buyerTab, setBuyerTab] = useState<'saved' | 'viewed' | 'history' | 'profile'>('saved');

    const triggerModal = (type: typeof modalType) => {
        setModalType(type);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 animate-in fade-in duration-500">

            {/* Demo Top Navigator */}
            <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 w-full shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border border-emerald-500/30">
                            Interactive Demo
                        </div>
                        <p className="text-slate-400 text-sm hidden md:block">
                            Experience the platform without creating an account. Databases are disconnected.
                        </p>
                    </div>

                    <div className="bg-slate-800 p-1 rounded-xl flex relative w-full md:w-auto">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${activeMode === 'buyer' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        />
                        <button
                            onClick={() => setActiveMode('buyer')}
                            className={`relative z-10 flex-1 md:w-40 py-1.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-colors ${activeMode === 'buyer' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Search className="h-4 w-4" /> Buyer View
                        </button>
                        <button
                            onClick={() => setActiveMode('seller')}
                            className={`relative z-10 flex-1 md:w-40 py-1.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-colors ${activeMode === 'seller' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Building2 className="h-4 w-4" /> Seller View
                        </button>
                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">

                {/* ================= BUYER DEMO ================= */}
                {activeMode === 'buyer' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

                        {/* Buyer Dashboard Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/30">
                                    B
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Buyer (Demo)</h1>
                                    <p className="text-slate-400">Manage your saved listings, track inquiries, and update your profile.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => triggerModal('save')}
                                className="relative z-10 inline-flex items-center justify-center bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
                            >
                                Browse Listings
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar Navigation */}
                            <div className="lg:col-span-1 space-y-2">
                                <button onClick={() => setBuyerTab('saved')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${buyerTab === 'saved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                                    <span className="flex items-center gap-3"><Bookmark className="h-4 w-4" /> Saved Listings</span>
                                    <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{DUMMY_LISTINGS.length}</span>
                                </button>
                                <button onClick={() => setBuyerTab('viewed')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${buyerTab === 'viewed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                                    <span className="flex items-center gap-3"><Clock className="h-4 w-4" /> Recently Viewed</span>
                                    <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">12</span>
                                </button>
                                <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
                                <button onClick={() => setBuyerTab('profile')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${buyerTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                                    <span className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Profile Settings
                                    </span>
                                </button>
                            </div>

                            {/* Main Content Area */}
                            <div className="lg:col-span-3">
                                {buyerTab === 'saved' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100">Saved Listings</h2>
                                            <div className="relative w-full sm:max-w-xs">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <input
                                                    placeholder="Search your saved items..."
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-900 dark:text-slate-100"
                                                    readOnly
                                                    onClick={() => triggerModal('save')}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {DUMMY_LISTINGS.map(listing => (
                                                    <div key={listing.id} className="bg-white dark:bg-slate-900 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl transition-all duration-300">
                                                        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative">
                                                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                                                                {listing.condition}
                                                            </div>
                                                            <button
                                                                onClick={() => triggerModal('save')}
                                                                className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                                            >
                                                                <Bookmark className="h-4 w-4 text-slate-400 hover:text-emerald-500" />
                                                            </button>
                                                        </div>
                                                        <div className="p-5 flex flex-col flex-grow">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">{listing.category}</span>
                                                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                                    <MapPin className="h-3 w-3" /> {listing.location}
                                                                </div>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 line-clamp-1">{listing.title}</h3>
                                                            <div className="flex items-baseline gap-1 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                                <span className="text-sm font-semibold text-slate-500">RM</span>
                                                                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{listing.price.toLocaleString()}</span>
                                                            </div>

                                                            <div className="mt-auto flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                                                    <span className="text-slate-500 font-bold">{listing.seller.company_name.charAt(0)}</span>
                                                                </div>
                                                                <div className="overflow-hidden flex-1">
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                                                                        {listing.seller.company_name}
                                                                        {listing.seller.is_verified && <CheckCircle className="h-3.5 w-3.5 text-blue-500" />}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                        {listing.seller.tier === 'PRO' ? 'Verified Enterprise Partner' : 'Standard Seller'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => triggerModal('dummy_contact')}
                                                                className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/20"
                                                            >
                                                                Contact Seller
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {buyerTab === 'viewed' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 p-12 flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Clock className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">Recently Viewed Items</h2>
                                        <p className="text-slate-500 text-center max-w-sm">This is a demo preview area. In the real application, your browser history of viewed listings will appear here.</p>
                                    </div>
                                )}



                                {buyerTab === 'profile' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 p-12 flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        </div>
                                        <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">Profile Settings</h2>
                                        <p className="text-slate-500 text-center max-w-sm">This is a demo preview area. You can manage your account details, security settings, and notifications here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= SELLER DEMO ================= */}
                {activeMode === 'seller' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-16">

                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Seller Dashboard</h1>
                                <p className="text-slate-500 dark:text-slate-300">Welcome back, Example Solar Test (Demo)</p>
                            </div>
                            <Link to="/create?demo=true" className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium">
                                <PlusCircle className="h-5 w-5" />
                                <span>Create New Listing</span>
                            </Link>
                        </div>

                        {/* Top Section: Company Profile */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                            <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
                                            <span className="text-lg font-bold text-slate-400">S</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Example Solar Test Sdn Bhd</h2>
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">demo@example-solar.test</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 dark:text-slate-400">Subscription</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                                                Elite
                                            </span>
                                        </div>
                                        <span className="text-slate-400">|</span>
                                        <button onClick={() => triggerModal('save')} className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                            Change Plan
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Email</div>
                                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">demo@example-solar.test</div>
                                    </div>
                                    <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">WhatsApp</div>
                                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">+60123456789</div>
                                    </div>
                                    <div className="rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Company Reg. No.</div>
                                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">202301000123</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- ELITE ANALYTICS REDESIGN --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                            {/* Card 1: My Listing Performance */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-50"><Eye className="h-16 w-16 text-slate-100 dark:text-slate-800" /></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Listing Views</p>
                                    </div>
                                    <div className="flex items-end gap-3 mb-1">
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100">12,405</h3>
                                        <span className="text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 mb-1">
                                            <TrendingUp className="h-3 w-3" /> +12% MoM
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        All-time accumulated views across your <span className="font-bold text-slate-600 dark:text-slate-300">3</span> active listings.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Conversion Funnel */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50"><Target className="h-16 w-16 text-slate-100 dark:text-slate-800" /></div>
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Buyer Conversion (7d)</p>
                                    </div>
                                    <div className="flex items-end gap-3 mb-2">
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100">
                                            3.5%
                                        </h3>
                                        <span className="text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 mb-1">
                                            <TrendingUp className="h-3 w-3" /> +4.2%
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider">Views</span>
                                            <span className="text-slate-800 dark:text-slate-200">1,832</span>
                                        </div>
                                        <div className="h-4 border-l border-slate-300 dark:border-slate-700"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider">Contacts</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">64</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Trending Keywords Visualizer */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Trending Keywords</p>
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                        <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { keyword: '10kwh battery', searches: 124, width: '90%', label: 'High Demand', colorClass: 'bg-indigo-500' },
                                        { keyword: 'growatt inverter', searches: 89, width: '65%', label: 'Med Demand', colorClass: 'bg-emerald-500' },
                                        { keyword: 'n-type 550w', searches: 62, width: '45%', label: 'Low Demand', colorClass: 'bg-amber-500' }
                                    ].map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{item.keyword}</span>
                                                <span className="text-slate-500 font-bold">{item.label}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div className={`${item.colorClass} h-1.5 rounded-full`} style={{ width: item.width }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">My Listings Inventory</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-2 py-1 rounded">
                                                3 / 25 Slots Used
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto flex-grow">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-300 font-medium">
                                                <tr>
                                                    <th className="px-4 py-3 w-1/2">Title</th>
                                                    <th className="px-4 py-3 w-20">Status</th>
                                                    <th className="px-4 py-3 text-right w-16">Views</th>
                                                    <th className="px-4 py-3 text-right w-32">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {DUMMY_LISTINGS.map((l, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group">
                                                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                            <div className="truncate max-w-[360px]">{l.title}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs">{Math.floor(Math.random() * 400) + 100}</span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link to="/edit/demo-1" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400">Edit</Link>
                                                                <span className="text-slate-300">|</span>
                                                                <button onClick={() => triggerModal('pause')} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">Pause</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                {/* Quick Actions */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Link to="/create?demo=true" className="bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-center block">
                                            Create Listing
                                        </Link>
                                        <button onClick={() => triggerModal('save')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-center">
                                            Browse Listings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>

            {/* Global Demo Modal Container */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 tracking-wide">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="h-6 w-6" />
                            </button>

                            {modalType === 'dummy_contact' ? (
                                <>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 self-start">Contact Seller</h2>
                                    <div className="space-y-4 w-full text-left">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Message</label>
                                            <textarea rows={4} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" placeholder="Hi, I am interested in this listing. Is the price negotiable?"></textarea>
                                        </div>
                                        <button onClick={() => { setShowModal(false); alert("Simulated Demo Message Sent!"); }} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                                            Send Message (Demo)
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 mt-2">
                                        <Star className="h-8 w-8" />
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Demo Environment</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                        This is an interactive simulation. To use functions like {
                                            modalType === 'save' ? 'saving searches and bookmarks' :
                                                modalType === 'contact' ? 'contacting sellers and publishing listings' :
                                                    modalType === 'pause' ? 'pausing active inventory' : 'applying AI discounts'
                                        }, please register for a real account.
                                    </p>

                                    <Link to="/pricing" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors mb-3">
                                        See Pricing
                                    </Link>
                                    <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                        Log in to Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

        </div >
    );
};

// Reusable SVG for PlusCircle (in case Lucide is missing in global wrap)
const PlusCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
    </svg>
)

export default Demo;
