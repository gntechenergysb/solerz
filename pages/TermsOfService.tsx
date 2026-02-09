import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Welcome to Solerz</h2>
          <p>
            Solerz is Malaysia's trusted platform connecting solar equipment buyers with verified sellers. Our mission is to create a transparent, safe environment where quality solar products can be discovered and businesses can grow.
          </p>
          <p>
            By using Solerz, you agree to these Terms of Service. We encourage you to read them carefully as they outline your rights, responsibilities, and how we work together to maintain a trustworthy marketplace.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. How Solerz Works</h2>
          <p>
            Solerz operates as a <strong>business directory and information platform</strong> that facilitates connections between buyers and sellers of solar equipment:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We verify seller business credentials to ensure legitimacy</li>
            <li>We provide tools for sellers to showcase their products with detailed information and images</li>
            <li>We enable buyers to discover products and connect directly with sellers</li>
            <li>We maintain platform security and investigate reported issues</li>
          </ul>
          <p className="mt-2">
            <strong>Important:</strong> Solerz is not an e-commerce platform. We don't process transactions, handle payments between users, or manage logistics. All sales, negotiations, and deliveries happen directly between buyers and sellers. This direct relationship gives both parties full control over their business arrangements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Our Commitment to Trust</h2>
          <p>
            We take seller verification seriously to protect the integrity of our platform:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We verify business registration and contact information for all sellers</li>
            <li>We review reported listings and take action against fraudulent or misleading content</li>
            <li>We provide reporting mechanisms for users to flag suspicious activity</li>
            <li>We maintain secure infrastructure to protect user data</li>
          </ul>
          <p className="mt-2">
            <strong>Scope of Verification:</strong> While we verify business legitimacy, our process has natural limitations. We don't conduct deep background checks, financial audits, or ongoing monitoring of seller operations. Buyers should always exercise due diligence before making purchasing decisions, just as they would with any business partner.
          </p>
          <p>
            <strong>No Implied Endorsement:</strong> Verification confirms business existence, not quality of service. Our "Verified" badge means we've confirmed the business is registered and contactable—it doesn't guarantee product quality, pricing fairness, or business performance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">4. Account Responsibilities</h2>
          <p>
            <strong>For All Users:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate information during registration</li>
            <li>Keep your account credentials secure</li>
            <li>Use the platform for legitimate business purposes only</li>
            <li>Report any security concerns or suspicious activity promptly</li>
          </ul>
          
          <p className="mt-3">
            <strong>For Sellers:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>List only solar equipment and related products</li>
            <li>Ensure all product descriptions, specifications, and pricing are accurate</li>
            <li>Provide clear, truthful product images</li>
            <li>Respond professionally to buyer inquiries</li>
            <li>Comply with all applicable laws and industry regulations</li>
          </ul>
          
          <p className="mt-3">
            <strong>For Buyers:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the platform for genuine product research and business inquiries</li>
            <li>Verify seller credentials independently before transactions</li>
            <li>Respect seller contact information and privacy</li>
            <li>Report fraud or misleading listings to help protect the community</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">5. Prohibited Activities</h2>
          <p>
            To maintain platform integrity, the following are strictly prohibited:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>False, misleading, or fraudulent product information</li>
            <li>Counterfeit goods or stolen property listings</li>
            <li>Impersonation or misrepresentation of business identity</li>
            <li>Platform manipulation, data scraping, or unauthorized data collection</li>
            <li>Spam, harassment, or unsolicited marketing</li>
            <li>Any illegal activities or circumvention of security measures</li>
          </ul>
          <p className="mt-2">
            Violations may result in immediate account termination and listing removal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">6. Subscription Services</h2>
          <p>
            We offer tiered subscription plans that provide sellers with listing capacity based on their business needs:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fees grant access to platform tools and listing services</li>
            <li>Subscriptions are charged in advance and renewed automatically</li>
            <li>Cancellations take effect at the end of the current billing period</li>
            <li>We provide 30 days notice for any pricing changes</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">7. Working Together: Rights and Responsibilities</h2>
          
          <p className="mt-2">
            <strong>What Solerz Provides:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A secure platform for product discovery and business connections</li>
            <li>Initial business verification to reduce fraudulent accounts</li>
            <li>Tools for sellers to showcase their products effectively</li>
            <li>Support for reported issues and disputes between users</li>
          </ul>
          
          <p className="mt-3">
            <strong>What We Cannot Do:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Guarantee the quality, safety, or performance of any product listed</li>
            <li>Ensure pricing accuracy or availability of listed items</li>
            <li>Mediate or resolve disputes between buyers and sellers (these are handled directly between parties)</li>
            <li>Verify every claim made in product listings</li>
            <li>Assume liability for transactions conducted off-platform</li>
          </ul>
          
          <p className="mt-3">
            <strong>User Accountability:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sellers are fully responsible for their listing accuracy and business conduct</li>
            <li>Buyers are responsible for verifying products and sellers before purchasing</li>
            <li>Both parties are responsible for their own transaction terms and fulfillment</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">8. Platform Limitations and Liability</h2>
          <p>
            We strive to maintain a reliable, secure platform, but we must acknowledge certain limitations:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We cannot guarantee uninterrupted platform availability</li>
            <li>We cannot prevent all fraudulent activity (though we actively work to minimize it)</li>
            <li>We cannot verify the accuracy of every product listing</li>
          </ul>
          <p className="mt-2">
            To the maximum extent permitted by law, Solerz is not liable for losses arising from platform use, including but not limited to: transaction disputes, product defects, financial losses, or fraudulent user activity. This limitation applies despite our security measures and verification efforts.
          </p>
          <p>
            Users agree to indemnify Solerz against claims arising from their platform use, content, or interactions with other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">9. Intellectual Property</h2>
          <p>
            Sellers retain ownership of their product content (images, descriptions) but grant Solerz a license to display this content. Platform software, design, and branding are Solerz property.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">10. Account Termination</h2>
          <p>
            We may suspend or terminate accounts for Terms violations, fraudulent activity, or harmful conduct. Users may also close their accounts at any time by contacting support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">11. Updates to These Terms</h2>
          <p>
            We may update these Terms as our platform evolves. Significant changes will be communicated via email or platform notice. Continued use after updates constitutes acceptance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">12. Legal Matters</h2>
          <p>
            These Terms are governed by Malaysian law. Any disputes will be resolved in Malaysian courts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">13. Contact Us</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:support@solerz.com" className="text-emerald-600 hover:underline">
              support@solerz.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
