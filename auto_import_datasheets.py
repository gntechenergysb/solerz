"""
===================================================================================
SOLERZ ALL-IN-ONE HARDWARE DATASHEET INGESTION & PHYSICS ENGINE
===================================================================================
Supports:
  1. Solar Panels (PV Modules)       -> `solar_panels`
  2. Inverters (String/Hybrid/Micro) -> `inverters`
  3. Battery Systems (BESS/Storage)  -> `batteries`

Usage:
  python auto_import_datasheets.py
  (Interactive menu will guide you to select Category and Target Folder)
===================================================================================
"""

import os
import sys
import re
import json
import uuid
import math
import urllib.request
import fitz # PyMuPDF
from scipy.optimize import least_squares

SUPABASE_URL = 'https://iqbopbbtknjpzwanqcxb.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYm9wYmJ0a25qcHp3YW5xY3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg2ODE2NywiZXhwIjoyMTAyNDQ0MTY3fQ.xPkiQFtpuiEiUt5pxH9Env62lpJR4PUaraaZy33QC8U'

# Global Brand Cache
BRAND_CACHE = {}

def load_brands_from_supabase():
    global BRAND_CACHE
    print("⏳ Loading global brand registry from Solerz database...")
    url = f"{SUPABASE_URL}/rest/v1/brands?select=id,name,slug"
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            brands = json.loads(resp.read().decode())
            for b in brands:
                BRAND_CACHE[b['name'].lower()] = b
                clean_key = re.sub(r'[^a-zA-Z0-9]', '', b['name']).lower()
                BRAND_CACHE[clean_key] = b
            print(f"✓ Loaded {len(brands)} registered brands into local cache.\n")
    except Exception as e:
        print(f"⚠️ Warning: Could not pre-fetch brands list: {e}\n")

def get_or_create_brand(brand_name):
    clean_name = brand_name.strip()
    key = clean_name.lower()
    clean_key = re.sub(r'[^a-zA-Z0-9]', '', clean_name).lower()

    if key in BRAND_CACHE:
        return BRAND_CACHE[key]
    if clean_key in BRAND_CACHE:
        return BRAND_CACHE[clean_key]

    for k, v in BRAND_CACHE.items():
        if k in key or key in k:
            return v

    brand_slug = re.sub(r'[^a-z0-9]+', '-', clean_name.lower()).strip('-')
    new_brand = {
        'id': str(uuid.uuid4()),
        'name': clean_name,
        'slug': brand_slug,
        'is_active': True
    }
    url = f"{SUPABASE_URL}/rest/v1/brands"
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    req = urllib.request.Request(url, data=json.dumps([new_brand]).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())[0]
            BRAND_CACHE[key] = data
            return data
    except:
        return new_brand

def detect_brand_from_path_and_text(pdf_path, full_text):
    folder_parent = os.path.basename(os.path.dirname(pdf_path))
    if folder_parent and folder_parent.lower() not in ['module', 'datasheet', 'datasheets', 'pdf', 'inverter', 'battery', 'inverters', 'batteries']:
        return folder_parent

    text_lower = full_text.lower()
    # Solar Panels
    if 'jinko' in text_lower: return 'Jinko Solar Co Ltd'
    if 'longi' in text_lower: return 'LONGi Solar'
    if 'trina' in text_lower: return 'Trina Solar'
    if 'ja solar' in text_lower: return 'JA Solar'
    if 'canadian' in text_lower: return 'Canadian Solar'
    if 'qcells' in text_lower: return 'Qcells North America'
    if 'astronergy' in text_lower or 'chint' in text_lower: return 'Astronergy'
    if 'tongwei' in text_lower or 'tw solar' in text_lower: return 'Tongwei Solar'
    if 'risen' in text_lower: return 'Risen Energy Co Ltd'
    if 'huasun' in text_lower: return 'Huasun Energy'
    if 'aiko' in text_lower: return 'Aiko Solar'
    
    # Inverters
    if 'huawei' in text_lower: return 'Huawei'
    if 'sungrow' in text_lower: return 'Sungrow'
    if 'sma' in text_lower: return 'SMA Solar Technology'
    if 'solaredge' in text_lower: return 'SolarEdge'
    if 'enphase' in text_lower: return 'Enphase Energy'
    if 'growatt' in text_lower: return 'Growatt'
    if 'goodwe' in text_lower: return 'GoodWe'
    if 'deye' in text_lower: return 'Deye'
    if 'fronius' in text_lower: return 'Fronius'
    if 'solis' in text_lower or 'ginlong' in text_lower: return 'Solis'
    if 'sofar' in text_lower: return 'Sofar Solar'
    if 'hoymiles' in text_lower: return 'Hoymiles'
    if 'foxess' in text_lower or 'fox-ess' in text_lower: return 'Fox ESS'
    
    # Batteries
    if 'byd' in text_lower: return 'BYD'
    if 'tesla' in text_lower: return 'Tesla'
    if 'pylontech' in text_lower: return 'Pylontech'
    if 'dyness' in text_lower: return 'Dyness'
    if 'catl' in text_lower: return 'CATL'
    if 'lg energy' in text_lower: return 'LG Energy Solution'
    if 'sonnen' in text_lower: return 'Sonnen'
    if 'generac' in text_lower: return 'Generac'
    if 'enphase' in text_lower and 'iq' in text_lower: return 'Enphase Energy'

    return "Generic Manufacturer"

# ===========================================================================
# 1. SOLAR PANELS PARSER & PHYSICS ENGINE
# ===========================================================================
def solve_sdm_parameters(v_mp, i_mp, v_oc, i_sc, n_s=72, temp_c=25.0):
    k = 1.380649e-23
    q = 1.60217663e-19
    t_k = temp_c + 273.15
    v_th = (k * t_k) / q

    def equations(vars):
        a, R_s, R_sh = vars
        if a <= 0 or R_s < 0 or R_sh <= 0 or R_s >= (v_oc / i_sc):
            return [1e6, 1e6, 1e6]
        try:
            exp_voc = math.exp(min(500.0, v_oc / a))
            exp_isc = math.exp(min(500.0, (i_sc * R_s) / a))
            denom = exp_voc - exp_isc
            if denom <= 0: return [1e6, 1e6, 1e6]
            I_o = (i_sc - (v_oc - i_sc * R_s) / R_sh) / denom
            if I_o <= 0: return [1e6, 1e6, 1e6]
            I_L = I_o * (exp_voc - 1.0) + v_oc / R_sh
            exp_mpp = math.exp(min(500.0, (v_mp + i_mp * R_s) / a))
            I_mp_calc = I_L - I_o * (exp_mpp - 1.0) - (v_mp + i_mp * R_s) / R_sh
            res1 = (I_mp_calc - i_mp) / i_mp
            g_mpp = (I_o / a) * exp_mpp + 1.0 / R_sh
            dI_dV = - g_mpp / (1.0 + R_s * g_mpp)
            res2 = (dI_dV - (- i_mp / v_mp)) / (i_mp / v_mp)
            gamma = a / (n_s * v_th)
            res3 = (gamma - 1.15) * 0.05
            return [res1, res2, res3]
        except:
            return [1e6, 1e6, 1e6]

    a_guess = n_s * 1.15 * v_th
    r_s_guess = max(0.01, 0.4 * (v_oc - v_mp) / i_mp)
    r_sh_guess = 400.0

    res = least_squares(
        equations, [a_guess, r_s_guess, r_sh_guess],
        bounds=([n_s * 0.8 * v_th, 0.0001, 20.0], [n_s * 2.0 * v_th, (v_oc / i_sc) * 0.95, 10000.0]),
        ftol=1e-8, xtol=1e-8, max_nfev=600
    )
    a_fit, r_s_fit, r_sh_fit = res.x
    gamma_fit = a_fit / (n_s * v_th)

    return {
        'gamma': round(float(gamma_fit), 4),
        'r_serie_ohm': round(float(r_s_fit), 4),
        'r_shunt_ohm': round(float(r_sh_fit), 2)
    }

def parse_solar_panel_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    doc = fitz.open(pdf_path)
    full_text = "\n".join([page.get_text() for page in doc])

    brand_name = detect_brand_from_path_and_text(pdf_path, full_text)
    brand_obj = get_or_create_brand(brand_name)

    # Dimensions
    length_m, width_m, depth_m = 2.278, 1.134, 0.030
    dim_match = re.search(r'(\d{3,4})\s*[×x*]\s*(\d{3,4})\s*[×x*]\s*(\d{2,3})\s*mm', full_text, re.IGNORECASE)
    if dim_match:
        length_m = round(float(dim_match.group(1)) / 1000.0, 4)
        width_m = round(float(dim_match.group(2)) / 1000.0, 4)
        depth_m = round(float(dim_match.group(3)) / 1000.0, 4)

    weight_kg = 28.5
    w_match = re.search(r'(\d{1,2}\.?\d*)\s*kg', full_text, re.IGNORECASE)
    if w_match:
        weight_kg = float(w_match.group(1))

    n_cells = 72
    cells_match = re.search(r'(\d{2,3})\s*(?:\([^\)]+\))?', full_text)
    if cells_match:
        try:
            n_cells = int(re.search(r'\d{2,3}', cells_match.group(0)).group(0))
        except:
            n_cells = 72

    cell_type = "Mono-c-Si"
    if "topcon" in full_text.lower() or "n-type" in full_text.lower():
        cell_type = "Mono-c-Si (N-type TOPCon)"
    elif "hjt" in full_text.lower() or "heterojunction" in full_text.lower():
        cell_type = "Heterojunction (HJT)"
    elif "abc" in full_text.lower() or "ibc" in full_text.lower() or "back contact" in full_text.lower():
        cell_type = "All-Back-Contact (ABC/IBC)"
    elif "perc" in full_text.lower():
        cell_type = "Mono-c-Si (PERC)"

    is_bifacial = "bifacial" in full_text.lower() or "dual-glass" in full_text.lower() or "-bdv" in filename.lower() or "-bdx" in filename.lower()

    tc_pmax = -0.29 if "topcon" in cell_type.lower() or "hjt" in cell_type.lower() else -0.35
    tc_voc = -0.25
    tc_isc = 0.045

    pmax_match = re.search(r'[-−](\d+\.\d+)\s*%/°C', full_text)
    if pmax_match:
        tc_pmax = -float(pmax_match.group(1))

    voc_matches = re.findall(r'[-−](\d+\.\d+)\s*%/°C', full_text)
    if len(voc_matches) >= 2:
        tc_voc = -float(voc_matches[1])

    prod_warranty = 15 if ('15year' in full_text.lower() or '15 year' in full_text.lower() or '15-year' in full_text.lower()) else (25 if '25year' in full_text.lower() else 12)

    models = []
    for page in doc:
        tables = page.find_tables()
        for tab in tables:
            df = tab.to_pandas()
            df_str = df.to_string().lower()
            if 'pmax' in df_str and ('vmp' in df_str or 'voc' in df_str):
                pmax_row, vmp_row, imp_row, voc_row, isc_row, eff_row = None, None, None, None, None, None
                for idx, row in df.iterrows():
                    row_txt = " ".join([str(v) for v in row.values]).lower()
                    if 'pmax' in row_txt and 'temperature' not in row_txt and 'bnp' not in row_txt and 'nmot' not in row_txt:
                        pmax_row = row
                    elif 'vmp' in row_txt and 'nmot' not in row_txt and 'noct' not in row_txt:
                        vmp_row = row
                    elif 'imp' in row_txt and 'nmot' not in row_txt and 'noct' not in row_txt:
                        imp_row = row
                    elif 'voc' in row_txt and 'temperature' not in row_txt and 'nmot' not in row_txt and 'noct' not in row_txt:
                        voc_row = row
                    elif 'isc' in row_txt and 'temperature' not in row_txt and 'nmot' not in row_txt and 'noct' not in row_txt:
                        isc_row = row
                    elif 'efficiency' in row_txt or 'eﬃciency' in row_txt:
                        eff_row = row

                if pmax_row is not None and vmp_row is not None:
                    pmax_vals = [float(x) for x in re.findall(r'\b\d{3}\b', str(pmax_row.values[-1])) if 250 <= float(x) <= 850]
                    vmp_vals = [float(x) for x in re.findall(r'\b\d{2}\.\d+\b', str(vmp_row.values[-1]))]
                    imp_vals = [float(x) for x in re.findall(r'\b\d{1,2}\.\d+\b', str(imp_row.values[-1]))] if imp_row is not None else []
                    voc_vals = [float(x) for x in re.findall(r'\b\d{2}\.\d+\b', str(voc_row.values[-1]))] if voc_row is not None else []
                    isc_vals = [float(x) for x in re.findall(r'\b\d{1,2}\.\d+\b', str(isc_row.values[-1]))] if isc_row is not None else []
                    eff_vals = [float(x) for x in re.findall(r'\b\d{2}\.\d+\b', str(eff_row.values[-1]))] if eff_row is not None else []

                    if len(vmp_vals) > len(pmax_vals):
                        vmp_vals = vmp_vals[:len(pmax_vals)]

                    clean_name = filename.replace('-EN.pdf', '').replace('.pdf', '')
                    parts = clean_name.split('-')
                    suffix_parts = [p for p in parts[2:] if not re.match(r'^(F\d+|Z\d+|Z\d+C\d+|EN)$', p, re.IGNORECASE)]
                    series_tag = "-".join(suffix_parts) if suffix_parts else (parts[1] if len(parts) > 1 else clean_name)

                    for i, p_val in enumerate(pmax_vals):
                        vmp = vmp_vals[i] if i < len(vmp_vals) else round(p_val / 14.5, 2)
                        imp = imp_vals[i] if i < len(imp_vals) else round(p_val / vmp, 2)
                        voc = voc_vals[i] if i < len(voc_vals) else round(vmp * 1.18, 2)
                        isc = isc_vals[i] if i < len(isc_vals) else round(imp * 1.05, 2)
                        eff = eff_vals[i] if i < len(eff_vals) else round((p_val / (length_m * width_m * 1000.0)) * 100, 2)

                        brand_prefix = brand_obj['name'].split()[0]
                        model_name = f"{brand_prefix}-{int(p_val)}W-{series_tag}" if not series_tag.startswith(brand_prefix) else f"{series_tag}-{int(p_val)}"
                        if "jinko" in brand_name.lower():
                            model_name = f"JKM{int(p_val)}N-{series_tag}"
                        elif "longi" in brand_name.lower():
                            model_name = f"LR5-{int(p_val)}HBD-{series_tag}" if is_bifacial else f"LR5-{int(p_val)}HPH-{series_tag}"
                        elif "trina" in brand_name.lower():
                            model_name = f"TSM-{int(p_val)}NEG9R-{series_tag}"

                        sdm = solve_sdm_parameters(v_mp=vmp, i_mp=imp, v_oc=voc, i_sc=isc, n_s=n_cells)
                        slug = f"{brand_obj['slug']}-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}"

                        entry = {
                            'id': str(uuid.uuid4()),
                            'brand_id': brand_obj['id'],
                            'brand_name': brand_obj['name'],
                            'model_name': model_name,
                            'slug': slug,
                            'technol': cell_type,
                            'ncels': n_cells,
                            'ncelp': 1,
                            'ndiodes': 3,
                            'pnom_w': float(p_val),
                            'pnom_tol_low_pct': 0.0,
                            'pnom_tol_up_pct': 3.0,
                            'voc_v': float(voc),
                            'isc_a': float(isc),
                            'vmp_v': float(vmp),
                            'imp_a': float(imp),
                            'module_efficiency_pct': float(eff),
                            'is_bifacial': is_bifacial,
                            'bifaciality_factor': 0.85 if is_bifacial else None,
                            'mu_pnom_spec_pct_c': tc_pmax,
                            'mu_voc_spec_mv_c': round(tc_voc * voc * 10, 2),
                            'mu_isc_ma_c': round(tc_isc * isc * 10, 2),
                            'gamma': sdm['gamma'],
                            'r_serie_ohm': sdm['r_serie_ohm'],
                            'r_shunt_ohm': sdm['r_shunt_ohm'],
                            'length_m': length_m,
                            'width_m': width_m,
                            'depth_m': depth_m,
                            'weight_kg': weight_kg,
                            'vmax_iec_v': 1500,
                            'vmax_ul_v': 1500,
                            'certifications': ['IEC61215', 'IEC61730', 'ISO9001', 'ISO14001', 'ISO45001'],
                            'origin_country': 'Global',
                            'warranty_product_years': prod_warranty,
                            'warranty_power_years': 30,
                            'is_active': True
                        }
                        models.append(entry)
                    break
    return models

# ===========================================================================
# 2. INVERTERS PARSER
# ===========================================================================
def parse_inverter_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    doc = fitz.open(pdf_path)
    full_text = "\n".join([page.get_text() for page in doc])

    brand_name = detect_brand_from_path_and_text(pdf_path, full_text)
    brand_obj = get_or_create_brand(brand_name)

    is_hybrid = "hybrid" in full_text.lower() or "storage" in full_text.lower() or "battery" in full_text.lower()
    inverter_type = "Hybrid Inverter" if is_hybrid else ("Microinverter" if "micro" in full_text.lower() else "String Inverter")

    # Max DC Voltage (e.g. 1000V or 1100V or 1500V)
    vdcmax_v = 1100.0
    vdc_match = re.search(r'max(?:imum)?\s*(?:dc)?\s*input\s*voltage\D*(\d{3,4})\s*v', full_text, re.IGNORECASE)
    if vdc_match:
        vdcmax_v = float(vdc_match.group(1))

    # MPPT Range
    mppt_low_v, mppt_high_v = 160.0, 960.0
    mppt_match = re.search(r'mppt\s*(?:voltage)?\s*range\D*(\d{2,3})\s*[-~至vV]+\s*(\d{3,4})\s*v', full_text, re.IGNORECASE)
    if mppt_match:
        mppt_low_v = float(mppt_match.group(1))
        mppt_high_v = float(mppt_match.group(2))

    # Efficiency
    eff_pct = 98.6
    eff_match = re.search(r'max(?:imum)?\s*efficiency\D*(\d{2}\.\d+)\s*%', full_text, re.IGNORECASE)
    if eff_match:
        eff_pct = float(eff_match.group(1))

    # AC Grid Voltage
    vac_v = 400.0 if ("3-phase" in full_text.lower() or "three phase" in full_text.lower() or "380" in full_text or "400" in full_text) else 230.0

    # Max DC Current
    idcmax_a = 32.0
    idc_match = re.search(r'max(?:imum)?\s*(?:input)?\s*current\D*(\d{1,3}(?:\.\d+)?)\s*a', full_text, re.IGNORECASE)
    if idc_match:
        idcmax_a = float(idc_match.group(1))

    models = []
    # Search for model columns with power ratings (e.g. 5K, 6K, 10K, 15K, 25K, 50K, 100K or 5000W, 10000W)
    for page in doc:
        tables = page.find_tables()
        for tab in tables:
            df = tab.to_pandas()
            df_str = df.to_string().lower()
            if 'power' in df_str or 'output' in df_str:
                paco_row = None
                for idx, row in df.iterrows():
                    row_txt = " ".join([str(v) for v in row.values]).lower()
                    if ('rated' in row_txt or 'nominal' in row_txt or 'max' in row_txt) and ('ac power' in row_txt or 'output power' in row_txt or 'power (va)' in row_txt or 'power (w)' in row_txt):
                        paco_row = row
                        break

                if paco_row is not None:
                    # Find powers in W or kW
                    powers_w = []
                    raw_nums = re.findall(r'\b\d+(?:\.\d+)?\b', str(paco_row.values[-1]))
                    for n in raw_nums:
                        val = float(n)
                        if 1.0 <= val <= 350.0: # in kW
                            powers_w.append(val * 1000.0)
                        elif 1000.0 <= val <= 350000.0: # in W
                            powers_w.append(val)

                    clean_name = filename.replace('-EN.pdf', '').replace('.pdf', '')
                    for p_w in powers_w:
                        kw_tag = f"{int(p_w/1000.0)}K" if p_w >= 1000 else f"{int(p_w)}W"
                        model_name = f"{brand_obj['name'].split()[0]}-{clean_name}-{kw_tag}"
                        slug = f"{brand_obj['slug']}-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}"

                        entry = {
                            'id': str(uuid.uuid4()),
                            'brand_id': brand_obj['id'],
                            'brand_name': brand_obj['name'],
                            'model_name': model_name,
                            'slug': slug,
                            'inverter_type': inverter_type,
                            'vac_v': vac_v,
                            'paco_w': float(p_w),
                            'pdco_w': float(p_w * 1.3), # 130% DC oversizing
                            'vdco_v': 600.0 if vac_v == 400.0 else 360.0,
                            'vdcmax_v': vdcmax_v,
                            'idcmax_a': idcmax_a,
                            'mppt_low_v': mppt_low_v,
                            'mppt_high_v': mppt_high_v,
                            'pso_w': round(p_w * 0.01, 1),
                            'pnt_w': 1.0,
                            'efficiency_pct': eff_pct,
                            'is_hybrid': is_hybrid,
                            'c0': 0.0,
                            'c1': 0.0,
                            'c2': 0.0,
                            'c3': 0.0,
                            'is_active': True
                        }
                        models.append(entry)
                    break

    # Fallback if no table row found
    if not models:
        clean_name = filename.replace('-EN.pdf', '').replace('.pdf', '')
        model_name = f"{brand_obj['name'].split()[0]}-{clean_name}"
        slug = f"{brand_obj['slug']}-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}"
        models.append({
            'id': str(uuid.uuid4()),
            'brand_id': brand_obj['id'],
            'brand_name': brand_obj['name'],
            'model_name': model_name,
            'slug': slug,
            'inverter_type': inverter_type,
            'vac_v': vac_v,
            'paco_w': 10000.0,
            'pdco_w': 13000.0,
            'vdco_v': 600.0,
            'vdcmax_v': vdcmax_v,
            'idcmax_a': idcmax_a,
            'mppt_low_v': mppt_low_v,
            'mppt_high_v': mppt_high_v,
            'pso_w': 50.0,
            'pnt_w': 1.0,
            'efficiency_pct': eff_pct,
            'is_hybrid': is_hybrid,
            'is_active': True
        })
    return models

# ===========================================================================
# 3. BATTERY SYSTEMS (BESS) PARSER
# ===========================================================================
def parse_battery_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    doc = fitz.open(pdf_path)
    full_text = "\n".join([page.get_text() for page in doc])

    brand_name = detect_brand_from_path_and_text(pdf_path, full_text)
    brand_obj = get_or_create_brand(brand_name)

    # Battery chemistry
    chem = "Lithium Iron Phosphate (LFP / LiFePO4)" if ("lfp" in full_text.lower() or "lifepo4" in full_text.lower() or "iron phosphate" in full_text.lower()) else "Lithium-ion (NMC)"
    app_type = "Commercial & Industrial (C&I BESS)" if ("commercial" in full_text.lower() or "industrial" in full_text.lower() or "c&i" in full_text.lower() or "container" in full_text.lower()) else "Residential Energy Storage"

    # Capacity
    cap_kwh = 10.0
    cap_match = re.search(r'(?:usable|nominal|energy)?\s*capacity\D*(\d{1,4}(?:\.\d+)?)\s*kwh', full_text, re.IGNORECASE)
    if cap_match:
        cap_kwh = float(cap_match.group(1))

    # Voltage
    volt_v = 51.2
    v_match = re.search(r'nominal\s*voltage\D*(\d{2,4}(?:\.\d+)?)\s*v', full_text, re.IGNORECASE)
    if v_match:
        volt_v = float(v_match.group(1))

    # Power
    power_kw = round(cap_kwh * 0.5, 2)
    p_match = re.search(r'(?:max|rated|continuous)?\s*(?:output|charge|discharge)?\s*power\D*(\d{1,3}(?:\.\d+)?)\s*kw', full_text, re.IGNORECASE)
    if p_match:
        power_kw = float(p_match.group(1))

    # Weight
    weight_kg = 85.0
    w_match = re.search(r'(\d{2,4}(?:\.\d+)?)\s*kg', full_text, re.IGNORECASE)
    if w_match:
        weight_kg = float(w_match.group(1))

    # IP Rating
    ip_rating = "IP65"
    if "ip66" in full_text.lower(): ip_rating = "IP66"
    elif "ip55" in full_text.lower(): ip_rating = "IP55"
    elif "ip20" in full_text.lower(): ip_rating = "IP20"

    # Warranty
    warranty_years = 10
    if "15 year" in full_text.lower(): warranty_years = 15

    # Cycle life
    cycles = 6000
    cycle_match = re.search(r'(\d{4,5})\s*cycles', full_text, re.IGNORECASE)
    if cycle_match:
        cycles = int(cycle_match.group(1))

    models = []
    clean_name = filename.replace('-EN.pdf', '').replace('.pdf', '')
    model_name = f"{brand_obj['name'].split()[0]} {clean_name}"
    slug = f"{brand_obj['slug']}-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}"

    entry = {
        'id': str(uuid.uuid4()),
        'brand_id': brand_obj['id'],
        'brand_name': brand_obj['name'],
        'model_name': model_name,
        'slug': slug,
        'battery_type': chem,
        'application_type': app_type,
        'usable_capacity_kwh': round(cap_kwh * 0.95, 2),
        'nominal_capacity_kwh': cap_kwh,
        'continuous_power_kw': power_kw,
        'peak_power_kw': round(power_kw * 1.25, 2),
        'nominal_voltage_v': volt_v,
        'operating_voltage_min_v': round(volt_v * 0.85, 1),
        'operating_voltage_max_v': round(volt_v * 1.15, 1),
        'max_continuous_current_a': round(power_kw * 1000.0 / volt_v, 1) if volt_v > 0 else 50.0,
        'coupling_type': 'DC-Coupled / AC-Coupled (Hybrid)',
        'round_trip_efficiency_pct': 95.5,
        'depth_of_discharge_pct': 90.0,
        'cycle_life_count': cycles,
        'warranty_years': warranty_years,
        'warranty_energy_throughput_mwh': round(cap_kwh * cycles * 0.9 / 1000.0, 1),
        'max_parallel_units': 8,
        'ip_rating': ip_rating,
        'operating_temp_min_c': -20.0,
        'operating_temp_max_c': 55.0,
        'weight_kg': weight_kg,
        'dimensions_mm': '650 x 500 x 200 mm',
        'certifications': ['UN38.3', 'IEC62619', 'UL1973', 'CE'],
        'is_active': True
    }
    models.append(entry)
    return models

# ===========================================================================
# DATABASE SYNC
# ===========================================================================
def sync_to_supabase(table_name, models):
    if not models:
        print("ℹ️ No models found to upload.")
        return

    print(f"\n🚀 Synchronizing {len(models)} models with Supabase `{table_name}` table...")
    upload_url = f"{SUPABASE_URL}/rest/v1/{table_name}?on_conflict=slug"
    upload_headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
    }

    success_count = 0
    batch_size = 20
    for i in range(0, len(models), batch_size):
        batch = models[i:i+batch_size]
        req = urllib.request.Request(upload_url, data=json.dumps(batch).encode('utf-8'), headers=upload_headers, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                success_count += len(batch)
                print(f"  ✓ Batch {i//batch_size + 1}/{(len(models)-1)//batch_size + 1} ({len(batch)} items) synced! (HTTP {resp.status})")
        except Exception as e:
            print(f"  ✗ Upload batch error: {e}")

    print(f"\n==========================================================================")
    print(f"🎉 COMPLETED: Successfully processed and synchronized {success_count} models into `{table_name}`!")
    print(f"==========================================================================\n")

# ===========================================================================
# INTERACTIVE CLI INTERFACE
# ===========================================================================
def main():
    print("\n" + "=" * 74)
    print(" ☀️  SOLERZ ALL-IN-ONE HARDWARE DATASHEET INGESTION & SIMULATION ENGINE  ⚡")
    print("=" * 74)
    print(" Please select the hardware product category to ingest:")
    print("   [1] ☀️  Solar Panels (光伏组件 / PV Modules)")
    print("   [2] ⚡  Inverters (光伏逆变器 / String, Hybrid & Micro Inverters)")
    print("   [3] 🔋  Battery Systems (储能电池系统 / BESS & Residential Batteries)")
    print("   [0] ❌  Exit")
    print("-" * 74)

    choice = input("👉 Enter choice [1/2/3/0]: ").strip()
    if choice in ['0', 'q', 'exit']:
        print("Exiting tool.")
        return

    category_map = {
        '1': ('solar_panels', parse_solar_panel_pdf, 'Solar Panels'),
        '2': ('inverters', parse_inverter_pdf, 'Inverters'),
        '3': ('batteries', parse_battery_pdf, 'Battery Systems')
    }

    if choice not in category_map:
        print("❌ Invalid choice. Please run again and select 1, 2, or 3.")
        return

    table_name, parse_func, cat_name = category_map[choice]

    print(f"\n📁 Selected Category: 【 {cat_name} 】")
    folder_input = input("👉 Please enter or drag-and-drop the target folder path: ").strip()

    # Clean quotes from Windows drag-and-drop (e.g. "E:\datasheet\module" -> E:\datasheet\module)
    clean_folder = folder_input.strip('\'"')

    if not clean_folder or not os.path.exists(clean_folder):
        print(f"❌ Error: Folder path '{clean_folder}' does not exist!")
        return

    print(f"\n==========================================================================")
    print(f"📂 Scanning Directory: {clean_folder}")
    print(f"📦 Target Database Table: `{table_name}`")
    print(f"==========================================================================\n")

    load_brands_from_supabase()

    # Recursively find all PDF files
    pdf_files = []
    for root, dirs, files in os.walk(clean_folder):
        for f in sorted(files):
            if f.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, f))

    print(f"📄 Found {len(pdf_files)} PDF datasheet files across all subfolders.")
    if not pdf_files:
        print("No PDF files found.")
        return

    all_models = []
    seen_slugs = set()

    for idx, fp in enumerate(pdf_files, 1):
        rel_path = os.path.relpath(fp, clean_folder)
        print(f"[{idx:02d}/{len(pdf_files):02d}] 📖 Parsing: {rel_path}")
        try:
            models = parse_func(fp)
            for m in models:
                if m['slug'] not in seen_slugs:
                    seen_slugs.add(m['slug'])
                    all_models.append(m)
                    if choice == '1':
                        print(f"     -> [{m['brand_name']}] {m['model_name']:<30} | {m['pnom_w']:>5.1f}W | Eff: {m['module_efficiency_pct']:>5.2f}% | Vmp: {m['vmp_v']:>5.2f}V | Voc: {m['voc_v']:>5.2f}V")
                    elif choice == '2':
                        print(f"     -> [{m['brand_name']}] {m['model_name']:<30} | {m['paco_w']:>7.1f}W AC | Max DC: {m['vdcmax_v']}V | Eff: {m['efficiency_pct']}%")
                    elif choice == '3':
                        print(f"     -> [{m['brand_name']}] {m['model_name']:<30} | {m['nominal_capacity_kwh']:>5.1f}kWh | Power: {m['continuous_power_kw']:>5.1f}kW | {m['battery_type'][:15]}")
        except Exception as e:
            print(f"     ⚠️ Error parsing {rel_path}: {e}")

    print(f"\n==========================================================================")
    print(f"📊 Extraction Summary: {len(all_models)} unique {cat_name} models extracted.")
    print(f"==========================================================================")

    sync_to_supabase(table_name, all_models)

if __name__ == '__main__':
    main()
