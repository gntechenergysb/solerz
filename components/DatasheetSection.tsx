import React from 'react';
import { FileText, Download, Printer, Search, ExternalLink, ShieldCheck, Sparkles, Send } from 'lucide-react';

interface DatasheetSectionProps {
  category: 'Solar Panel' | 'Inverter' | 'Battery Storage';
  brandName: string;
  modelName: string;
  powerOrCapacity?: string;
  datasheetUrl?: string | null;
  onOpenQuote?: () => void;
}

export const DatasheetSection: React.FC<DatasheetSectionProps> = ({
  category,
  brandName,
  modelName,
  powerOrCapacity,
  datasheetUrl,
  onOpenQuote,
}) => {
  const handlePrintStandardizedSheet = () => {
    window.print();
  };

  // Google Search query for official PDF
  const oemSearchQuery = encodeURIComponent(`${brandName} ${modelName} datasheet filetype:pdf`);
  const oemSearchUrl = `https://www.google.com/search?q=${oemSearchQuery}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Official Datasheet &amp; Technical Documents
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access certified technical documentation, single-diode simulation parameters, and factory spec sheets.
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Official PDF / Direct Cloud Download */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {datasheetUrl ? 'Official Factory PDF' : 'Standardized Spec Sheet'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">PDF Document</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {brandName} {modelName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete {category} technical parameters, electrical ratings, and mechanical layout.
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

        {/* Card 2: OEM Factory Portal Search */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Search className="w-3 h-3" />
                OEM Global Archives
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Web Portal</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Manufacturer Technical Library
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query {brandName}&apos;s official support server for user manuals, firmware, and certificates.
            </p>
          </div>

          <a
            href={oemSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Search {brandName} Official PDF
          </a>
        </div>

        {/* Card 3: Engineering Pack & Pricing Inquiries */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Wholesale &amp; EPC
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Engineering</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Factory Compliance Pack
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request factory warranty certificates, PVSyst PAN files, and wholesale volume pricing.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenQuote || handlePrintStandardizedSheet}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
            Request Wholesale Pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatasheetSection;
