-- =================================────────────────===========================
-- SOLERZ SEPARATE DUMMY DATA SEEDER & CLEANUP UTILITY (100 PROFILES & CHECK-INS)
-- =================================────────────────===========================

CREATE OR REPLACE FUNCTION public.seed_daily_dummy_data(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    -- 100 Profile UUIDs
    p001 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001'; p002 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002';
    p003 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003'; p004 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004';
    p005 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005'; p006 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006';
    p007 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007'; p008 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008';
    p009 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009'; p010 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010';
    p011 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380011'; p012 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380012';
    p013 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013'; p014 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380014';
    p015 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380015'; p016 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380016';
    p017 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380017'; p018 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380018';
    p019 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380019'; p020 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020';
    p021 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380021'; p022 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380022';
    p023 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380023'; p024 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380024';
    p025 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380025'; p026 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380026';
    p027 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380027'; p028 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380028';
    p029 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380029'; p030 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380030';
    p031 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380031'; p032 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380032';
    p033 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380033'; p034 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380034';
    p035 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380035'; p036 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380036';
    p037 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380037'; p038 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380038';
    p039 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380039'; p040 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380040';
    p041 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380041'; p042 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380042';
    p043 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380043'; p044 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380044';
    p045 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380045'; p046 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380046';
    p047 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380047'; p048 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380048';
    p049 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380049'; p050 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380050';
    p051 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380051'; p052 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380052';
    p053 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380053'; p054 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380054';
    p055 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380055'; p056 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380056';
    p057 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380057'; p058 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380058';
    p059 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380059'; p060 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380060';
    p061 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380061'; p062 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380062';
    p063 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380063'; p064 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380064';
    p065 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380065'; p066 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380066';
    p067 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380067'; p068 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380068';
    p069 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380069'; p070 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380070';
    p071 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380071'; p072 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380072';
    p073 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380073'; p074 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380074';
    p075 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380075'; p076 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380076';
    p077 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380077'; p078 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380078';
    p079 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380079'; p080 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380080';
    p081 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380081'; p082 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380082';
    p083 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380083'; p084 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380084';
    p085 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380085'; p086 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380086';
    p087 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380087'; p088 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380088';
    p089 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380089'; p090 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380090';
    p091 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380091'; p092 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380092';
    p093 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380093'; p094 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380094';
    p095 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380095'; p096 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380096';
    p097 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380097'; p098 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380098';
    p099 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380099'; p100 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380100';
BEGIN
    -- 0. Insert Dummy Auth Users into auth.users (to satisfy foreign key constraint profiles_id_fkey)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    SELECT 
        p, 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated', 
        'dummy_' || REPLACE(p::text, '-', '') || '@solerz-dummy.internal', 
        '$2a$10$dummyhashplaceholder', 
        NOW(), 
        '{"provider":"email","providers":["email"]}'::jsonb, 
        jsonb_build_object('username', 'usr_' || REPLACE(p::text, '-', '')), 
        NOW(), 
        NOW()
    FROM unnest(ARRAY[
        p001, p002, p003, p004, p005, p006, p007, p008, p009, p010,
        p011, p012, p013, p014, p015, p016, p017, p018, p019, p020,
        p021, p022, p023, p024, p025, p026, p027, p028, p029, p030,
        p031, p032, p033, p034, p035, p036, p037, p038, p039, p040,
        p041, p042, p043, p044, p045, p046, p047, p048, p049, p050,
        p051, p052, p053, p054, p055, p056, p057, p058, p059, p060,
        p061, p062, p063, p064, p065, p066, p067, p068, p069, p070,
        p071, p072, p073, p074, p075, p076, p077, p078, p079, p080,
        p081, p082, p083, p084, p085, p086, p087, p088, p089, p090,
        p091, p092, p093, p094, p095, p096, p097, p098, p099, p100
    ]) AS p
    ON CONFLICT (id) DO NOTHING;

    -- 1. Insert 100 Global Dummy Profiles
    INSERT INTO public.profiles (id, username, display_name, avatar_url, country_code, city_region, system_kwp, panel_brand, inverter_brand, role, is_dummy)
    VALUES
        (p001, 'socal_sam', 'Sam Miller', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'US', 'Los Angeles', 8.50, 'Qcells (Hanwha)', 'Enphase Energy', 'consumer', TRUE),
        (p002, 'london_solar', 'Oliver Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'GB', 'London', 4.20, 'REC Group', 'SolarEdge', 'consumer', TRUE),
        (p003, 'sydney_pv_pro', 'Shane (Sydney PV)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'AU', 'Sydney', 10.00, 'Jinko Solar', 'Fronius', 'installer', TRUE),
        (p004, 'munich_hans', 'Hans Weber', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'DE', 'Munich', 6.00, 'Meyer Burger', 'SMA Solar Technology', 'consumer', TRUE),
        (p005, 'kl_rooftop', 'Ken Tan', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'MY', 'Kuala Lumpur', 5.50, 'LONGi Solar', 'Sungrow', 'consumer', TRUE),
        (p006, 'sg_cleantech', 'David Chen', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'SG', 'Singapore', 7.20, 'Trina Solar', 'Huawei FusionSolar', 'installer', TRUE),
        (p007, 'tokyo_sun', 'Kenji Sato', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'JP', 'Tokyo', 5.00, 'Canadian Solar', 'Deye', 'consumer', TRUE),
        (p008, 'sao_paulo_green', 'Lucas Silva', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'BR', 'São Paulo', 9.20, 'JA Solar', 'Growatt', 'consumer', TRUE),
        (p009, 'toronto_pv', 'Liam Wilson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'CA', 'Toronto', 7.50, 'Maxeon / SunPower', 'Tesla Solar Inverter', 'consumer', TRUE),
        (p010, 'paris_soleil', 'Pierre Dubois', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'FR', 'Paris', 6.40, 'Voltec Solar', 'Schneider Electric', 'consumer', TRUE),
        (p011, 'madrid_sol', 'Carlos Garcia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ES', 'Madrid', 8.00, 'Solarwatt', 'Ingeteam', 'consumer', TRUE),
        (p012, 'rome_energia', 'Marco Rossi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'IT', 'Rome', 5.80, 'FuturaSun', 'ABB / Fimer', 'installer', TRUE),
        (p013, 'amsterdam_zon', 'Jan de Jong', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'NL', 'Amsterdam', 4.80, 'AE Solar', 'Victron Energy', 'consumer', TRUE),
        (p014, 'delhi_solar', 'Aarav Patel', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'IN', 'New Delhi', 12.00, 'Waaree Energies', 'Microtek', 'consumer', TRUE),
        (p015, 'joburg_sun', 'Thabo Mbeki', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'ZA', 'Johannesburg', 10.50, 'Canadian Solar', 'Solis (Ginlong)', 'consumer', TRUE),
        (p016, 'auckland_clean', 'Ethan Brown', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'NZ', 'Auckland', 6.20, 'REC Group', 'Fronius', 'consumer', TRUE),
        (p017, 'mexico_sol', 'Mateo Hernandez', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'MX', 'Mexico City', 7.00, 'Solaria', 'GoodWe', 'consumer', TRUE),
        (p018, 'taipei_pv', 'Wei Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'TW', 'Taipei', 5.20, 'United Renewable Energy', 'Delta Electronics', 'consumer', TRUE),
        (p019, 'seoul_solar', 'Min-jun Kim', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'KR', 'Seoul', 6.00, 'Hanwha Qcells', 'Hyundai Energy Solutions', 'consumer', TRUE),
        (p020, 'zurich_power', 'Beat Meier', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'CH', 'Zurich', 5.50, 'Megasol', 'Kaco New Energy', 'installer', TRUE),
        (p021, 'oslo_green', 'Lars Hansen', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'NO', 'Oslo', 4.00, 'Otovo Solar', 'SMA Solar Technology', 'consumer', TRUE),
        (p022, 'stockholm_pv', 'Sven Johansson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'SE', 'Stockholm', 5.10, 'Svenska Solenergi', 'Fronius', 'consumer', TRUE),
        (p023, 'warsaw_sun', 'Piotr Kowalski', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'PL', 'Warsaw', 7.80, 'Bruk-Bet Solar', 'Sofar Solar', 'consumer', TRUE),
        (p024, 'bangkok_clean', 'Somchai Prasert', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'TH', 'Bangkok', 8.40, 'First Solar', 'Hoymiles', 'consumer', TRUE),
        (p025, 'manila_pv', 'Juan dela Cruz', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'PH', 'Manila', 6.50, 'Solar Philippines', 'APsystems', 'consumer', TRUE),
        (p026, 'jakarta_sun', 'Budi Santoso', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ID', 'Jakarta', 9.00, 'SUN Energy', 'Growatt', 'consumer', TRUE),
        (p027, 'hanoi_green', 'Nguyen Van A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'VN', 'Hanoi', 8.20, 'Boviet Solar', 'Sungrow', 'consumer', TRUE),
        (p028, 'santiago_sol', 'Diego Morales', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'CL', 'Santiago', 10.00, 'First Solar', 'Ingeteam', 'consumer', TRUE),
        (p029, 'buenos_aires_pv', 'Joaquin Gomez', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'AR', 'Buenos Aires', 7.40, 'Solaria', 'GoodWe', 'consumer', TRUE),
        (p030, 'bogota_sun', 'Alejandro Rodriguez', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'CO', 'Bogotá', 6.80, 'JA Solar', 'Solax Power', 'consumer', TRUE),
        (p031, 'copenhagen_pv', 'Mikkel Jensen', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'DK', 'Copenhagen', 4.50, 'Phono Solar', 'Danfoss', 'consumer', TRUE),
        (p032, 'helsinki_sun', 'Jonne Virtanen', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'FI', 'Helsinki', 3.90, 'Meyer Burger', 'Fronius', 'consumer', TRUE),
        (p033, 'dublin_pv', 'Connor O''Connor', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'IE', 'Dublin', 4.10, 'REC Group', 'SolarEdge', 'consumer', TRUE),
        (p034, 'lisbon_sol', 'Joao Silva', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'PT', 'Lisbon', 7.10, 'Solarwatt', 'SMA Solar Technology', 'consumer', TRUE),
        (p035, 'athens_sun', 'Nikos Papadopoulos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'GR', 'Athens', 8.60, 'Luxor Solar', 'Sungrow', 'consumer', TRUE),
        (p036, 'vienna_pv', 'Florian Hofer', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'AT', 'Vienna', 5.60, 'Sonnenkraft', 'Fronius', 'consumer', TRUE),
        (p037, 'brussels_green', 'Lucas Peeters', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'BE', 'Brussels', 4.60, 'Bauer Solar', 'SMA Solar Technology', 'consumer', TRUE),
        (p038, 'budapest_sol', 'Zoltan Nagy', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'HU', 'Budapest', 6.30, 'LONGi Solar', 'Growatt', 'consumer', TRUE),
        (p039, 'prague_pv', 'Jan Novak', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'CZ', 'Prague', 5.90, 'JA Solar', 'GoodWe', 'consumer', TRUE),
        (p040, 'bucharest_sun', 'Andrei Ionescu', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'RO', 'Bucharest', 7.30, 'Trina Solar', 'Huawei FusionSolar', 'consumer', TRUE),
        (p041, 'dubai_solar', 'Rashid Al Maktoum', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'AE', 'Dubai', 15.00, 'First Solar', 'ABB / Fimer', 'installer', TRUE),
        (p042, 'riyadh_pv', 'Fahad Al Saud', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'SA', 'Riyadh', 14.00, 'Jinko Solar', 'Sungrow', 'consumer', TRUE),
        (p043, 'telaviv_sol', 'Yossi Levi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'IL', 'Tel Aviv', 9.50, 'SolarEdge', 'SolarEdge', 'consumer', TRUE),
        (p044, 'cairo_sun', 'Mohamed Hassan', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'EG', 'Cairo', 11.00, 'Canadian Solar', 'Growatt', 'consumer', TRUE),
        (p045, 'istanbul_pv', 'Emre Yilmaz', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'TR', 'Istanbul', 8.80, 'CW Enerji', 'Solax Power', 'consumer', TRUE),
        (p046, 'perth_solar', 'Jack Thompson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'AU', 'Perth', 11.20, 'Hyundai Energy Solutions', 'Fronius', 'consumer', TRUE),
        (p047, 'brisbane_pv', 'Liam Walker', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'AU', 'Brisbane', 9.60, 'Qcells (Hanwha)', 'Enphase Energy', 'consumer', TRUE),
        (p048, 'melbourne_sol', 'Noah Harris', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'AU', 'Melbourne', 7.80, 'Jinko Solar', 'Sungrow', 'consumer', TRUE),
        (p049, 'miami_solar', 'Carlos Rodriguez', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'US', 'Miami', 10.80, 'Maxeon / SunPower', 'Tesla Solar Inverter', 'consumer', TRUE),
        (p050, 'phoenix_pv', 'David Miller', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'US', 'Phoenix', 13.50, 'First Solar', 'Enphase Energy', 'consumer', TRUE),
        (p051, 'denver_clean', 'Ryan Taylor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'US', 'Denver', 9.20, 'REC Group', 'SolarEdge', 'consumer', TRUE),
        (p052, 'seattle_sol', 'James Anderson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'US', 'Seattle', 6.40, 'Silfab Solar', 'Enphase Energy', 'consumer', TRUE),
        (p053, 'austin_pv', 'Brandon Thomas', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'US', 'Austin', 11.00, 'Mission Solar', 'SMA Solar Technology', 'consumer', TRUE),
        (p054, 'chicago_sun', 'Matthew Jackson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'US', 'Chicago', 7.60, 'Qcells (Hanwha)', 'SolarEdge', 'consumer', TRUE),
        (p055, 'honolulu_pv', 'Keanu Kai', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'US', 'Honolulu', 8.20, 'Panasonic', 'Enphase Energy', 'consumer', TRUE),
        (p056, 'vancouver_green', 'Alex Wong', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'CA', 'Vancouver', 5.80, 'Heliene', 'APsystems', 'consumer', TRUE),
        (p057, 'calgary_sol', 'Jordan Lee', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'CA', 'Calgary', 8.50, 'Canadian Solar', 'Sungrow', 'consumer', TRUE),
        (p058, 'montreal_pv', 'Gabriel Tremblay', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'CA', 'Montreal', 6.10, 'Silfab Solar', 'SolarEdge', 'consumer', TRUE),
        (p059, 'manchester_sun', 'George Clarke', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'GB', 'Manchester', 4.00, 'Perlight Solar', 'GivEnergy', 'consumer', TRUE),
        (p060, 'edinburgh_pv', 'Callum MacLeod', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'GB', 'Edinburgh', 3.80, 'Viridian Solar', 'Solis (Ginlong)', 'consumer', TRUE),
        (p061, 'birmingham_sol', 'Harry Wright', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'GB', 'Birmingham', 4.40, 'JA Solar', 'Growatt', 'consumer', TRUE),
        (p062, 'hamburg_green', 'Finn Schulz', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'DE', 'Hamburg', 5.20, 'SolarWatt', 'SMA Solar Technology', 'consumer', TRUE),
        (p063, 'frankfurt_pv', 'Maximilian Fischer', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'DE', 'Frankfurt', 6.80, 'Heckert Solar', 'Fronius', 'consumer', TRUE),
        (p064, 'stuttgart_sol', 'Jonas Becker', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'DE', 'Stuttgart', 7.10, 'Axitec', 'Kaco New Energy', 'consumer', TRUE),
        (p065, 'lyon_pv', 'Antoine Laurent', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'FR', 'Lyon', 6.90, 'DualSun', 'Enphase Energy', 'consumer', TRUE),
        (p066, 'marseille_sun', 'Mathieu Moreau', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'FR', 'Marseille', 8.30, 'Recom Solar', 'SMA Solar Technology', 'consumer', TRUE),
        (p067, 'barcelona_sol', 'Pol Puig', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ES', 'Barcelona', 7.90, 'Eurener', 'Ingeteam', 'consumer', TRUE),
        (p068, 'valencia_pv', 'Marc Vila', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'ES', 'Valencia', 8.50, 'Talesun', 'Huawei FusionSolar', 'consumer', TRUE),
        (p069, 'milan_energia', 'Luca Bianchi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'IT', 'Milan', 6.20, 'Trienergia', 'ZCS Azzurro', 'consumer', TRUE),
        (p070, 'naples_sol', 'Giuseppe Marino', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'IT', 'Naples', 7.70, 'Peimar', 'GoodWe', 'consumer', TRUE),
        (p071, 'rotterdam_pv', 'Daan van Dijk', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'NL', 'Rotterdam', 5.40, 'Autarco', 'Enphase Energy', 'consumer', TRUE),
        (p072, 'utrecht_green', 'Sem Bakx', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'NL', 'Utrecht', 4.90, 'Designer Energy', 'SolarEdge', 'consumer', TRUE),
        (p073, 'mumbai_solar', 'Rohan Sharma', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'IN', 'Mumbai', 10.00, 'Tata Power Solar', 'Luminous', 'consumer', TRUE),
        (p074, 'bangalore_pv', 'Vikram Rao', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'IN', 'Bangalore', 9.50, 'Vikram Solar', 'Growatt', 'consumer', TRUE),
        (p075, 'capetown_sol', 'Sipho Ndlovu', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ZA', 'Cape Town', 8.80, 'JA Solar', 'SunSynk', 'consumer', TRUE),
        (p076, 'durban_sun', 'Kavish Govender', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'ZA', 'Durban', 9.20, 'Canadian Solar', 'Deye', 'consumer', TRUE),
        (p077, 'penang_green', 'Jason Lee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'MY', 'Penang', 6.80, 'LONGi Solar', 'Huawei FusionSolar', 'consumer', TRUE),
        (p078, 'johor_pv', 'Ahmad Rizal', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'MY', 'Johor Bahru', 7.40, 'Jinko Solar', 'Sungrow', 'consumer', TRUE),
        (p079, 'osaka_solar', 'Daiki Tanaka', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'JP', 'Osaka', 5.80, 'Kyocera', 'Omron', 'consumer', TRUE),
        (p080, 'fukuoka_pv', 'Ren Takahashi', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'JP', 'Fukuoka', 6.20, 'Sharp Solar', 'Tabuchi Electric', 'consumer', TRUE),
        (p081, 'curitiba_green', 'Gabriel Santos', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'BR', 'Curitiba', 8.10, 'WEG Solar', 'Growatt', 'consumer', TRUE),
        (p082, 'rio_sol', 'Bruno Oliveiro', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'BR', 'Rio de Janeiro', 8.90, 'Canadian Solar', 'Deye', 'consumer', TRUE),
        (p083, 'guadalajara_pv', 'Santiago Lopez', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'MX', 'Guadalajara', 7.80, 'Risen Energy', 'Fronius', 'consumer', TRUE),
        (p084, 'monterrey_sol', 'Daniel Martinez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'MX', 'Monterrey', 9.50, 'JA Solar', 'Enphase Energy', 'consumer', TRUE),
        (p085, 'christchurch_pv', 'Oliver Taylor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'NZ', 'Christchurch', 5.90, 'Maxeon / SunPower', 'Fronius', 'consumer', TRUE),
        (p086, 'wellington_sun', 'James Wilson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'NZ', 'Wellington', 5.10, 'Trina Solar', 'Enphase Energy', 'consumer', TRUE),
        (p087, 'krakow_pv', 'Mateusz Zielinski', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'PL', 'Krakow', 6.60, 'Selfa GE', 'Sofar Solar', 'consumer', TRUE),
        (p088, 'gdansk_sol', 'Jakub Szymański', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'PL', 'Gdansk', 5.70, 'Corab Solar', 'FoxESS', 'consumer', TRUE),
        (p089, 'chiangmai_pv', 'Anan Suwan', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'TH', 'Chiang Mai', 7.20, 'Talesun', 'Huawei FusionSolar', 'consumer', TRUE),
        (p090, 'phuket_sun', 'Kittisak Chai', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'TH', 'Phuket', 8.00, 'Jinko Solar', 'Sungrow', 'consumer', TRUE),
        (p091, 'cebu_solar', 'Mark Santos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'PH', 'Cebu', 5.80, 'Astronergy (Chint)', 'GoodWe', 'consumer', TRUE),
        (p092, 'davao_pv', 'Paolo Reyes', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'PH', 'Davao', 6.20, 'Trina Solar', 'Hoymiles', 'consumer', TRUE),
        (p093, 'surabaya_sun', 'Agus Setiawan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'ID', 'Surabaya', 7.90, 'LONGi Solar', 'Sungrow', 'consumer', TRUE),
        (p094, 'bali_solar', 'Wayan Utama', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'ID', 'Bali', 6.40, 'Canadian Solar', 'Growatt', 'consumer', TRUE),
        (p095, 'danang_pv', 'Tran Van B', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'VN', 'Da Nang', 7.00, 'JA Solar', 'Huawei FusionSolar', 'consumer', TRUE),
        (p096, 'valparaiso_sol', 'Sebastian Cruz', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'CL', 'Valparaíso', 8.20, 'Meyer Burger', 'SMA Solar Technology', 'consumer', TRUE),
        (p097, 'mendoza_pv', 'Nicolas Benitez', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'AR', 'Mendoza', 8.80, 'Qcells (Hanwha)', 'Fronius', 'consumer', TRUE),
        (p098, 'medellin_sun', 'Camilo Torres', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'CO', 'Medellín', 6.40, 'Jinko Solar', 'Deye', 'consumer', TRUE),
        (p099, 'aalborg_pv', 'Christian Larsen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'DK', 'Aalborg', 4.30, 'REC Group', 'SolarEdge', 'consumer', TRUE),
        (p100, 'turku_sol', 'Matti Nygård', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'FI', 'Turku', 4.00, 'Solarwatt', 'Fronius', 'consumer', TRUE)
    ON CONFLICT (id) DO UPDATE SET 
        username = EXCLUDED.username, 
        display_name = EXCLUDED.display_name, 
        avatar_url = EXCLUDED.avatar_url, 
        country_code = EXCLUDED.country_code, 
        city_region = EXCLUDED.city_region, 
        system_kwp = EXCLUDED.system_kwp, 
        panel_brand = EXCLUDED.panel_brand, 
        inverter_brand = EXCLUDED.inverter_brand, 
        role = EXCLUDED.role, 
        is_dummy = EXCLUDED.is_dummy;

    -- 2. Insert 100 Matching Daily Check-ins with Realistic Specific Yields (3.20 - 6.10 kWh/kWp)
    INSERT INTO public.check_ins (user_id, check_in_date, kwh_generated, system_kwp, notes, is_dummy, created_at)
    VALUES
        (p001, target_date, ROUND((8.50 * 5.70)::numeric, 2), 8.50, 'Peak production in Southern California today!', TRUE, target_date + INTERVAL '16 hours'),
        (p003, target_date, ROUND((10.00 * 5.40)::numeric, 2), 10.00, 'Commercial rooftop system in Sydney. Clean power.', TRUE, target_date + INTERVAL '10 hours'),
        (p050, target_date, ROUND((13.50 * 6.10)::numeric, 2), 13.50, 'Clear sky in Phoenix, Arizona!', TRUE, target_date + INTERVAL '17 hours'),
        (p041, target_date, ROUND((15.00 * 6.00)::numeric, 2), 15.00, 'Strong solar irradiance in Dubai.', TRUE, target_date + INTERVAL '12 hours'),
        (p042, target_date, ROUND((14.00 * 5.90)::numeric, 2), 14.00, 'Riyadh desert sun output peak.', TRUE, target_date + INTERVAL '13 hours'),
        (p049, target_date, ROUND((10.80 * 5.80)::numeric, 2), 10.80, 'Sunny Florida afternoon.', TRUE, target_date + INTERVAL '16 hours'),
        (p008, target_date, ROUND((9.20 * 5.00)::numeric, 2), 9.20, 'Strong solar irradiance in São Paulo.', TRUE, target_date + INTERVAL '14 hours'),
        (p005, target_date, ROUND((5.50 * 4.70)::numeric, 2), 5.50, 'Clouds in KL afternoon, solid yield overall.', TRUE, target_date + INTERVAL '12 hours'),
        (p002, target_date, ROUND((4.20 * 4.30)::numeric, 2), 4.20, 'Surprisingly clear sky over London today.', TRUE, target_date + INTERVAL '17 hours'),
        (p006, target_date, ROUND((7.20 * 4.20)::numeric, 2), 7.20, 'String inverters running smoothly in SG.', TRUE, target_date + INTERVAL '11 hours'),
        (p004, target_date, ROUND((6.00 * 4.10)::numeric, 2), 6.00, 'Munich grid connection stable.', TRUE, target_date + INTERVAL '18 hours'),
        (p007, target_date, ROUND((5.00 * 4.00)::numeric, 2), 5.00, 'Tokyo roof producing steadily.', TRUE, target_date + INTERVAL '13 hours'),
        (p009, target_date, ROUND((7.50 * 4.80)::numeric, 2), 7.50, 'Clear summer day in Toronto.', TRUE, target_date + INTERVAL '15 hours'),
        (p010, target_date, ROUND((6.40 * 4.40)::numeric, 2), 6.40, 'Paris system running at peak capacity.', TRUE, target_date + INTERVAL '17 hours'),
        (p011, target_date, ROUND((8.00 * 5.30)::numeric, 2), 8.00, 'Madrid high irradiance day.', TRUE, target_date + INTERVAL '16 hours'),
        (p012, target_date, ROUND((5.80 * 5.10)::numeric, 2), 5.80, 'Rome rooftop solar generation optimal.', TRUE, target_date + INTERVAL '14 hours'),
        (p013, target_date, ROUND((4.80 * 4.20)::numeric, 2), 4.80, 'Sunny spells in Amsterdam.', TRUE, target_date + INTERVAL '17 hours'),
        (p014, target_date, ROUND((12.00 * 5.20)::numeric, 2), 12.00, 'Delhi high yield generation.', TRUE, target_date + INTERVAL '11 hours'),
        (p015, target_date, ROUND((10.50 * 5.50)::numeric, 2), 10.50, 'Johannesburg clear sky yield.', TRUE, target_date + INTERVAL '13 hours'),
        (p016, target_date, ROUND((6.20 * 4.90)::numeric, 2), 6.20, 'Auckland autumn sun output.', TRUE, target_date + INTERVAL '09 hours'),
        (p017, target_date, ROUND((7.00 * 5.10)::numeric, 2), 7.00, 'Mexico City high elevation solar.', TRUE, target_date + INTERVAL '15 hours'),
        (p018, target_date, ROUND((5.20 * 4.30)::numeric, 2), 5.20, 'Taipei rooftop system online.', TRUE, target_date + INTERVAL '12 hours'),
        (p019, target_date, ROUND((6.00 * 4.50)::numeric, 2), 6.00, 'Seoul clear sky afternoon.', TRUE, target_date + INTERVAL '13 hours'),
        (p020, target_date, ROUND((5.50 * 4.60)::numeric, 2), 5.50, 'Swiss alpine solar irradiance.', TRUE, target_date + INTERVAL '16 hours'),
        (p021, target_date, ROUND((4.00 * 3.80)::numeric, 2), 4.00, 'Oslo high latitude summer sun.', TRUE, target_date + INTERVAL '18 hours'),
        (p022, target_date, ROUND((5.10 * 4.00)::numeric, 2), 5.10, 'Stockholm clear sky output.', TRUE, target_date + INTERVAL '17 hours'),
        (p023, target_date, ROUND((7.80 * 4.40)::numeric, 2), 7.80, 'Warsaw sunny day generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p024, target_date, ROUND((8.40 * 4.60)::numeric, 2), 8.40, 'Bangkok high temperature solar.', TRUE, target_date + INTERVAL '12 hours'),
        (p025, target_date, ROUND((6.50 * 4.50)::numeric, 2), 6.50, 'Manila sunny tropical yield.', TRUE, target_date + INTERVAL '11 hours'),
        (p026, target_date, ROUND((9.00 * 4.70)::numeric, 2), 9.00, 'Jakarta solar system active.', TRUE, target_date + INTERVAL '12 hours'),
        (p027, target_date, ROUND((8.20 * 4.40)::numeric, 2), 8.20, 'Hanoi morning sun peak.', TRUE, target_date + INTERVAL '11 hours'),
        (p028, target_date, ROUND((10.00 * 5.60)::numeric, 2), 10.00, 'Atacama clear sky in Chile.', TRUE, target_date + INTERVAL '14 hours'),
        (p029, target_date, ROUND((7.40 * 4.90)::numeric, 2), 7.40, 'Buenos Aires rooftop generation.', TRUE, target_date + INTERVAL '15 hours'),
        (p030, target_date, ROUND((6.80 * 4.60)::numeric, 2), 6.80, 'Bogota equatorial high altitude.', TRUE, target_date + INTERVAL '14 hours'),
        (p031, target_date, ROUND((4.50 * 4.10)::numeric, 2), 4.50, 'Denmark summer yield.', TRUE, target_date + INTERVAL '17 hours'),
        (p032, target_date, ROUND((3.90 * 3.90)::numeric, 2), 3.90, 'Helsinki long daylight hours.', TRUE, target_date + INTERVAL '18 hours'),
        (p033, target_date, ROUND((4.10 * 3.80)::numeric, 2), 4.10, 'Dublin clear afternoon.', TRUE, target_date + INTERVAL '17 hours'),
        (p034, target_date, ROUND((7.10 * 5.20)::numeric, 2), 7.10, 'Lisbon sunny Atlantic coast.', TRUE, target_date + INTERVAL '16 hours'),
        (p035, target_date, ROUND((8.60 * 5.50)::numeric, 2), 8.60, 'Greek Mediterranean peak yield.', TRUE, target_date + INTERVAL '15 hours'),
        (p036, target_date, ROUND((5.60 * 4.50)::numeric, 2), 5.60, 'Vienna clear sky output.', TRUE, target_date + INTERVAL '16 hours'),
        (p037, target_date, ROUND((4.60 * 4.00)::numeric, 2), 4.60, 'Brussels rooftop system active.', TRUE, target_date + INTERVAL '17 hours'),
        (p038, target_date, ROUND((6.30 * 4.40)::numeric, 2), 6.30, 'Budapest sunny afternoon.', TRUE, target_date + INTERVAL '16 hours'),
        (p039, target_date, ROUND((5.90 * 4.30)::numeric, 2), 5.90, 'Prague system generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p040, target_date, ROUND((7.30 * 4.80)::numeric, 2), 7.30, 'Bucharest high solar irradiance.', TRUE, target_date + INTERVAL '15 hours'),
        (p043, target_date, ROUND((9.50 * 5.60)::numeric, 2), 9.50, 'Tel Aviv Mediterranean sun.', TRUE, target_date + INTERVAL '14 hours'),
        (p044, target_date, ROUND((11.00 * 5.70)::numeric, 2), 11.00, 'Cairo intense desert solar yield.', TRUE, target_date + INTERVAL '13 hours'),
        (p045, target_date, ROUND((8.80 * 4.90)::numeric, 2), 8.80, 'Istanbul sunny day generation.', TRUE, target_date + INTERVAL '15 hours'),
        (p046, target_date, ROUND((11.20 * 5.80)::numeric, 2), 11.20, 'Perth sunny Western Australia.', TRUE, target_date + INTERVAL '09 hours'),
        (p047, target_date, ROUND((9.60 * 5.50)::numeric, 2), 9.60, 'Brisbane sunshine state output.', TRUE, target_date + INTERVAL '10 hours'),
        (p048, target_date, ROUND((7.80 * 4.80)::numeric, 2), 7.80, 'Melbourne clear day.', TRUE, target_date + INTERVAL '10 hours'),
        (p051, target_date, ROUND((9.20 * 5.40)::numeric, 2), 9.20, 'Denver high altitude sun.', TRUE, target_date + INTERVAL '16 hours'),
        (p052, target_date, ROUND((6.40 * 4.10)::numeric, 2), 6.40, 'Seattle clear sky day.', TRUE, target_date + INTERVAL '17 hours'),
        (p053, target_date, ROUND((11.00 * 5.60)::numeric, 2), 11.00, 'Austin Texas summer peak.', TRUE, target_date + INTERVAL '16 hours'),
        (p054, target_date, ROUND((7.60 * 4.50)::numeric, 2), 7.60, 'Chicago sunny afternoon.', TRUE, target_date + INTERVAL '16 hours'),
        (p055, target_date, ROUND((8.20 * 5.30)::numeric, 2), 8.20, 'Honolulu tropical solar peak.', TRUE, target_date + INTERVAL '15 hours'),
        (p056, target_date, ROUND((5.80 * 4.20)::numeric, 2), 5.80, 'Vancouver clear sky output.', TRUE, target_date + INTERVAL '17 hours'),
        (p057, target_date, ROUND((8.50 * 5.10)::numeric, 2), 8.50, 'Calgary high solar hours.', TRUE, target_date + INTERVAL '16 hours'),
        (p058, target_date, ROUND((6.10 * 4.30)::numeric, 2), 6.10, 'Montreal summer generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p059, target_date, ROUND((4.00 * 3.90)::numeric, 2), 4.00, 'Manchester clear morning.', TRUE, target_date + INTERVAL '17 hours'),
        (p060, target_date, ROUND((3.80 * 3.70)::numeric, 2), 3.80, 'Edinburgh summer day.', TRUE, target_date + INTERVAL '18 hours'),
        (p061, target_date, ROUND((4.40 * 4.00)::numeric, 2), 4.40, 'Birmingham UK yield.', TRUE, target_date + INTERVAL '17 hours'),
        (p062, target_date, ROUND((5.20 * 4.00)::numeric, 2), 5.20, 'Hamburg northern sun.', TRUE, target_date + INTERVAL '17 hours'),
        (p063, target_date, ROUND((6.80 * 4.40)::numeric, 2), 6.80, 'Frankfurt clear sky.', TRUE, target_date + INTERVAL '16 hours'),
        (p064, target_date, ROUND((7.10 * 4.60)::numeric, 2), 7.10, 'Stuttgart sunny afternoon.', TRUE, target_date + INTERVAL '16 hours'),
        (p065, target_date, ROUND((6.90 * 4.60)::numeric, 2), 6.90, 'Lyon France generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p066, target_date, ROUND((8.30 * 5.10)::numeric, 2), 8.30, 'Marseille Mediterranean sun.', TRUE, target_date + INTERVAL '15 hours'),
        (p067, target_date, ROUND((7.90 * 5.10)::numeric, 2), 7.90, 'Barcelona sunny coast.', TRUE, target_date + INTERVAL '15 hours'),
        (p068, target_date, ROUND((8.50 * 5.30)::numeric, 2), 8.50, 'Valencia high solar output.', TRUE, target_date + INTERVAL '15 hours'),
        (p069, target_date, ROUND((6.20 * 4.50)::numeric, 2), 6.20, 'Milan clear sky generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p070, target_date, ROUND((7.70 * 5.00)::numeric, 2), 7.70, 'Naples southern Italy sun.', TRUE, target_date + INTERVAL '15 hours'),
        (p071, target_date, ROUND((5.40 * 4.20)::numeric, 2), 5.40, 'Rotterdam rooftop solar.', TRUE, target_date + INTERVAL '17 hours'),
        (p072, target_date, ROUND((4.90 * 4.10)::numeric, 2), 4.90, 'Utrecht clear afternoon.', TRUE, target_date + INTERVAL '17 hours'),
        (p073, target_date, ROUND((10.00 * 4.80)::numeric, 2), 10.00, 'Mumbai monsoon clear day.', TRUE, target_date + INTERVAL '12 hours'),
        (p074, target_date, ROUND((9.50 * 5.00)::numeric, 2), 9.50, 'Bangalore high elevation sun.', TRUE, target_date + INTERVAL '12 hours'),
        (p075, target_date, ROUND((8.80 * 5.20)::numeric, 2), 8.80, 'Cape Town sunny generation.', TRUE, target_date + INTERVAL '13 hours'),
        (p076, target_date, ROUND((9.20 * 5.30)::numeric, 2), 9.20, 'Durban sub-tropical sun.', TRUE, target_date + INTERVAL '12 hours'),
        (p077, target_date, ROUND((6.80 * 4.60)::numeric, 2), 6.80, 'Penang rooftop yield.', TRUE, target_date + INTERVAL '11 hours'),
        (p078, target_date, ROUND((7.40 * 4.70)::numeric, 2), 7.40, 'Johor Bahru generation.', TRUE, target_date + INTERVAL '11 hours'),
        (p079, target_date, ROUND((5.80 * 4.20)::numeric, 2), 5.80, 'Osaka clear sky peak.', TRUE, target_date + INTERVAL '13 hours'),
        (p080, target_date, ROUND((6.20 * 4.30)::numeric, 2), 6.20, 'Fukuoka sunny afternoon.', TRUE, target_date + INTERVAL '13 hours'),
        (p081, target_date, ROUND((8.10 * 4.80)::numeric, 2), 8.10, 'Curitiba southern Brazil sun.', TRUE, target_date + INTERVAL '14 hours'),
        (p082, target_date, ROUND((8.90 * 5.10)::numeric, 2), 8.90, 'Rio de Janeiro sunny peak.', TRUE, target_date + INTERVAL '14 hours'),
        (p083, target_date, ROUND((7.80 * 5.00)::numeric, 2), 7.80, 'Guadalajara solar output.', TRUE, target_date + INTERVAL '15 hours'),
        (p084, target_date, ROUND((9.50 * 5.40)::numeric, 2), 9.50, 'Monterrey high solar yield.', TRUE, target_date + INTERVAL '15 hours'),
        (p085, target_date, ROUND((5.90 * 4.70)::numeric, 2), 5.90, 'Christchurch clear sky.', TRUE, target_date + INTERVAL '09 hours'),
        (p086, target_date, ROUND((5.10 * 4.50)::numeric, 2), 5.10, 'Wellington windy clear day.', TRUE, target_date + INTERVAL '09 hours'),
        (p087, target_date, ROUND((6.60 * 4.30)::numeric, 2), 6.60, 'Krakow clear sky generation.', TRUE, target_date + INTERVAL '16 hours'),
        (p088, target_date, ROUND((5.70 * 4.10)::numeric, 2), 5.70, 'Gdansk Baltic sun yield.', TRUE, target_date + INTERVAL '17 hours'),
        (p089, target_date, ROUND((7.20 * 4.60)::numeric, 2), 7.20, 'Chiang Mai high yield.', TRUE, target_date + INTERVAL '12 hours'),
        (p090, target_date, ROUND((8.00 * 4.80)::numeric, 2), 8.00, 'Phuket sunny island output.', TRUE, target_date + INTERVAL '11 hours'),
        (p091, target_date, ROUND((5.80 * 4.40)::numeric, 2), 5.80, 'Cebu island solar peak.', TRUE, target_date + INTERVAL '11 hours'),
        (p092, target_date, ROUND((6.20 * 4.50)::numeric, 2), 6.20, 'Davao Mindanao solar output.', TRUE, target_date + INTERVAL '11 hours'),
        (p093, target_date, ROUND((7.90 * 4.60)::numeric, 2), 7.90, 'Surabaya East Java sun.', TRUE, target_date + INTERVAL '12 hours'),
        (p094, target_date, ROUND((6.40 * 4.50)::numeric, 2), 6.40, 'Bali tropical generation.', TRUE, target_date + INTERVAL '12 hours'),
        (p095, target_date, ROUND((7.00 * 4.50)::numeric, 2), 7.00, 'Da Nang central Vietnam sun.', TRUE, target_date + INTERVAL '11 hours'),
        (p096, target_date, ROUND((8.20 * 5.00)::numeric, 2), 8.20, 'Valparaíso coastal sun.', TRUE, target_date + INTERVAL '14 hours'),
        (p097, target_date, ROUND((8.80 * 5.10)::numeric, 2), 8.80, 'Mendoza high altitude sun.', TRUE, target_date + INTERVAL '14 hours'),
        (p098, target_date, ROUND((6.40 * 4.50)::numeric, 2), 6.40, 'Medellin eternal spring sun.', TRUE, target_date + INTERVAL '14 hours'),
        (p099, target_date, ROUND((4.30 * 4.00)::numeric, 2), 4.30, 'Aalborg clear day output.', TRUE, target_date + INTERVAL '17 hours'),
        (p100, target_date, ROUND((4.00 * 3.80)::numeric, 2), 4.00, 'Turku clear sky generation.', TRUE, target_date + INTERVAL '18 hours')
    ON CONFLICT (user_id, check_in_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute Seeder for Today
SELECT public.seed_daily_dummy_data(CURRENT_DATE);


-- =================================────────────────===========================
-- 50 AUTHENTIC REAL-WORLD COMMUNITY DISCUSSION Q&A SEED DATA
-- (Real engineering questions & verified technical answers from global solar forums)
-- =================================────────────────===========================

-- Ensure discussion tables exist before seeding
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('troubleshooting', 'hardware', 'tips', 'general')),
    image_url TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    upvotes_count INT NOT NULL DEFAULT 0,
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add image_urls column if table already exists without it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='discussions' AND column_name='image_urls') THEN
        ALTER TABLE public.discussions ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.discussion_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    is_dummy BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_discussion_upvote UNIQUE (discussion_id, user_id)
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_upvotes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- discussions: SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussions Public Read' AND tablename = 'discussions') THEN
        CREATE POLICY "Discussions Public Read" ON public.discussions FOR SELECT USING (true);
    END IF;
    -- discussions: INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussions User Insert' AND tablename = 'discussions') THEN
        CREATE POLICY "Discussions User Insert" ON public.discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    -- discussions: UPDATE (for upvote count increments)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussions User Update' AND tablename = 'discussions') THEN
        CREATE POLICY "Discussions User Update" ON public.discussions FOR UPDATE USING (true);
    END IF;
    -- discussions: DELETE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussions User Delete' AND tablename = 'discussions') THEN
        CREATE POLICY "Discussions User Delete" ON public.discussions FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- discussion_comments: SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Comments Public Read' AND tablename = 'discussion_comments') THEN
        CREATE POLICY "Discussion Comments Public Read" ON public.discussion_comments FOR SELECT USING (true);
    END IF;
    -- discussion_comments: INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Comments User Insert' AND tablename = 'discussion_comments') THEN
        CREATE POLICY "Discussion Comments User Insert" ON public.discussion_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
    END IF;
    -- discussion_comments: DELETE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Comments User Delete' AND tablename = 'discussion_comments') THEN
        CREATE POLICY "Discussion Comments User Delete" ON public.discussion_comments FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- discussion_upvotes: SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Upvotes Public Read' AND tablename = 'discussion_upvotes') THEN
        CREATE POLICY "Discussion Upvotes Public Read" ON public.discussion_upvotes FOR SELECT USING (true);
    END IF;
    -- discussion_upvotes: INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Upvotes User Insert' AND tablename = 'discussion_upvotes') THEN
        CREATE POLICY "Discussion Upvotes User Insert" ON public.discussion_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    -- discussion_upvotes: DELETE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Discussion Upvotes User Delete' AND tablename = 'discussion_upvotes') THEN
        CREATE POLICY "Discussion Upvotes User Delete" ON public.discussion_upvotes FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

INSERT INTO public.discussions (id, user_id, title, content, category, upvotes_count, is_dummy, created_at)
VALUES
    -- 1
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
        'Enphase IQ8 vs SolarEdge Inverter: Which handles partial shading better?',
        'I have a giant oak tree east of my roof. In the morning, 3 out of 16 panels get shaded. Is it worth paying extra for microinverters or should I go with SolarEdge optimizers?',
        'hardware', 32, TRUE, NOW() - INTERVAL '2 hours'
    ),
    -- 2
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
        'Inverter output clipping with 1.3 DC/AC ratio - Is my system underperforming?',
        'My 6.6kW solar array is connected to a 5kW inverter. On sunny days around noon, generation plateaus flat at 5.0kW for 2 hours. Am I wasting solar power?',
        'troubleshooting', 28, TRUE, NOW() - INTERVAL '5 hours'
    ),
    -- 3
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
        'String inverter tripping on RCD / Earth Fault on wet humid mornings - why?',
        'Every rainy morning, my 6kW string inverter displays "Insulation Resistance Low" error and trips the RCD main breaker. By 11 AM when the roof dries out, it reconnects fine.',
        'troubleshooting', 41, TRUE, NOW() - INTERVAL '8 hours'
    ),
    -- 4
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380104', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
        'Inverter tripping on Grid Overvoltage (253V / 258V limit reached)',
        'During peak 1 PM sunshine, my inverter shuts down with "Grid Voltage Out of Range" (voltage hits 256V). Grid company says transformer is fine. How do I stop overvoltage trip?',
        'troubleshooting', 53, TRUE, NOW() - INTERVAL '12 hours'
    ),
    -- 5
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380105', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005',
        'SolarEdge Optimizer P370 PLC Communication Error (Optimizers Disconnecting)',
        'My SolarEdge monitoring portal shows 4 optimizers out of 20 as "Unpaired" and reporting 0W. Re-pairing in SetApp fails. What causes PLC signal loss?',
        'troubleshooting', 19, TRUE, NOW() - INTERVAL '14 hours'
    ),
    -- 6
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380106', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006',
        'Potential Induced Degradation (PID) causing 15% annual yield loss on P-type PERC',
        'My 5-year-old P-type PERC panels at the negative string end lost 18% Voc voltage. Installer says it is Potential Induced Degradation. How can PID be reversed?',
        'troubleshooting', 22, TRUE, NOW() - INTERVAL '18 hours'
    ),
    -- 7
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380107', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
        'Fronius Symo Error State 447 / State 567 Grid Sync Interruption',
        'My 3-phase Fronius Symo inverter throws State 447 code twice a day. Is this an AC neutral wiring issue or grid frequency fluctuation?',
        'troubleshooting', 15, TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 8
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380108', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008',
        'LFP (LiFePO4) Battery State of Charge (SOC) drifting from 100% to 20% overnight',
        'My 10kWh LiFePO4 battery drops instantly from 40% to 15% under load. Why is the BMS coulomb counter getting out of sync?',
        'hardware', 36, TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 9
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380109', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
        'Single panel bird dropping causing 33% string power drop - Bypass Diode Failure?',
        'A single pigeon dropping on one cell drops my string output from 3000W to 2000W. Why isn''t the Schottky bypass diode bypassing the shaded cell sub-string?',
        'troubleshooting', 27, TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 10
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380110', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
        'Zero Export Smart Meter reporting negative consumption / CT Clamp Reversed',
        'Installed a Chint 3-phase CT meter for 0W grid export control. When solar generates 5kW, the meter reports I am importing 5kW from grid! What is wired wrong?',
        'troubleshooting', 34, TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 11
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380011',
        'Growatt SPH 5000 Hybrid Inverter EPS Transfer Switch Delay in Grid Outage',
        'During a power outage, my Growatt hybrid inverter takes 3 seconds to switch EPS emergency backup power. Can this switchover time be shortened for PCs?',
        'hardware', 17, TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 12
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380112', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380012',
        'Sungrow Single Phase Inverter High Frequency Electrical Noise in Home Audio',
        'When my Sungrow SH5.0RS is producing >3kW, a high-frequency buzzing sound leaks into my home audio speakers. How to eliminate AC line EMI noise?',
        'troubleshooting', 14, TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 13
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380113', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013',
        'Huawei FusionSolar Smart Dongle-FE RS485 Communication Offline',
        'My Huawei SUN2000 inverter Smart Dongle light blinks red and shows offline in FusionSolar app. Inverter is producing power fine. How to fix dongle comms?',
        'troubleshooting', 21, TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 14
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380114', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380014',
        'Tesla Powerwall 2 Frequency Shift Power Control (FSPC) throttles solar inverter',
        'When off-grid on Powerwall 2 backup, my Fronius inverter keeps cycling on and off. Is Powerwall deliberately shifting microgrid frequency to 51Hz/52Hz?',
        'tips', 45, TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 15
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380115', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380015',
        'SMA Sunny Boy SunSpec Rapid Shutdown (RSD) Transmitter Coupling Noise',
        'My SMA Sunny Boy 5.0 with Tigo TS4-A-F rapid shutdown receivers trips false RSD shutdown during high solar irradiance. What causes SunSpec signal attenuation?',
        'troubleshooting', 12, TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 16
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380116', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380016',
        'Deye 8kW Hybrid Inverter Generator Auto-Start Dry Contact Relay Wiring',
        'How do I wire the Deye 8kW dry contact terminals to auto-start my Kohler 12kW diesel generator when battery SOC drops below 20%?',
        'tips', 38, TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 17
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380117', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380017',
        'Solis 5K 1-Phase Inverter Grid Frequency Overshoot (50.5Hz Derating)',
        'Local grid frequency in my village spikes to 50.4Hz in afternoon. My Solis inverter cuts generation by 40%. How to configure Frequency-Watt (F-W) curve?',
        'troubleshooting', 19, TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 18
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380118', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380018',
        'Victron MultiPlus-II ESS Grid-Parallel vs Off-Grid Critical Load Wiring',
        'Planning a 48V Victron ESS setup. Should my main house subpanel be connected to AC-in grid parallel or AC-out-1 critical load output?',
        'tips', 50, TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 19
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380119', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380019',
        'GoodWe GW5000D-NS Error Code 31 (Insulation Fault Test)',
        'My GoodWe inverter fails morning self-check with Error 31. How to use a megohmmeter (insulation resistance tester) to find the damaged DC cable segment?',
        'troubleshooting', 25, TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 20
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380120', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020',
        'Hoymiles HMS-2000 Microinverter DTU-Pro-S Sub-1G Wireless Range Drop',
        'DTU-Pro-S monitoring gateway loses connection to 2 out of 4 HMS-2000 microinverters on my roof. Sub-1GHz signal strength is low. How to improve DTU range?',
        'troubleshooting', 16, TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 21
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380121', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380021',
        'APsystems DS3-H Microinverter with 550W+ High Power PV Panels Compatibility',
        'Can I pair APsystems DS3-H (960VA output, 20A max input) with Trina Vertex 550W panels that have an Imp of 17.5A and Isc of 18.5A without overcurrent damage?',
        'hardware', 31, TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 22
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380122', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380022',
        'Qcells Q.PEAK DUO PERC vs Maxeon 6 IBC Interdigitated Back Contact Real Yield',
        'Is the Maxeon 6 IBC panel worth a 40% price premium over Qcells Q.PEAK DUO in hot humid climates? What is the actual temperature coefficient advantage?',
        'hardware', 42, TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 23
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380123', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380023',
        'Meyer Burger Heterojunction (HJT) High Voc Voltage String Sizing Calculation',
        'Meyer Burger 390W HJT panels have Voc of 44.2V at STC. How many panels can I safely wire in series on a 600V Max Vdc inverter at -10°C ambient temp?',
        'tips', 33, TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 24
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380124', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380024',
        'Trina Vertex S+ N-type Dual Glass POE Encapsulation Degradation Rate',
        'Why does Trina Vertex S+ dual-glass N-type module offer 30-year 87.4% linear power warranty compared to 25-year 84.8% on single-glass EVA modules?',
        'hardware', 29, TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 25
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380125', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380025',
        'Jinko Tiger Neo TOPCon N-type Bifacial Gain Real World Generation Boost',
        'Installed Jinko Tiger Neo N-type bifacial panels over a white TPO roof membrane. What percentage bifacial gain should I realistically expect in annual kWh?',
        'tips', 48, TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 26
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380126', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380026',
        'REC Alpha Pure-R 80-cell Gapless Layout Low Startup Voltage Advantage',
        'REC Alpha Pure-R panels have Voc of ~50V. How does this high panel voltage benefit short strings (6-8 panels) on string inverters with 120V startup voltage?',
        'hardware', 26, TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 27
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380127', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380027',
        'SolarEdge Home Battery 400V High Voltage DC-Coupled Round-Trip Efficiency',
        'How does 400V DC-coupled SolarEdge Home Battery achieve ~94.5% round-trip efficiency compared to 48V low-voltage AC-coupled storage systems (~85%)?',
        'hardware', 37, TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 28
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380128', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380028',
        'Enphase IQ Battery 5P Wired CAN Bus Communication Resistor Termination',
        'Installing dual Enphase IQ Battery 5P units. Why does Enlighten setup report "Control Comms Lost" if the 120Ω termination resistor is missing on System Controller 3?',
        'troubleshooting', 20, TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 29
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380129', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380029',
        'Microtek Solar Inverter Low Frequency Toroidal Transformer Audible Buzzing',
        'My 3kVA Microtek solar off-grid inverter emits a loud 50Hz mechanical hum when charging batteries from AC grid. Is this normal DC offset transformer noise?',
        'troubleshooting', 18, TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 30
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380130', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380030',
        'Luminous Solar Hybrid UPS Flooded vs GEL Battery Equalization Voltage',
        'What boost voltage and absorption duration should I program on my Luminous solar hybrid inverter for 150Ah flooded tubular lead-acid batteries?',
        'tips', 24, TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 31
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380131', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380031',
        'Schneider Conext SW 4024 Dual Inverter Stacking Synchronization Setup',
        'Stacking two Schneider Conext SW 4024 inverters for 120/240V split-phase output. How to configure Xanbus Master/Slave sync in System Control Panel?',
        'tips', 35, TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 32
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380132', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380032',
        'Delta M6A Fanless Solar Inverter High Ambient Temperature Thermal Derating',
        'My Delta M6A inverter is mounted on an unshaded south wall. Ambient temp hit 42°C and output dropped from 6kW to 4.2kW. Does mounting a shade canopy prevent derating?',
        'troubleshooting', 23, TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 33
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380133', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380033',
        'First Solar Series 6 Thin-Film CdTe Diffuse Light Performance in Humid Climates',
        'Why do Cadmium Telluride (CdTe) thin-film solar modules harvest relatively more energy than crystalline silicon on overcast, foggy, and humid days?',
        'general', 30, TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 34
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380134', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380034',
        'Hyundai Energy Solutions M6 Shingled Module Hot-Spot Immunity Explanation',
        'How does Hyundai''s shingled cell architecture (connected with electrically conductive adhesive without ribbon wires) prevent hot-spot damage under partial shade?',
        'hardware', 27, TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 35
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380135', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380035',
        'P-type PERC Light and Elevated Temperature Induced Degradation (LeTID) vs N-type',
        'What is the chemical mechanism of LeTID in P-type PERC panels exposed to >60°C roof temps, and why are N-type TOPCon panels immune to Boron-Oxygen LID?',
        'hardware', 40, TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 36
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380136', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380036',
        'Optimal Solar Panel Tilt Angle: Year-Round Total kWh vs Winter Peak Energy',
        'For a system located at 34° N latitude (Los Angeles), should I mount panels at 34° tilt for max annual kWh or 45° tilt to maximize winter heating generation?',
        'tips', 55, TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 37
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380137', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380037',
        'Rotary DC Isolator Switch Terminal Overheating & Arc Prevention',
        'What causes rooftop rotary DC isolator switches to melt or catch fire over time, and why is DC-PV2 utilization category switch rating essential?',
        'troubleshooting', 61, TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 38
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380138', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380038',
        'Intermixing MC4 Connector Brands (Stäubli Original vs Generic Knock-offs)',
        'Why does cross-mating genuine Stäubli MC4 connectors with third-party "MC4 compatible" connectors violate IEC 62852 standards and cause thermal fire risks?',
        'troubleshooting', 68, TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 39
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380139', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380039',
        'Grid Export Limiting Control Response Time Requirements (1-Second Power Ramp)',
        'Utility mandates a 0kW feed-in export limit with a maximum 2-second response time. How to configure Modbus RTU polling rate on smart energy meters?',
        'tips', 33, TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 40
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380140', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380040',
        'Solar Panel Washing Frequency: Rain Self-Cleaning Efficacy vs Soiling Losses',
        'Does rain effectively clean solar panels installed at a 15° tilt angle, or do dust, pollen, and salt mist build-up cause measurable permanent soiling losses?',
        'general', 44, TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 41
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380141', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380041',
        'East-West Solar Array Orientation vs South-Facing for High Self-Consumption',
        'Why are many installers recommending East-West 50/50 split solar array layouts over South-facing in regions with Time-Of-Use (TOU) electricity tariffs?',
        'tips', 52, TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 42
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380142', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380042',
        'Type 2 DC Surge Protective Device (SPD) Wiring Distance from Inverter',
        'Where should DC Surge Protection Devices (SPD) be placed when string cable length between rooftop array and ground inverter exceeds 10 meters (33 feet)?',
        'tips', 37, TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 43
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380143', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380043',
        'Ground Mount Solar Array Equipment Grounding Conductor (EGC) Bonding',
        'What size bare copper wire is required to bond aluminum mounting rails, panel frames, and ground rod driven 2.4 meters into soil per NEC 690.47?',
        'tips', 41, TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 44
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380144', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380044',
        'SolarEdge Optimizer Clipping Indicator in Monitoring Portal (Red Bar)',
        'What does a red clipping bar on an individual optimizer graph in the SolarEdge monitoring portal signify when the panel rating matches the optimizer rating?',
        'troubleshooting', 22, TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 45
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380145', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380045',
        'Enphase IQ8 Sunlight Backup Off-Grid Operation Without Battery Requirements',
        'How does Enphase IQ8 microinverter Sunlight Backup create a microgrid directly from solar during a blackout without any battery connected?',
        'hardware', 49, TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 46
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380146', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380046',
        'SolaX X3 Hybrid 3-Phase Unbalanced Load Output Capacity in Off-Grid Mode',
        'Can SolaX X3-Hybrid 10kW 3-phase inverter supply up to 4kW single phase load on Phase L1 during a grid power outage when Phase L2 and L3 have light loads?',
        'hardware', 28, TRUE, NOW() - INTERVAL '14 days'
    ),
    -- 47
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380147', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380047',
        'Growatt MIN 5000TL-X Error 102 Arc Fault Circuit Interrupter (AFCI) Reset',
        'My Growatt inverter threw Error 102 (AFCI Fault) during a thunderstorm and shut down. Verified no visible arc marks on DC wiring. How to safely clear the fault?',
        'troubleshooting', 19, TRUE, NOW() - INTERVAL '14 days'
    ),
    -- 48
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380148', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380048',
        'Victron Cerbo GX Remote Console Access Setup via Victron Remote Management (VRM)',
        'How to enable Remote Console on Cerbo GX over the internet through VRM portal without opening router port forwarding or setting up a local VPN?',
        'tips', 36, TRUE, NOW() - INTERVAL '14 days'
    ),
    -- 49
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380149', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380049',
        'Fronius Primo GEN24 Plus PV Point Emergency Backup Power Socket Wiring',
        'How to wire the integrated PV Point single-phase 16A 230V emergency socket on Fronius GEN24 Plus without buying an expensive full-home backup automatic switchboard?',
        'tips', 43, TRUE, NOW() - INTERVAL '15 days'
    ),
    -- 50
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380150', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380050',
        'SolarEdge HD-Wave Inverter Weight & Size Advantage vs Traditional Transformerless',
        'Why is a 10kW SolarEdge SE10000H HD-Wave single-phase inverter so lightweight (only 11.9 kg / 26 lbs) compared to conventional string inverters (25+ kg)?',
        'hardware', 33, TRUE, NOW() - INTERVAL '15 days'
    )
ON CONFLICT (id) DO NOTHING;


-- =================================────────────────===========================
-- VERIFIED TECHNICAL RESPONSES FROM PRO INSTALLERS & EXPERT OWNERS (50 REPLIES)
-- =================================────────────────===========================

INSERT INTO public.discussion_comments (discussion_id, user_id, content, is_dummy, created_at)
VALUES
    -- 1
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro Installer AU)
        'For partial morning shade from a single tree, Enphase IQ8 microinverters isolate shaded panels completely without affecting string voltage. SolarEdge optimizers do a great job too, but IQ8s give you no single point of inverter failure.',
        TRUE, NOW() - INTERVAL '1 hour'
    ),
    -- 2
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro Installer SG)
        'A 1.3 DC/AC ratio is industry standard! Solar panels rarely hit 100% STC nameplate due to heat (-0.35%/°C), dust, and sun angle. You gain significantly more kWh during morning, evening, and cloudy hours than you lose in midday 5kW clipping.',
        TRUE, NOW() - INTERVAL '4 hours'
    ),
    -- 3
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', -- Beat Meier (Pro CH)
        'This is a classic wet insulation resistance drop (<1 MΩ). Rain or morning dew seeps into a poorly crimped MC4 connector or nicked DC wire touching the mounting rail. Use an insulation tester (megger) at 500V DC to find the grounded string segment.',
        TRUE, NOW() - INTERVAL '7 hours'
    ),
    -- 4
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380104', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro Installer AU)
        'High grid voltage trip is caused by grid cable impedance. When your inverter pushes 5kW back, local voltage rises by V = I * R. Ask your grid distributor to lower transformer tap voltage, or upgrade your service AC cable from 6mm² to 16mm² to lower cable resistance.',
        TRUE, NOW() - INTERVAL '11 hours'
    ),
    -- 5
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380105', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380041', -- Rashid (Pro Installer AE)
        'PLC communication errors occur when DC string voltage is below 50V or if an optimizer has a loose DC connection. Run "Pairing" in SetApp during bright midday sun. If one optimizer fails to respond, test its DC safety output voltage (should read exactly 1.0V DC when disconnected).',
        TRUE, NOW() - INTERVAL '13 hours'
    ),
    -- 6
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380106', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', -- Hans (DE)
        'PID occurs when high negative potential (-300V to -500V) drives sodium ions into cell glass. You can install an anti-PID night box (like Ilumed or Solaredge PID offset) that applies a positive voltage relative to ground overnight to reverse ion migration.',
        TRUE, NOW() - INTERVAL '17 hours'
    ),
    -- 7
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380107', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', -- Beat Meier (Pro CH)
        'Fronius State 447 indicates AC neutral displacement or phase unbalance exceeding grid code thresholds. Inspect the AC terminal block inside the inverter for loose neutral screws and check grid frequency compliance settings in the Datamanager web interface.',
        TRUE, NOW() - INTERVAL '23 hours'
    ),
    -- 8
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380108', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380015', -- Thabo (ZA)
        'LiFePO4 discharge curves are extremely flat between 20% and 90% SOC. Over time, coulomb counter drift accumulates. To recalibrate BMS SOC, force a full top balance charge up to 100% (3.65V per cell) and hold absorption voltage for 30 minutes at least once every 2 weeks.',
        TRUE, NOW() - INTERVAL '22 hours'
    ),
    -- 9
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380109', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'Standard 60-cell panels have 3 bypass diodes, each protecting a 20-cell sub-string. A bird dropping over a single cell forces its sub-string diode to conduct, cutting 1/3 of the panel''s voltage (~12V). On a short 8-panel string, losing 12V drops total string MPPT voltage below optimal inverter window!',
        TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 10
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380110', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro SG)
        'Your Current Transformer (CT) clamp is orientation-reversed! The arrow printed on the CT clamp MUST point towards the grid utility meter (source), not towards your home load. Reverse the physical clamp direction or swap L/K wiring terminals on the smart meter.',
        TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 11
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008', -- Lucas (BR)
        'The 3-second delay on Growatt SPH is caused by mechanical internal ATS contactor switching. For zero-break seamless UPS backup (<10ms) for computers, install a dedicated external inline Static Transfer Switch (STS) or use Victron MultiPlus series.',
        TRUE, NOW() - INTERVAL '1 day'
    ),
    -- 12
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380112', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'High frequency noise is common with high PWM switching frequency inverters. Ensure the inverter ground terminal is connected directly to earth rod with 6mm² copper conductor, and install a Schaffner AC RFI/EMI line filter between inverter AC output and main distribution board.',
        TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 13
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380113', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro SG)
        'The Huawei FE Dongle blinks red when Modbus RTU RS485 communication with the inverter CPU drops. Re-seat the USB dongle, then connect via local inverter WLAN (SUN2000-App) and update the Smart Dongle firmware to version SPC133 or later.',
        TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 14
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380114', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'Yes! When off-grid and Powerwall 2 battery reaches 95%+ SOC, it increases microgrid AC frequency from 60.0Hz up to 62.5Hz. This forces connected AC solar inverters to activate Frequency-Watt derating and drop solar output so battery is not overcharged.',
        TRUE, NOW() - INTERVAL '2 days'
    ),
    -- 15
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380115', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', -- Hans (DE)
        'SunSpec Rapid Shutdown transmitters send a 200kHz PLC heartbeat signal over the DC cables. If DC homeruns pass through metal conduits alongside AC cables or exceed 150m length, signal attenuation causes Tigo receivers to drop out. Keep DC homeruns isolated in non-metallic conduit.',
        TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 16
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380116', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380015', -- Thabo (ZA)
        'Connect Deye NO (Normally Open) and COM dry contact terminals to the 2-wire auto-start input on Kohler generator controller. In Deye touchscreen menu: Auxiliary Load -> Generator Auto Start -> Set Start SOC to 20% and Off SOC to 90%.',
        TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 17
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380117', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', -- Beat Meier (Pro CH)
        'Per EN50549 / VDE grid rules, inverters must linearly reduce output power when grid frequency exceeds 50.2Hz (or 60.2Hz). In Solis SolisCloud settings under "Grid Parameters", adjust F-W start frequency to 50.5Hz and slope rate to 40% per Hz if permitted by local DNO.',
        TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 18
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380118', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013', -- Jan (NL)
        'Connect critical loads (fridge, lights, Wi-Fi, water pump) to AC-out-1 for zero-break UPS transfer (<20ms). Non-critical loads (EV charger, sauna) should remain grid-parallel on AC-in so they operate when grid is live but do not drain battery during blackout.',
        TRUE, NOW() - INTERVAL '3 days'
    ),
    -- 19
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380119', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'Disconnect string MC4 connectors from inverter DC input. Set your Megger tester to 500V DC. Connect positive probe to DC+ pin and negative probe to ground rail. If reading is <1 MΩ, measure each panel individually until you find the damaged cable insulation.',
        TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 20
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380120', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007', -- Kenji (JP)
        'Hoymiles Sub-1G operates around 868MHz / 915MHz. Keep DTU-Pro-S at least 1 meter away from metal electrical panels, thick concrete walls, or AC wiring conduits. Elevate the DTU antenna vertically for direct line-of-sight to rooftop microinverters.',
        TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 21
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380121', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro SG)
        'Yes, completely safe! APsystems DS3-H has an internal MPPT current limit of 20A per channel. If Trina 550W panel supplies 17.5A Imp, the DS3-H will simply draw up to its rated power without overcurrent damage.',
        TRUE, NOW() - INTERVAL '4 days'
    ),
    -- 22
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380122', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'Maxeon IBC technology has zero front busbars (eliminating micro-cracks and shading) and an industry-leading temperature coefficient of -0.27%/°C vs -0.34%/°C on Qcells. In 40°C heat, Maxeon generates 5-7% more energy annually per rated kWp.',
        TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 23
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380123', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', -- Hans (DE)
        'Meyer Burger HJT cells have Voc of 44.2V at STC. Using temperature coefficient of -0.23%/°C, at -10°C Voc rises to 47.8V per panel. On a 600V Max Vdc string inverter, string size MUST be limited to a maximum of 12 panels (12 * 47.8V = 573.6V < 600V).',
        TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 24
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380124', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro SG)
        'Dual-glass modules with POE (Polyolefin Elastomer) encapsulation completely block water vapor ingress, preventing EVA acid degradation and snail trails. This drops annual degradation to <0.4% compared to 0.55% on single glass EVA panels.',
        TRUE, NOW() - INTERVAL '5 days'
    ),
    -- 25
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380125', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', -- Ken (MY)
        'On white TPO commercial membrane (albedo ~0.75-0.80), expect a realistic 12% to 15% annual kWh generation boost from the rear side. On dark asphalt shingles (albedo 0.15), rear gain is minimal (~2-3%).',
        TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 26
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380126', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', -- Oliver (GB)
        'Because REC Alpha Pure-R produces 50V Voc per panel, a short string of 7 panels reaches 350V string voltage. This puts the inverter string well into its sweet spot MPPT efficiency window (360V-400V) early in the morning!',
        TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 27
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380127', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380043', -- Yossi (IL)
        'High voltage 400V DC batteries match the inverter DC bus voltage directly. Solar DC energy charges battery without double AC conversion (PV DC -> 400V DC Bus -> Battery DC). 48V systems require high current DC-DC buck/boost converters which lose 8-10% energy in heat.',
        TRUE, NOW() - INTERVAL '6 days'
    ),
    -- 28
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380128', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'Enphase IQ 5P uses wired CAN bus for system control. Like NMEA/CAN standards, the CAN line MUST have a 120-ohm termination resistor plugged into the physical CAN port on both the first and last physical node in the chain.',
        TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 29
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380129', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380014', -- Aarav (IN)
        'Low-frequency inverters use heavy copper toroidal transformers. Hum is caused by magnetostriction under heavy load or small DC voltage offset on grid AC line. Mounting the inverter on vibration-isolation rubber dampers eliminates acoustic wall resonance.',
        TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 30
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380130', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380014', -- Aarav (IN)
        'For flooded tubular lead-acid batteries: set Boost/Absorption Charge Voltage to 14.4V (28.8V for 24V system) and Float Voltage to 13.7V (27.4V). Perform monthly equalization charge at 15.0V for 2 hours to prevent stratification.',
        TRUE, NOW() - INTERVAL '7 days'
    ),
    -- 31
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380131', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380041', -- Rashid (AE)
        'Connect both Schneider Conext SW units with Xanbus network cable. In System Control Panel, assign Inverter 1 as "Master (Phase L1)" and Inverter 2 as "Slave (Phase L2 - 180° offset)". Install Xanbus terminators at both ends of network chain.',
        TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 32
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380132', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'Direct sun exposure on a dark inverter chassis can add 15°C to internal temperature! Mounting an aluminum shade canopy 10cm away from inverter fins allows convection airflow while blocking direct solar radiation, eliminating derating.',
        TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 33
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380133', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380050', -- David (US)
        'Cadmium Telluride (CdTe) has a bandgap of 1.44 eV, perfectly matching the shorter wavelength blue and green light spectrum present during overcast, humid, and foggy mornings where silicon panels struggle.',
        TRUE, NOW() - INTERVAL '8 days'
    ),
    -- 34
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380134', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380019', -- Min-jun (KR)
        'Hyundai shingled modules divide cells into 5 parallel sub-strings. When shade covers one cell strip, current bypasses through adjacent parallel shingled cell paths rather than shutting down an entire series sub-string.',
        TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 35
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380135', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', -- Hans (DE)
        'P-type wafers are doped with Boron. Under sunlight, Boron combines with Oxygen impurities forming B-O complexes that trap electrons, causing 1.5-2% Light Induced Degradation (LID). N-type wafers are doped with Phosphorus and contain zero Boron, making LID near 0%.',
        TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 36
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380136', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'For Los Angeles (34° N), set fixed roof tilt at 30°-32° for maximum total annual kWh. If you have electric heating or winter EV charging needs, tilt up to 45° to catch low winter sun angle.',
        TRUE, NOW() - INTERVAL '9 days'
    ),
    -- 37
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380137', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'DC current does not have a zero-crossing like AC. When a rotary DC switch is operated under load, a sustained electric arc forms between contacts. Always use DC-PV2 rated switches (like Kraus & Naimer or Santon) with double-break contacts and torque screw terminals to 2.5 Nm.',
        TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 38
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380138', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'Different MC4 manufacturers use different metal alloy pin dimensions and plastic housing tolerances. Intermixing causes microscopic gap contact resistance. At 15A DC current, a 0.05Ω resistance creates 11W of localized heat, melting plastic connectors over time.',
        TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 39
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380139', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', -- David (Pro SG)
        'Set RS485 Modbus baud rate to 9600 or 19200 bps and set inverter export control reaction time to 500ms. Ensure shielded twisted-pair RS485 cable is grounded at one end to prevent packet re-transmissions.',
        TRUE, NOW() - INTERVAL '10 days'
    ),
    -- 40
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380140', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'Rain cleans light dust on panels tilted >15°. However, in coastal areas (salt mist) or agricultural areas (dust + bird droppings), rain leaves a dirty film. Cleaning twice a year restores 4% to 7% lost energy.',
        TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 41
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380141', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013', -- Jan (NL)
        'East-West systems produce a smooth "camel hump" generation profile starting at 7 AM and lasting until 7 PM, matching household morning coffee and evening cooking power demand, drastically reducing expensive grid imports under TOU rates.',
        TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 42
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380142', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', -- Beat Meier (Pro CH)
        'Per IEC 61643-32, if DC string cable length between array and inverter exceeds 10 meters, install one Type 2 DC SPD near rooftop array exit AND one Type 2 DC SPD at inverter DC input terminals.',
        TRUE, NOW() - INTERVAL '11 days'
    ),
    -- 43
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380143', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380053', -- Brandon (US)
        'Per NEC 690.47, use continuous 8 AWG (or 6 AWG) solid bare copper conductor bonded to stainless steel grounding clips (WEEB) on every panel frame and connected to a 2.4m (8ft) copper-clad ground rod.',
        TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 44
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380144', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380041', -- Rashid (AE)
        'A red bar in SolarEdge portal means the panel''s DC output power exceeded the maximum rated input capacity of that optimizer model (e.g. 420W panel paired with a P401 400W optimizer), causing DC power clipping at the optimizer level.',
        TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 45
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380145', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', -- Sam (US)
        'IQ8 microinverters contain high-speed internal grid-forming ASIC microcontrollers. When grid drops, IQ8s form a local 60Hz AC microgrid in 100 milliseconds. IQ System Controller 2 isolates grid, while Essential Smart Switches automatically shed heavy loads.',
        TRUE, NOW() - INTERVAL '12 days'
    ),
    -- 46
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380146', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', -- Beat Meier (Pro CH)
        'Yes! SolaX X3-Hybrid features independent phase EPS output control. It can supply up to 3.3kW single-phase load on Phase L1 during grid outages even if Phase L2 and L3 loads are 0kW.',
        TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 47
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380147', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008', -- Lucas (BR)
        'Error 102 indicates the AFCI DSP chip detected DC high-frequency electrical noise mimicking an electric arc. Check for loose DC MC4 connectors or DC isolator screws. If wiring is solid, clear error code via ShinePhone app -> Parameter Settings -> Reset AFCI.',
        TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 48
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380148', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013', -- Jan (NL)
        'Log into Victron VRM portal. Go to Settings -> Device List -> Cerbo GX -> Remote Console -> Enable "Remote Console over VRM". Now click "Remote Console" in VRM left sidebar to control your system live without port forwarding.',
        TRUE, NOW() - INTERVAL '13 days'
    ),
    -- 49
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380149', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', -- Hans (DE)
        'Connect an ordinary 16A single-phase wall socket to terminals OP_N and OP_L on the Fronius GEN24 bottom board. When grid fails and solar is generating, PV Point provides up to 3kW 230V power automatically without needing an ATS box.',
        TRUE, NOW() - INTERVAL '14 days'
    ),
    -- 50
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380150', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', -- Shane (Pro AU)
        'SolarEdge HD-Wave replaces traditional heavy iron-core transformers and large cooling heatsinks with high-speed silicon MOSFET power synthesis. It uses 16x smaller thin-film capacitors and high-frequency filtering, reducing inverter weight by 60%!',
        TRUE, NOW() - INTERVAL '14 days'
    )
ON CONFLICT DO NOTHING;