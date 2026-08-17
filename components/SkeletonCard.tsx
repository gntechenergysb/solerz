import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
    <div className="h-1 bg-slate-100 dark:bg-slate-800" />
    <div className="p-5 space-y-4">
      {/* Brand + tech tag */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
      {/* Model name */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      {/* Power + Efficiency */}
      <div className="flex items-end gap-3">
        <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-12 rounded bg-slate-100 dark:bg-slate-800 ml-auto" />
      </div>
      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      {/* Badges */}
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
