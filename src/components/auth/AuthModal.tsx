import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { GLOBAL_COUNTRIES, TOP_INVERTER_BRANDS, TOP_PANEL_BRANDS } from '../../utils/equipment';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [systemKwp, setSystemKwp] = useState('6.0');
  const [panelBrand, setPanelBrand] = useState('Jinko Solar');
  const [inverterBrand, setInverterBrand] = useState('Enphase Energy');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || 'Solar Owner',
              country_code: countryCode,
              system_kwp: parseFloat(systemKwp) || 5.0,
              panel_brand: panelBrand,
              inverter_brand: inverterBrand,
            },
          },
        });
        if (error) throw error;
      }
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/50"
        >
          <X className="w-5 h-5"/>
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Lock className="w-5 h-5"/>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{mode === 'login' ? 'Sign In' : 'Create Owner Account'}</h3>
            <p className="text-xs text-slate-400">Join the Global Solar Arena</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-xs text-rose-300 mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="solar.owner@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Display Name / Alias</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex (California Sun)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Country</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {GLOBAL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">System Size (kWp)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={systemKwp}
                    onChange={(e) => setSystemKwp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Panel Brand</label>
                  <select
                    value={panelBrand}
                    onChange={(e) => setPanelBrand(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-[11px] focus:outline-none focus:border-amber-500"
                  >
                    {TOP_PANEL_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Inverter Brand</label>
                  <select
                    value={inverterBrand}
                    onChange={(e) => setInverterBrand(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-[11px] focus:outline-none focus:border-amber-500"
                  >
                    {TOP_INVERTER_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => setMode('signup')} className="text-amber-400 font-bold underline">Sign Up Free</button></p>
          ) : (
            <p>Already registered? <button onClick={() => setMode('login')} className="text-amber-400 font-bold underline">Sign In</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
