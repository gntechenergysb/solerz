import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Profile } from '../types';
import { Check, X, Search, Shield, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';

const AdminRow = ({ profile, onVerify }: { profile: Profile, onVerify: (p: Profile, s: boolean) => void }) => {
    const [expanded, setExpanded] = useState(false);
    const [docUrl, setDocUrl] = useState<string | null>(null);

    const getDocUrl = async () => {
        if (!profile.ssm_file_path) return;
        const { data } = await supabase.storage.from('ssm-documents').createSignedUrl(profile.ssm_file_path, 3600);

        if (data?.signedUrl) {
            setDocUrl(data.signedUrl);
        } else {
            toast.error("Could not generate link");
        }
    };

    return (
        <React.Fragment>
            <tr className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${expanded ? 'bg-indigo-50/50' : ''}`} onClick={() => setExpanded(!expanded)}>
                <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{profile.company_name}</div>
                    <div className="text-xs text-slate-400">{profile.email}</div>
                </td>
                <td className="px-6 py-4">
                    <span className="font-mono text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded">
                        {profile.ssm_new_no || profile.ssm_no || '-'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    {profile.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <Award className="h-3 w-3" /> Verified
                        </span>
                    ) : (profile.ssm_new_no || profile.ssm_no) ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            Pending Review
                        </span>
                    ) : (
                        <span className="text-slate-400 text-xs">Unverified</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                        {!profile.is_verified && (
                            <button
                                onClick={() => onVerify(profile, true)}
                                className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                title="Approve"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                        )}
                        {profile.is_verified && (
                            <button
                                onClick={() => onVerify(profile, false)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Revoke"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50 border-b border-indigo-100">
                    <td colSpan={5} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">KYC Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-3"><span className="text-slate-500">Business Addr:</span> <span className="col-span-2 font-medium">{profile.business_address || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500">Incorp Date:</span> <span className="col-span-2 font-medium">{profile.incorporation_date || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500">Business Nature:</span> <span className="col-span-2 font-medium">{profile.nature_of_business || '-'}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-slate-500">Old SSM No:</span> <span className="col-span-2 font-medium">{profile.ssm_old_no || '-'}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Documents</h4>
                                {profile.ssm_file_path ? (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Attached Document: {profile.ssm_file_path}</p>
                                        {!docUrl ? (
                                            <button onClick={getDocUrl} className="text-indigo-600 text-sm font-bold hover:underline">View Document (Generate Link)</button>
                                        ) : (
                                            <a href={docUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700 inline-block">
                                                Download / Open File
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic text-sm">No document uploaded.</p>
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
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('PENDING');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        // Note: You must disable RLS for profiles read or be logged in as an admin user to see all profiles
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data as Profile[]);
        } catch (error) {
            console.error("Error fetching admin profiles:", error);
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (profile: Profile, isVerified: boolean) => {
        const confirmMsg = isVerified
            ? `Approve verification for ${profile.company_name}?`
            : `Revoke verification for ${profile.company_name}?`;

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_verified: isVerified })
                .eq('id', profile.id);

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
        if (filter === 'PENDING') return !p.is_verified && (p.ssm_no || p.ssm_new_no);
        if (filter === 'VERIFIED') return p.is_verified;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-indigo-600" />
                        Admin Verification Portal
                    </h1>
                    <p className="text-slate-500 mt-2">Manage merchant verifications and approvals.</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
                    {(['PENDING', 'VERIFIED', 'ALL'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-500 text-sm">Company / User</th>
                            <th className="px-6 py-4 font-bold text-slate-500 text-sm">SSM Number</th>
                            <th className="px-6 py-4 font-bold text-slate-500 text-sm">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-8">Loading...</td></tr>
                        ) : filteredProfiles.length === 0 ? (
                            <tr><td colSpan={4} className="text-center p-8 text-slate-400">No applicants found.</td></tr>
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

            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
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
