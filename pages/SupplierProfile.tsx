import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Listing, SalesRepresentative } from '../types';
import ProductCard from '../components/ProductCard';
import { MapPin, CheckCircle, Mail, Phone, ExternalLink, ShieldCheck, Users, MessageSquare, MessageCircle, Send, Linkedin, Facebook, Twitter, Instagram, Video, Hash, PlayCircle, Info, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../services/authContext';

const SupplierProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
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
    const initial = profile.avatar_url ? null : supplierName.charAt(0).toUpperCase();

    // Group listings by category
    const groupedListings = listings.reduce((acc, listing) => {
        if (!acc[listing.category]) acc[listing.category] = [];
        acc[listing.category].push(listing);
        return acc;
    }, {} as Record<string, Listing[]>);

    const activeCategories = Object.keys(groupedListings).sort();

    return (
        <div className="bg-slate-50 dark:bg-slate-950 pb-20 min-h-screen">
            {/* Immersive Hero Banner Area */}
            <div className="w-full bg-slate-900 relative h-[180px] md:h-[260px]">
                {/* Background Video/Image Cover */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Using a premium solar facility image as default cover */}
                    <img
                        src="https://images.unsplash.com/photo-1509391366360-120021b33924?auto=format&fit=crop&w=2000&q=80"
                        alt="Company Cover"
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-end pb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full text-center md:text-left z-10 translate-y-10 md:translate-y-12">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl md:text-5xl font-black text-slate-800 border-4 border-white/50 flex-shrink-0 overflow-hidden backdrop-blur-md">
                            {user ? (
                                profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={supplierName} className="w-full h-full object-cover" />
                                ) : (
                                    initial
                                )
                            ) : (
                                <Lock className="w-10 h-10 text-slate-400" />
                            )}
                        </div>

                        {/* Main Info */}
                        <div className="flex-grow pb-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1
                                    className={`text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md ${!user ? 'blur-[8px] select-none hover:blur-[5px] transition-all cursor-pointer' : ''}`}
                                    onClick={() => !user && (window.location.href = '/login')}
                                    title={!user ? "Login to view supplier" : undefined}
                                >
                                    {user ? supplierName : 'Hidden Supplier Ltd'}
                                </h1>
                                {profile.is_verified && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/90 text-slate-900 border border-primary/50 rounded-full text-xs font-bold shadow-lg shadow-primary/20 backdrop-blur-md">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Supplier
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base text-slate-200">
                                {user ? (
                                    <>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-300" /> {profile.country || 'Global'}, {profile.business_address || 'Registered Business'}
                                        </span>
                                        {profile.email && (
                                            <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                <Mail className="w-4 h-4 text-slate-300" /> Email Us
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="flex items-center gap-1.5 filter blur-[5px] hover:blur-[3px] transition-all duration-300 select-none text-slate-300 hover:text-white" title="Login to view address">
                                            <MapPin className="w-4 h-4 text-slate-300" /> {profile.country || 'Global'}, {profile.business_address || 'Registered Business'}
                                        </Link>
                                        {profile.email && (
                                            <Link to="/login" className="flex items-center gap-1.5 filter blur-[5px] hover:blur-[3px] transition-all duration-300 select-none text-slate-300 hover:text-white" title="Login to view email">
                                                <Mail className="w-4 h-4 text-slate-300" /> Email Us
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Top Stats */}
                        <div className="hidden lg:flex gap-4 pb-2">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 text-center min-w-[120px]">
                                <div className="text-2xl font-black text-white">{listings.length}</div>
                                <div className="text-xs font-medium text-slate-300 uppercase tracking-wider">Products</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 text-center min-w-[120px]">
                                <div className="text-2xl font-black text-white">{salesReps.length || 1}</div>
                                <div className="text-xs font-medium text-slate-300 uppercase tracking-wider">Agents</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-24 md:mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Stats & Products */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-10">

                        {/* About Us (Placeholder or actual if available) */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Info className="w-40 h-40" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                                Company Description
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                <p>
                                    Welcome to <span className={!user ? "blur-[5px] select-none cursor-pointer hover:blur-[3px] transition-all" : "font-bold"} onClick={() => !user && (window.location.href = '/login')} title={!user ? "Login to view supplier" : undefined}>{user ? supplierName : 'Hidden Supplier Ltd'}</span>. We are a {profile.seller_type === 'COMPANY' ? 'leading registered enterprise' : 'specialized trader'} based in {profile.country || 'the region'}, dedicated to providing top-tier renewable energy products to installers, EPCs, and distributors worldwide.
                                </p>
                                <p>
                                    With a focus on quality and reliability, check out our catalog below for our latest stock items. We are committed to fostering long-term business partnerships. Feel free to reach out to any of our dedicated sales representatives for bulk pricing and project quotations.
                                </p>
                            </div>
                        </div>

                        {/* Grouped Product Catalog */}
                        <div>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Product Portfolio</h2>
                            </div>

                            {listings.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 border-dashed">
                                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No active products</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">This supplier does not have any active product listings at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {activeCategories.map(category => (
                                        <div key={category} className="scroll-mt-24" id={`category-${category}`}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{category}</h3>
                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">{groupedListings[category].length}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {groupedListings[category].map(listing => (
                                                    <ProductCard key={listing.id} listing={listing} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details & Reps */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">

                        {/* Company Stats & Type */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Business Profile</h3>

                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="py-3 font-semibold text-slate-500">Business Type</td>
                                        <td className="py-3 text-right text-slate-800 dark:text-slate-200 font-medium">{profile.seller_type === 'COMPANY' ? 'Enterprise' : 'Trader'}</td>
                                    </tr>
                                    {profile.country && (
                                        <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                            <td className="py-3 font-semibold text-slate-500">Region</td>
                                            <td className="py-3 text-right">
                                                {user ? (
                                                    <span className="text-slate-800 dark:text-slate-200 font-medium">{profile.country}</span>
                                                ) : (
                                                    <Link to="/login" className="filter blur-[5px] select-none hover:blur-[3px] transition-all duration-300 text-slate-800 dark:text-slate-200 font-medium inline-block" title="Login to view region">
                                                        {profile.country || "Demo Region"}
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {profile.company_reg_no && (
                                        <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                            <td className="py-3 font-semibold text-slate-500">Reg. Num</td>
                                            <td className="py-3 text-right">
                                                {user ? (
                                                    <span className="text-slate-800 dark:text-slate-200 font-mono text-xs">{profile.company_reg_no}</span>
                                                ) : (
                                                    <Link to="/login" className="filter blur-[5px] select-none hover:blur-[3px] transition-all duration-300 text-slate-800 dark:text-slate-200 font-mono text-xs inline-block" title="Login to view Reg. Num">
                                                        {profile.company_reg_no || "123456789"}
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Verified / Trust Box */}
                            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Trade Safety</h4>
                                </div>
                                <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300">
                                    Always use secure payment methods and conduct due diligence for B2B transactions.
                                </p>
                            </div>
                        </div>

                        {/* Category Fast Links */}
                        {activeCategories.length > 0 && (
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Categories Supplied</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeCategories.map(cat => (
                                        <a href={`#category-${cat}`} key={cat} className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-primary border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                            {cat}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sales Team Section */}
                        {salesReps.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" /> Verified Contacts
                                </h3>
                                {user ? (
                                    <div className="space-y-4">
                                        {salesReps.map((rep, idx) => {
                                            const repMsisdn = String(rep.phone || '').replace(/\D/g, '');
                                            const defaultPhoneLink = repMsisdn.startsWith('60') ? repMsisdn : (repMsisdn.startsWith('0') ? `60${repMsisdn.slice(1)}` : repMsisdn);
                                            const wappNum = rep.whatsapp ? String(rep.whatsapp).replace(/\D/g, '') : defaultPhoneLink;
                                            const phoneLink = wappNum.startsWith('60') ? wappNum : (wappNum.startsWith('0') ? `60${wappNum.slice(1)}` : wappNum);

                                            const socialLinks = [];
                                            if (wappNum) {
                                                socialLinks.push({
                                                    id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp',
                                                    color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
                                                    onClick: () => { window.open(`https://web.whatsapp.com/send?phone=${encodeURIComponent(phoneLink)}`, '_blank'); }
                                                });
                                            }
                                            if (rep.phone) {
                                                socialLinks.push({
                                                    id: 'call', icon: Phone, label: 'Call',
                                                    color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                                                    onClick: () => { window.location.href = `tel:${rep.phone.replace(/\s+/g, '')}`; }
                                                });
                                            }
                                            if (rep.wechat) {
                                                socialLinks.push({
                                                    id: 'wechat', icon: MessageCircle, label: 'WeChat',
                                                    color: 'bg-[#07C160]/10 text-[#07C160] hover:bg-[#07C160]/20',
                                                    onClick: () => { alert(`WeChat ID: ${rep.wechat}\n\nSearch this ID in WeChat to connect.`); }
                                                });
                                            }
                                            if (rep.telegram) {
                                                const tgLink = rep.telegram.startsWith('http') ? rep.telegram : `https://t.me/${rep.telegram.replace('@', '')}`;
                                                socialLinks.push({
                                                    id: 'telegram', icon: Send, label: 'Telegram',
                                                    color: 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20',
                                                    onClick: () => { window.open(tgLink, '_blank'); }
                                                });
                                            }

                                            return (
                                                <div key={rep.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:border-primary/30 transition-colors">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border-2 border-slate-100 dark:border-slate-700 font-bold flex items-center justify-center text-slate-500 text-lg shadow-sm">
                                                            {rep.avatar_url ? <img src={rep.avatar_url} alt={rep.name} className="h-full w-full object-cover" /> : rep.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rep.name}</p>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{rep.email || rep.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/50">
                                                        {socialLinks.map(link => {
                                                            const Icon = link.icon;
                                                            return (
                                                                <button key={link.id} onClick={link.onClick} title={link.label} className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-[1.03] ${link.color}`}>
                                                                    <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{link.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <Link to="/login" className="block space-y-4 filter blur-[6px] hover:blur-[4px] transition-all duration-300 select-none cursor-pointer" title="Login to view verified contacts">
                                        {salesReps.map((rep, idx) => {
                                            const repMsisdn = String(rep.phone || '').replace(/\D/g, '');
                                            const defaultPhoneLink = repMsisdn.startsWith('60') ? repMsisdn : (repMsisdn.startsWith('0') ? `60${repMsisdn.slice(1)}` : repMsisdn);
                                            const wappNum = rep.whatsapp ? String(rep.whatsapp).replace(/\D/g, '') : defaultPhoneLink;

                                            // Mock active links array for the blurred layout
                                            const mockSocialLinks = [
                                                { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20' },
                                                { id: 'call', icon: Phone, label: 'Call', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' }
                                            ];

                                            return (
                                                <div key={rep.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border-2 border-slate-100 dark:border-slate-700 font-bold flex items-center justify-center text-slate-500 text-lg shadow-sm">
                                                            {rep.avatar_url ? <img src={rep.avatar_url} alt={rep.name} className="h-full w-full object-cover" /> : rep.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rep.name || 'Sales Representative'}</p>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{rep.email || 'employee@company.com'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/50">
                                                        {mockSocialLinks.map(link => {
                                                            const Icon = link.icon;
                                                            return (
                                                                <div key={link.id} className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold ${link.color}`}>
                                                                    <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{link.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierProfile;
