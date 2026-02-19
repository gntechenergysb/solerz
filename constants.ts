
export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya'
];

export const CATEGORIES = ['Panels', 'Inverters', 'Batteries', 'Cable', 'Protective', 'Miscellaneous'];

export const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'solar.king@example.com',
    company_name: 'Solar King Sdn Bhd',
    company_reg_no: '202301001234',
    is_verified: true,
    whatsapp_no: '60123456789',
    tier: 'ELITE',
    seller_type: 'COMPANY',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-2',
    email: 'newbie@example.com',
    company_name: 'New Energy Enterprise',
    company_reg_no: '202301009999',
    is_verified: false,
    whatsapp_no: '60198765432',
    tier: 'STARTER',
    seller_type: 'INDIVIDUAL',
    created_at: new Date().toISOString()
  }
] as const;

// Helper to get date relative to now
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const MOCK_LISTINGS = [
  {
    id: 'list-1',
    seller_id: 'user-1',
    title: 'JA Solar 550W Mono PERC Half-Cell',
    category: 'Panels',
    brand: 'JA Solar',
    specs: {
      wattage: 550,
      cell_type: 'Monocrystalline',
      efficiency: 21.5,
      dimensions: '2279x1134x35mm'
    },
    price_rm: 450.00,
    location_state: 'Selangor',
    images_url: ['https://picsum.photos/800/600?random=1', 'https://picsum.photos/800/600?random=2'],
    active_until: daysFromNow(20), // Active
    archive_until: daysFromNow(20), // Same as active
    is_sold: false,
    is_hidden: false,
    is_verified_listing: true,
    view_count: 142,
    created_at: daysFromNow(-10)
  },
  {
    id: 'list-2',
    seller_id: 'user-1',
    title: 'Huawei SUN2000-100KTL-M1',
    category: 'Inverters',
    brand: 'Huawei',
    specs: {
      phase: 'Three',
      max_input_voltage: 1100,
      efficiency: 98.6,
      warranty_years: 5
    },
    price_rm: 12000.00,
    location_state: 'Johor',
    images_url: ['https://picsum.photos/800/600?random=3'],
    active_until: daysFromNow(-5), // Expired
    archive_until: daysFromNow(-5), // Expired
    is_sold: false,
    is_hidden: false,
    is_verified_listing: true,
    view_count: 89,
    created_at: daysFromNow(-35)
  },
  {
    id: 'list-3',
    seller_id: 'user-1',
    title: 'Pylontech US3000C',
    category: 'Batteries',
    brand: 'Pylontech',
    specs: {
      cycle_life: 6000,
      capacity_kwh: 3.5,
      nominal_voltage: 48,
      technology: 'LiFePO4'
    },
    price_rm: 5500.00,
    location_state: 'Penang',
    images_url: ['https://picsum.photos/800/600?random=4'],
    active_until: daysFromNow(28),
    archive_until: daysFromNow(28),
    is_sold: true,
    is_hidden: false,
    is_verified_listing: true,
    view_count: 356,
    created_at: daysFromNow(-2)
  }
];