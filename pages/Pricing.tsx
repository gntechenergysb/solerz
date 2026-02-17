import React, { useState } from 'react';
import { Check, X, ShieldCheck, Zap, BarChart2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

type BillingCycle = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number; // The yearly price (total)
  listingLimit: number;
  features: string[];
  isPopular?: boolean;
  colorTheme: 'slate' | 'emerald';
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 39,
    yearlyPrice: 428,
    listingLimit: 3,
    features: [
      '3 Active Listings (30 days each)',
      'Basic View Counter',
      'Standard Visibility',
      'SSM Verification',
      'Company Profile Page'
    ],
    colorTheme: 'slate'
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 99,
    yearlyPrice: 1088,
    listingLimit: 10,
    features: [
      '10 Active Listings (30 days each)',
      'Basic View Counter',
      'Standard Visibility',
      'SSM Verification',
      'Company Profile Page'
    ],
    isPopular: true,
    colorTheme: 'emerald'
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 199,
    yearlyPrice: 2188,
    listingLimit: 25,
    features: [
      '25 Active Listings (30 days each)',
      'Basic View Counter',
      'Standard Visibility',
      'SSM Verification',
      'Company Profile Page',
      'Basic Analytics'
    ],
    colorTheme: 'emerald'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    yearlyPrice: 5488,
    listingLimit: 80,
    features: [
      '80 Active Listings (30 days each)',
      'Basic View Counter',
      'Standard Visibility',
      'SSM Verification',
      'Company Profile Page',
      'Basic Analytics'
    ],
    colorTheme: 'emerald'
  }
];

const Pricing: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to handle plan selection
  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
        toast.error("Please login to purchase a plan");
        navigate('/login');
        return;
    }
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!user || !selectedPlan) return;
    setIsProcessing(true);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error('Please login again to continue.');
        navigate('/login');
        return;
      }

      const isSubscribed = user.tier !== 'UNSUBSCRIBED';

      if (isSubscribed) {
        // 已订阅用户跳转到 Stripe Portal 管理
        const res = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ returnPath: '/dashboard' })
        });

        const json = (await res.json().catch(() => null)) as any;
        if (!res.ok) {
          throw new Error(String(json?.error || 'portal_failed'));
        }

        const url = String(json?.url || '').trim();
        if (!url) throw new Error('missing_portal_url');

        window.location.href = url;
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle
        })
      });

      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        throw new Error(String(json?.error || 'checkout_failed'));
      }

      const url = String(json?.url || '').trim();
      if (!url) throw new Error('missing_checkout_url');

      window.location.href = url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error('Unable to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const currentPrice = selectedPlan 
    ? (billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice)
    : 0;

  return (
    <div className="animate-in fade-in duration-500 py-10 px-4">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Professional Listing Platform Pricing</h1>
        <p className="text-lg text-slate-500 dark:text-slate-300 mb-8">
            Clear, flat-fee pricing for solar assets. Scale your inventory as you grow.
        </p>

        {/* Toggle */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl relative border border-transparent dark:border-slate-800">
          <div 
            className={`absolute top-1 bottom-1 w-[50%] bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-all duration-300 ease-out ${billingCycle === 'monthly' ? 'left-1' : 'left-[49%]'}`} 
          />
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors w-32 ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-300'}`}
          >
            Monthly
          </button>
          <button 
             onClick={() => setBillingCycle('yearly')}
             className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors w-32 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-300'}`}
          >
            Yearly <span className="text-[10px] text-emerald-600 ml-1">(1 month free)</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {PLANS.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isEmerald = plan.colorTheme === 'emerald';

          return (
            <div 
                key={plan.id}
                className={`relative flex flex-col p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 duration-300
                ${isEmerald 
                    ? 'bg-white border-emerald-100 shadow-lg shadow-emerald-50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none' 
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }
                ${plan.isPopular ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950' : ''}
                `}
            >
                {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        MOST POPULAR
                    </div>
                )}

                <div className="mb-6">
                    <h3 className={`text-lg font-bold ${isEmerald ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-200'}`}>{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-300">RM</span>
                        <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{price.toLocaleString()}</span>
                        <span className="text-slate-500 dark:text-slate-300 text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                </div>

                <div className="flex-grow space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isEmerald ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            <Zap className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{plan.listingLimit} Active Listings</span>
                    </div>
                    {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check className={`h-4 w-4 ${isEmerald ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                        </div>
                    ))}
                    
                    {/* Visual Aid for Analytics */}
                    {plan.id !== 'starter' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 mt-2">
                             <BarChart2 className="h-4 w-4 text-emerald-600" />
                             <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                {plan.id === 'pro' ? 'Basic Analytics' : 'Market Price Benchmarking'}
                             </span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                    ${isEmerald 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 shadow-lg' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300 shadow-md'
                    }`}
                >
                    Subscribe Now
                </button>
            </div>
          );
        })}

      {/* Custom Plan */}
      <div className="relative flex flex-col p-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Custom</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-300">Contact Us</span>
          </div>
        </div>

        <div className="flex-grow space-y-4 mb-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Enterprise Solutions</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Large-scale projects & custom requirements</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Unlimited Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Dedicated Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Custom Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">API Access</span>
            </div>
          </div>
        </div>

        <a 
          href="mailto:support@solerz.com?subject=Custom%20Plan%20Inquiry"
          className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          Get Quote
        </a>
      </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPlan(null)}></div>
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
                            S
                         </div>
                         <span className="font-bold text-slate-700">Secure Checkout</span>
                    </div>
                    <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{selectedPlan.name} Plan</h3>
                            <p className="text-slate-500 text-sm">
                                {`${billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                        <div className="flex justify-between font-bold text-slate-900 text-lg">
                            <span>Total</span>
                            <span>RM {currentPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <span>Processing Payment...</span>
                        ) : (
                            <>
                                <span>Pay with Stripe</span>
                            </>
                        )}
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-4 opacity-50 grayscale">
                       {/* Mock Bank Icons */}
                       <div className="h-6 w-10 bg-slate-300 rounded"></div>
                       <div className="h-6 w-10 bg-slate-300 rounded"></div>
                       <div className="h-6 w-10 bg-slate-300 rounded"></div>
                       <div className="h-6 w-10 bg-slate-300 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pricing;