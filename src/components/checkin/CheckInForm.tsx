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
      if (!user) throw new Error('Please sign in to log your daily generation.');

      let uploadedImageUrl = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadResult.error || 'Failed to upload image.');
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
          throw new Error('You have already submitted a check-in for today.');
        }
        throw error;
      }

      setMessage({ type: 'success', text: 'Check-in logged successfully.' });
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
    <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl text-zinc-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
        <div className="p-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-amber-400">
          <Zap className="w-4 h-4 fill-amber-400/20" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Daily Generation Entry
          </h2>
          <p className="text-xs text-zinc-400">Log today's kWh to update your Specific Yield ranking</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl mb-5 flex items-center gap-2.5 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
              : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Today's Yield (kWh) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 28.5"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600 placeholder:font-normal font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              System Capacity (kWp) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 6.4"
              value={kwp}
              onChange={(e) => setKwp(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600 placeholder:font-normal font-mono"
            />
          </div>
        </div>

        {/* Live Specific Yield Preview */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Computed Specific Yield:
          </span>
          <span className="text-sm font-semibold font-mono text-white">
            {calculatedYield} <span className="text-xs text-zinc-400 font-normal">kWh/kWp</span>
          </span>
        </div>

        {/* Proof Screenshot */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
            Inverter App Screenshot (Optional)
          </label>
          <div className="relative border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-center bg-zinc-950/40 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {previewUrl ? (
              <div className="space-y-1">
                <img src={previewUrl} alt="Preview" className="max-h-24 mx-auto rounded-lg object-cover border border-zinc-800" />
                <p className="text-[10px] text-zinc-400 font-mono">WebP compressed</p>
              </div>
            ) : (
              <div className="space-y-1 text-zinc-400">
                <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                <p className="text-xs font-medium text-zinc-300">Upload inverter app proof</p>
                <p className="text-[10px] text-zinc-400">JPG, PNG or WebP</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl transition-all disabled:opacity-50 tracking-wide text-xs uppercase shadow-sm mt-2 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Log Generation & Update Ranking'}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;
