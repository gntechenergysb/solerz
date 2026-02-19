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
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Jinko Solar • KL, Malaysia</p>
            <p className="text-sm font-bold text-emerald-600">RM 850</p>
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Example Solar Trading Sdn Bhd</span>
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
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Price (RM)</label>
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
  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-16 pt-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          How Solerz Works
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Malaysia's trusted marketplace for solar equipment. 
          Buy from verified sellers or list your inventory.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* STEP 1: Browse */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Browse Equipment</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Search through hundreds of solar equipment listings. Filter by category, location, 
              price range, and specifications to find exactly what you need.
            </p>
            <ul className="space-y-2">
              {[
                'Solar panels, inverters, batteries & more',
                'Filter by location in Malaysia',
                'Compare prices and specifications'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
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
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verify Sellers</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Look for the verified badge on listings. We verify company registration 
              numbers to ensure you're dealing with legitimate businesses.
            </p>
            <ul className="space-y-2">
              {[
                'Company registration verified',
                'Business address confirmed',
                'Safe transaction guidance'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1">
            <VerificationPreview />
          </div>
        </div>

        {/* STEP 3: Contact */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contact & Deal</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Contact sellers directly through phone or WhatsApp. Arrange viewings, 
              negotiate prices, and complete transactions on your terms.
            </p>
            <ul className="space-y-2">
              {[
                'Direct contact with sellers',
                'Arrange product viewing',
                'Negotiate best prices'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <ContactPreview />
          </div>
        </div>

        {/* Seller Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">For Sellers</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Start Selling Today</h2>
        </div>

        {/* SELLER STEP 1: Register */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-1">
            <VerificationPreview />
          </div>
          <div className="order-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Register Your Company</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Complete your company profile with registration number. 
              Verified sellers get priority listing and buyer trust.
            </p>
            <ul className="space-y-2">
              {[
                'Submit company registration document',
                'Get verified badge on all listings',
                'Build buyer confidence'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SELLER STEP 2: List */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">List Your Products</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Create detailed listings with photos, specifications, and pricing. 
              The more information you provide, the more inquiries you'll receive.
            </p>
            <ul className="space-y-2">
              {[
                'Upload multiple product photos',
                'Add detailed specifications',
                'Set competitive prices'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <ListingFormPreview />
          </div>
        </div>

        {/* SELLER STEP 3: Manage */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Manage & Sell</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Track views, respond to inquiries, and manage your inventory 
              through your seller dashboard. Buyers contact you directly.
            </p>
            <ul className="space-y-2">
              {[
                'Real-time view analytics',
                'Direct buyer messages',
                'Inventory management'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1">
            <SellerDashboardPreview />
          </div>
        </div>

        {/* Equipment Categories */}
        <div className="mb-16">
          <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Popular Equipment Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Solar Panels', icon: Sun, color: 'amber' },
              { name: 'Inverters', icon: Cpu, color: 'blue' },
              { name: 'Batteries', icon: Battery, color: 'green' },
              { name: 'Cables', icon: Cable, color: 'orange' },
              { name: 'Protection Devices', icon: Shield, color: 'purple' }
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Zap, label: 'Smart Filters', desc: 'Find exactly what you need', color: 'amber' },
            { icon: MapPin, label: 'Location Based', desc: 'Search nearby sellers', color: 'blue' },
            { icon: ShieldCheck, label: 'Verified Only', desc: 'Company registration checked', color: 'emerald' },
            { icon: Eye, label: 'Analytics', desc: 'Track listing performance', color: 'purple' }
          ].map((f) => (
            <div key={f.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
              <div className={`w-12 h-12 bg-${f.color}-100 dark:bg-${f.color}-900/20 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <f.icon className={`h-6 w-6 text-${f.color}-500`} />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">{f.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Browse Listings
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            to="/pricing" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Selling
          </Link>
        </div>

        {/* Safety Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Safety Notice:</span> Solerz is a listing platform. 
            We verify company sellers through registration numbers. For individual sellers, 
            meet in person and avoid advance payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
