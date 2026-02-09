import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Our Commitment to Your Privacy</h2>
          <p>
            At Solerz, we believe trust is the foundation of every successful business relationship. Protecting your personal information is not just a legal requirement for us—it's essential to building the trusted community we're creating.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform. By using Solerz, you trust us with your data, and we take that responsibility seriously.
          </p>
          <p>
            <strong>What We Do:</strong> We collect only the information necessary to provide our services, verify business legitimacy, and help buyers and sellers connect. We never sell your personal data.
          </p>
          <p>
            <strong>Platform Nature:</strong> Solerz is a business directory platform, not an e-commerce marketplace. We facilitate connections between buyers and sellers, but all transactions occur directly between users outside our platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Information We Collect</h2>
          <p>
            We collect information that helps us provide, secure, and improve our services:
          </p>
          
          <p className="mt-2"><strong>2.1 Account Information:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email address (for account creation, communication, and security)</li>
            <li>Password (encrypted—we never see or store it in plain text)</li>
            <li>Account type (Buyer, Individual Seller, or Company Seller)</li>
            <li>For Company Sellers: Business registration details, company name, and verification documents</li>
            <li>For Individual Sellers: Full name and identification for verification</li>
            <li>Contact phone number (optional but helpful for verification)</li>
          </ul>

          <p className="mt-2"><strong>2.2 Listing Information (Sellers):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Product descriptions, specifications, and pricing you choose to share</li>
            <li>Product images and documentation you upload</li>
            <li>Business location and operational details</li>
          </ul>

          <p className="mt-2"><strong>2.3 Usage Information:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address and device information (for security and fraud prevention)</li>
            <li>Browser type and version (to ensure platform compatibility)</li>
            <li>Pages visited and search queries (to improve our services)</li>
            <li>Time spent on features (to understand what helps our users most)</li>
          </ul>

          <p className="mt-2"><strong>2.4 Communication Records:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customer support inquiries (to help resolve your issues)</li>
            <li>Platform notifications and alerts sent to you</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. How We Use Your Information</h2>
          <p>
            We use your data to create value for our community:
          </p>
          
          <p className="mt-2"><strong>3.1 To Build a Trusted Platform:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify seller business credentials to maintain platform integrity</li>
            <li>Display your listings to potential buyers (for sellers)</li>
            <li>Enable product discovery and search functionality</li>
            <li>Process subscription payments securely</li>
            <li>Send important account notifications and updates</li>
          </ul>

          <p className="mt-2"><strong>3.2 To Facilitate Business Connections:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display seller contact information to interested buyers</li>
            <li>Enable buyers to discover products and view seller profiles</li>
            <li>Allow sellers to showcase their inventory effectively</li>
          </ul>
          <p className="mt-1">
            <strong>Note:</strong> We do not monitor, record, or interfere with communications or transactions between buyers and sellers. All business negotiations and arrangements occur directly between users outside our platform.
          </p>

          <p className="mt-2"><strong>3.3 To Improve Our Services:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Analyze usage patterns to enhance platform functionality</li>
            <li>Monitor performance and resolve technical issues</li>
            <li>Develop features based on user needs and feedback</li>
            <li>Generate anonymized statistics to understand market trends</li>
          </ul>

          <p className="mt-2"><strong>3.4 To Protect Our Community:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Detect and prevent fraudulent activity</li>
            <li>Enforce our Terms of Service</li>
            <li>Comply with legal obligations</li>
            <li>Protect the rights and safety of our users</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">4. How We Share Information</h2>
          <p>
            <strong>We Do Not Sell Your Personal Information. Ever.</strong>
          </p>
          <p>
            We share information only in these limited circumstances:
          </p>

          <p className="mt-2"><strong>Public Information (Visible to All Users):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>For Sellers: Company name, business location, product listings, images, descriptions, and business contact information you provide in your profile</li>
            <li>For Buyers: Minimal public information to protect your privacy</li>
          </ul>
          <p className="mt-1">
            By listing products as a seller, you acknowledge that this business information will be publicly visible to facilitate buyer discovery and contact.
          </p>

          <p className="mt-2"><strong>Trusted Service Providers:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stripe: Secure payment processing (billing information only)</li>
            <li>Supabase: Secure database hosting</li>
            <li>Cloudflare: Security and performance optimization</li>
            <li>Email providers: Account notifications and communications</li>
          </ul>
          <p className="mt-1">
            All service providers are bound by strict confidentiality agreements and may only use your data to perform services on our behalf.
          </p>

          <p className="mt-2"><strong>When Required by Law:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Court orders, subpoenas, or legal process</li>
            <li>To protect rights, property, or safety of users or the platform</li>
            <li>To investigate violations of our Terms</li>
            <li>To prevent fraud or address security issues</li>
          </ul>

          <p className="mt-2"><strong>Business Transitions:</strong></p>
          <p>
            If Solerz is involved in a merger, acquisition, or sale, your information may be transferred as part of that transaction. We will notify you of any ownership change.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">5. How We Protect Your Data</h2>
          <p>
            Security is central to everything we do:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Industry-standard SSL/TLS encryption for all data transmission</li>
            <li>Secure password hashing—we never store passwords in plain text</li>
            <li>Regular security assessments and monitoring</li>
            <li>Strict access controls and authentication requirements</li>
            <li>Secure, redundant hosting infrastructure</li>
            <li>Regular data backups to prevent loss</li>
          </ul>
          <p className="mt-2">
            <strong>Important Reality:</strong> While we implement robust security measures, no internet transmission or electronic storage is 100% secure. We continuously work to protect your information, but absolute security cannot be guaranteed. We encourage users to use strong passwords and report any suspicious activity immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">6. How Long We Keep Your Information</h2>
          <p>
            We retain data only as long as necessary:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Active Accounts:</strong> While your account is active and needed to provide services</li>
            <li><strong>Closed Accounts:</strong> Personal information deleted or anonymized within 90 days of closure (except where legally required)</li>
            <li><strong>Legal Requirements:</strong> Some information may be retained longer as required by applicable laws</li>
            <li><strong>Anonymized Data:</strong> Aggregated, non-identifiable statistics may be kept indefinitely for platform improvement</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">7. Your Rights and Choices</h2>
          <p>
            You have control over your information:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your data</li>
            <li><strong>Marketing:</strong> Opt out of marketing communications at any time</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at{' '}
            <a href="mailto:support@solerz.com" className="text-emerald-600 hover:underline">
              support@solerz.com
            </a>
            . We respond to all requests within 30 days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">8. Cookies and Technology</h2>
          <p>
            We use cookies to enhance your experience:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep you securely logged in</li>
            <li>Remember your preferences and settings</li>
            <li>Understand how our platform is used so we can improve it</li>
            <li>Ensure platform security</li>
          </ul>
          <p className="mt-2">
            You can control cookies through your browser settings. Disabling some cookies may affect platform functionality, particularly security features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">9. Third-Party Links</h2>
          <p>
            Our platform may contain links to external websites. We're not responsible for the privacy practices or content of these sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">10. Understanding Our Role</h2>
          <p>
            <strong>Our Commitment:</strong> We work hard to create a safe, trustworthy environment by verifying business registrations and providing reporting tools.
          </p>
          <p className="mt-2">
            <strong>Natural Limitations:</strong> 
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We cannot supervise or control interactions between buyers and sellers</li>
            <li>We cannot verify, monitor, or mediate transactions that occur outside our platform</li>
            <li>We cannot verify the accuracy of every product listing or seller claim</li>
            <li>We cannot guarantee the quality, safety, or performance of listed products</li>
          </ul>
          <p className="mt-2">
            <strong>Your Responsibility:</strong> Buyers must independently verify sellers and products before transactions. Sellers are responsible for the accuracy of their listings. Both parties bear responsibility for their business arrangements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as our platform evolves. Significant changes will be communicated via email or prominent platform notice. We encourage you to review this policy periodically.
          </p>
          <p>
            Continued use after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">12. International Operations</h2>
          <p>
            Your information may be processed in countries outside your jurisdiction. By using Solerz, you consent to these transfers. We ensure appropriate safeguards are in place for international data transfers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">13. Contact Us</h2>
          <p>
            Your privacy matters to us. If you have questions about this Privacy Policy or our data practices, please contact:
          </p>
          <p>
            Email:{' '}
            <a href="mailto:support@solerz.com" className="text-emerald-600 hover:underline">
              support@solerz.com
            </a>
          </p>
          <p>
            We typically respond within 5 business days.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
