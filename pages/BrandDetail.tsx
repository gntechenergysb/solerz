import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Award,
  Zap,
  Battery,
  ArrowLeft,
  Sun,
  Scale,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import PanelCard from '../components/PanelCard';
import InverterCard from '../components/InverterCard';
import BatteryCard from '../components/BatteryCard';
import AdSlotPlaceholder from '../components/AdSlotPlaceholder';
import type { Brand, SolarPanelSummary, InverterSummary, BatterySummary } from '../types';

const BrandDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [panels, setPanels] = useState<SolarPanelSummary[]>([]);
  const [inverters, setInverters] = useState<InverterSummary[]>([]);
  const [batteries, setBatteries] = useState<BatterySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'panels' | 'inverters' | 'batteries'>('panels');

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimForm, setClaimForm] = useState({ name: '', email: '', role: '', message: '' });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    async function loadBrandData() {
      try {
        const { data: bData, error: bErr } = await supabase
          .from('brands')
          .select('*')
          .eq('slug', slug)
          .single();

        if (bErr || !bData) {
          setLoading(false);
          return;
        }

        setBrand(bData);
        document.title = `${bData.name} — Solar Panels, Inverters & Storage Hardware Catalog | Solerz`;

        // Fetch products by this brand in parallel
        const [panelsRes, invertersRes, batteriesRes] = await Promise.all([
          supabase
            .from('v_solar_panels_summary')
            .select('*')
            .eq('brand_id', bData.id)
            .order('pnom_w', { ascending: false })
            .limit(48),
          supabase
            .from('v_inverters_summary')
            .select('*')
            .eq('brand_id', bData.id)
            .order('paco_w', { ascending: false })
            .limit(48),
          supabase
            .from('v_batteries_summary')
            .select('*')
            .eq('brand_id', bData.id)
            .order('usable_capacity_kwh', { ascending: false })
            .limit(48),
        ]);

        const pList = (panelsRes.data || []) as SolarPanelSummary[];
        const iList = (invertersRes.data || []) as InverterSummary[];
        const bList = (batteriesRes.data || []) as BatterySummary[];

        setPanels(pList);
        setInverters(iList);
        setBatteries(bList);

        if (pList.length > 0) setActiveTab('panels');
        else if (iList.length > 0) setActiveTab('inverters');
        else if (bList.length > 0) setActiveTab('batteries');
      } catch (err) {
        console.error('Error fetching brand detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBrandData();
  }, [slug]);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
    setTimeout(() => {
      setClaimModalOpen(false);
      setClaimSubmitted(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Brand Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The brand requested does not exist in our global registry.</p>
        <Link to="/brands" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Brands Directory
        </Link>
      </div>
    );
  }

  // Top flagship specs
  const maxPanelPower = panels.length > 0 ? Math.max(...panels.map((p) => p.pnom_w)) : null;
  const maxPanelEff = panels.length > 0 ? Math.max(...panels.map((p) => p.module_efficiency_pct || 0)) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back to Brands */}
      <div className="flex items-center justify-between">
        <Link to="/brands" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Brands Directory
        </Link>
        <button
          onClick={() => setClaimModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold hover:bg-emerald-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Claim / Verify {brand.name} Profile
        </button>
      </div>

      {/* Brand Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-10 text-white border border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/10">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  Global Solar &amp; Energy Storage Brand
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {brand.name}
                </h1>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore technical datasheets, certified test parameters, temperature coefficients, and single-diode simulation models for all hardware produced by {brand.name}.
            </p>
          </div>

          {/* Metric Stats */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            {panels.length > 0 && (
              <div className="px-3 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">PV Modules</span>
                <span className="text-2xl font-black text-white">{panels.length}</span>
              </div>
            )}
            {maxPanelPower && (
              <div className="px-3 py-1 border-l border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Max Output</span>
                <span className="text-2xl font-black text-amber-400">{Math.round(maxPanelPower)}W</span>
              </div>
            )}
            {maxPanelEff && maxPanelEff > 0 && (
              <div className="px-3 py-1 border-l border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Peak Efficiency</span>
                <span className="text-2xl font-black text-emerald-400">{maxPanelEff.toFixed(1)}%</span>
              </div>
            )}
            {inverters.length > 0 && (
              <div className="px-3 py-1 border-l border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inverters</span>
                <span className="text-2xl font-black text-cyan-400">{inverters.length}</span>
              </div>
            )}
            {batteries.length > 0 && (
              <div className="px-3 py-1 border-l border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Batteries</span>
                <span className="text-2xl font-black text-purple-400">{batteries.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad / Sponsor Banner for Brand Hub */}
      <AdSlotPlaceholder
        format="horizontal"
        customText={`Official wholesale distributor network & factory warranty archives for ${brand.name}.`}
      />

      {/* Product Catalog Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {panels.length > 0 && (
              <button
                onClick={() => setActiveTab('panels')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'panels'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" /> Solar Panels ({panels.length})
              </button>
            )}
            {inverters.length > 0 && (
              <button
                onClick={() => setActiveTab('inverters')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'inverters'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" /> Inverters ({inverters.length})
              </button>
            )}
            {batteries.length > 0 && (
              <button
                onClick={() => setActiveTab('batteries')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'batteries'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Battery className="w-4 h-4" /> Batteries ({batteries.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'panels' && panels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {panels.map((p) => (
              <PanelCard key={p.id} panel={p} />
            ))}
          </div>
        )}

        {activeTab === 'inverters' && inverters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {inverters.map((inv) => (
              <InverterCard key={inv.id} inverter={inv} />
            ))}
          </div>
        )}

        {activeTab === 'batteries' && batteries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {batteries.map((b) => (
              <BatteryCard key={b.id} battery={b} />
            ))}
          </div>
        )}
      </div>

      {/* Claim Brand Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setClaimModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Claim {brand.name} Brand Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct B2B Manufacturer Verification &amp; Authorized Distributor Listing.
                </p>
              </div>
            </div>

            {claimSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Verification Application Received!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Our manufacturer liaison will contact your team within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Your Name &amp; Title
                  </label>
                  <input
                    type="text"
                    required
                    value={claimForm.name}
                    onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                    placeholder="e.g. David Zhang, Overseas Sales Director"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={claimForm.email}
                    onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                    placeholder={`sales@${slug}.com`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Website / Verification Request
                  </label>
                  <textarea
                    rows={3}
                    value={claimForm.message}
                    onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })}
                    placeholder={`Update official ${brand.name} authorized dealers, datasheet links, and new product releases...`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Brand Verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDetailPage;
