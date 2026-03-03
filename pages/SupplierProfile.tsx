import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Listing, SalesRepresentative } from '../types';
import ProductCard from '../components/ProductCard';
import { MapPin, CheckCircle, Mail, Phone, ExternalLink, ShieldCheck, Users, MessageSquare, MessageCircle, Send, Linkedin, Facebook, Twitter, Instagram, Video, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const SupplierProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesReps, setSalesReps] = useState<SalesRepresentative[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchSupplierData = async () => {
            setLoading(true);
            try {
                const [profileData, supplierListings, repsData] = await Promise.all([
                    db.getPublicProfile(id),
                    db.getListingsBySellerId(id),
                    db.getSalesReps(id)
                ]);

                if (profileData) {
                    setProfile(profileData);
                } else {
                    toast.error("Supplier not found.");
                }

                setSalesReps(repsData || []);

                // Filter out hidden or sold listings for public view
                const activePublicListings = (supplierListings || []).filter(
                    (l) => !l.is_hidden && !l.is_paused && !l.is_sold
                );
                setListings(activePublicListings);

            } catch (error) {
                console.error("Error loading supplier", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSupplierData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Supplier Not Found</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">The supplier profile you are looking for does not exist or has been removed.</p>
                <Link to="/marketplace" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-slate-900 bg-primary hover:bg-primary/90">
                    Browse Marketplace
                </Link>
            </div>
        );
    }

    const supplierName = profile.company_name || 'Verified Supplier';
    const initial = supplierName.charAt(0).toUpperCase();

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">

            {/* Hero Banner Area */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden shadow-xl mb-12 relative">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

                <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center md:items-end gap-8">

                    {/* Avatar / Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-5xl md:text-6xl font-black text-slate-800 border-4 border-slate-700/50 flex-shrink-0 z-10">
                        {initial}
                    </div>

                    {/* Main Info */}
                    <div className="text-center md:text-left z-10 flex-grow">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                {supplierName}
                            </h1>
                            {profile.is_verified && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 backdrop-blur-md">
                                    <ShieldCheck className="w-4 h-4" />
                                    Verified Supplier
                                </span>
                            )}
                        </div>

                        <p className="text-slate-300 text-lg flex items-center justify-center md:justify-start gap-2 mb-6">
                            <MapPin className="w-5 h-5 opacity-70" /> {profile.country || 'Global'}, {profile.business_address || 'Registered Business'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md font-medium transition-colors border border-white/10">
                                    <Mail className="w-4 h-4" /> Contact via Email
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Stats Box */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hidden lg:flex flex-col items-center justify-center min-w-[200px] z-10">
                        <span className="text-4xl font-black text-primary mb-1">{listings.length}</span>
                        <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Active Listings</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Business Details</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Type</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{profile.seller_type === 'COMPANY' ? 'Registered Enterprise' : 'Individual/Trader'}</p>
                            </div>

                            {profile.country && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operating Region</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded inline-flex">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.country}
                                    </p>
                                </div>
                            )}

                            {profile.company_reg_no && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration #</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded block truncate" title={profile.company_reg_no}>
                                        {profile.company_reg_no}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Trade Assurance</h4>
                        </div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            Always conduct your own due diligence and use secure payment methods to protect your transactions.
                        </p>
                    </div>

                    {/* Sales Team Section */}
                    {salesReps.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" /> Sales Team
                            </h3>
                            <div className="space-y-4">
                                {salesReps.map(rep => {
                                    const repMsisdn = String(rep.phone || '').replace(/\D/g, '');
                                    const defaultPhoneLink = repMsisdn.startsWith('60') ? repMsisdn : (repMsisdn.startsWith('0') ? `60${repMsisdn.slice(1)}` : repMsisdn);

                                    const wappNum = rep.whatsapp ? String(rep.whatsapp).replace(/\D/g, '') : defaultPhoneLink;
                                    const phoneLink = wappNum.startsWith('60') ? wappNum : (wappNum.startsWith('0') ? `60${wappNum.slice(1)}` : wappNum);

                                    const socialLinks = [];
                                    if (wappNum) {
                                        socialLinks.push({
                                            id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp',
                                            color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900',
                                            onClick: () => { window.open(`https://web.whatsapp.com/send?phone=${encodeURIComponent(phoneLink)}`, '_blank'); }
                                        });
                                    }
                                    if (rep.phone) {
                                        socialLinks.push({
                                            id: 'call', icon: Phone, label: 'Call',
                                            color: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900',
                                            onClick: () => { window.location.href = `tel:${rep.phone.replace(/\s+/g, '')}`; }
                                        });
                                    }
                                    if (rep.wechat) {
                                        socialLinks.push({
                                            id: 'wechat', icon: MessageCircle, label: 'WeChat',
                                            color: 'bg-[#E3F2E1] dark:bg-[#1E3B21] text-[#07C160] hover:bg-[#D1EBD0] dark:hover:bg-[#2A4D2D]',
                                            onClick: () => { alert(`WeChat ID: ${rep.wechat}\n\nSearch this ID in WeChat to connect.`); }
                                        });
                                    }
                                    if (rep.telegram) {
                                        const tgLink = rep.telegram.startsWith('http') ? rep.telegram : `https://t.me/${rep.telegram.replace('@', '')}`;
                                        socialLinks.push({
                                            id: 'telegram', icon: Send, label: 'Telegram',
                                            color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900',
                                            onClick: () => { window.open(tgLink, '_blank'); }
                                        });
                                    }
                                    if (rep.linkedin) {
                                        const lnLink = rep.linkedin.startsWith('http') ? rep.linkedin : `https://${rep.linkedin}`;
                                        socialLinks.push({
                                            id: 'linkedin', icon: Linkedin, label: 'LinkedIn',
                                            color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900',
                                            onClick: () => { window.open(lnLink, '_blank'); }
                                        });
                                    }
                                    if (rep.facebook) {
                                        const fbLink = rep.facebook.startsWith('http') ? rep.facebook : `https://${rep.facebook}`;
                                        socialLinks.push({
                                            id: 'facebook', icon: Facebook, label: 'Facebook',
                                            color: 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-900',
                                            onClick: () => { window.open(fbLink, '_blank'); }
                                        });
                                    }
                                    if (rep.x_twitter) {
                                        const xLink = rep.x_twitter.startsWith('http') ? rep.x_twitter : `https://${rep.x_twitter}`;
                                        socialLinks.push({
                                            id: 'twitter', icon: Twitter, label: 'X',
                                            color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700',
                                            onClick: () => { window.open(xLink, '_blank'); }
                                        });
                                    }
                                    if (rep.skype) {
                                        socialLinks.push({
                                            id: 'skype', icon: Video, label: 'Skype',
                                            color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900',
                                            onClick: () => { window.open(`skype:${rep.skype}?chat`, '_blank'); }
                                        });
                                    }
                                    if (rep.line) {
                                        socialLinks.push({
                                            id: 'line', icon: Hash, label: 'LINE',
                                            color: 'bg-[#E1F5E1] dark:bg-[#1A3B1A] text-[#00C300] hover:bg-[#C8EFC8] dark:hover:bg-[#254C25]',
                                            onClick: () => { window.open(`https://line.me/R/ti/p/~${rep.line}`, '_blank'); }
                                        });
                                    }
                                    if (rep.instagram) {
                                        const igLink = rep.instagram.startsWith('http') ? rep.instagram : `https://instagram.com/${rep.instagram.replace('@', '')}`;
                                        socialLinks.push({
                                            id: 'instagram', icon: Instagram, label: 'Instagram',
                                            color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900',
                                            onClick: () => { window.open(igLink, '_blank'); }
                                        });
                                    }

                                    return (
                                        <div key={rep.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-slate-700 font-bold flex items-center justify-center text-slate-500 text-sm">
                                                    {rep.avatar_url ? <img src={rep.avatar_url} alt={rep.name} className="h-full w-full object-cover" /> : rep.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rep.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{rep.email || rep.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {socialLinks.map(link => {
                                                    const Icon = link.icon;
                                                    return (
                                                        <button key={link.id} onClick={link.onClick} title={link.label} className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 ${link.color}`}>
                                                            <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{link.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Listings */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Product Catalog</h2>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium">
                            {listings.length} Products
                        </span>
                    </div>

                    {listings.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 border-dashed">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No active products</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">This supplier does not have any active product listings at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {listings.map(listing => (
                                <ProductCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>

            </div >
        </div >
    );
};

export default SupplierProfile;
