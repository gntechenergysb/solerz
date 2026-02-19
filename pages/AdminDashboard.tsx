import React, { useCallback, useEffect, useState } from 'react';
import { Profile } from '../types';
import { Check, X, Search, Shield, ShieldAlert, Award, Package, EyeOff, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../services/authContext';
import { Navigate } from 'react-router-dom';

const AdminRow: React.FC<{ profile: Profile; onVerify: (p: Profile, s: boolean) => Promise<void> }> = ({ profile, onVerify }) => {
    const [expanded, setExpanded] = useState(false);
    const [docUrl, setDocUrl] = useState<string | null>(null);

    const getDocUrl = async () => {
        if (!profile.company_doc_path) return;
        const { data } = await supabase.storage.from('company-documents').createSignedUrl(profile.company_doc_path, 3600);

        if (data?.signedUrl) {
            setDocUrl(data.signedUrl);
        } else {
            toast.error("Could not generate link");
        }
    };

    return (
        <React.Fragment>
            <tr className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer ${expanded ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`} onClick={() => setExpanded(!expanded)}>
                <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{profile.company_name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-400">{profile.email}</div>
                </td>
                <td className="px-6 py-4">
                    <span className="font-mono text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {profile.company_reg_no || profile.ssm_no || '-'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    {profile.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-200 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                            <Award className="h-3 w-3" /> Verified
                        </span>
                    ) : (profile.company_reg_no || profile.ssm_no) ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-200 font-bold text-xs bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-500/20">
                            Pending Review
                        </span>
                    ) : (
                        <span className="text-slate-400 dark:text-slate-400 text-xs">Unverified</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                        {!profile.is_verified && (
                            <button
                                onClick={() => onVerify(profile, true)}
                                className="p-2 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/25 transition-colors"
                                title="Approve"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                        )}
                        {profile.is_verified && (
                            <button
                                onClick={() => onVerify(profile, false)}
                                className="p-2 bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors"
                                title="Revoke"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-indigo-100 dark:border-slate-800">
                    <td colSpan={5} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">KYC Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Company Reg. No.</span> <span className="col-span-2 font-medium">{profile.company_reg_no || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Phone:</span> <span className="col-span-2 font-medium">{profile.handphone_no || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Business Addr:</span> <span className="col-span-2 font-medium">{profile.business_address || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Incorp Date:</span> <span className="col-span-2 font-medium">{profile.incorporation_date || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Business Nature:</span> <span className="col-span-2 font-medium">{profile.nature_of_business || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500 dark:text-slate-400">Company Reg. No. (Optional)</span> <span className="col-span-2 font-medium">{profile.company_reg_no || '-'}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Documents</h4>
                                {profile.company_doc_path ? (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Attached Document: {profile.company_doc_path}</p>
                                        {!docUrl ? (
                                            <button onClick={getDocUrl} className="text-indigo-600 dark:text-indigo-300 text-sm font-bold hover:underline">View Document (Generate Link)</button>
                                        ) : (
                                            <a href={docUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700 inline-block">
                                                Download / Open File
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-400 italic text-sm">No document uploaded.</p>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

const AdminDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('PENDING');

    const [tab, setTab] = useState<'KYC' | 'LISTINGS'>('KYC');

    type AdminListingRow = {
        id: string;
        seller_id: string;
        seller_company_name: string | null;
        seller_is_verified: boolean | null;
        title: string;
        category: string;
        brand: string | null;
        price_rm: number;
        location_state: string;
        is_hidden: boolean;
        is_sold: boolean;
        is_verified_listing: boolean;
        active_until: string;
        archive_until: string;
        created_at: string;
    };

    const [listingRows, setListingRows] = useState<AdminListingRow[]>([]);
    const [listingLoading, setListingLoading] = useState(false);
    const [listingFilter, setListingFilter] = useState<'ACTIVE' | 'HIDDEN' | 'SOLD' | 'EXPIRED' | 'ALL'>('ACTIVE');
    const [listingSearch, setListingSearch] = useState('');

    const isAdmin = user?.role === 'ADMIN';

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('admin_list_profiles', {
                filter_status: filter
            });

            if (error) throw error;
            setProfiles((data || []) as Profile[]);
        } catch (error) {
            console.error("Error fetching admin profiles:", error);
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchListings = useCallback(async () => {
        setListingLoading(true);
        try {
            const { data, error } = await supabase.rpc('admin_list_listings', {
                filter_status: listingFilter
            });
            if (error) throw error;
            setListingRows((data || []) as AdminListingRow[]);
        } catch (error) {
            console.error('Error fetching admin listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setListingLoading(false);
        }
    }, [listingFilter]);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        if (tab === 'KYC') fetchProfiles();
    }, [fetchProfiles, isAuthenticated, isAdmin, tab]);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        if (tab === 'LISTINGS') fetchListings();
    }, [fetchListings, isAuthenticated, isAdmin, tab]);

    if (authLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/login" />;

    const handleSetListingModeration = async (row: AdminListingRow, patch: { is_hidden?: boolean; is_sold?: boolean }) => {
        const confirmMsg = `Apply changes to listing "${row.title}"?`;
        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase.rpc('admin_set_listing_moderation', {
                p_listing_id: row.id,
                p_is_hidden: patch.is_hidden ?? null,
                p_is_sold: patch.is_sold ?? null
            });
            if (error) throw error;

            setListingRows(prev => prev.map(r => r.id === row.id ? ({ ...r, ...patch } as AdminListingRow) : r));
            toast.success('Listing updated');
        } catch (error) {
            console.error('Failed to update listing:', error);
            toast.error('Operation failed');
        }
    };

    const handleExpireListing = async (row: AdminListingRow) => {
        const confirmMsg = `Expire listing "${row.title}" now?`;
        if (!confirm(confirmMsg)) return;

        try {
            const activeUntil = new Date(Date.now() - 60 * 1000).toISOString();
            const archiveUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const { error } = await supabase.rpc('admin_set_listing_times', {
                p_listing_id: row.id,
                p_active_until: activeUntil,
                p_archive_until: archiveUntil
            });
            if (error) throw error;

            setListingRows(prev => prev.map(r => r.id === row.id ? ({ ...r, active_until: activeUntil, archive_until: archiveUntil } as AdminListingRow) : r));
            toast.success('Listing expired');
        } catch (error) {
            console.error('Failed to expire listing:', error);
            toast.error('Operation failed');
        }
    };

    const handleVerifyUser = async (profile: Profile, isVerified: boolean) => {
        const confirmMsg = isVerified
            ? `Approve verification for ${profile.company_name}?`
            : `Revoke verification for ${profile.company_name}?`;

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase.rpc('set_profile_verification', {
                target_profile_id: profile.id,
                verified: isVerified
            });

            if (error) throw error;

            toast.success(isVerified ? "User Verified Successfully" : "Verification Revoked");

            // Optimistic update
            setProfiles(prev => prev.map(p =>
                p.id === profile.id ? { ...p, is_verified: isVerified } : p
            ));

        } catch (error) {
            console.error("Verification failed:", error);
            toast.error("Operation failed");
        }
    };

    const filteredProfiles = profiles.filter(p => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') return !p.is_verified && (p.ssm_no || p.company_reg_no);
        if (filter === 'VERIFIED') return p.is_verified;
        return true;
    });

    const filteredListings = listingRows.filter(r => {
        if (!listingSearch) return true;
        const q = listingSearch.toLowerCase();
        return (
            (r.title || '').toLowerCase().includes(q) ||
            (r.brand || '').toLowerCase().includes(q) ||
            (r.seller_company_name || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-indigo-600" />
                        Admin Portal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">KYC review and listing moderation.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex">
                    {([
                        { k: 'KYC', label: 'KYC' },
                        { k: 'LISTINGS', label: 'Listings' }
                    ] as const).map((t) => (
                        <button
                            key={t.k}
                            onClick={() => setTab(t.k)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${tab === t.k
                                ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 shadow-sm'
                                : 'text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'KYC' ? (
                <>
                    <div className="flex justify-end mb-4">
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex">
                            {(['PENDING', 'VERIFIED', 'ALL'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f
                                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[720px]">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 text-sm">Company / User</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 text-sm">SSM Number</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 text-sm">Status</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-300 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-700 dark:text-slate-200">Loading...</td></tr>
                                    ) : filteredProfiles.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-400 dark:text-slate-400">No applicants found.</td></tr>
                                    ) : (
                                        filteredProfiles.map((profile) => (
                                            <AdminRow
                                                key={profile.id}
                                                profile={profile}
                                                onVerify={handleVerifyUser}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex">
                            {(['ACTIVE', 'HIDDEN', 'SOLD', 'EXPIRED', 'ALL'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setListingFilter(f)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${listingFilter === f
                                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                value={listingSearch}
                                onChange={(e) => setListingSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder="Search title/brand/seller"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 text-sm">Listing</th>
                                        <th className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 text-sm">Seller</th>
                                        <th className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 text-sm">Status</th>
                                        <th className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {listingLoading ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-700 dark:text-slate-200">Loading...</td></tr>
                                    ) : filteredListings.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-400 dark:text-slate-400">No listings found.</td></tr>
                                    ) : (
                                        filteredListings.map((r) => {
                                            const expired = new Date(r.active_until).getTime() <= Date.now();
                                            return (
                                                <tr key={r.id}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-slate-400" />
                                                            <span className="truncate max-w-[420px]">{r.title}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            {r.category} · {(r.brand || '—')} · RM {Number(r.price_rm).toLocaleString()} · {r.location_state}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{r.seller_company_name || 'Unknown'}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{r.seller_is_verified ? 'Verified' : 'Unverified'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {r.is_hidden && (
                                                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">Hidden</span>
                                                            )}
                                                            {r.is_sold && (
                                                                <span className="text-[11px] font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-500/20 px-2 py-0.5 rounded-full">Sold</span>
                                                            )}
                                                            {expired && (
                                                                <span className="text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-amber-500/20 px-2 py-0.5 rounded-full">Expired</span>
                                                            )}
                                                            {(!r.is_hidden && !r.is_sold && !expired) && (
                                                                <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSetListingModeration(r, { is_hidden: !r.is_hidden })}
                                                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                                title={r.is_hidden ? 'Unhide' : 'Hide'}
                                                            >
                                                                {r.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleSetListingModeration(r, { is_sold: !r.is_sold })}
                                                                className="p-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                                title={r.is_sold ? 'Mark as unsold' : 'Mark as sold'}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleExpireListing(r)}
                                                                className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                                                                title="Expire now"
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                            </button>
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
                </>
            )}

            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-sm text-indigo-800 dark:text-indigo-200">
                <h4 className="font-bold mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Admin Security Note
                </h4>
                <p className="opacity-80">
                    This page bypasses standard RLS policies for demonstration. In production, ensure only users with 'SERVICE_ROLE' or 'ADMIN' claim can access these write operations.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
