import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, ArrowRight, User, Briefcase, ShoppingBag, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TurnstileWidget } from '../components/TurnstileWidget';

type RegistrationRole = 'Buyer' | 'Individual Seller' | 'Company Seller';

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false); // New state
  const [slowHint, setSlowHint] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [hp, setHp] = useState('');

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!loading) {
      setSlowHint(false);
      return;
    }

    const t = window.setTimeout(() => setSlowHint(true), 10000);
    return () => window.clearTimeout(t);
  }, [loading]);

  // Step 1: Role Selection
  const [role, setRole] = useState<RegistrationRole>('Buyer');

  // Step 2: Details
  const [formData, setFormData] = useState({
    email: '',
    name: '', // Used for company_name in Profile
    password: '' // Mock
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (hp.trim()) {
      toast.error('Sign up failed.');
      setLoading(false);
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      toast.error('Please complete the captcha.');
      setLoading(false);
      return;
    }

    // Map form data to Profile type
    const profileData = {
      email: formData.email,
      company_name: formData.name, // "Name" acts as Company Name or Full Name
      seller_type: role === 'Company Seller' ? 'COMPANY' : 'INDIVIDUAL' as 'COMPANY' | 'INDIVIDUAL',
      tier: 'UNSUBSCRIBED' as any,
      role: role === 'Buyer' ? 'BUYER' : 'SELLER'
    };

    try {
      const result = await register(profileData, formData.password, captchaToken);

      if (result.success) {
        if (result.needsEmailVerification) {
          toast.success(result.msg || 'Account created! Please verify your email.');
          setVerificationSent(true);
        } else {
          toast.success(result.msg || 'Account created!');
          navigate('/dashboard');
        }
      } else {
        toast.error(result.msg || 'Email already in use or sign up failed.');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sun className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Verify Your Email</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            We've sent a confirmation link to <span className="font-bold text-slate-800 dark:text-slate-100">{formData.email}</span>.
            <br />Please check your inbox (and spam folder) to activate your account.
          </p>

          <Link to="/login">
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">
              I've Verified My Email - Log In
            </button>
          </Link>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
            Didn't receive it? <button className="text-emerald-600 font-bold hover:underline">Resend code</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl mb-4 hover:bg-emerald-200 dark:hover:bg-emerald-500/15 transition-colors">
            <Sun className="h-8 w-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Join Solerz</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Create your identity in the solar market.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">I am a...</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setRole('Buyer')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Buyer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-100 hover:border-slate-200 text-slate-500 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'}`}
              >
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Buyer</span>
              </div>
              <div
                onClick={() => setRole('Individual Seller')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Individual Seller' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-100 hover:border-slate-200 text-slate-500 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'}`}
              >
                <User className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Individual<br />Seller</span>
              </div>
              <div
                onClick={() => setRole('Company Seller')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Company Seller' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-100 hover:border-slate-200 text-slate-500 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'}`}
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Company<br />Seller</span>
              </div>
            </div>
          </div>

          {/* Dynamic Form Fields */}
          <div className="space-y-4">
            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="name@example.com"
              />
            </div>

            {/* Role Specific Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {role === 'Company Seller' ? 'Registered Company Name' : 'Full Name'}
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder={role === 'Company Seller' ? "Solar Tech Sdn Bhd" : "John Doe"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-slate-200 dark:shadow-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          {turnstileSiteKey && (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onToken={setCaptchaToken}
              className="flex justify-center"
            />
          )}

          {slowHint && (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
              This is taking longer than usual. If you get a timeout, your account may still be created. Please check your email and try logging in.
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Log In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;