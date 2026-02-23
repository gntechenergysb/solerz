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
      'Company Verification'
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
      'Company Verification'
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
      'Company Verification',
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
      'Company Verification',
      'Basic Analytics'
    ],
    colorTheme: 'emerald'
  }
];

const TIER_RANK: Record<string, number> = { STARTER: 1, PRO: 2, ELITE: 3, ENTERPRISE: 4 };

const Pricing: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSubscribed = !!user && user.tier !== 'UNSUBSCRIBED';
  const currentTier = user?.tier?.toUpperCase() || '';
  const currentBilling = user?.stripe_billing_interval === 'year' ? 'yearly' : 'monthly';
  const isCancelPending = !!user?.stripe_cancel_at_period_end;

  // Determine button label and state for each plan card
  const getPlanAction = (plan: Plan): { label: string; disabled: boolean; action: string } => {
    if (!isSubscribed) return { label: 'Subscribe Now', disabled: false, action: 'subscribe' };

    const planTier = plan.id.toUpperCase();
    const isSameTier = planTier === currentTier;
    const isSameBilling = billingCycle === currentBilling;

    if (isSameTier && isSameBilling) {
      if (isCancelPending) return { label: 'Resubscribe', disabled: false, action: 'resubscribe' };
      return { label: 'Current Plan', disabled: true, action: 'current' };
    }

    const planRank = TIER_RANK[planTier] || 0;
    const currentRank = TIER_RANK[currentTier] || 0;

    if (planRank > currentRank) return { label: 'Upgrade', disabled: false, action: 'upgrade' };
    if (planRank < currentRank) return { label: 'Downgrade', disabled: false, action: 'downgrade' };

    // Same rank but different billing cycle
    if (billingCycle === 'yearly') {
      return { label: 'Switch to Yearly', disabled: false, action: 'switch_to_yearly' };
    }
    return { label: 'Switch to Monthly', disabled: false, action: 'switch_to_monthly' };
  };

  // Helper to handle plan selection
  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.error("Please login to purchase a plan");
      navigate('/login');
      return;
    }
    const { disabled } = getPlanAction(plan);
    if (disabled) return;
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

      if (isSubscribed) {
        // Already subscribed → call change API
        const res = await fetch('/api/stripe/subscription/change', {
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
          throw new Error(String(json?.error || 'change_failed'));
        }

        if (json?.mode === 'resubscribed') {
          toast.success('Subscription reactivated!');
        } else if (json?.mode === 'upgrade') {
          toast.success('Plan upgraded successfully!');
        } else if (json?.mode === 'downgrade_scheduled') {
          const effectiveDate = json?.effectiveAt
            ? new Date(json.effectiveAt * 1000).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
          toast.success(`Plan change scheduled${effectiveDate ? ` for ${effectiveDate}` : ''}.`);
        }

        await refreshUser();
        setSelectedPlan(null);
        navigate('/dashboard');
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
    } finally {
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

      {/* Premium 4-Column Grid Layout */}
      <div className="max-w-[85rem] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 mb-16">

        {PLANS.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isEmerald = plan.colorTheme === 'emerald';

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all hover:-translate-y-1.5 duration-300
                ${isEmerald
                  ? 'bg-white border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.12)] dark:bg-slate-900 border-t-[6px] !border-t-emerald-500 dark:border-slate-800 dark:shadow-none'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 border-t-[6px] !border-t-slate-300 dark:!border-t-slate-700'
                }
                ${plan.isPopular ? 'ring-2 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] dark:ring-offset-slate-950 scale-100 lg:scale-[1.02] z-10' : 'hover:shadow-xl'}
                `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-md uppercase">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-extrabold tracking-tight mb-2 ${isEmerald ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">RM</span>
                  <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-50">{price.toLocaleString()}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="flex-grow space-y-5 mb-10">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                  <div className={`p-2 rounded-xl ${isEmerald ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{plan.listingLimit} Active Listings</span>
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 mt-0.5 ${isEmerald ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="text-slate-600 dark:text-slate-300 leading-snug">{feature}</span>
                  </div>
                ))}

                {/* Visual Aid for Analytics */}
                {plan.id !== 'starter' && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50 mt-4 shadow-sm">
                    <BarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {plan.id === 'pro' ? 'Basic Analytics Dashboard' : 'Market Price Benchmarking'}
                    </span>
                  </div>
                )}
              </div>

              {(() => {
                const { label, disabled, action } = getPlanAction(plan);
                const isResubscribe = action === 'resubscribe';
                const isCurrent = action === 'current';
                return (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={disabled}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base
                      ${isCurrent
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : isResubscribe
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                          : isEmerald
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md shadow-slate-900/20'
                      }`}
                  >
                    {label}
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Horizontal Enterprise / Custom Banner */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none" />
          <div className="absolute -right-20 top-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex items-center gap-6 mb-8 md:mb-0 text-center md:text-left">
            <div className="hidden sm:flex w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl items-center justify-center shrink-0">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise Solutions</h3>
              <p className="text-slate-400 max-w-lg leading-relaxed text-sm md:text-base">
                Need more than 80 listings? Get specialized API integrations, dedicated account management, and bulk onboarding services.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@solerz.com?subject=Enterprise%20Plan%20Inquiry"
            className="relative z-10 w-full md:w-auto px-8 py-4 rounded-xl font-bold transition-all text-center border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 tracking-wide"
          >
            Contact Sales
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know about billing and limits.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* FAQ 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> What counts as an "Active Listing"?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              An active listing is any inventory item currently visible to buyers on the marketplace. You can have unlimited Draft or Paused listings without them counting against your tier quota.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" /> How do upgrades work?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Upgrades take effect immediately. You'll only pay the prorated difference for the remainder of your current billing cycle, then the full new price from the next cycle. Switching from monthly to yearly billing also takes effect immediately.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> How do downgrades work?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Downgrades are scheduled to take effect at the end of your current billing period. You'll continue to enjoy your current plan's benefits until then. No partial refunds are issued for the remaining period. Switching from yearly to monthly billing follows the same policy.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <X className="h-5 w-5 text-rose-500" /> How do cancellations work?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              If you cancel, you retain your current plan's privileges until the end of your billing cycle. After that, your listings are safely paused — never deleted. You can resubscribe at any time to resume them. No refunds are provided for unused time.
            </p>
          </div>

          {/* FAQ 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" /> Are there transaction fees?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              No! We are a zero-commission classifieds platform. Our flat monthly/annual fee is the only cost you pay. You handle 100% of the financial transaction and shipping with buyers directly.
            </p>
          </div>

          {/* FAQ 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> What is the refund policy?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              All subscription fees are non-refundable. When you upgrade, you only pay the prorated difference — no overpayment occurs. Downgrades and cancellations let you keep your current benefits until the billing period ends. We recommend starting with a monthly plan if you'd like to try the platform first.
            </p>
          </div>
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

              {(() => {
                const action = selectedPlan ? getPlanAction(selectedPlan).action : 'subscribe';
                const actionLabel = action === 'resubscribe' ? 'Reactivate Subscription'
                  : action === 'upgrade' ? 'Confirm Upgrade'
                    : action === 'downgrade' ? 'Schedule Downgrade'
                      : action === 'switch_to_yearly' ? 'Confirm Switch'
                        : action === 'switch_to_monthly' ? 'Schedule Switch'
                          : 'Pay with Stripe';
                return (
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Processing...</span>
                    ) : (
                      <span>{actionLabel}</span>
                    )}
                  </button>
                );
              })()}

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