do $$
declare
  v_seller_ids uuid[] := array[
    'PUT_SELLER_UUID_1_HERE'::uuid,
    'PUT_SELLER_UUID_2_HERE'::uuid,
    'PUT_SELLER_UUID_3_HERE'::uuid
  ];
  v_count int := 30;          -- how many listings
  v_hidden_every int := 0;    -- e.g. 10 => every 10th listing is hidden; 0 => none
  v_sold_every int := 0;      -- e.g. 8 => every 8th listing is sold; 0 => none
begin
  if v_seller_ids is null or array_length(v_seller_ids, 1) is null then
    raise exception 'v_seller_ids is null/empty';
  end if;

  insert into public.listings (
    seller_id,
    title,
    category,
    brand,
    condition,
    specs,
    price_rm,
    location_state,
    images_url,
    is_sold,
    is_hidden
  )
  with
  sellers as (
    select unnest(v_seller_ids) as seller_id
  ),
  gs as (
    select generate_series(1, v_count) as i
  ),
  base as (
    select
      s.seller_id,
      i,
      random() as r,
      (array['Selangor','Johor','Penang','Perak','Kuala Lumpur','Sarawak','Sabah'])[1 + floor(random()*7)::int] as location_state,
      (1 + floor(random()*1000)::int) as img_seed
    from sellers s
    cross join gs
  ),
  derived as (
    select
      b.*,

      case
        when b.r < 0.20 then 'Panels'
        when b.r < 0.40 then 'Inverters'
        when b.r < 0.60 then 'Batteries'
        when b.r < 0.70 then 'Cable'
        when b.r < 0.90 then 'Protective'
        else 'Miscellaneous'
      end as category,

      case
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Panels' then (array['JA Solar','Jinko','Trina','LONGi'])[1 + floor(random()*4)::int]
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Inverters' then (array['Huawei','Sungrow','Growatt','SMA','GoodWe'])[1 + floor(random()*5)::int]
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Batteries' then (array['BYD','Pylontech','Dyness','Generic'])[1 + floor(random()*4)::int]
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Cable' then (array['Prysmian','Nexans','LS Cable','Helukabel','Generic'])[1 + floor(random()*5)::int]
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Protective' then (array['Schneider','ABB','Eaton','Siemens','Hager','Generic'])[1 + floor(random()*6)::int]
        else (array['Generic','Unbranded','Other'])[1 + floor(random()*3)::int]
      end as brand,

      case
        when (case
          when b.r < 0.20 then 'Panels'
          when b.r < 0.40 then 'Inverters'
          when b.r < 0.60 then 'Batteries'
          when b.r < 0.70 then 'Cable'
          when b.r < 0.90 then 'Protective'
          else 'Miscellaneous'
        end) = 'Panels' then (array['New','Used','Refurbished'])[1 + floor(random()*3)::int]
        else (array['New','Used','Refurbished'])[1 + floor(random()*3)::int]
      end as cond,

      -- Panels fields
      (array[410,450,455,500,535,550,580])[1 + floor(random()*7)::int] as p_wattage,
      (array[
        'Mono',
        'Poly',
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
      ])[1 + floor(random()*16)::int] as p_cell_type,
      round(((array[18.5,19.2,20.1,20.7,21.2,21.6,22.1])[1 + floor(random()*7)::int] + (random()*0.2))::numeric, 2) as p_efficiency,

      -- Inverter fields
      (array['Single','Three'])[1 + floor(random()*2)::int] as inv_phase,
      (array['String','Micro','Microinverter','Hybrid','Off-Grid','Grid-Tied','Central'])[1 + floor(random()*7)::int] as inv_type,
      (array[3,5,8,10,12,20])[1 + floor(random()*6)::int] as inv_rated_kw,
      round((( (array[3,5,8,10,12,20])[1 + floor(random()*6)::int] ) * (array[1.0,1.1,1.2])[1 + floor(random()*3)::int])::numeric, 1) as inv_max_kw,

      -- Battery fields
      (array[4000,6000,8000])[1 + floor(random()*3)::int] as bat_cycle_life,
      (array[5,10,15,20])[1 + floor(random()*4)::int] as bat_capacity_kwh,
      (array[48,51.2])[1 + floor(random()*2)::int] as bat_nominal_voltage,
      (array['Rack-mounted','Wall-mounted','Portable','Container','Floor-standing','All-in-one'])[1 + floor(random()*6)::int] as bat_type,
      (array['LiFePO4','NMC','LTO','Lead-Acid','AGM','Gel','Sodium-Ion','Flow','Other'])[1 + floor(random()*9)::int] as bat_tech,

      -- Cable fields
      (array['DC','AC'])[1 + floor(random()*2)::int] as cab_current_type,
      (array['PV1-F','H1Z2Z2-K','USE-2','PV Wire','THHN','H05VV-F','N2XH','Battery Cable','MV Cable','RHW-2','THWN-2'])[1 + floor(random()*11)::int] as cab_type,
      (array['600V','1000V','1500V','1800V','2000V','0.6/1kV','450/750V','1.8/3kV','6.35/11kV','19/33kV'])[1 + floor(random()*10)::int] as cab_voltage,
      (array['XLPE','XLPO','PVC','Halogen-Free','LSHF'])[1 + floor(random()*5)::int] as cab_insulation,
      (array[2.5,4,6,10,16,25,35,50])[1 + floor(random()*8)::int] as cab_size_mm2,
      (array[1,2,3,4,5])[1 + floor(random()*5)::int] as cab_cores,
      (array[10,25,50,100,200])[1 + floor(random()*5)::int] as cab_length_m,
      (array['Copper','Tinned Copper','Aluminum','Tinned Copper-Clad Aluminum (TCCA)','Aluminum Alloy'])[1 + floor(random()*5)::int] as cab_conductor,

      -- Protective fields
      (array['Fuse','Breaker','SPD','Isolator','Other'])[1 + floor(random()*5)::int] as prot_device_type,
      (array[10,16,20,25,32,40,50,63,80,100])[1 + floor(random()*10)::int] as prot_rated_current_a,
      (array[230,400,500,600,800,1000])[1 + floor(random()*6)::int] as prot_rated_voltage_v,
      (array[1,2,3,4])[1 + floor(random()*4)::int] as prot_poles
    from base b
  )
  select
    seller_id,

    left(
      case
        when category = 'Panels' then
          brand || ' ' || p_wattage::text || 'W ' || p_cell_type || ' Panel (' ||
          cond || ')'
        when category = 'Inverters' then
          brand || ' ' || inv_rated_kw::text || 'kW ' || inv_type || ' ' || inv_phase || ' Phase Inverter (' ||
          cond || ')'
        when category = 'Batteries' then
          brand || ' ' || bat_capacity_kwh::text || 'kWh ' || bat_type || ' ' || bat_tech || ' Battery (' ||
          cond || ')'
        when category = 'Cable' then
          brand || ' ' || cab_type || ' ' || cab_voltage || ' ' || cab_size_mm2::text || 'mm² ' || cab_cores::text || 'C Cable (' || cab_length_m::text || 'm)'
        when category = 'Protective' then
          brand || ' ' || prot_device_type || ' ' || prot_rated_current_a::text || 'A ' || prot_rated_voltage_v::text || 'V (' || prot_poles::text || 'P)'
        else
          brand || ' Miscellaneous Item (' || cond || ')'
      end
    , 80) as title,

    category,
    brand,
    cond as condition,

    case
      when category = 'Panels' then
        jsonb_build_object(
          'wattage', p_wattage,
          'cell_type', p_cell_type,
          'efficiency', p_efficiency,
          'dimensions', case when p_wattage >= 500 then '2279x1134x35' else '1722x1134x30' end,
          'model', (array['JAM72S30','Tiger Pro','Vertex','Hi-MO 5','M10'])[1 + floor(random()*5)::int],
          'voc_v', round((case when p_wattage >= 500 then 49.6 else (41.2 + random()*2) end)::numeric, 2),
          'isc_a', round((case when p_wattage >= 500 then 13.9 else (10.8 + random()*1.8) end)::numeric, 2),
          'vmp_v', round((case when p_wattage >= 500 then 49.6 else (41.2 + random()*2) end * 0.82)::numeric, 2),
          'imp_a', round(((p_wattage / (case when p_wattage >= 500 then 49.6 else (41.2 + random()*2) end * 0.82)) * (0.98 + random()*0.04))::numeric, 2),
          'max_system_voltage_v', (array[1000,1500])[1 + floor(random()*2)::int],
          'max_fuse_rating_a', (array[20,25,30])[1 + floor(random()*3)::int],
          'temp_coeff_pmax_pct_per_c', round((-(0.29 + random()*0.08))::numeric, 3),
          'temp_coeff_voc_pct_per_c', round((-(0.25 + random()*0.1))::numeric, 3),
          'temp_coeff_isc_pct_per_c', round(((0.03 + random()*0.03))::numeric, 3),
          'weight_kg', round((case when p_wattage >= 500 then 27.5 else (22.5 + random()*4) end)::numeric, 1),
          'warranty_years', (array[10,12,15])[1 + floor(random()*3)::int]
        )
      when category = 'Inverters' then
        jsonb_build_object(
          'inverter_type', inv_type,
          'phase', inv_phase,
          'rated_ac_power_kw', inv_rated_kw,
          'max_ac_power_kw', inv_max_kw,
          'max_input_voltage', (array[600,1000,1100])[1 + floor(random()*3)::int],
          'efficiency', (array[97.6,98.1,98.4,98.6])[1 + floor(random()*4)::int],
          'warranty_years', (array[5,10,12])[1 + floor(random()*3)::int]
        )
      when category = 'Batteries' then
        jsonb_build_object(
          'cycle_life', bat_cycle_life,
          'capacity_kwh', bat_capacity_kwh,
          'nominal_voltage', bat_nominal_voltage,
          'battery_type', bat_type,
          'technology', bat_tech
        )
      when category = 'Cable' then
        jsonb_build_object(
          'current_type', cab_current_type,
          'cable_type', cab_type,
          'voltage_rating', cab_voltage,
          'insulation', cab_insulation,
          'size_mm2', cab_size_mm2,
          'cores', cab_cores,
          'length_m', cab_length_m,
          'conductor', cab_conductor
        )
      when category = 'Protective' then
        jsonb_build_object(
          'device_type', prot_device_type,
          'rated_current_a', prot_rated_current_a,
          'rated_voltage_v', prot_rated_voltage_v,
          'poles', prot_poles
        )
      else
        '{}'::jsonb
    end as specs,

    round(
      (
        case
          when category = 'Panels' then (p_wattage * (array[0.55,0.62,0.70,0.85])[1 + floor(random()*4)::int])
          when category = 'Inverters' then (array[1800,2200,3500,4800,6500])[1 + floor(random()*5)::int]
          when category = 'Batteries' then (array[3500,5200,7500,9800])[1 + floor(random()*4)::int]
          when category = 'Cable' then (cab_size_mm2 * cab_length_m * (array[0.6,0.8,1.1])[1 + floor(random()*3)::int])
          when category = 'Protective' then (prot_rated_current_a * (array[12,16,20])[1 + floor(random()*3)::int])
          else (array[120,250,480,850])[1 + floor(random()*4)::int]
        end
        * (0.9 + random()*0.25)
      )::numeric
    , 2) as price_rm,

    location_state,

    array[
      case
        when category = 'Panels' then format('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&lock=%s', img_seed)
        when category = 'Inverters' then format('https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&h=600&fit=crop&lock=%s', img_seed)
        when category = 'Batteries' then format('https://images.unsplash.com/photo-1617783756017-38d7c1b32402?w=800&h=600&fit=crop&lock=%s', img_seed)
        when category = 'Cable' then format('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&lock=%s', img_seed)
        when category = 'Protective' then format('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&lock=%s', img_seed)
        else format('https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop&lock=%s', img_seed)
      end
    ]::text[] as images_url,

    case when v_sold_every > 0 and (i % v_sold_every = 0) then true else false end as is_sold,
    case when v_hidden_every > 0 and (i % v_hidden_every = 0) then true else false end as is_hidden

  from derived;
end $$;
