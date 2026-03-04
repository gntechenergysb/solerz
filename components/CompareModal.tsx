import React, { useState } from 'react';
import { Listing } from '../types';
import { X, Check } from 'lucide-react';

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    listings: Listing[];
    onRemove: (id: string) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, listings, onRemove }) => {
    const [highlightDiff, setHighlightDiff] = useState(false);

    if (!isOpen || listings.length === 0) return null;

    // Extract all unique specs keys, filtering out image and datasheet URLs
    const excludeKeys = ['image_url', 'images_url', 'datasheet', 'datasheet_url'];
    const allSpecKeys: string[] = Array.from(
        new Set<string>(listings.flatMap(l => Object.keys((l.specs as object) || {})))
    ).filter(k => !excludeKeys.includes(k.toLowerCase()) && !k.toLowerCase().includes('image')).sort();

    // Helper to check if a spec value is different across all listings
    const isSpecDifferent = (key: string) => {
        if (listings.length <= 1) return false;
        const firstVal = (listings[0].specs as any)?.[key];
        return listings.some(l => (l.specs as any)?.[key] !== firstVal);
    };

    // Helper to find min and max values numeric values for a specific key
    const getMinMaxNumericValues = (key: string) => {
        let minVal = Infinity;
        let maxVal = -Infinity;
        let hasNumber = false;

        listings.forEach(l => {
            const val = (l.specs as any)?.[key];
            if (val !== undefined && val !== null && val !== '') {
                const numVal = Number(val);
                if (!isNaN(numVal)) {
                    hasNumber = true;
                    if (numVal < minVal) minVal = numVal;
                    if (numVal > maxVal) maxVal = numVal;
                }
            }
        });

        return hasNumber ? { min: minVal, max: maxVal } : null;
    };

    const formatKey = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getPriceDisplay = (listing: Listing) => {
        if (!listing.price || listing.price === 0) return 'POA';
        return `${listing.currency || 'USD'} ${listing.price.toLocaleString()}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            Compare {listings[0].category}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Comparing {listings.length} items</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <label
                            className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 select-none hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setHighlightDiff(!highlightDiff)}
                        >
                            <span className={`${highlightDiff ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-transparent'} w-4 h-4 rounded-sm flex items-center justify-center transition-colors`}>
                                <Check className={`w-3 h-3 ${highlightDiff ? 'opacity-100' : 'opacity-0'} transition-opacity`} strokeWidth={3} />
                            </span>
                            Compare & Highlight Specs
                        </label>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Matrix Container */}
                <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm">
                                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 w-40 min-w-[160px] font-semibold text-slate-500 bg-white dark:bg-slate-900 align-bottom pb-3 text-sm sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                                    Product Details
                                </th>
                                {listings.map(l => (
                                    <th key={l.id} className="p-3 border-b border-slate-200 dark:border-slate-800 w-56 min-w-[200px] align-top bg-white dark:bg-slate-900 relative">
                                        <button
                                            onClick={() => onRemove(l.id)}
                                            className="absolute top-1 right-1 p-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors z-10"
                                            title="Remove"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="h-28 w-full rounded-md overflow-hidden bg-white dark:bg-slate-800 mb-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5">
                                            <img
                                                src={l.images_url?.[0] || ''}
                                                className="max-w-full max-h-full object-contain"
                                                alt={l.title}
                                                onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f1f5f9"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="32" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E')}
                                            />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-0.5 tracking-tight">{l.brand}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-tight" title={l.title}>{l.title}</p>
                                        <div className="mt-1.5 text-amber-600 dark:text-amber-500 font-bold text-sm">
                                            {getPriceDisplay(l)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Basic Info Rows */}
                            <tr className="group border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <td className="px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 sticky left-0 z-10 bg-white dark:bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">Condition</td>
                                {listings.map(l => (
                                    <td key={`cond-${l.id}`} className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{l.condition || '-'}</td>
                                ))}
                            </tr>
                            <tr className="group border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <td className="px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 sticky left-0 z-10 bg-white dark:bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">Location</td>
                                {listings.map(l => (
                                    <td key={`loc-${l.id}`} className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{l.location_country || '-'}</td>
                                ))}
                            </tr>
                            <tr className="group border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <td className="px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 sticky left-0 z-10 bg-white dark:bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">Datasheet</td>
                                {listings.map(l => {
                                    const url = l.datasheet_url || (l.specs as any)?.datasheet_url || (l.specs as any)?.datasheet;
                                    return (
                                        <td key={`ds-${l.id}`} className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                                            {url ? (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium underline underline-offset-2 flex items-center gap-1">
                                                    View Datasheet
                                                </a>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Section Divider */}
                            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                                <td colSpan={listings.length + 1} className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide sticky left-0 z-10">
                                    Technical Specifications
                                </td>
                            </tr>

                            {/* Specs Rows */}
                            {allSpecKeys.map((key: string) => {
                                const isDiff = isSpecDifferent(key);
                                const shouldHighlight = highlightDiff && isDiff;
                                const minMax = getMinMaxNumericValues(key);

                                return (
                                    <tr
                                        key={key}
                                        className={`group border-b border-slate-200 dark:border-slate-800 transition-colors
                      ${shouldHighlight ? 'bg-amber-100/30 dark:bg-amber-900/40' : 'bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900'}
                    `}
                                    >
                                        <td className={`px-3 py-2.5 text-sm font-medium border-r border-slate-200 dark:border-slate-800 capitalize sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] transition-colors
                      ${shouldHighlight
                                                ? 'bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800'}
                    `}>
                                            {formatKey(key)}
                                        </td>
                                        {listings.map(l => {
                                            const val = (l.specs as any)?.[key];
                                            const isNumeric = val !== undefined && val !== null && val !== '' && !isNaN(Number(val));
                                            const numVal = isNumeric ? Number(val) : null;

                                            // Determine visual styling for values
                                            const isMax = isNumeric && minMax?.max === numVal && minMax.max !== minMax.min;
                                            const isMin = isNumeric && minMax?.min === numVal && minMax.max !== minMax.min;

                                            let cellBgClass = 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50';
                                            if (shouldHighlight) cellBgClass = 'group-hover:bg-amber-200/50 dark:group-hover:bg-amber-900/60';

                                            return (
                                                <td key={`${key}-${l.id}`} className={`px-3 py-2.5 text-sm transition-colors ${cellBgClass}
                          ${shouldHighlight ? 'text-amber-900 dark:text-amber-100' : 'text-slate-700 dark:text-slate-300'}
                        `}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{val !== undefined && val !== null && val !== '' ? String(val) : '-'}</span>

                                                        {highlightDiff && isDiff && isMax && (
                                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wide truncate">
                                                                Highest
                                                            </span>
                                                        )}
                                                        {highlightDiff && isDiff && isMin && (
                                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wide truncate">
                                                                Lowest
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
