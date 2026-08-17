import urllib.parse
import time
from sqlalchemy import create_engine, text
import pandas as pd
import re

# ==================== 1. 数据库与导入配置 ====================
RAW_PASSWORD = "hkJR&NdG4x93@7^^r!WAsPTrJ6qn^MmB0mCteSp0PyF$Dyx62PG2U@8^Uw9Ek2y^"
encoded_password = urllib.parse.quote_plus(RAW_PASSWORD)

PROJECT_REF = "iqbopbbtknjpzwanqcxb"
REGION = "ap-southeast-1"

# 使用 Session Pooler 端口 5432
DB_URL = f"postgresql://postgres.{PROJECT_REF}:{encoded_password}@aws-0-{REGION}.pooler.supabase.com:5432/postgres"

# 控制参数
BATCH_SIZE = 200          # 每批写入 200 条
SLEEP_SECONDS = 0.5       # 每批休眠 0.5 秒，极其平稳
MAX_IMPORT_THIS_RUN = 0   # 0 表示全自动一口气跑完全部未导入数据

print("正在建立数据库连接...")
engine = create_engine(DB_URL, pool_pre_ping=True)

def slugify(text):
    text = str(text).lower()
    text = re.sub(r'[\W_]+', '-', text)
    return text.strip('-')

# ==================== 2. 读取 CSV 数据 ====================
print("1. 正在读取 CEC Modules.csv 数据...")
df_raw = pd.read_csv('CEC Modules.csv')
data = df_raw.iloc[2:].copy()
data.columns = df_raw.columns

# ==================== 3. 检查数据库现有状态（增量防重核心） ====================
print("2. 正在检查 Supabase 现有数据，准备增量比对...")
with engine.connect() as conn:
    # 1. 自动同步新品牌（如有新品牌自动录入，默认 tier_rating 为 NULL）
    unique_brands = data['Manufacturer'].dropna().str.strip().unique()
    for brand in unique_brands:
        conn.execute(
            text("INSERT INTO brands (name, slug, tier_rating) VALUES (:name, :slug, NULL) ON CONFLICT (name) DO NOTHING;"),
            {"name": brand, "slug": slugify(brand)}
        )
    conn.commit()
    
    # 2. 读取品牌 ID 映射
    res = conn.execute(text("SELECT name, id FROM brands;"))
    brand_map = {row[0]: row[1] for row in res}
    
    # 3. 读取所有已有组件的 slug 集合
    res_slugs = conn.execute(text("SELECT slug FROM solar_panels;"))
    existing_slugs = set(row[0] for row in res_slugs)

print(f"   已加载品牌: {len(brand_map)} 个 | 数据库已存在组件: {len(existing_slugs)} 条")

# ==================== 4. 过滤并组装全新数据 ====================
seen_slugs = set()
pending_records = []

for _, row in data.iterrows():
    mfr = str(row['Manufacturer']).strip()
    name = str(row['Name']).strip()
    
    # 构造唯一 slug
    base_slug = f"{slugify(mfr)}-{slugify(name)}"
    slug = base_slug
    counter = 1
    while slug in seen_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
    seen_slugs.add(slug)
    
    # 防重复核心：如果数据库已有此 slug，直接跳过
    if slug in existing_slugs:
        continue
        
    stc = float(row['STC'])
    area = float(row['A_c']) if pd.notnull(row['A_c']) and float(row['A_c']) > 0 else None
    eff = round(stc / (area * 1000.0) * 100.0, 2) if area else None
    
    width = float(row['Width']) if pd.notnull(row['Width']) else None
    length = float(row['Length']) if pd.notnull(row['Length']) else None
    ns_str = str(row['N_s']).strip()
    ncels_val = int(float(ns_str)) if (pd.notnull(row['N_s']) and ns_str != '' and ns_str != 'nan') else 60

    record = {
        "brand_id": brand_map.get(mfr),
        "brand_name": mfr,
        "model_name": name,
        "slug": slug,
        "technol": str(row['Technology']).strip() if pd.notnull(row['Technology']) else 'Mono-c-Si',
        "ncels": ncels_val,
        "pnom_w": stc,
        "voc_v": round(float(row['V_oc_ref']), 2),
        "isc_a": round(float(row['I_sc_ref']), 2),
        "vmp_v": round(float(row['V_mp_ref']), 2),
        "imp_a": round(float(row['I_mp_ref']), 2),
        "module_efficiency_pct": eff,
        "mu_isc_ma_c": round(float(row['alpha_sc']) * 1000.0, 3),
        "mu_voc_spec_mv_c": round(float(row['beta_oc']) * 1000.0, 2),
        "mu_pnom_spec_pct_c": round(float(row['gamma_pmp']), 3),
        "r_serie_ohm": round(float(row['R_s']), 3) if pd.notnull(row['R_s']) else None,
        "r_shunt_ohm": round(float(row['R_sh_ref']), 2) if pd.notnull(row['R_sh_ref']) else None,
        "is_bifacial": True if str(row['Bifacial']).strip() == '1' else False,
        "width_m": width,
        "length_m": length,
        "weight_kg": None,
        "raw_pan_content": None
    }
    pending_records.append(record)

total_pending = len(pending_records)
if total_pending == 0:
    print("✅ 比对完成：当前 CSV 中没有发现任何新组件，无需导入！")
    exit(0)

if MAX_IMPORT_THIS_RUN > 0 and total_pending > MAX_IMPORT_THIS_RUN:
    pending_records = pending_records[:MAX_IMPORT_THIS_RUN]
    print(f"3. 检测到新增组件: {total_pending} 条，本次限制执行: {MAX_IMPORT_THIS_RUN} 条。")
else:
    print(f"3. 检测到新增组件: {total_pending} 条，准备全量自动写入。")

# ==================== 5. 平稳微批次写入 ====================
df_pending = pd.DataFrame(pending_records)
records_to_process = len(df_pending)

print(f"4. 开始写入（每批 {BATCH_SIZE} 条，间隔 {SLEEP_SECONDS} 秒）...")

for i in range(0, records_to_process, BATCH_SIZE):
    batch = df_pending.iloc[i:i + BATCH_SIZE]
    
    with engine.begin() as conn:
        batch.to_sql('solar_panels', conn, if_exists='append', index=False)
        
    current_count = min(i + BATCH_SIZE, records_to_process)
    print(f"   已写入: [{current_count}/{records_to_process}] 条")
    
    time.sleep(SLEEP_SECONDS)

print("🎉 写入完成！所有新增光伏组件已同步至 Supabase。")