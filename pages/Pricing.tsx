import React, { useState } from 'react';
import { Check, X, ShieldCheck, Zap, BarChart2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';

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
    monthlyPrice: 29, // Per listing
    yearlyPrice: 290, // Same for starter (mock logic)
    listingLimit: 1,
    features: [
      '30-Day Active Listing',
      'Basic View Counter',
      'Standard Visibility',
      'Individual & Company Verified'
    ],
    colorTheme: 'slate'
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    listingLimit: 10,
    features: [
      '~ RM 19.90 / listing',
      'Company Profile Badge',
      'Unlock Audience Insights',
      'Listing Performance Funnel'
    ],
    isPopular: true,
    colorTheme: 'emerald'
  },
  {
    id: 'merchant',
    name: 'Merchant',
    monthlyPrice: 399,
    yearlyPrice: 3990,
    listingLimit: 30,
    features: [
      '~ RM 13.30 / listing',
      'Market Price Comparison',
      'Competitor Benchmarking',
      'Priority Search Ranking'
    ],
    colorTheme: 'emerald'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 1199,
    yearlyPrice: 11990,
    listingLimit: 100,
    features: [
      '~ RM 11.99 / listing',
      'Dedicated Account Manager',
      'Deep Market Analytics',
      'Featured Homepage Spots'
    ],
    colorTheme: 'emerald'
  }
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
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

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Billplz API call
    setTimeout(() => {
        setIsProcessing(false);
        setSelectedPlan(null);
        toast.success(`Successfully subscribed to ${selectedPlan?.name}!`);
        // In real app, update user tier here
    }, 2000);
  };

  // Tax Calculation
  const currentPrice = selectedPlan 
    ? (selectedPlan.id === 'starter' 
        ? selectedPlan.monthlyPrice 
        : (billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice))
    : 0;

  // Reverse calculate SST (Price is Nett)
  // Price = Base * 1.08  => Base = Price / 1.08
  const basePrice = currentPrice / 1.08;
  const sstAmount = currentPrice - basePrice;

  return (
    <div className="animate-in fade-in duration-500 py-10 px-4">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Professional Marketplace Pricing</h1>
        <p className="text-lg text-slate-500 mb-8">
            Clear, flat-fee pricing for solar assets. Scale your inventory as you grow.<br/>
            All prices are <span className="font-bold text-slate-800">Nett</span> (Inclusive of 8% SST and Fees).
        </p>

        {/* Toggle */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl relative">
          <div 
            className={`absolute top-1 bottom-1 w-[50%] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${billingCycle === 'monthly' ? 'left-1' : 'left-[49%]'}`} 
          />
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors w-32 ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}
          >
            Monthly
          </button>
          <button 
             onClick={() => setBillingCycle('yearly')}
             className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors w-32 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}
          >
            Yearly <span className="text-[10px] text-emerald-600 ml-1">(-17%)</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {PLANS.map((plan) => {
          const isStarter = plan.id === 'starter';
          const price = isStarter ? plan.monthlyPrice : (billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
          const isEmerald = plan.colorTheme === 'emerald';

          return (
            <div 
                key={plan.id}
                className={`relative flex flex-col p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 duration-300
                ${isEmerald 
                    ? 'bg-white border-emerald-100 shadow-lg shadow-emerald-50' 
                    : 'bg-slate-50 border-slate-200'
                }
                ${plan.isPopular ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
                `}
            >
                {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        MOST POPULAR
                    </div>
                )}

                <div className="mb-6">
                    <h3 className={`text-lg font-bold ${isEmerald ? 'text-emerald-900' : 'text-slate-700'}`}>{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-slate-500">RM</span>
                        <span className="text-4xl font-bold text-slate-900">{price.toLocaleString()}</span>
                        {!isStarter && (
                            <span className="text-slate-500 text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        )}
                    </div>
                    {isStarter && <p className="text-xs text-slate-400 mt-1">One-time payment per post</p>}
                </div>

                <div className="flex-grow space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isEmerald ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            <Zap className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{plan.listingLimit} Active Listings</span>
                    </div>
                    {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check className={`h-4 w-4 ${isEmerald ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                    ))}
                    
                    {/* Visual Aid for Analytics */}
                    {plan.id !== 'starter' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                             <BarChart2 className="h-4 w-4 text-emerald-600" />
                             <span className="text-xs font-medium text-slate-600">
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
                    {isStarter ? 'Pay Per Post' : 'Subscribe Now'}
                </button>
            </div>
          );
        })}
      </div>

      {/* Billplz Style Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPlan(null)}></div>
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                            BP
                         </div>
                         <span className="font-bold text-slate-700">Billplz Secure Checkout</span>
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
                                {selectedPlan.id === 'starter' 
                                    ? 'Single Asset Listing Credit' 
                                    : `${billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`}
                            </p>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 border border-slate-100">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal (Base Price)</span>
                            <span>RM {basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>SST (8%)</span>
                            <span>RM {sstAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between font-bold text-slate-900 text-lg">
                            <span>Total (Nett)</span>
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
                                <span>Pay via Billplz FPX</span>
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