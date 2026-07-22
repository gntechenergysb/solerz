-- =================================────────────────===========================
-- SOLERZ SEPARATE DUMMY DATA SEEDER & CLEANUP UTILITY
-- =================================────────────────===========================

CREATE OR REPLACE FUNCTION public.seed_daily_dummy_data(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    d1 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    d2 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    d3 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    d4 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
    d5 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
    d6 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
    d7 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77';
    d8 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88';
BEGIN
    -- 1. Insert Worldwide Dummy Profiles
    INSERT INTO public.profiles (id, username, display_name, avatar_url, country_code, city_region, system_kwp, panel_brand, inverter_brand, role, is_dummy)
    VALUES
        (d1, 'socal_sam', 'Sam Miller', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'US', 'Los Angeles', 8.50, 'Qcells', 'Enphase', 'consumer', TRUE),
        (d2, 'london_solar', 'Oliver Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'GB', 'London', 4.20, 'REC', 'SolarEdge', 'consumer', TRUE),
        (d3, 'sydney_pv_pro', 'Shane (Sydney PV)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'AU', 'Sydney', 10.00, 'Jinko Solar', 'Fronius', 'installer', TRUE),
        (d4, 'munich_hans', 'Hans Weber', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'DE', 'Munich', 6.00, 'Meyer Burger', 'SMA', 'consumer', TRUE),
        (d5, 'kl_rooftop', 'Ken Tan', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'MY', 'Kuala Lumpur', 5.50, 'LONGi', 'Sungrow', 'consumer', TRUE),
        (d6, 'sg_cleantech', 'David Chen', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'SG', 'Singapore', 7.20, 'Trina Solar', 'Huawei', 'installer', TRUE),
        (d7, 'tokyo_sun', 'Kenji Sato', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'JP', 'Tokyo', 5.00, 'Canadian Solar', 'Deye', 'consumer', TRUE),
        (d8, 'sao_paulo_green', 'Lucas Silva', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'BR', 'São Paulo', 9.20, 'JA Solar', 'Growatt', 'consumer', TRUE)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Dynamic Check-ins for Target Date
    INSERT INTO public.check_ins (user_id, check_in_date, kwh_generated, system_kwp, notes, is_dummy, created_at)
    VALUES
        (d1, target_date, ROUND((8.50 * (5.6 + random() * 1.0))::numeric, 2), 8.50, 'Peak production in Southern California today!', TRUE, target_date + INTERVAL '16 hours'),
        (d3, target_date, ROUND((10.00 * (5.2 + random() * 0.9))::numeric, 2), 10.00, 'Commercial rooftop system in Sydney. Clean power.', TRUE, target_date + INTERVAL '10 hours'),
        (d5, target_date, ROUND((5.50 * (4.5 + random() * 0.8))::numeric, 2), 5.50, 'Clouds in KL afternoon, solid yield overall.', TRUE, target_date + INTERVAL '12 hours'),
        (d8, target_date, ROUND((9.20 * (4.8 + random() * 1.0))::numeric, 2), 9.20, 'Strong solar irradiance in São Paulo.', TRUE, target_date + INTERVAL '14 hours'),
        (d2, target_date, ROUND((4.20 * (4.0 + random() * 1.0))::numeric, 2), 4.20, 'Surprisingly clear sky over London today.', TRUE, target_date + INTERVAL '17 hours'),
        (d6, target_date, ROUND((7.20 * (4.1 + random() * 0.8))::numeric, 2), 7.20, 'String inverters running smoothly.', TRUE, target_date + INTERVAL '11 hours'),
        (d4, target_date, ROUND((6.00 * (3.8 + random() * 0.9))::numeric, 2), 6.00, 'Munich grid connection stable.', TRUE, target_date + INTERVAL '18 hours'),
        (d7, target_date, ROUND((5.00 * (4.2 + random() * 0.7))::numeric, 2), 5.00, 'Tokyo roof producing steadily.', TRUE, target_date + INTERVAL '13 hours')
    ON CONFLICT (user_id, check_in_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute Seeder for Today
SELECT public.seed_daily_dummy_data(CURRENT_DATE);

-- 💡 ONE-CLICK CLEANUP INSTRUCTION (When real users grow):
-- DELETE FROM public.profiles WHERE is_dummy = TRUE;


-- =================================────────────────===========================
-- COMMUNITY DISCUSSION DUMMY SEED DATA
-- =================================────────────────===========================

INSERT INTO public.discussions (id, user_id, title, content, category, upvotes_count, is_dummy, created_at)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Sam (CA)
        'Enphase IQ8 vs SolarEdge Inverter: Which handles partial shading better?',
        'I have a giant oak tree east of my roof. In the morning, 3 out of 16 panels get shaded. Is it worth paying extra for microinverters or should I go with SolarEdge optimizers?',
        'hardware',
        14,
        TRUE,
        NOW() - INTERVAL '3 hours'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', -- Oliver (UK)
        'Yield dropping around 2 PM every sunny afternoon - thermal throttling?',
        'Notice a sudden 20% power drop on bright sunny days around 2 PM in London. Inverter is mounted inside my garage. Could heat be clipping the output?',
        'troubleshooting',
        8,
        TRUE,
        NOW() - INTERVAL '6 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Starter Replies from Installer
INSERT INTO public.discussion_comments (discussion_id, user_id, content, is_dummy, created_at)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Shane (Pro Installer AU)
        'For partial morning shade, Enphase IQ8 microinverters isolated the shaded panels completely without affecting string voltage. SolarEdge optimizers do a great job too, but IQ8s give you no single point of inverter failure.',
        TRUE,
        NOW() - INTERVAL '2 hours'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Shane (Pro Installer AU)
        'Check your garage ambient temperature! Most string inverters start thermal derating above 45°C (113°F). Installing a small external cooling fan near the heat sink usually fixes this completely.',
        TRUE,
        NOW() - INTERVAL '4 hours'
    )
ON CONFLICT DO NOTHING;