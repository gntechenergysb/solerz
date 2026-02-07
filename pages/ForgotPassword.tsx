import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sun, ArrowRight } from 'lucide-react';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { supabase } from '../services/supabaseClient';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [hp, setHp] = useState('');

  const turnstileSiteKey = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hp.trim()) {
      toast.error('Request failed.');
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      toast.error('Please complete the captcha.');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
        captchaToken: captchaToken || undefined,
      } as any);

      if (error) {
        toast.error(error.message || 'Failed to send reset email.');
        return;
      }

      toast.success('Password reset email sent. Please check your inbox (and spam folder).');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl mb-4">
            <Sun className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forgot Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">We will email you a link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="you@company.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2 group"
          >
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          {turnstileSiteKey && (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onToken={setCaptchaToken}
              className="flex justify-center"
            />
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
