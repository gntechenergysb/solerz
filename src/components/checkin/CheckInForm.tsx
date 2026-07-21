import React, { useState } from 'react';
import { Sun, MapPin, Zap, Camera, Leaf, Sparkles, CheckCircle2, CloudSun, Cloud, CloudRain } from 'lucide-react';
import { CheckInFormData } from '../../types/checkin';
import { calculateCO2Reduction, calculateTreesEquivalent } from '../../utils/carbon';
import toast from 'react-hot-toast';

interface CheckInFormProps {
  onSuccess?: () => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CheckInFormData>({
    systemName: '頂樓太陽能案場',
    capacitykWp: 10.5,
    dailyKWh: 52.0,
    location: '屏東縣 萬丹鄉',
    photoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
    note: '陽光充足，發電效率極佳！',
    weather: 'sunny'
  });

  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Carbon Stats
  const co2Saved = calculateCO2Reduction(formData.dailyKWh || 0);
  const treesEquiv = calculateTreesEquivalent(co2Saved);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dailyKWh || formData.dailyKWh <= 0) {
      toast.error('請輸入有效的今日太陽能發電度數 (kWh)');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 border border-emerald-500/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 text-white`}>
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-400 text-base">太陽能打卡成功！🎉</h4>
            <p className="text-xs text-slate-300 mt-1">
              今日發電 <span className="font-bold text-amber-300">{formData.dailyKWh} kWh</span>，成功為地球減少 <span className="font-bold text-emerald-300">{co2Saved} kg CO₂</span> 排放！
            </p>
          </div>
        </div>
      ), { duration: 4000 });

      if (onSuccess) {
        onSuccess();
      }
    }, 600);
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
            每日太陽能發電打卡
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            記錄今日案場發電量，同步解鎖綠電成就與排行榜積分
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Real-time Carbon & Power Saving Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-amber-950/60 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">今日發電量</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {formData.dailyKWh || 0} <span className="text-xs font-normal text-slate-400">kWh</span>
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

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">相當於造樹</span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {treesEquiv} <span className="text-xs font-normal text-slate-400">棵/年</span>
              </span>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* System Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              太陽能系統/案場名稱 *
            </label>
            <input
              type="text"
              required
              value={formData.systemName}
              onChange={e => setFormData({ ...formData, systemName: e.target.value })}
              placeholder="例：頂樓光電系統 1號機"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
            />
          </div>

          {/* System Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              裝置容量 (kWp) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.capacitykWp || ''}
              onChange={e => setFormData({ ...formData, capacitykWp: parseFloat(e.target.value) || 0 })}
              placeholder="例：10.5"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm font-mono"
            />
          </div>

          {/* Daily kWh generated */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              今日總發電量 (kWh/度) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                value={formData.dailyKWh || ''}
                onChange={e => setFormData({ ...formData, dailyKWh: parseFloat(e.target.value) || 0 })}
                placeholder="例：52.5"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-base font-mono pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                度 (kWh)
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              案場地理位置
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="例：屏東縣 萬丹鄉"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
              />
              <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Weather Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            今日天候狀況
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'sunny', label: '烈日晴空', icon: Sun, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
              { key: 'partly_cloudy', label: '多雲時晴', icon: CloudSun, color: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10' },
              { key: 'cloudy', label: '陰天遮日', icon: Cloud, color: 'text-slate-300 border-slate-700 bg-slate-800/50' },
              { key: 'rainy', label: '陰雨綿綿', icon: CloudRain, color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10' }
            ].map(item => {
              const Icon = item.icon;
              const selected = formData.weather === item.key;
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setFormData({ ...formData, weather: item.key as any })}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? `${item.color} shadow-lg ring-1 ring-amber-400/50`
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Upload Simulation */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            案場/電表現場打卡照片 (可選)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {photoPreview && (
              <div className="relative w-full sm:w-36 h-24 rounded-2xl overflow-hidden border border-slate-800 group">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs text-white">
                  預覽照片
                </div>
              </div>
            )}
            <label className="w-full sm:flex-1 cursor-pointer border-2 border-dashed border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-300 transition-all bg-slate-950/50">
              <Camera className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-medium">點擊選擇照片或拍照上傳</span>
              <span className="text-[10px] text-slate-500">支援 JPG, PNG, WEBP 格式</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            今日發電心得 / 現場備註
          </label>
          <textarea
            rows={2}
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            placeholder="寫下今日太陽能運轉狀況或經驗心得..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-base tracking-wide hover:brightness-110 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sun className="w-5 h-5 fill-slate-950" />
              <span>確認發電打卡並上傳成就</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;
