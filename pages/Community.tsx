import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, ArrowRight } from 'lucide-react';

const Community: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-200">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Community</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Community forums are in progress. For now, you can continue browsing the marketplace.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
              >
                Back to Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                <MessageSquare className="h-4 w-4" />
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
