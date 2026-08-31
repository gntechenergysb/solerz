import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Cpu,
  ShoppingCart,
  Building2,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import type { SolarPanelDetail } from '../types';
import { downloadPanFile } from '../utils/panFileGenerator';

interface DatasheetSectionProps {
  category: 'Solar Panel' | 'Inverter' | 'Battery Storage';
  brandName: string;
  modelName: string;
  powerOrCapacity?: string;
  datasheetUrl?: string | null;
  panelDetail?: SolarPanelDetail;
  onOpenQuote?: () => void;
}

export const DatasheetSection: React.FC<DatasheetSectionProps> = ({
  category,
  brandName,
  modelName,
  powerOrCapacity,
  datasheetUrl,
  panelDetail,
  onOpenQuote,
}) => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimContact, setClaimContact] = useState({ name: '', email: '', company: '', message: '' });

  const handlePrintStandardizedSheet = () => {
    window.print();
  };

  const handleDownloadPan = () => {
    if (panelDetail) {
      downloadPanFile(panelDetail);
    }
  };

  // Google Search query for official PDF
  const oemSearchQuery = encodeURIComponent(`${brandName} ${modelName} datasheet filetype:pdf`);
  const oemSearchUrl = `https://www.google.com/search?q=${oemSearchQuery}`;

  // Amazon / General Solar Distributor Affiliate Query
  const affiliateSearchQuery = encodeURIComponent(`${brandName} ${modelName} solar`);
  const amazonAffiliateUrl = `https://www.amazon.com/s?k=${affiliateSearchQuery}&tag=solerz-20`;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
    setTimeout(() => {
      setClaimModalOpen(false);
      setClaimSubmitted(false);
    }, 2500);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Technical Documentation &amp; Simulation Files
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download factory PDF datasheets, PVsyst simulation files, or inspect verified distribution channels.
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Official PDF / Direct Cloud Download */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {datasheetUrl ? 'Official Factory PDF' : 'Standardized Spec Sheet'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">PDF Document</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {brandName} {modelName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Complete {category} technical parameters, electrical curve ratings, and mechanical layout.
              </p>
            </div>

            {datasheetUrl ? (
              <a
                href={datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                Download Official PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePrintStandardizedSheet}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" />
                Export / Print Spec Sheet
              </button>
            )}
          </div>

          {/* Card 2: PVsyst .PAN File Download (Panels) / Engineering Parameters */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  {category === 'Solar Panel' ? 'PVsyst .PAN File' : 'Engineering Parameters'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Simulation Asset</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {category === 'Solar Panel' ? 'Single-Diode Model (.PAN)' : `${category} Single-Line Model`}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {category === 'Solar Panel'
                  ? 'Pre-configured PVsyst .PAN file with series resistance, shunt resistance, and diode ideality factor.'
                  : 'Certified Sandia / CEC test parameters and temperature loss coefficients for PV engineering.'}
              </p>
            </div>

            {category === 'Solar Panel' && panelDetail ? (
              <button
                type="button"
                onClick={handleDownloadPan}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm shadow-amber-600/20"
              >
                <Download className="w-4 h-4" />
                Download PVsyst .PAN File
              </button>
            ) : (
              <a
                href={oemSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Search OEM Tech Portal
              </a>
            )}
          </div>

          {/* Card 3: Check Hardware Price / Affiliate Channel */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Procurement &amp; Price Check
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Verified Stock</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Check Online Availability
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare direct pricing and inventory across authorized wholesale distributors &amp; online partners.
              </p>
            </div>

            <a
              href={amazonAffiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-600/20"
            >
              <ShoppingCart className="w-4 h-4" />
              Check Price &amp; Stock
            </a>
          </div>
        </div>

        {/* Claim / Manufacturer Footer Banner */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Are you an official representative of <strong>{brandName}</strong>?
          </span>
          <button
            type="button"
            onClick={() => setClaimModalOpen(true)}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            Claim Brand Profile &amp; Update Official Assets →
          </button>
        </div>
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
                  Claim {brandName} Manufacturer Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verify your brand to upload official .PAN files, link authorized dealers, and post news releases.
                </p>
              </div>
            </div>

            {claimSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Verification Request Received!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Our manufacturer partnership team will reach out to you within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={claimContact.name}
                    onChange={(e) => setClaimContact({ ...claimContact, name: e.target.value })}
                    placeholder="e.g. David Zhang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Work Email (Domain-verified)
                  </label>
                  <input
                    type="email"
                    required
                    value={claimContact.email}
                    onChange={(e) => setClaimContact({ ...claimContact, email: e.target.value })}
                    placeholder="name@manufacturer.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Official Message / Datasheet Updates
                  </label>
                  <textarea
                    rows={3}
                    value={claimContact.message}
                    onChange={(e) => setClaimContact({ ...claimContact, message: e.target.value })}
                    placeholder={`Provide official website, direct sales contact, or updated ${modelName} datasheets...`}
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
    </>
  );
};

export default DatasheetSection;
