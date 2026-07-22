import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { compressImageToWebP } from '../../services/imageCompression';
import { calculateCO2SavedKg } from '../../utils/carbon';
import { TOP_PANEL_BRANDS, TOP_INVERTER_BRANDS, GLOBAL_COUNTRIES } from '../../utils/equipment';
import { AuthModal } from '../auth/AuthModal';
import { Upload, Zap, AlertCircle, CheckCircle2, Sparkles, Leaf, Lock, LogIn } from 'lucide-react';

export const CheckInForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [kwh, setKwh] = useState<string>('');
  const [kwp, setKwp] = useState<string>('6.0');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [panelBrand, setPanelBrand] = useState<string>('Jinko Solar');
  const [inverterBrand, setInverterBrand] = useState<string>('Enphase Energy');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
      if (data?.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: profile }) => {
          if (profile) {
            setCountryCode(profile.country_code || 'US');
            setKwp(profile.system_kwp ? String(profile.system_kwp) : '6.0');
            setPanelBrand(profile.panel_brand || 'Jinko Solar');
            setInverterBrand(profile.inverter_brand || 'Enphase Energy');
          }
        }).catch(err => console.warn('Profile load warning:', err));
      }
    }).catch(err => console.warn('Auth check warning:', err));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      try {
        const compressed = await compressImageToWebP(selectedFile);
        setFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch (err) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrl = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadResult.error || 'Failed to upload screenshot.');
        uploadedImageUrl = uploadResult.url;
      }

      await supabase.from('profiles').update({
        country_code: countryCode,
        panel_brand: panelBrand,
        inverter_brand: inverterBrand,
        system_kwp: parseFloat(kwp),
      }).eq('id', currentUser.id);

      const { error } = await supabase.from('check_ins').insert({
        user_id: currentUser.id,
        check_in_date: new Date().toISOString().slice(0, 10),
        kwh_generated: parseFloat(kwh),
        system_kwp: parseFloat(kwp),
        image_url: uploadedImageUrl || null,
        is_dummy: false,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already logged your generation for today!');
        }
        throw error;
      }

      setMessage({ type: 'success', text: 'Check-in live! You are now ranked on the global leaderboard.' });
      setKwh('');
      setFile(null);
      setPreviewUrl(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
      alertRef.current?.scrollIntoView({ behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const kwhNum = parseFloat(kwh) || 0;
  const kwpNum = parseFloat(kwp) || 0;
  const calculatedYield = kwhNum > 0 && kwpNum > 0 ? (kwhNum / kwpNum).toFixed(2) : '0.00';
  const estimatedCo2 = kwhNum > 0 ? calculateCO2SavedKg(kwhNum, countryCode) : 0;

  // Unauthenticated Lock Card View
  if (!currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center text-slate-100 relative overflow-hidden">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Lock className="w-6 h-6"/>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Sign In to Log Daily Generation</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
          Log today's yield, compare your kWh/kWp efficiency with global owners, and track your CO2 environmental impact.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs uppercase tracking-wider"
        >
          <LogIn className="w-4 h-4"/> Sign In / Register Now
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signup" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-slate-100 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
          <Zap className="w-6 h-6 fill-amber-400"/>
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Daily Solar Check-In</h2>
          <p className="text-xs text-slate-400">Log today's output to enter global arena</p>
        </div>
      </div>

      <div ref={alertRef}>
        {message && (
          <div className={`p-3.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-medium border ${message.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-rose-950/40 text-rose-300 border-rose-800/50'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0"/>}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Country / Location</label>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500">
              {GLOBAL_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">System Size (kWp) *</label>
            <input type="number" step="0.01" required placeholder="e.g. 6.4" value={kwp} onChange={(e) => setKwp(e.target.value)} className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Panel Brand</label>
            <select value={panelBrand} onChange={(e) => setPanelBrand(e.target.value)} className="w-full px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:border-amber-500">
              {TOP_PANEL_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Inverter Brand</label>
            <select value={inverterBrand} onChange={(e) => setInverterBrand(e.target.value)} className="w-full px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:border-amber-500">
              {TOP_INVERTER_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Today's Generation (kWh) *</label>
          <input type="number" step="0.01" required placeholder="e.g. 32.8" value={kwh} onChange={(e) => setKwh(e.target.value)} className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-black text-xl focus:outline-none focus:border-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0"/>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Specific Yield</p>
              <p className="text-sm font-black text-amber-400">{calculatedYield} <span className="text-[10px] font-normal text-slate-500">kWh/kWp</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0"/>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">CO2 Offset</p>
              <p className="text-sm font-black text-emerald-400">{estimatedCo2} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">App Proof Screenshot (Optional)</label>
          <div className="relative border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-3.5 text-center bg-slate-800/30 hover:bg-slate-800/60 transition-all">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {previewUrl ? (
              <div className="space-y-1">
                <img src={previewUrl} alt="Preview" className="max-h-24 mx-auto rounded-lg object-cover" />
                <p className="text-[10px] text-amber-400 font-medium">Auto-compressed WebP image</p>
              </div>
            ) : (
              <div className="space-y-1 text-slate-400">
                <Upload className="w-5 h-5 mx-auto text-slate-500"/>
                <p className="text-xs font-medium">Click or drop inverter app screenshot</p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all disabled:opacity-50 text-xs uppercase tracking-wider">
          {submitting ? 'Compressing & Submitting...' : 'Log Yield & Claim Rank'}
        </button>
      </form>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signup" />
    </div>
  );
};

export default CheckInForm;
