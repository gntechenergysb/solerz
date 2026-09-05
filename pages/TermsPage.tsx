import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, AlertTriangle, ShieldAlert, FileText, Ban, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service & Engineering Disclaimer | Solerz';
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'September 4, 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Hardware Catalog
      </Link>

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Scale className="w-3.5 h-3.5" />
          Binding Legal Agreement & Disclaimers
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Terms of Service & Disclaimer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Effective & Last Updated: {lastUpdated} &bull; Please read carefully prior to utilizing Solerz data or computational tools.
        </p>
      </div>

      {/* Prominent Protective Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 mb-8 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-bold block mb-1">CRITICAL ENGINEERING & SAFETY NOTICE:</strong>
          Solerz is an independent reference database. All specifications, computational tools, and PAN simulation files are provided strictly <strong>&ldquo;AS IS&rdquo; for preliminary informational purposes only</strong>. Solerz does NOT provide professional engineering, electrical, structural, or legal advice. Users must independently verify all data with original manufacturer datasheets and certified licensed Professional Engineers (PE).
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-8 text-slate-700 dark:text-slate-300">
        {/* Section 1: Acceptance */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <FileText className="w-5 h-5 text-blue-500" />
            1. Acceptance of Terms
          </div>
          <p>
            By accessing, browsing, scraping, or utilizing any portion of <strong>Solerz (solerz.com)</strong>, including technical datasheets, PAN model downloads, comparison matrices, or solar sizing calculators, you agree to be bound unconditionally by these Terms of Service. If you do not agree to these terms, you are prohibited from utilizing this platform.
          </p>
        </section>

        {/* Section 2: Comprehensive Engineering Disclaimer */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            2. Complete Disclaimer of Warranties (&ldquo;AS-IS&rdquo; Provision)
          </div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            THE PLATFORM, ITS CONTENT, SOFTWARE, CALCULATORS, DATASHEETS, AND SIMULATION FILES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-xs sm:text-sm">
            <li>
              <strong>No Accuracy Guarantee:</strong> Solerz indexes technical data from publicly available manufacturer documentation. While we apply automated validation and sanitization, hardware specifications (including STC ratings, NMOT coefficients, MPPT voltages, dimensions, weights, and tolerances) may be revised by manufacturers at any time without notice. We disclaim any liability for typographical errors, outdated figures, or transcription discrepancies.
            </li>
            <li>
              <strong>No Code or Regulatory Compliance Endorsement:</strong> Inclusion of any equipment on Solerz does not certify compliance with national or international electrical codes (e.g., National Electrical Code [NEC], IEC standards, UL certifications, IEEE guidelines, or local utility interconnection standards).
            </li>
            <li>
              <strong>No Professional Relationship:</strong> Utilization of Solerz tools does not create an engineer-client, contractor-client, or advisory relationship of any kind.
            </li>
          </ul>
        </section>

        {/* Section 3: Free Platform Limitation of Liability */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Ban className="w-5 h-5 text-amber-500" />
            3. Limitation of Liability
          </div>
          <p>
            Solerz is an open-access platform whose public hardware catalog, technical specifications, and baseline engineering tools are provided free of charge for academic, research, and general reference purposes.
          </p>
          <p className="mt-2">
            To the fullest extent permitted by applicable law, Solerz, its operators, and contributors shall not be held liable for any direct, indirect, incidental, or consequential damages, financial losses, or equipment issues arising from the access to, use of, or reliance upon any hardware specifications, simulation models, calculator algorithms, or datasheets hosted on this platform.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Users assume sole responsibility for independently cross-referencing all technical data with certified manufacturer documentation and consulting qualified local engineering professionals before purchasing equipment or conducting installations.
          </p>
        </section>

        {/* Section 4: Non-Commercial & Nominative Fair Use */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            4. Non-Commercial Status & Nominative Fair Use of Trademarks
          </div>
          <p>
            Solerz is strictly an informational hardware catalog and computational engineering library. <strong>Solerz is not an authorized distributor, retailer, contractor, installer, or broker of solar hardware.</strong>
          </p>
          <p className="mt-2 text-xs sm:text-sm">
            All brand names, registered trademarks, logos, and model designations mentioned on this site (including but not limited to Canadian Solar, Jinko, LONGi, SMA, SolarEdge, Enphase, Sungrow, Tesla, BYD, Silfab, and others) are the property of their respective trademark holders. Their reference on Solerz is strictly for factual identification, cataloging, comparative research, and educational purposes under the international legal doctrine of <strong>Nominative Fair Use</strong>. Solerz is not affiliated with, endorsed by, or sponsored by any referenced manufacturer unless explicitly indicated.
          </p>
        </section>

        {/* Section 5: Content Removal & Takedown Requests */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Mail className="w-5 h-5 text-purple-500" />
            5. Content Removal & Takedown Requests
          </div>
          <p>
            Solerz respects intellectual property rights and aims to support manufacturers and the clean energy engineering community. If you are an equipment manufacturer or copyright owner and would like any technical datasheet, specification, or document updated or removed from our catalog, please reach out to us at:
          </p>
          <div className="my-3">
            <a
              href="mailto:support@solerz.com"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              <Mail className="w-4 h-4" />
              support@solerz.com
            </a>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Please include the relevant product model and URL on Solerz. We are always happy to cooperate with manufacturers and rights holders, and will review and accommodate legitimate requests in a timely and cooperative manner.
          </p>
        </section>

        {/* Section 6: Indemnification */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Scale className="w-5 h-5 text-blue-500" />
            6. User Indemnification
          </div>
          <p className="text-xs sm:text-sm">
            You agree to defend, indemnify, and hold harmless Solerz, its operators, officers, and service providers from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal and accounting fees) arising out of or in any way connected with your access to, reliance upon, or use of the platform, or your violation of these Terms.
          </p>
        </section>

        {/* Section 7: Future Modifications & Governing Terms */}
        <section className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <p>
            Solerz reserves the full right to modify, update, or introduce new features, premium computational services, or subscription tiers at any time. Continued use of the platform following any modifications constitutes full acceptance of the revised terms. For any legal or licensing inquiries, contact:{' '}
            <a href="mailto:support@solerz.com" className="text-blue-600 dark:text-blue-400 underline font-semibold">
              support@solerz.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
