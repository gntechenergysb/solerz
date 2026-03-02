import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  MessageCircle,
  CheckCircle,
  Package,
  User,
  ArrowRight,
  AlertTriangle,
  Sun,
  Cpu,
  Battery,
  Cable,
  Shield,
  Zap,
  MapPin,
  Eye,
  Building2,
  Phone
} from 'lucide-react';

// Mock UI Components for screenshots
const MarketplacePreview: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-md mx-auto">
    {/* Header */}
    <div className="bg-slate-50 dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
        <Sun className="h-5 w-5 text-white" />
      </div>
      <span className="font-bold text-slate-700 dark:text-slate-300">Solerz</span>
      <div className="ml-auto flex gap-1">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
      </div>
    </div>
    {/* Search */}
    <div className="p-4">
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-400">Search solar panels...</span>
      </div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['Panels', 'Inverters', 'Batteries'].map((f) => (
          <span key={f} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
            {f}
          </span>
        ))}
      </div>
      {/* Listing Card */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Sun className="h-8 w-8 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">550W Solar Panel</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-bold">VERIFIED</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Jinko Solar • Global Supplier</p>
            <p className="text-sm font-bold text-emerald-600">USD 85</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const VerificationPreview: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-md mx-auto">
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-emerald-800 dark:text-emerald-300">Company Verified</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Registration No: 1234567-A</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Company registration verified</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Business address confirmed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Contact information valid</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Acme Solar Trading Corp</span>
        </div>
      </div>
    </div>
  </div>
);

const ContactPreview: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-md mx-auto">
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Contact Seller</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Direct message</p>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400">
          Hi, is the 550W panel still available?
        </div>
        <div className="bg-blue-500 text-white rounded-lg p-3 text-sm ml-8">
          Yes, still available. Can arrange viewing in PJ.
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Call
        </button>
        <button className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium">
          WhatsApp
        </button>
      </div>
    </div>
  </div>
);

const SellerDashboardPreview: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-md mx-auto">
    <div className="bg-slate-50 dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-700">
      <p className="font-semibold text-slate-700 dark:text-slate-300">Seller Dashboard</p>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">12</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Listings</p>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-lg font-bold text-emerald-600">1.2k</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-lg font-bold text-blue-600">8</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inquiries</p>
        </div>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
        <Package className="h-4 w-4" />
        Add New Listing
      </button>
    </div>
  </div>
);

const ListingFormPreview: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-md mx-auto">
    <div className="p-4">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Create Listing</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Product Name</label>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-300">550W Mono Solar Panel</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Price (USD)</label>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-300">850</div>
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Category</label>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-300">Solar Panels</div>
          </div>
        </div>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
          <Package className="h-6 w-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload photos</p>
        </div>
      </div>
    </div>
  </div>
);

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'buy' | 'sell'>('buy');

  return (
    <div className="min-h-screen animate-in fade-in duration-500 pb-16">
      {/* Hero Header */}
      <div className="text-center mb-10 pt-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          How Solerz Works
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-4">
          The world's trusted platform for global solar equipment trades (B2B, B2C, & C2C).
          Discover how easy it is to transact safely on our platform.
        </p>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="flex justify-center mb-16">
        <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl flex relative max-w-xs w-full shadow-inner border border-slate-200/50 dark:border-slate-800">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'buy' ? 'left-1.5' : 'left-[calc(50%+0.375rem)]'}`}
          />
          <button
            onClick={() => setActiveTab('buy')}
            className={`relative z-10 flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-colors ${activeTab === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Search className="h-4 w-4" /> I want to Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`relative z-10 flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-colors ${activeTab === 'sell' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Building2 className="h-4 w-4" /> I want to Sell
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">

        {/* Dynamic Content Area */}
        <div className="relative">

          {/* BUYER JOURNEY */}
          {activeTab === 'buy' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Central Line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-4 bottom-24 w-0.5 bg-gradient-to-b from-emerald-100 via-emerald-200 to-transparent dark:from-emerald-900/30 dark:via-emerald-900/10 dark:to-transparent -translate-x-1/2 z-0" />

              {/* STEP 1: Browse */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 relative z-10">
                <div className="order-2 md:order-1 text-center md:text-right">
                  <div className="flex flex-col md:flex-row items-center justify-end gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. Browse & Filter</h2>
                    <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-950 order-first md:order-last">1</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm ml-auto mr-auto md:mr-0">
                    Search through hundreds of solar equipment listings. Filter by category, location,
                    price range, and specifications to find exactly what you need.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Solar panels, inverters, batteries & more',
                      'Filter by global seller locations',
                      'Compare prices and specifications'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <MarketplacePreview />
                </div>
              </div>

              {/* STEP 2: Verify */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 relative z-10">
                <div className="order-1">
                  <VerificationPreview />
                </div>
                <div className="order-2 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                    <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-950">2</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. Verify Identity</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto md:mx-0">
                    Look for the verified badge on listings. We verify company registration
                    numbers to ensure you're dealing with legitimate businesses.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Company registration verified',
                      'Business address confirmed',
                      'Safe transaction guidance'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* STEP 3: Contact */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16 relative z-10">
                <div className="order-2 md:order-1 text-center md:text-right">
                  <div className="flex flex-col md:flex-row items-center justify-end gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. Deal Securely</h2>
                    <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-950 order-first md:order-last">3</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm ml-auto mr-auto md:mr-0">
                    Contact sellers directly through phone or WhatsApp. Arrange viewings,
                    negotiate prices, and complete transactions on your terms.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Direct contact with sellers',
                      'Arrange product viewing',
                      'Negotiate best prices'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <ContactPreview />
                </div>
              </div>

              <div className="flex justify-center mt-12 mb-8 relative z-10">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                >
                  Start Browsing
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

            </div>
          )}

          {/* SELLER JOURNEY */}
          {activeTab === 'sell' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Central Line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-4 bottom-24 w-0.5 bg-gradient-to-b from-blue-100 via-blue-200 to-transparent dark:from-blue-900/30 dark:via-blue-900/10 dark:to-transparent -translate-x-1/2 z-0" />

              {/* SELLER STEP 1: Register */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 relative z-10">
                <div className="order-2 md:order-1 text-center md:text-right">
                  <div className="flex flex-col md:flex-row items-center justify-end gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. Create Profile</h2>
                    <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-slate-950 order-first md:order-last">1</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm ml-auto mr-auto md:mr-0">
                    Complete your company profile with registration number.
                    Verified sellers get priority listing and build instant buyer trust.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Submit company registration document',
                      'Get verified badge on all listings',
                      'Build buyer confidence immediately'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <VerificationPreview />
                </div>
              </div>

              {/* SELLER STEP 2: List */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 relative z-10">
                <div className="order-1">
                  <ListingFormPreview />
                </div>
                <div className="order-2 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                    <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-slate-950">2</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. Upload Inventory</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto md:mx-0">
                    Create detailed listings with photos, accurate specifications, and competitive pricing.
                    The richer the details, the higher the conversion.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Upload high-quality product photos',
                      'Fill in technical data sheets',
                      'Set clear availability and prices'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SELLER STEP 3: Manage */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16 relative z-10">
                <div className="order-2 md:order-1 text-center md:text-right">
                  <div className="flex flex-col md:flex-row items-center justify-end gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. Track & Sell</h2>
                    <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-slate-950 order-first md:order-last">3</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm ml-auto mr-auto md:mr-0">
                    Track impressions, respond to WhatsApp inquiries instantly, and manage your inventory
                    throughput from a unified command center.
                  </p>
                  <ul className="space-y-3 inline-block text-left">
                    {[
                      'Real-time view analytics dashboard',
                      'Field direct buyer inquiries',
                      'Pause or rotate inventory seamlessly'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <SellerDashboardPreview />
                </div>
              </div>

              <div className="flex justify-center mt-12 mb-8 relative z-10">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  View Seller Plans
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

            </div>
          )}
        </div>

        {/* Universal Features Area (Applies to both) */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800">
          {/* Equipment Categories */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-full tracking-wider uppercase mb-3 text-center">Equipment coverage</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Comprehensive Hardware Catalog
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
              {[
                { name: 'Solar Panels', icon: Sun, color: 'text-amber-500' },
                { name: 'Inverters', icon: Cpu, color: 'text-blue-500' },
                { name: 'Batteries', icon: Battery, color: 'text-green-500' },
                { name: 'Cables', icon: Cable, color: 'text-orange-500' },
                { name: 'Protection Devices', icon: Shield, color: 'text-purple-500' }
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto shadow-inner">
            <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
              <Shield className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Our Commitment to Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Solerz operates strictly as a classifieds listing platform facilitating B2B, B2C, and C2C connections. We do not provide transaction or escrow services. While we vigorously verify corporate sellers through established registration matrices, community (C2C) sellers remain unverified and carry higher risk. For all interactions, we strongly advise physical inspections, direct communication with the seller, and to completely avoid premature digital fund transfers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;
