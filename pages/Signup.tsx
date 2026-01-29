import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, ArrowRight, User, Briefcase, ShoppingBag, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

type RegistrationRole = 'Buyer' | 'Individual Seller' | 'Company Seller';

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Step 1: Role Selection
  const [role, setRole] = useState<RegistrationRole>('Buyer');

  // Step 2: Details
  const [formData, setFormData] = useState({
    email: '',
    name: '', // Used for company_name in Profile
    whatsapp: '',
    ssm: '',
    password: '' // Mock
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'Company Seller' && (!formData.ssm || !formData.name)) {
      toast.error("Company Name and SSM Number are required.");
      setLoading(false);
      return;
    }

    // Map form data to Profile type
    const profileData = {
      email: formData.email,
      company_name: formData.name, // "Name" acts as Company Name or Full Name
      whatsapp_no: formData.whatsapp,
      ssm_no: role === 'Company Seller' ? formData.ssm : '',
      seller_type: role === 'Company Seller' ? 'COMPANY' : 'INDIVIDUAL' as 'COMPANY' | 'INDIVIDUAL',
      tier: role === 'Buyer' ? 'STARTER' : (role === 'Company Seller' ? 'MERCHANT' : 'PRO') as any,
      is_verified: role === 'Company Seller' // Auto-verify companies if SSM provided (Mock logic)
    };

    const success = await register(profileData, formData.password);

    if (success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error('Email already in use.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-xl w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-xl mb-4 hover:bg-emerald-200 transition-colors">
            <Sun className="h-8 w-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Join Solerz</h1>
          <p className="text-slate-500 mt-2">Create your identity in the solar market.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">I am a...</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setRole('Buyer')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Buyer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
              >
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Buyer</span>
              </div>
              <div
                onClick={() => setRole('Individual Seller')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Individual Seller' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
              >
                <User className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Individual<br />Seller</span>
              </div>
              <div
                onClick={() => setRole('Company Seller')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${role === 'Company Seller' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            {/* Role Specific Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {role === 'Company Seller' ? 'Registered Company Name' : 'Full Name'}
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder={role === 'Company Seller' ? "Solar Tech Sdn Bhd" : "John Doe"}
              />
            </div>

            {/* Company Specific Fields */}
            {role === 'Company Seller' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">SSM Registration Number</label>
                <input
                  name="ssm"
                  type="text"
                  required
                  value={formData.ssm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="e.g. 202301001234"
                />
                <p className="text-xs text-slate-500 mt-1">Required for verification badge.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="60123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-slate-200"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
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