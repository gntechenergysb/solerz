import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sun,
  Battery,
  ArrowRight,
  BarChart3,
  Users,
  Database,
  GitCompareArrows,
  TrendingUp,
  Shield,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Product Category Card
// ---------------------------------------------------------------------------
interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: string;
  to?: string;
  comingSoon?: boolean;
  accentColor: string;
  accentBg: string;
  accentGlow: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  description,
  count,
  to,
  comingSoon,
  accentColor,
  accentBg,
  accentGlow,
}) => {
  const content = (
    <div
      className={`category-card relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden ${
        comingSoon ? 'opacity-75 cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 dark:opacity-30 transition-opacity"
        style={{ background: accentGlow }}
      />

      {/* Coming soon badge */}
      {comingSoon && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
          Coming Soon
        </span>
      )}

      {/* Icon */}
      <div
        className={`category-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${accentBg}`}
      >
        <div className={accentColor}>{icon}</div>
      </div>

      {/* Title & description */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
        {description}
      </p>

      {/* Count + CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
          {count}
        </span>
        {!comingSoon && (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accentColor} group-hover:gap-2.5 transition-all`}
          >
            Explore
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );

  if (comingSoon || !to) return content;

  return (
    <Link to={to} className="group block">
      {content}
    </Link>
  );
};

// ---------------------------------------------------------------------------
// Stats Strip Item
// ---------------------------------------------------------------------------
interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const Stat: React.FC<StatProps> = ({ icon, value, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
      {icon}
    </div>
    <div>
      <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
        {value}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500">{label}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Popular Comparison Card
// ---------------------------------------------------------------------------
interface PopularCompareCardProps {
  panelA: string;
  panelB: string;
  powerW: number;
  slug: string;
  index: number;
}

const PopularCompareCard: React.FC<PopularCompareCardProps> = ({
  panelA,
  panelB,
  powerW,
  slug,
  index,
}) => (
  <Link
    to={slug}
    className="animate-float-up group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center gap-2 mb-3">
      <GitCompareArrows className="w-4 h-4 text-emerald-500" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        {powerW}W Comparison
      </span>
    </div>
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
        {panelA}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-600">
          vs
        </span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
        {panelB}
      </p>
    </div>
    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
      View comparison <ArrowRight className="w-3.5 h-3.5" />
    </div>
  </Link>
);

// ---------------------------------------------------------------------------
// Feature Highlight
// ---------------------------------------------------------------------------
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex-none w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Home Page Component
// ---------------------------------------------------------------------------
const HomePage: React.FC = () => {
  // Static popular comparisons (hardcoded examples — can be replaced with API later)
  const popularComparisons = [
    {
      panelA: 'LONGi LR5-72HPH-555M',
      panelB: 'JA Solar JAM72S30-545/MR',
      powerW: 550,
      slug: '/compare/longi-green-energy-technology-co---ltd--longi-lr5-72hph-555m-vs-ja-solar-jam72s30-545-mr',
    },
    {
      panelA: 'Canadian Solar CS6R-420MS',
      panelB: 'Trina Solar TSM-DE09R.08 420',
      powerW: 420,
      slug: '/compare/canadian-solar-inc--cs6r-420ms-vs-trina-solar-co---ltd-tsm-de09r-08-420',
    },
    {
      panelA: 'REC Alpha Pure-R Series 430',
      panelB: 'SunPower SPR-MAX5-420-COM',
      powerW: 430,
      slug: '/compare/rec-group-rec430aa-pure-r-vs-sunpower-corporation-spr-max5-420-com',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ============================== HERO ============================== */}
      <section className="relative text-center pt-8 sm:pt-14 pb-4 hero-pattern">
        {/* Decorative blurred orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 mb-6 animate-float-up">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
              21,000+ Solar Modules Indexed
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-float-up"
            style={{ animationDelay: '80ms' }}
          >
            Compare Solar Hardware.
            <br />
            <span className="text-gradient-brand">Make Smarter Decisions.</span>
          </h1>

          <p
            className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-float-up"
            style={{ animationDelay: '160ms' }}
          >
            The most comprehensive solar panel database with detailed specs,
            side-by-side comparisons, and data-driven insights — all free.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-float-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              to="/solar-panels"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sun className="w-4.5 h-4.5" />
              Browse Solar Panels
            </Link>
            <Link
              to="/solar-panels"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-300"
            >
              <GitCompareArrows className="w-4.5 h-4.5" />
              Compare Panels
            </Link>
          </div>
        </div>
      </section>

      {/* ========================== STATS STRIP ========================== */}
      <section
        className="animate-float-up"
        style={{ animationDelay: '320ms' }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          <Stat
            icon={<Database className="w-4.5 h-4.5" />}
            value="21,000+"
            label="Solar Panels"
          />
          <Stat
            icon={<Users className="w-4.5 h-4.5" />}
            value="282"
            label="Brands"
          />
          <Stat
            icon={<BarChart3 className="w-4.5 h-4.5" />}
            value="30+"
            label="Spec Parameters"
          />
          <Stat
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            value="Free"
            label="Always"
          />
        </div>
      </section>

      {/* ======================= PRODUCT CATEGORIES ======================= */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Dive into detailed specs and comparisons for each product type.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          <CategoryCard
            icon={<Sun className="w-6 h-6" />}
            title="Solar Panels"
            description="Browse 21,000+ photovoltaic modules with full STC electrical specs, temperature coefficients, and SDM parameters."
            count="21,000+ modules"
            to="/solar-panels"
            accentColor="text-emerald-600 dark:text-emerald-400"
            accentBg="bg-emerald-50 dark:bg-emerald-500/10"
            accentGlow="radial-gradient(circle, rgba(16,185,129,0.3), transparent)"
          />
          <CategoryCard
            icon={<Zap className="w-6 h-6" />}
            title="Inverters"
            description="String, micro, and hybrid inverters from leading manufacturers. Compare efficiency, voltage ranges, and features."
            count="Coming soon"
            comingSoon
            accentColor="text-amber-600 dark:text-amber-400"
            accentBg="bg-amber-50 dark:bg-amber-500/10"
            accentGlow="radial-gradient(circle, rgba(245,158,11,0.3), transparent)"
          />
          <CategoryCard
            icon={<Battery className="w-6 h-6" />}
            title="Energy Storage"
            description="Home batteries, commercial storage, and lithium packs. Compare capacity, cycle life, and warranty terms."
            count="Coming soon"
            comingSoon
            accentColor="text-purple-600 dark:text-purple-400"
            accentBg="bg-purple-50 dark:bg-purple-500/10"
            accentGlow="radial-gradient(circle, rgba(139,92,246,0.3), transparent)"
          />
        </div>
      </section>

      {/* ==================== POPULAR COMPARISONS ==================== */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Popular Comparisons
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            See how top solar panels stack up against each other.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {popularComparisons.map((cmp, i) => (
            <PopularCompareCard key={i} {...cmp} index={i} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/solar-panels"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Build your own comparison
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ====================== WHY SOLERZ ====================== */}
      <section className="bg-slate-50 dark:bg-slate-900/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-14 rounded-3xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Why Solerz?
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Feature
            icon={<Database className="w-5 h-5" />}
            title="Largest Open Database"
            description="21,000+ modules from CEC's verified database — the most comprehensive free resource for PV module specifications."
          />
          <Feature
            icon={<GitCompareArrows className="w-5 h-5" />}
            title="Side-by-Side Comparison"
            description="Compare any two solar panels head-to-head across 30+ parameters. Every spec, every detail, crystal clear."
          />
          <Feature
            icon={<BarChart3 className="w-5 h-5" />}
            title="Data-Driven Insights"
            description="Automated analysis highlights which panel wins in each category — power, efficiency, thermals, and more."
          />
          <Feature
            icon={<Shield className="w-5 h-5" />}
            title="Always Free"
            description="No registration, no paywalls, no ads. Just clean, comprehensive solar hardware data for everyone."
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
