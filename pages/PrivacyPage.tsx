import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cookie, Eye, UserCheck, Mail, ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Solerz Solar Hardware Intelligence';
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'September 4, 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb / Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Hardware Catalog
      </Link>

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Transparency & Data Governance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Effective & Last Updated: {lastUpdated} &bull; Applicable to Solerz (solerz.com)
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-8 text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Lock className="w-5 h-5 text-blue-500" />
            1. Overview & Commitment to User Privacy
          </div>
          <p>
            Solerz (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;), accessible at{' '}
            <strong className="text-slate-900 dark:text-slate-100">https://solerz.com</strong>, operates as an open-access engineering catalog, PV hardware specifications database, and computational simulation utility. We prioritize user privacy and adhere strictly to the principle of data minimization: we do not sell, rent, or trade your personal information.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This Privacy Policy explains the nature of information collected when you access Solerz, how third-party services operate on our platform, and your legal rights under international regulations including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>
        </section>

        {/* Section 2: Advertising & Google AdSense - CRITICAL FOR ADSENSE APPROVAL */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-blue-500/20 dark:border-blue-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Cookie className="w-5 h-5 text-amber-500" />
            2. Third-Party Advertising & Google AdSense Disclosures
          </div>
          <p>
            To sustain our high-performance infrastructure, cloud object storage, and global CDN delivery without charging subscription fees for engineering datasheets, Solerz displays contextual and programmatic advertisements provided by third-party advertising networks, including <strong>Google AdSense</strong>.
          </p>
          
          <div className="my-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Mandatory Google Advertising Disclosures:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&rsquo;s prior visits to Solerz or other websites on the internet.
              </li>
              <li>
                Google&rsquo;s use of advertising cookies enables it and its certified advertising partners to serve personalized or non-personalized advertisements to users based on their visits to our site and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://myadcenter.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline font-medium"
                >
                  Google Ads Settings (My Ad Center)
                </a>.
              </li>
              <li>
                Alternatively, users may opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline font-medium"
                >
                  www.aboutads.info
                </a>{' '}
                or the{' '}
                <a
                  href="https://www.youronlinechoices.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline font-medium"
                >
                  Your Online Choices guide
                </a>.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Information We Collect */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Eye className="w-5 h-5 text-emerald-500" />
            3. Information We Collect Automatically
          </div>
          <p>
            When you browse the Solerz database, our server edge logs and web analytics utilities (such as Google Analytics 4) may automatically record non-personally identifiable diagnostic information:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-xs sm:text-sm">
            <li>Browser type, device architecture, operating system, and language preferences;</li>
            <li>Referrer URL, pages visited, time spent per technical specification, and search queries within the catalog;</li>
            <li>Masked / anonymized Internet Protocol (IP) addresses used strictly for regional geolocation mapping and distributed denial-of-service (DDoS) prevention;</li>
            <li>Local browser storage keys (e.g. <code>solerz_theme</code>) to preserve your preferred dark/light viewing mode.</li>
          </ul>
        </section>

        {/* Section 4: Data Security & Storage */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            4. Cloud Infrastructure & Security Measures
          </div>
          <p>
            Solerz employs industry-standard Transport Layer Security (TLS 1.3 / HTTPS encryption) for all data in transit across Cloudflare&rsquo;s global edge network. Database records are stored securely with enterprise-grade access restrictions. No sensitive payment or personal identity credentials are stored on Solerz servers.
          </p>
        </section>

        {/* Section 5: GDPR & CCPA Rights */}
        <section className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <UserCheck className="w-5 h-5 text-purple-500" />
            5. Your Rights Under GDPR and CCPA
          </div>
          <p>
            Depending on your jurisdiction, you possess statutory rights regarding your digital privacy:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-xs sm:text-sm">
            <li><strong>Right of Access & Portability:</strong> Request confirmation on whether telemetry or inquiry data is retained.</li>
            <li><strong>Right of Rectification & Erasure:</strong> Request correction or complete deletion of contact correspondence records (&ldquo;Right to be Forgotten&rdquo;).</li>
            <li><strong>Non-Discrimination:</strong> We do not discriminate against any engineer or user exercising their lawful privacy rights.</li>
            <li><strong>Opt-Out of Data Sale:</strong> Solerz does not sell, lease, or monetize personal information.</li>
          </ul>
        </section>

        {/* Section 6: Contact & Inquiries */}
        <section className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl p-6 border border-blue-500/20 dark:border-blue-500/30">
          <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-lg">
            <Mail className="w-5 h-5 text-blue-500" />
            6. Contacting the Data Protection Representative
          </div>
          <p className="text-sm">
            If you have questions regarding this Privacy Policy, wish to exercise statutory data rights, or request inquiry data deletion, please contact our administrative desk:
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <Mail className="w-4 h-4" />
            support@solerz.com
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
