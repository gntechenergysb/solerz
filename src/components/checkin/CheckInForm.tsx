import React, { useState, useEffect } from 'react';
import { Sun, Zap, Camera, Leaf, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { compressImageToWebP } from '../../services/imageCompression';
import toast from 'react-hot-toast';

interface CheckInFormProps {
  onSuccess?: () => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ onSuccess }) => {
  const [kwh, setKwh] = useState<string>('');
  const [kwp, setKwp] = useState<string>('5.0');
  const [notes, setNotes] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user's system_kwp from profile on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('system_kwp')
          .eq('id', user.id)
          .single();
        if (profile?.system_kwp) {
          setKwp(String(profile.system_kwp));
        }
      }
    })();
  }, []);

  // Live computed efficiency
  const kwhNum = parseFloat(kwh) || 0;
  const kwpNum = parseFloat(kwp) || 1;
  const efficiency = kwpNum > 0 ? (kwhNum / kwpNum).toFixed(3) : '0.000';
  const co2Saved = (kwhNum * 0.495).toFixed(2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      try {
        const compressed = await compressImageToWebP(selectedFile);
        setFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch {
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
      if (!user) throw new Error('請先登入帳號以進行打卡');

      let uploadedImageUrl = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadResult.error || '圖片上傳失敗');
        uploadedImageUrl = uploadResult.url;
      }

      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        check_in_date: new Date().toISOString().slice(0, 10),
        kwh_generated: parseFloat(kwh),
        system_kwp: parseFloat(kwp),
        image_url: uploadedImageUrl || null,
        notes: notes || null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('您今日已經完成打卡囉！每人每天限打卡一次。');
        }
        throw error;
      }

      setMessage({ type: 'success', text: '打卡成功！已將您的數據更新至排行榜。' });

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 border border-emerald-500/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 text-white`}>
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-400 text-base">太陽能打卡成功！🎉</h4>
            <p className="text-xs text-slate-300 mt-1">
              今日發電 <span className="font-bold text-amber-300">{kwh} kWh</span>，
              效率 <span className="font-bold text-cyan-300">{efficiency} kWh/kWp</span>，
              減碳 <span className="font-bold text-emerald-300">{co2Saved} kg CO₂</span>！
            </p>
          </div>
        </div>
      ), { duration: 4000 });

      setKwh('');
      setNotes('');
      setFile(null);
      setPreviewUrl(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '發生未知錯誤' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/20 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
          <Sun className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ☀️ 今日發電打卡
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            輸入發電量與系統容量，即時計算效率 (kWh/kWp) 並登上排行榜
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-xl mb-5 text-sm font-medium relative ${
          message.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border border-red-500/30 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Real-time Stats Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-amber-950/60 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">今日發電量</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {kwhNum || 0} <span className="text-xs font-normal text-slate-400">kWh</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">特定發電效率</span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {efficiency} <span className="text-xs font-normal text-slate-400">kWh/kWp</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">預計減碳量</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {co2Saved} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
              </span>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Daily kWh generated */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              今日發電量 (kWh/度) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="例如: 24.5"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-lg font-mono"
            />
          </div>

          {/* System Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              系統總容量 (kWp) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="例如: 5.0"
              value={kwp}
              onChange={(e) => setKwp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm font-mono"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            App 截圖證明 (自動壓縮為 WebP)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {previewUrl && (
              <div className="relative w-full sm:w-36 h-24 rounded-2xl overflow-hidden border border-slate-800 group">
                <img src={previewUrl} alt="壓縮預覽" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs text-white">
                  壓縮預覽
                </div>
              </div>
            )}
            <label className="w-full sm:flex-1 cursor-pointer border-2 border-dashed border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-300 transition-all bg-slate-950/50">
              <Camera className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-medium">點擊選擇照片或拍照上傳</span>
              <span className="text-[10px] text-slate-500">支援 JPG, PNG, WEBP · 自動壓縮為 WebP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            今日發電備註 (可選)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="寫下今日太陽能運轉狀況或經驗心得..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-base tracking-wide hover:brightness-110 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sun className="w-5 h-5 fill-slate-950" />
              <span>提交打卡並進入排行榜</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;
