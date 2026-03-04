const fs = require('fs');

let content = fs.readFileSync('e:\\\\GitHub\\\\solerz\\\\pages\\\\Marketplace.tsx', 'utf8');

const priceFiltersDef = `    const priceFilters = (
      <>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Min Price (USD)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Max Price (USD)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-900 px-3 py-2 rounded-lg w-full whitespace-nowrap">
            <input
              type="checkbox"
              checked={includePOA}
              onChange={(e) => setIncludePOA(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            Include POA Quotes
          </label>
        </div>
      </>
    );`;

content = content.replace(/    const globalFilters = \([\s\S]*?    \);\n/, priceFiltersDef + '\n');

// 2. replace all \n          {globalFilters}\n          <div className="..." with just <div className="...">
// also change lg:grid-cols-\d to lg:grid-cols-5
content = content.replace(/ *{globalFilters}\n *<div className="([^"]+)">/g, (match, classNames) => {
    let newClass = classNames.replace(/lg:grid-cols-\d/g, 'lg:grid-cols-5');
    return `        <div className="${newClass}">`;
});

// 3. inject {priceFilters} before the closing tags of the grid
content = content.replace(/              <\/select>\n            <\/div>\n          <\/div>\n        <\/div>\n      \);/g,
    '              </select>\n            </div>\n            {priceFilters}\n          </div>\n        </div>\n      );');
content = content.replace(/              \/>\n            <\/div>\n          <\/div>\n        <\/div>\n      \);/g,
    '              />\n            </div>\n            {priceFilters}\n          </div>\n        </div>\n      );');

// 4. replace the `if (!selectedCategory)` block specifically
const emptyCategoryBlock = `    if (!selectedCategory) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {priceFilters}
          <div className="sm:col-span-2 lg:col-span-2 text-sm text-slate-500 dark:text-slate-400 py-3 px-3 text-center bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
            Select a specific category above to unlock technical filters.
          </div>
        </div>
      );
    }`;
content = content.replace(/    if \(\!selectedCategory\) \{[\s\S]*?    \}/, emptyCategoryBlock);

// 5. replace the final fallback block
const fallbackBlock = `    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {priceFilters}
        <div className="sm:col-span-2 lg:col-span-2 text-sm text-slate-500 dark:text-slate-400 py-3 px-3 text-center bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
          No specific technical filters for this category.
        </div>
      </div>
    );`;
content = content.replace(/    return \(\n      <div>\n        {globalFilters}[\s\S]*?    \);/, fallbackBlock);


fs.writeFileSync('e:\\\\GitHub\\\\solerz\\\\pages\\\\Marketplace.tsx', content);
console.log('done!');
