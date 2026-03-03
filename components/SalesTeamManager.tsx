import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { SalesRepresentative } from '../types';
import toast from 'react-hot-toast';
import { Users, UserPlus, Phone, Mail, Trash2, X, Upload, MessageSquare, MessageCircle, Send, Linkedin, Facebook, Twitter, Instagram, Video, Hash } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { compressImageFile } from '../services/imageCompression';

interface SalesTeamManagerProps {
    sellerId: string;
    isDemo?: boolean;
}

const SalesTeamManager: React.FC<SalesTeamManagerProps> = ({ sellerId, isDemo = false }) => {
    const [reps, setReps] = useState<SalesRepresentative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRep, setEditingRep] = useState<SalesRepresentative | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [wechat, setWechat] = useState('');
    const [telegram, setTelegram] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [facebook, setFacebook] = useState('');
    const [xTwitter, setXTwitter] = useState('');
    const [skype, setSkype] = useState('');
    const [line, setLine] = useState('');
    const [instagram, setInstagram] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isDemo) {
            setReps([
                {
                    id: 'demo-1', seller_id: sellerId, name: 'Alex Wong (Demo Regional)', phone: '+60 12-345 6789', email: 'alex@example.com', is_active: true,
                    whatsapp: '+60123456789', wechat: 'alex_solar', telegram: '@alextgsolar', linkedin: 'https://linkedin.com/in/alexw', skype: 'live:alex_solar', line: 'alex123',
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                },
                {
                    id: 'demo-2', seller_id: sellerId, name: 'Sarah Chen (Demo Accounts)', phone: '+86 138-1234-5678', email: 'sarah@example.com', is_active: true,
                    whatsapp: '+8613812345678', wechat: 'sarah_wx', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                },
                {
                    id: 'demo-3', seller_id: sellerId, name: 'Michael Lee (Demo Tech)', phone: '+65 9876 5432', email: 'michael@example.com', is_active: true,
                    whatsapp: '+6598765432', telegram: '@tech_mike', linkedin: 'https://linkedin.com/in/michaell', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                }
            ]);
            setLoading(false);
        } else {
            fetchReps();
        }
    }, [sellerId, isDemo]);

    const fetchReps = async () => {
        if (!sellerId || isDemo) return;
        setLoading(true);
        const data = await db.getSalesReps(sellerId);
        setReps(data);
        setLoading(false);
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setWhatsapp('');
        setWechat('');
        setTelegram('');
        setLinkedin('');
        setFacebook('');
        setXTwitter('');
        setSkype('');
        setLine('');
        setInstagram('');
        setFile(null);
        setAvatarUrl('');
        setEditingRep(null);
    };

    const openModal = (rep?: SalesRepresentative) => {
        resetForm();
        if (rep) {
            setEditingRep(rep);
            setName(rep.name);
            setPhone(rep.phone);
            setEmail(rep.email || '');
            setWhatsapp(rep.whatsapp || '');
            setWechat(rep.wechat || '');
            setTelegram(rep.telegram || '');
            setLinkedin(rep.linkedin || '');
            setFacebook(rep.facebook || '');
            setXTwitter(rep.x_twitter || '');
            setSkype(rep.skype || '');
            setLine(rep.line || '');
            setInstagram(rep.instagram || '');
            setAvatarUrl(rep.avatar_url || '');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isDemo) {
            toast.success('Demo: Representative saved successfully!');
            closeModal();
            return;
        }

        setIsSaving(true);

        try {
            let finalAvatarUrl = avatarUrl;

            // Upload image if a new file is chosen
            if (file) {
                const compressed = await compressImageFile(file, {
                    maxBytes: 300 * 1024,
                    maxWidth: 800,
                    maxHeight: 800,
                    outputType: 'image/webp'
                });
                const fileExt = compressed.name.split('.').pop();
                const filePath = `${sellerId}/rep_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('listing-images')
                    .upload(filePath, compressed);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrl;
            }

            await db.upsertSalesRep({
                ...(editingRep ? { id: editingRep.id } : {}),
                seller_id: sellerId,
                name,
                phone,
                email,
                whatsapp,
                wechat,
                telegram,
                linkedin,
                facebook,
                x_twitter: xTwitter,
                skype,
                line,
                instagram,
                avatar_url: finalAvatarUrl,
                is_active: true
            });

            toast.success(editingRep ? 'Sales Representative updated!' : 'Sales Representative added!');
            closeModal();
            fetchReps();
        } catch (e: any) {
            console.error(e);
            toast.error('Failed to save Sales Representative.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this representative?")) return;

        if (isDemo) {
            toast.success('Demo: Representative removed! (Not removed from DB)');
            return;
        }

        try {
            await db.deleteSalesRep(id, sellerId);
            toast.success('Representative removed.');
            fetchReps();
        } catch (e) {
            toast.error('Failed to remove representative.');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Sales Team
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage sales representatives to let buyers contact the right person directly.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Add Rep
                </button>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : reps.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No sales representatives yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Add your sales team members to personalize the contacting experience for your buyers.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {reps.map(rep => (
                            <div key={rep.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col relative group hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                            {rep.avatar_url ? (
                                                <img src={rep.avatar_url} alt={rep.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex justify-center items-center font-bold text-slate-400 bg-slate-100 dark:bg-slate-800">
                                                    {rep.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rep.name}</h4>
                                            <p className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded inline-block mt-0.5 font-semibold">Active Rep</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(rep)} className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded">
                                            <span className="text-[10px] font-bold">Edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(rep.id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-medium">{rep.phone}</span>
                                    </div>
                                    {rep.email && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="truncate">{rep.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                {editingRep ? 'Edit Representative' : 'Add Sales Representative'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100 dark:bg-slate-800 shrink-0 relative flex items-center justify-center">
                                    {file ? (
                                        <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="Preview" />
                                    ) : avatarUrl ? (
                                        <img src={avatarUrl} className="h-full w-full object-cover" alt="Current" />
                                    ) : (
                                        <Users className="h-6 w-6 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Profile Photo</label>
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <Upload className="h-3 w-3" />
                                        Choose New Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4 overflow-y-auto max-h-[60vh] p-6 custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                                        <input
                                            required
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all"
                                            placeholder="e.g. +86 123 4567 8901"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            required
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition-all"
                                            placeholder="john@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 block">Social & Chat Links (Optional)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp</label>
                                            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. +86 1234..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> WeChat</label>
                                            <input value={wechat} onChange={e => setWechat(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. wx_id_123" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-blue-500" /> Telegram</label>
                                            <input value={telegram} onChange={e => setTelegram(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. @username" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-[#00c300]" /> LINE ID</label>
                                            <input value={line} onChange={e => setLine(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. my_line_id" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-sky-500" /> Skype ID</label>
                                            <input value={skype} onChange={e => setSkype(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. live:my_skype" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram</label>
                                            <input value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="e.g. @company_ins" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5 text-indigo-600" /> LinkedIn</label>
                                            <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="Profile URL" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Facebook className="h-3.5 w-3.5 text-blue-700" /> Facebook</label>
                                            <input value={facebook} onChange={e => setFacebook(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="Page URL" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5"><Twitter className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" /> X (Twitter)</label>
                                            <input value={xTwitter} onChange={e => setXTwitter(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-300" placeholder="Profile URL" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !name || !phone}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSaving ? 'Saving...' : 'Save Representative'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesTeamManager;
