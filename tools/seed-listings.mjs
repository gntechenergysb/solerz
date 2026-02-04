import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    let v = trimmed.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = loadEnvLocal();
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const PASSWORD = process.env.SOLERZ_TEST_PASSWORD;

const args = new Map();
for (const raw of process.argv.slice(2)) {
  const idx = raw.indexOf('=');
  if (idx === -1) continue;
  args.set(raw.slice(0, idx), raw.slice(idx + 1));
}

const sellerCount = Number(args.get('seller') ?? '30');
const buyerCount = Number(args.get('buyer') ?? '0');
const includeUnverified = (args.get('include_unverified') ?? 'false').toLowerCase() === 'true';
const sellerIdsRaw = (args.get('seller_ids') ?? '').trim();
const sellerIds = sellerIdsRaw
  ? sellerIdsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

if (!PASSWORD && sellerIds.length === 0) {
  console.error('Set SOLERZ_TEST_PASSWORD in environment before running this script.');
  process.exit(1);
}

const ACCOUNTS = {
  seller: 'seller@solerz.com',
  buyer: 'buyer@solerz.com'
};

function client() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function adminClient() {
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function signIn(email) {
  const sb = client();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Missing user id after login');
  return { sb, userId, email };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function makePanelSpecs() {
  const wattage = pick([410, 450, 455, 500, 535, 550, 580]);
  const cellType = pick([
    'Monocrystalline',
    'Polycrystalline',
    'N-type',
    'P-type',
    'IBC',
    'ABC',
    'TOPCon',
    'HJT',
    'PERC',
    'Bifacial',
    'Monofacial',
    'Thin-Film',
    'Standard Rigid',
    'Flexible',
    'BIPV',
    'Shingled'
  ]);
  const efficiency = Number((pick([18.5, 19.2, 20.1, 20.7, 21.2, 21.6, 22.1]) + (Math.random() * 0.2)).toFixed(2));

  const voc = Number((wattage >= 500 ? 49.6 : 41.2 + Math.random() * 2).toFixed(2));
  const isc = Number((wattage >= 500 ? 13.9 : 10.8 + Math.random() * 1.8).toFixed(2));
  const vmp = Number((voc * 0.82).toFixed(2));
  const imp = Number(((wattage / vmp) * (0.98 + Math.random() * 0.04)).toFixed(2));

  const tempCoeffPmax = Number((-(0.29 + Math.random() * 0.08)).toFixed(3));
  const tempCoeffVoc = Number((-(0.25 + Math.random() * 0.1)).toFixed(3));
  const tempCoeffIsc = Number(((0.03 + Math.random() * 0.03)).toFixed(3));

  const maxSystemVoltage = pick([1000, 1500]);
  const maxFuse = pick([20, 25, 30]);
  const weightKg = Number((wattage >= 500 ? 27.5 : 22.5 + Math.random() * 4).toFixed(1));

  return {
    wattage,
    cell_type: cellType,
    efficiency,
    dimensions: wattage >= 500 ? '2279x1134x35' : '1722x1134x30',

    model: pick(['JAM72S30', 'Tiger Pro', 'Vertex', 'Hi-MO 5', 'M10']),
    voc_v: voc,
    isc_a: isc,
    vmp_v: vmp,
    imp_a: imp,
    max_system_voltage_v: maxSystemVoltage,
    max_fuse_rating_a: maxFuse,
    temp_coeff_pmax_pct_per_c: tempCoeffPmax,
    temp_coeff_voc_pct_per_c: tempCoeffVoc,
    temp_coeff_isc_pct_per_c: tempCoeffIsc,
    weight_kg: weightKg,
    warranty_years: pick([10, 12, 15])
  };
}

function makeInverterSpecs() {
  const rated = pick([3, 5, 8, 10, 12, 20]);
  return {
    inverter_type: pick(['String', 'Micro', 'Microinverter', 'Hybrid', 'Off-Grid', 'Grid-Tied', 'Central']),
    phase: pick(['Single', 'Three']),
    rated_ac_power_kw: rated,
    max_ac_power_kw: Number((rated * pick([1.0, 1.1, 1.2])).toFixed(1)),
    max_input_voltage: pick([600, 1000, 1100]),
    efficiency: pick([97.6, 98.1, 98.4, 98.6]),
    warranty_years: pick([5, 10, 12])
  };
}

function makeBatterySpecs() {
  return {
    cycle_life: pick([4000, 6000, 8000]),
    capacity_kwh: pick([5, 10, 15, 20]),
    nominal_voltage: pick([48, 51.2]),
    battery_type: pick(['Rack-mounted', 'Wall-mounted', 'Portable', 'Container', 'Floor-standing', 'All-in-one']),
    technology: pick(['LiFePO4', 'NMC', 'LTO', 'Lead-Acid', 'AGM', 'Gel', 'Sodium-Ion', 'Flow', 'Other'])
  };
}

function makeCableSpecs() {
  return {
    current_type: pick(['DC', 'AC']),
    cable_type: pick(['PV1-F', 'H1Z2Z2-K', 'USE-2', 'PV Wire', 'THHN', 'H05VV-F', 'N2XH', 'Battery Cable', 'MV Cable', 'RHW-2', 'THWN-2']),
    voltage_rating: pick(['600V', '1000V', '1500V', '1800V', '2000V', '0.6/1kV', '450/750V', '1.8/3kV', '6.35/11kV', '19/33kV']),
    insulation: pick(['XLPE', 'XLPO', 'PVC', 'Halogen-Free', 'LSHF']),
    size_mm2: pick([2.5, 4, 6, 10, 16, 25, 35, 50]),
    cores: pick([1, 2, 3, 4, 5]),
    length_m: pick([10, 25, 50, 100, 200]),
    conductor: pick(['Copper', 'Tinned Copper', 'Aluminum', 'Tinned Copper-Clad Aluminum (TCCA)', 'Aluminum Alloy'])
  };
}

function makeProtectiveSpecs() {
  return {
    device_type: pick(['Fuse', 'Breaker', 'SPD', 'Isolator', 'Other']),
    rated_current_a: pick([10, 16, 20, 25, 32, 40, 50, 63, 80, 100]),
    rated_voltage_v: pick([230, 400, 500, 600, 800, 1000]),
    poles: pick([1, 2, 3, 4])
  };
}

function makeListingPayload(userId, i, opts) {
  const categories = ['Panels', 'Inverters', 'Batteries', 'Cable', 'Protective', 'Miscellaneous'];
  const category = pick(categories);

  const states = ['Selangor', 'Johor', 'Penang', 'Perak', 'Kuala Lumpur', 'Sarawak', 'Sabah'];

  let brand = pick(['JA Solar', 'Jinko', 'Trina', 'LONGi', 'Huawei', 'Sungrow', 'Growatt', 'SMA', 'GoodWe']);
  let specs = {};
  const condition = pick(['New', 'Used', 'Refurbished']);

  if (category === 'Panels') {
    specs = makePanelSpecs();
  } else if (category === 'Inverters') {
    specs = makeInverterSpecs();
  } else if (category === 'Batteries') {
    specs = makeBatterySpecs();
  } else if (category === 'Cable') {
    brand = pick(['Prysmian', 'Nexans', 'LS Cable', 'Helukabel', 'Generic']);
    specs = makeCableSpecs();
  } else if (category === 'Protective') {
    brand = pick(['Schneider', 'ABB', 'Eaton', 'Siemens', 'Hager', 'Generic']);
    specs = makeProtectiveSpecs();
  } else {
    brand = pick(['Generic', 'Unbranded', 'Other']);
    specs = {};
  }

  const basePrice = category === 'Panels'
    ? (specs.wattage * pick([0.55, 0.62, 0.7, 0.85]))
    : category === 'Inverters'
      ? pick([1800, 2200, 3500, 4800, 6500])
      : category === 'Batteries'
        ? pick([3500, 5200, 7500, 9800])
        : category === 'Cable'
          ? (Number(specs.size_mm2 || 6) * Number(specs.length_m || 50) * pick([0.6, 0.8, 1.1]))
          : category === 'Protective'
            ? (Number(specs.rated_current_a || 32) * pick([12, 16, 20]))
            : pick([120, 250, 480, 850]);

  const priceRm = Number((basePrice * (0.9 + Math.random() * 0.25)).toFixed(2));

  const title = category === 'Panels'
    ? `${brand} ${specs.wattage}W ${specs.cell_type} Panel (${condition})`
    : category === 'Inverters'
      ? `${brand} ${specs.rated_ac_power_kw}kW ${specs.phase} Phase Inverter (${condition})`
      : category === 'Batteries'
        ? `${brand} ${specs.capacity_kwh}kWh ${specs.technology} Battery (${condition})`
        : category === 'Cable'
          ? `${brand} ${specs.current_type} ${specs.size_mm2}mm² ${specs.cores}C Cable (${specs.length_m}m)`
          : category === 'Protective'
            ? `${brand} ${specs.device_type} ${specs.rated_current_a}A ${specs.rated_voltage_v}V (${specs.poles}P)`
            : `${brand} Miscellaneous Item (${condition})`;

  const isHidden = opts?.hiddenEvery && i % opts.hiddenEvery === 0;
  const isSold = opts?.soldEvery && i % opts.soldEvery === 0;

  return {
    seller_id: userId,
    title: title.slice(0, 80),
    category,
    brand,
    condition,
    specs,
    price_rm: priceRm,
    location_state: pick(states),
    images_url: [`https://picsum.photos/800/600?random=${randInt(1, 1000)}`],
    is_sold: !!isSold,
    is_hidden: !!isHidden
  };
}

async function seedFor(accountName, count, opts) {
  if (!count) return;

  const ctx = await signIn(ACCOUNTS[accountName]);
  console.log(`[seed] signed in as ${ctx.email} (${ctx.userId})`);

  const batch = [];
  for (let i = 1; i <= count; i++) {
    batch.push(makeListingPayload(ctx.userId, i, opts));
  }

  const { error } = await ctx.sb.from('listings').insert(batch);
  if (error) {
    console.error(`[seed] insert failed for ${ctx.email}:`, error.message);
    return;
  }

  console.log(`[seed] inserted ${count} listings for ${ctx.email}`);
}

async function seedForSellerIds(ids, count, opts) {
  if (!ids.length || !count) return;
  const sb = adminClient();

  for (const sellerId of ids) {
    const batch = [];
    for (let i = 1; i <= count; i++) {
      batch.push(makeListingPayload(sellerId, i, opts));
    }

    const { error } = await sb.from('listings').insert(batch);
    if (error) {
      console.error(`[seed] insert failed for seller_id=${sellerId}:`, error.message);
      continue;
    }
    console.log(`[seed] inserted ${count} listings for seller_id=${sellerId}`);
  }
}

async function main() {
  const opts = {
    hiddenEvery: 0,
    soldEvery: 0
  };

  if (sellerIds.length > 0) {
    await seedForSellerIds(sellerIds.slice(0, 3), sellerCount, opts);
  } else {
    await seedFor('seller', sellerCount, opts);
  }

  if (buyerCount > 0) {
    if (!includeUnverified) {
      console.log('[seed] buyerCount was set but include_unverified=false; skipping buyer seeding');
    } else {
      await seedFor('buyer', buyerCount, opts);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
