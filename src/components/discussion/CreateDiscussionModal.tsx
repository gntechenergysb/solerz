import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { compressImageToWebP } from '../../services/imageCompression';
import { DiscussionCategory } from '../../types/discussion';
import { X, MessageSquarePlus, Upload, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDiscussionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>('troubleshooting');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      try {
        const compressed = await compressImageToWebP(selected);
        setFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch (err) {
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to start a discussion.');

      let imageUrl = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
        imageUrl = data.url;
      }

      const { error } = await supabase.from('discussions').insert({
        user_id: user.id,
        title,
        content,
        category,
        image_url: imageUrl || null,
        is_dummy: false,
      });

      if (error) throw error;

      setTitle('');
      setContent('');
      setFile(null);
      setPreviewUrl(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/50">
          <X className="w-5 h-5"/>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <MessageSquarePlus className="w-6 h-6"/>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Ask Question or Share Post</h3>
            <p className="text-xs text-slate-400">Get advice from global solar owners & certified installers</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0"/> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Topic Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DiscussionCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="troubleshooting">⚡ Troubleshooting / Repair</option>
              <option value="hardware">🔍 Inverter & Panel Reviews</option>
              <option value="tips">💡 ROI & Energy Saving Tips</option>
              <option value="general">💬 General Solar Discussion</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Title / Question *</label>
            <input
              type="text"
              required
              placeholder="e.g. Why is my 5kW inverter clipping output around 2 PM?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-500 placeholder:font-normal placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Details & Setup Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your system configuration (brand, capacity, roof tilt, weather) and the issue..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Attach Photo or Chart (Optional)</label>
            <div className="relative border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-3 text-center bg-slate-800/30">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-24 mx-auto rounded-lg object-cover" />
              ) : (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-1">
                  <Upload className="w-4 h-4 text-slate-500"/> Drop installation photo or app chart
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider mt-2"
          >
            {loading ? 'Posting...' : 'Publish Discussion'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussionModal;
