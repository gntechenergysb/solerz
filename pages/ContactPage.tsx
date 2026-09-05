import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, FileCheck, ArrowLeft, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us & Technical Support | Solerz';
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate pre-filled mailto
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}`
    );
    const mailtoUrl = `mailto:support@solerz.com?subject=${encodeURIComponent(`[Solerz Inquiry - ${category}] ${subject}`)}&body=${mailtoBody}`;
    
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          Engineering Support & Inquiries
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
          We welcome feedback from solar designers, installers, equipment manufacturers, and researchers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Direct contact & Info cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Direct Support Email
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Official email for technical support, inquiries, and legal correspondence:
            </p>
            <a
              href="mailto:support@solerz.com"
              className="inline-block text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              support@solerz.com
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              Periodic Review Desk
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Our team regularly reviews verified inquiries, catalog corrections, and manufacturer datasheet submissions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <FileCheck className="w-4 h-4 text-purple-500 shrink-0" />
              Datasheet & PAN Submissions
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Manufacturers seeking to publish new or updated equipment specifications may attach official PDFs and .PAN files to direct email inquiries.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Message Composed!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Your email client has been opened with your inquiry. If it did not launch automatically, please email us directly at{' '}
                  <strong className="text-blue-600 dark:text-blue-400">support@solerz.com</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Send an Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="datasheet_correction">Hardware Data Correction / Update</option>
                    <option value="oem_submission">Manufacturer Datasheet & PAN Submission</option>
                    <option value="calculator_feedback">Solar Calculator & Simulation Feedback</option>
                    <option value="partnership">Sponsorship / Advertising Inquiries</option>
                    <option value="legal_dmca">DMCA / Copyright / Legal Matters</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Message Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include product model numbers, links, or specific questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Transmit Inquiry via Email
                </button>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Your communication is confidential and will never be shared or sold.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
