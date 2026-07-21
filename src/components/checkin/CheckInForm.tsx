import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { compressImageToWebP } from '../../services/imageCompression';
import { Upload, Zap, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const CheckInForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [kwh, setKwh] = useState<string>('');
  const [kwp, setKwp] = useState<string>('5.0');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    setSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to submit your daily generation.');

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

      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        check_in_date: new Date().toISOString().slice(0, 10),
        kwh_generated: parseFloat(kwh),
        system_kwp: parseFloat(kwp),
        image_url: uploadedImageUrl || null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already logged your generation for today!');
        }
        throw error;
      }

      setMessage({ type: 'success', text: 'Check-in logged! You are now live on the arena board.' });
      setKwh('');
      setFile(null);
      setPreviewUrl(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedYield =
    parseFloat(kwh) > 0 && parseFloat(kwp) > 0
      ? (parseFloat(kwh) / parseFloat(kwp)).toFixed(2)
      : '0.00';

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-slate-100 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
          <Zap className="w-6 h-6 fill-amber-400"/>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Daily Solar Check-In
          </h2>
          <p className="text-xs text-slate-400">Log today's yield to claim your rank</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0"/>
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Today's Yield (kWh) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 28.5"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              System Size (kWp) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 6.4"
              value={kwp}
              onChange={(e) => setKwp(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Live Specific Yield Preview */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400"/>
            Estimated Specific Yield:
          </span>
          <span className="text-sm font-black text-amber-400">
            {calculatedYield} <span className="text-xs text-slate-500 font-normal">kWh/kWp</span>
          </span>
        </div>

        {/* Screenshot Proof Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            App Proof Screenshot (Optional)
          </label>
          <div className="relative border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center bg-slate-800/30 hover:bg-slate-800/60 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {previewUrl ? (
              <div className="space-y-1.5">
                <img src={previewUrl} alt="Preview" className="max-h-28 mx-auto rounded-lg object-cover" />
                <p className="text-[11px] text-amber-400 font-medium">Auto-compressed WebP format</p>
              </div>
            ) : (
              <div className="space-y-1 text-slate-400">
                <Upload className="w-6 h-6 mx-auto text-slate-500"/>
                <p className="text-xs font-medium">Click or drop inverter app screenshot</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 tracking-wide text-sm"
        >
          {submitting ? 'Compressing & Submitting...' : 'LOG GENERATION & ENTER ARENA'}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;
