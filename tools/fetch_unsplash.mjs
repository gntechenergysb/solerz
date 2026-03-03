import https from 'https';
import fs from 'fs';

const categories = [
    { name: 'Panels', query: 'solar-panel' },
    { name: 'Inverters', query: 'solar-inverter' },
    { name: 'Batteries', query: 'lithium-battery' },
    { name: 'Cable', query: 'electrical-wire' },
    { name: 'Protective', query: 'circuit-breaker' },
    { name: 'Full System', query: 'solar-installation' },
    { name: 'Mounting', query: 'solar-mounting' },
    { name: 'Accessories', query: 'electrical-tools' },
    { name: 'Misc', query: 'solar-equipment' }
];

async function fetchUnsplash(query) {
    return new Promise((resolve, reject) => {
        https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=15`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    let rawUrls = [];
                    if (json.results) {
                        rawUrls = json.results.map(r => r.urls.raw.split('?')[0]);
                    }
                    resolve(rawUrls.slice(0, 10));
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    const results = {};
    for (const c of categories) {
        console.log('Fetching', c.query);
        const urls = await fetchUnsplash(c.query);
        results[c.name] = urls;
        // wait a bit to avoid rate limit
        await new Promise(r => setTimeout(r, 500));
    }

    // Generate SQL snippets
    let sql = "    array[\n      case\n";
    for (const c of categories) {
        const urls = results[c.name];
        if (urls && urls.length > 0) {
            let pgArrayStr = "        when category = '" + c.name + "' then " + "array[\n          " + urls.map(u => "'" + u + "?auto=format&fit=crop&w=800&q=80'").join(",\n          ") + "\n        ][(i % " + urls.length + ") + 1]\n";
            sql += pgArrayStr;
        }
    }

    // Default fallback
    const firstCategory = categories[0].name;
    const fallbackUrls = results[firstCategory] || ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d'];
    sql += "        else array[\n          " + fallbackUrls.map(u => "'" + u + "?auto=format&fit=crop&w=800&q=80'").join(",\n          ") + "\n        ][(i % " + fallbackUrls.length + ") + 1]\n";

    sql += "      end\n    ]::text[] as images_url,";

    fs.writeFileSync('generated_images_sql.txt', sql);
    console.log('Done!');
}

main().catch(console.error);
