const fs = require('fs');

const sql = fs.readFileSync('seed-listings.sql', 'utf8');
const repl = fs.readFileSync('generated_images_sql.txt', 'utf8');

const targetStr = `    array[
      case
        when category = 'Panels' then format('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Inverters' then format('https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Batteries' then format('https://images.unsplash.com/photo-1617783756017-38d7c1b32402?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Cable' then format('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Protective' then format('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Full System' then format('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Mounting' then format('https://images.unsplash.com/photo-1504917595217-d4ce5eb3e212?w=800&h=600&fit=crop&random=%s', img_seed)
        when category = 'Accessories' then format('https://images.unsplash.com/photo-1548613053-220e7558185a?w=800&h=600&fit=crop&random=%s', img_seed)
        else format('https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop&random=%s', img_seed)
      end
    ]::text[] as images_url,`;

if (sql.includes(targetStr)) {
    const newSql = sql.replace(targetStr, repl);
    fs.writeFileSync('seed-listings.sql', newSql);
    console.log('Replaced successfully');
} else {
    console.log('Target string not found in seed-listings.sql');
}
