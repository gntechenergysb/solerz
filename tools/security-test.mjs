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
const anon = env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const PASSWORD = process.env.SOLERZ_TEST_PASSWORD;
if (!PASSWORD) {
  console.error('Set SOLERZ_TEST_PASSWORD in environment before running this script.');
  process.exit(1);
}

const ACCOUNTS = {
  buyer: 'buyer@solerz.com',
  seller: 'seller@solerz.com',
  admin: 'admin@solerz.com'
};

function client() {
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function signIn(email) {
  const sb = client();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Missing user id after login');
  return { sb, userId };
}

async function getMyProfile(sb, userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) return { error };
  return { data };
}

async function run() {
  const results = [];

  const buyer = await signIn(ACCOUNTS.buyer);
  const seller = await signIn(ACCOUNTS.seller);
  const admin = await signIn(ACCOUNTS.admin);

  // 0) Read own profile
  for (const [name, ctx] of Object.entries({ buyer, seller, admin })) {
    const p = await getMyProfile(ctx.sb, ctx.userId);
    results.push({ test: 'profile:read:self', actor: name, pass: !!p.data && !p.error, detail: p.error?.message || (p.data?.role ?? 'ok') });
  }

  // 0b) profiles_public: ensure no sensitive fields are exposed
  {
    const pub = await buyer.sb.from('profiles_public').select('*').limit(1);
    if (pub.error) {
      results.push({ test: 'profiles_public:read', actor: 'buyer', pass: false, detail: pub.error.message });
    } else {
      const row = Array.isArray(pub.data) && pub.data.length ? pub.data[0] : null;
      const keys = row ? Object.keys(row) : [];
      const sensitiveKeys = [
        'email',
        'handphone_no',
        'business_address',
        'incorporation_date',
        'nature_of_business',
        'ssm_no',
        'ssm_new_no',
        'ssm_old_no',
        'ssm_file_path',
        'role',
        'tier'
      ];
      const leaked = sensitiveKeys.filter((k) => keys.includes(k));
      results.push({
        test: 'profiles_public:no_sensitive_fields',
        actor: 'buyer',
        pass: leaked.length === 0,
        detail: leaked.length ? `leaked=${leaked.join(',')}` : `keys=${keys.join(',')}`
      });
    }
  }

  // 0bb) anon read surface
  {
    const anonClient = client();
    const anonProfiles = await anonClient.from('profiles').select('id').limit(1);
    const anonProfilesBlocked = !!anonProfiles.error || (Array.isArray(anonProfiles.data) && anonProfiles.data.length === 0);
    results.push({
      test: 'profiles:anon_read:block',
      actor: 'anon',
      pass: anonProfilesBlocked,
      detail: anonProfiles.error?.message || JSON.stringify(anonProfiles.data)
    });

    const anonPublic = await anonClient.from('profiles_public').select('id').limit(1);
    results.push({
      test: 'profiles_public:anon_read:allowed',
      actor: 'anon',
      pass: !anonPublic.error,
      detail: anonPublic.error?.message || 'ok'
    });
  }

  // 0c) Profiles / profiles_public RLS brute force
  {
    const crossRead = await buyer.sb
      .from('profiles')
      .select('id')
      .eq('id', seller.userId)
      .maybeSingle();
    const crossReadBlocked = !!crossRead.error || !crossRead.data;
    results.push({
      test: 'profiles:cross_read:block',
      actor: 'buyer',
      pass: crossReadBlocked,
      detail: crossRead.error?.message || JSON.stringify(crossRead.data)
    });

    const sellerBefore = await getMyProfile(seller.sb, seller.userId);
    const beforeName = sellerBefore.data?.company_name;

    const crossUpdate = await buyer.sb
      .from('profiles')
      .update({ company_name: 'HACKED_BY_BUYER' })
      .eq('id', seller.userId)
      .select('id');

    const sellerAfter = await getMyProfile(seller.sb, seller.userId);
    const afterName = sellerAfter.data?.company_name;

    const crossUpdateBlocked = !!crossUpdate.error || (Array.isArray(crossUpdate.data) && crossUpdate.data.length === 0) || beforeName === afterName;
    results.push({
      test: 'profiles:cross_update:block',
      actor: 'buyer',
      pass: crossUpdateBlocked,
      detail: crossUpdate.error?.message || JSON.stringify({ before: beforeName, after: afterName, data: crossUpdate.data })
    });

    const pubWrite = await buyer.sb
      .from('profiles_public')
      .update({ company_name: 'HACKED_PUBLIC' })
      .eq('id', seller.userId)
      .select('id');
    const pubWriteBlocked = !!pubWrite.error || (Array.isArray(pubWrite.data) && pubWrite.data.length === 0);
    results.push({
      test: 'profiles_public:write:block',
      actor: 'buyer',
      pass: pubWriteBlocked,
      detail: pubWrite.error?.message || JSON.stringify(pubWrite.data)
    });
  }

  // 1) Attempt privilege escalation: seller tries to update protected fields
  {
    const before = await getMyProfile(seller.sb, seller.userId);
    const beforeRole = before.data?.role;
    const beforeVerified = before.data?.is_verified;

    await seller.sb.from('profiles').update({ role: 'ADMIN', is_verified: true }).eq('id', seller.userId);
    const after = await getMyProfile(seller.sb, seller.userId);
    const afterRole = after.data?.role;
    const afterVerified = after.data?.is_verified;

    const pass = beforeRole === afterRole && beforeVerified === afterVerified;
    results.push({
      test: 'profile:escalation:block',
      actor: 'seller',
      pass,
      detail: JSON.stringify({ before: { role: beforeRole, verified: beforeVerified }, after: { role: afterRole, verified: afterVerified } })
    });
  }

  // 2) Buyer tries to call admin RPCs
  {
    const r1 = await buyer.sb.rpc('admin_list_profiles', { filter_status: 'ALL' });
    results.push({ test: 'rpc:admin_list_profiles:block', actor: 'buyer', pass: !!r1.error, detail: r1.error?.message || 'unexpected success' });

    const r2 = await buyer.sb.rpc('set_profile_verification', { target_profile_id: seller.userId, verified: true });
    results.push({ test: 'rpc:set_profile_verification:block', actor: 'buyer', pass: !!r2.error, detail: r2.error?.message || 'unexpected success' });
  }

  // 2b) Audit logs: admin action should be recorded; non-admin should not read it
  {
    const adminSet = await admin.sb.rpc('set_profile_verification', { target_profile_id: seller.userId, verified: false });
    results.push({
      test: 'rpc:set_profile_verification:admin_allowed',
      actor: 'admin',
      pass: !adminSet.error,
      detail: adminSet.error?.message || 'ok'
    });

    const adminAudit = await admin.sb
      .from('audit_logs')
      .select('id, actor_id, action, target_id, metadata')
      .eq('action', 'profile.verification.set')
      .eq('target_id', seller.userId)
      .order('created_at', { ascending: false })
      .limit(1);
    const adminAuditPass = !adminAudit.error && Array.isArray(adminAudit.data) && adminAudit.data.length > 0;
    results.push({
      test: 'audit:admin_can_read',
      actor: 'admin',
      pass: adminAuditPass,
      detail: adminAudit.error?.message || JSON.stringify(adminAudit.data)
    });

    const buyerAudit = await buyer.sb
      .from('audit_logs')
      .select('id, actor_id, action, target_id')
      .eq('action', 'profile.verification.set')
      .eq('target_id', seller.userId)
      .limit(1);
    const buyerBlocked = !!buyerAudit.error || (Array.isArray(buyerAudit.data) && buyerAudit.data.length === 0);
    results.push({
      test: 'audit:buyer_cannot_read',
      actor: 'buyer',
      pass: buyerBlocked,
      detail: buyerAudit.error?.message || JSON.stringify(buyerAudit.data)
    });

    const sellerAudit = await seller.sb
      .from('audit_logs')
      .select('id, actor_id, action, target_id')
      .eq('action', 'profile.verification.set')
      .eq('target_id', seller.userId)
      .limit(1);
    const sellerBlocked = !!sellerAudit.error || (Array.isArray(sellerAudit.data) && sellerAudit.data.length === 0);
    results.push({
      test: 'audit:seller_cannot_read',
      actor: 'seller',
      pass: sellerBlocked,
      detail: sellerAudit.error?.message || JSON.stringify(sellerAudit.data)
    });
  }

  // 2bb) Rate limit: set_profile_verification should eventually be throttled
  {
    let rateLimited = false;
    let lastDetail = '';
    for (let i = 0; i < 25; i++) {
      const r = await admin.sb.rpc('set_profile_verification', { target_profile_id: seller.userId, verified: i % 2 === 0 });
      if (r.error) {
        lastDetail = r.error.message;
        if ((r.error.message || '').toLowerCase().includes('rate limit exceeded')) {
          rateLimited = true;
          break;
        }
      }
    }
    results.push({
      test: 'rate_limit:set_profile_verification:enforced',
      actor: 'admin',
      pass: rateLimited,
      detail: lastDetail || 'no rate limit hit'
    });
  }

  // 2c) Rate limit: admin_list_profiles should eventually be throttled
  {
    let rateLimited = false;
    let lastDetail = '';
    for (let i = 0; i < 35; i++) {
      const r = await admin.sb.rpc('admin_list_profiles', { filter_status: 'ALL' });
      if (r.error) {
        lastDetail = r.error.message;
        if ((r.error.message || '').toLowerCase().includes('rate limit exceeded')) {
          rateLimited = true;
          break;
        }
      }
    }
    results.push({
      test: 'rate_limit:admin_list_profiles:enforced',
      actor: 'admin',
      pass: rateLimited,
      detail: lastDetail || 'no rate limit hit'
    });
  }

  // 2d) Audit log write should be admin-only (prevent log spam)
  {
    const buyerWrite = await buyer.sb.rpc('write_audit_log', {
      p_action: 'security.test.spam',
      p_metadata: { from: 'buyer' }
    });
    results.push({
      test: 'rpc:write_audit_log:block',
      actor: 'buyer',
      pass: !!buyerWrite.error,
      detail: buyerWrite.error?.message || 'unexpected success'
    });

    const sellerWrite = await seller.sb.rpc('write_audit_log', {
      p_action: 'security.test.spam',
      p_metadata: { from: 'seller' }
    });
    results.push({
      test: 'rpc:write_audit_log:block',
      actor: 'seller',
      pass: !!sellerWrite.error,
      detail: sellerWrite.error?.message || 'unexpected success'
    });
  }

  // 3) Seller creates a hidden listing; buyer should not see it
  let listingId = null;
  let publicListingId = null;
  let soldListingId = null;
  let activeExpiredListingId = null;
  {
    const crossInsert = await seller.sb.from('listings').insert({
      seller_id: buyer.userId,
      title: 'SECURITY_TEST_CROSS_SELLER_INSERT',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 1.23,
      location_state: 'TEST',
      is_hidden: true,
      images_url: []
    }).select('id').single();

    results.push({
      test: 'listing:insert:cross_seller_id_block',
      actor: 'seller',
      pass: !!crossInsert.error,
      detail: crossInsert.error?.message || 'unexpected success'
    });

    if (!crossInsert.error && crossInsert.data?.id) {
      await seller.sb.from('listings').delete().eq('id', crossInsert.data.id);
    }

    const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const farPast = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const tamperInsert = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_INSERT_TAMPER',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 1.23,
      location_state: 'TEST',
      is_hidden: true,
      images_url: [],
      is_verified_listing: true,
      active_until: farFuture,
      archive_until: farFuture,
      view_count: 99999,
      created_at: farPast
    }).select('id').single();

    if (tamperInsert.error) {
      results.push({ test: 'listing:insert:tamper_create', actor: 'seller', pass: false, detail: tamperInsert.error.message });
    } else {
      const tid = tamperInsert.data.id;

      const sellerNow = await getMyProfile(seller.sb, seller.userId);
      const sellerIsVerifiedNow = !!sellerNow.data?.is_verified;

      const readBack = await seller.sb
        .from('listings')
        .select('is_verified_listing, active_until, archive_until, view_count, created_at')
        .eq('id', tid)
        .maybeSingle();

      const now = Date.now();
      const activeTs = readBack.data?.active_until ? Date.parse(readBack.data.active_until) : NaN;
      const archiveTs = readBack.data?.archive_until ? Date.parse(readBack.data.archive_until) : NaN;
      const createdTs = readBack.data?.created_at ? Date.parse(readBack.data.created_at) : NaN;

      const passIsVerified = readBack.data?.is_verified_listing === sellerIsVerifiedNow;
      const passViewCount = readBack.data?.view_count === 0;
      const passCreatedAtRecent = Number.isFinite(createdTs) && createdTs > (now - 5 * 60 * 1000);
      const passExpiryReasonable =
        Number.isFinite(activeTs) && Number.isFinite(archiveTs) &&
        activeTs < (now + 40 * 24 * 60 * 60 * 1000) &&
        archiveTs < (now + 40 * 24 * 60 * 60 * 1000) &&
        activeTs > (now + 20 * 24 * 60 * 60 * 1000) &&
        archiveTs > (now + 20 * 24 * 60 * 60 * 1000);

      results.push({
        test: 'listing:insert:tamper_sanitized',
        actor: 'seller',
        pass: !readBack.error && passIsVerified && passViewCount && passCreatedAtRecent && passExpiryReasonable,
        detail: readBack.error?.message || JSON.stringify(readBack.data)
      });

      await seller.sb.from('listings').delete().eq('id', tid);
    }

    const insert = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_LISTING',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 1.23,
      location_state: 'TEST',
      is_hidden: true,
      images_url: []
    }).select('id').single();

    if (insert.error) {
      results.push({ test: 'listing:create', actor: 'seller', pass: false, detail: insert.error.message });
    } else {
      listingId = insert.data.id;
      results.push({ test: 'listing:create', actor: 'seller', pass: true, detail: listingId });
    }

    if (listingId) {
      const anonClient = client();
      const anonRead = await anonClient.from('listings').select('id').eq('id', listingId).maybeSingle();
      const anonBlocked = !!anonRead.error || !anonRead.data;
      results.push({
        test: 'listing:hidden:not_visible_to_anon',
        actor: 'anon',
        pass: anonBlocked,
        detail: anonRead.error?.message || (anonRead.data ? 'visible' : 'not visible')
      });

      const sellerRead = await seller.sb.from('listings').select('id').eq('id', listingId).maybeSingle();
      const sellerCanView = !sellerRead.error && !!sellerRead.data;
      results.push({
        test: 'listing:hidden:still_visible_to_seller',
        actor: 'seller',
        pass: sellerCanView,
        detail: sellerRead.error?.message || (sellerRead.data ? 'visible' : 'not visible')
      });
    }

    const pubInsert = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_PUBLIC_LISTING',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 2.34,
      location_state: 'TEST',
      is_hidden: false,
      images_url: []
    }).select('id').single();

    if (pubInsert.error) {
      results.push({ test: 'listing:create_public', actor: 'seller', pass: false, detail: pubInsert.error.message });
    } else {
      publicListingId = pubInsert.data.id;
      results.push({ test: 'listing:create_public', actor: 'seller', pass: true, detail: publicListingId });
    }

    const soldInsert = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_SOLD_LISTING',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 3.45,
      location_state: 'TEST',
      is_hidden: false,
      is_sold: false,
      images_url: []
    }).select('id').single();

    if (soldInsert.error) {
      results.push({ test: 'listing:create_sold_candidate', actor: 'seller', pass: false, detail: soldInsert.error.message });
    } else {
      soldListingId = soldInsert.data.id;
      results.push({ test: 'listing:create_sold_candidate', actor: 'seller', pass: true, detail: soldListingId });
    }

    const activeExpiredInsert = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_ACTIVE_EXPIRED_LISTING',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 4.56,
      location_state: 'TEST',
      is_hidden: false,
      images_url: []
    }).select('id').single();

    if (activeExpiredInsert.error) {
      results.push({ test: 'listing:create_active_expired_candidate', actor: 'seller', pass: false, detail: activeExpiredInsert.error.message });
    } else {
      activeExpiredListingId = activeExpiredInsert.data.id;
      results.push({ test: 'listing:create_active_expired_candidate', actor: 'seller', pass: true, detail: activeExpiredListingId });
    }

    if (listingId) {
      const buyerRead = await buyer.sb.from('listings').select('id').eq('id', listingId).maybeSingle();
      const pass = !!buyerRead.error || !buyerRead.data;
      results.push({ test: 'listing:hidden:not_visible_to_buyer', actor: 'buyer', pass, detail: buyerRead.error?.message || (buyerRead.data ? 'visible' : 'not visible') });
    }
  }

  // 3ab) anon can read active public listing
  if (publicListingId) {
    const anonClient = client();
    const anonRead = await anonClient.from('listings').select('id').eq('id', publicListingId).maybeSingle();
    const pass = !anonRead.error && !!anonRead.data;
    results.push({ test: 'listing:public_visible_to_anon', actor: 'anon', pass, detail: anonRead.error?.message || (anonRead.data ? 'visible' : 'not visible') });
  }

  // 3ac) expired listing should not be visible to anon/buyer, but seller can still view own listing
  if (publicListingId) {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const adminExpire = await admin.sb.rpc('admin_set_listing_times', {
      p_listing_id: publicListingId,
      p_active_until: past,
      p_archive_until: past
    });

    results.push({
      test: 'rpc:admin_set_listing_times:admin_allowed',
      actor: 'admin',
      pass: !adminExpire.error,
      detail: adminExpire.error?.message || 'ok'
    });

    const anonClient = client();
    const anonExpired = await anonClient.from('listings').select('id').eq('id', publicListingId).maybeSingle();
    const anonBlocked = !!anonExpired.error || !anonExpired.data;
    results.push({
      test: 'listing:expired:not_visible_to_anon',
      actor: 'anon',
      pass: anonBlocked,
      detail: anonExpired.error?.message || (anonExpired.data ? 'visible' : 'not visible')
    });

    const buyerExpired = await buyer.sb.from('listings').select('id').eq('id', publicListingId).maybeSingle();
    const buyerBlocked = !!buyerExpired.error || !buyerExpired.data;
    results.push({
      test: 'listing:expired:not_visible_to_buyer',
      actor: 'buyer',
      pass: buyerBlocked,
      detail: buyerExpired.error?.message || (buyerExpired.data ? 'visible' : 'not visible')
    });

    const sellerExpired = await seller.sb.from('listings').select('id').eq('id', publicListingId).maybeSingle();
    const sellerCanView = !sellerExpired.error && !!sellerExpired.data;
    results.push({
      test: 'listing:expired:still_visible_to_seller',
      actor: 'seller',
      pass: sellerCanView,
      detail: sellerExpired.error?.message || (sellerExpired.data ? 'visible' : 'not visible')
    });
  }

  // 3ad) sold listing should not be visible to anon/buyer, but seller can view
  if (soldListingId) {
    const markSold = await seller.sb.from('listings').update({ is_sold: true }).eq('id', soldListingId).select('id').maybeSingle();
    results.push({
      test: 'listing:mark_sold',
      actor: 'seller',
      pass: !markSold.error,
      detail: markSold.error?.message || 'ok'
    });

    const anonClient = client();
    const anonRead = await anonClient.from('listings').select('id').eq('id', soldListingId).maybeSingle();
    const anonBlocked = !!anonRead.error || !anonRead.data;
    results.push({
      test: 'listing:sold:not_visible_to_anon',
      actor: 'anon',
      pass: anonBlocked,
      detail: anonRead.error?.message || (anonRead.data ? 'visible' : 'not visible')
    });

    const buyerRead = await buyer.sb.from('listings').select('id').eq('id', soldListingId).maybeSingle();
    const buyerBlocked = !!buyerRead.error || !buyerRead.data;
    results.push({
      test: 'listing:sold:not_visible_to_buyer',
      actor: 'buyer',
      pass: buyerBlocked,
      detail: buyerRead.error?.message || (buyerRead.data ? 'visible' : 'not visible')
    });

    const sellerRead = await seller.sb.from('listings').select('id').eq('id', soldListingId).maybeSingle();
    const sellerCanView = !sellerRead.error && !!sellerRead.data;
    results.push({
      test: 'listing:sold:still_visible_to_seller',
      actor: 'seller',
      pass: sellerCanView,
      detail: sellerRead.error?.message || (sellerRead.data ? 'visible' : 'not visible')
    });
  }

  // 3ae) if active_until is expired but archive_until is still in future, listing should not be visible to anon/buyer
  if (activeExpiredListingId) {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const adminSet = await admin.sb.rpc('admin_set_listing_times', {
      p_listing_id: activeExpiredListingId,
      p_active_until: past,
      p_archive_until: future
    });
    results.push({
      test: 'rpc:admin_set_listing_times:active_expired_case',
      actor: 'admin',
      pass: !adminSet.error,
      detail: adminSet.error?.message || 'ok'
    });

    const anonClient = client();
    const anonRead = await anonClient.from('listings').select('id').eq('id', activeExpiredListingId).maybeSingle();
    const anonBlocked = !!anonRead.error || !anonRead.data;
    results.push({
      test: 'listing:active_expired:not_visible_to_anon',
      actor: 'anon',
      pass: anonBlocked,
      detail: anonRead.error?.message || (anonRead.data ? 'visible' : 'not visible')
    });

    const buyerRead = await buyer.sb.from('listings').select('id').eq('id', activeExpiredListingId).maybeSingle();
    const buyerBlocked = !!buyerRead.error || !buyerRead.data;
    results.push({
      test: 'listing:active_expired:not_visible_to_buyer',
      actor: 'buyer',
      pass: buyerBlocked,
      detail: buyerRead.error?.message || (buyerRead.data ? 'visible' : 'not visible')
    });

    const sellerRead = await seller.sb.from('listings').select('id').eq('id', activeExpiredListingId).maybeSingle();
    const sellerCanView = !sellerRead.error && !!sellerRead.data;
    results.push({
      test: 'listing:active_expired:still_visible_to_seller',
      actor: 'seller',
      pass: sellerCanView,
      detail: sellerRead.error?.message || (sellerRead.data ? 'visible' : 'not visible')
    });
  }

  // 3af) admin_set_listing_times should be admin-only + rate-limited
  if (publicListingId) {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const buyerTry = await buyer.sb.rpc('admin_set_listing_times', {
      p_listing_id: publicListingId,
      p_active_until: past,
      p_archive_until: past
    });
    results.push({
      test: 'rpc:admin_set_listing_times:block',
      actor: 'buyer',
      pass: !!buyerTry.error,
      detail: buyerTry.error?.message || 'unexpected success'
    });

    const sellerTry = await seller.sb.rpc('admin_set_listing_times', {
      p_listing_id: publicListingId,
      p_active_until: past,
      p_archive_until: past
    });
    results.push({
      test: 'rpc:admin_set_listing_times:block',
      actor: 'seller',
      pass: !!sellerTry.error,
      detail: sellerTry.error?.message || 'unexpected success'
    });

    let rateLimited = false;
    let lastDetail = null;
    for (let i = 0; i < 60; i++) {
      const r = await admin.sb.rpc('admin_set_listing_times', {
        p_listing_id: publicListingId,
        p_active_until: past,
        p_archive_until: past
      });
      if (r.error) {
        lastDetail = r.error.message;
        if ((r.error.message || '').toLowerCase().includes('rate limit')) {
          rateLimited = true;
          break;
        }
      }
    }
    results.push({
      test: 'rate_limit:admin_set_listing_times:enforced',
      actor: 'admin',
      pass: rateLimited,
      detail: lastDetail || 'no rate limit hit'
    });
  }

  // 3aa) renew_listing RPC
  if (listingId) {
    const buyerRenew = await buyer.sb.rpc('renew_listing', { p_listing_id: listingId });
    results.push({
      test: 'rpc:renew_listing:block',
      actor: 'buyer',
      pass: !!buyerRenew.error,
      detail: buyerRenew.error?.message || 'unexpected success'
    });

    const before = await seller.sb
      .from('listings')
      .select('active_until')
      .eq('id', listingId)
      .maybeSingle();

    await new Promise(r => setTimeout(r, 1500));
    const sellerRenew = await seller.sb.rpc('renew_listing', { p_listing_id: listingId });
    results.push({
      test: 'rpc:renew_listing:allowed',
      actor: 'seller',
      pass: !sellerRenew.error,
      detail: sellerRenew.error?.message || 'ok'
    });

    const after = await seller.sb
      .from('listings')
      .select('active_until')
      .eq('id', listingId)
      .maybeSingle();

    const beforeTs = before.data?.active_until ? Date.parse(before.data.active_until) : NaN;
    const afterTs = after.data?.active_until ? Date.parse(after.data.active_until) : NaN;
    const passExtended = Number.isFinite(beforeTs) && Number.isFinite(afterTs) && afterTs > beforeTs;
    results.push({
      test: 'rpc:renew_listing:extends',
      actor: 'seller',
      pass: passExtended,
      detail: JSON.stringify({ before: before.data?.active_until, after: after.data?.active_until })
    });
  }

  // 3b) Seller tries to transfer listing ownership by changing seller_id
  if (listingId) {
    const transfer = await seller.sb
      .from('listings')
      .update({ seller_id: buyer.userId })
      .eq('id', listingId)
      .select('id, seller_id');

    const verifyOwner = await seller.sb.from('listings').select('seller_id').eq('id', listingId).maybeSingle();
    const ownerStillSeller = !!verifyOwner.data && verifyOwner.data.seller_id === seller.userId;

    const transferBlocked = !!transfer.error || ownerStillSeller;
    results.push({
      test: 'listing:ownership_transfer:block',
      actor: 'seller',
      pass: transferBlocked,
      detail: transfer.error?.message || JSON.stringify(transfer.data)
    });

    results.push({
      test: 'listing:ownership_transfer:verify_owner_unchanged',
      actor: 'seller',
      pass: ownerStillSeller,
      detail: verifyOwner.error?.message || `seller_id=${verifyOwner.data?.seller_id}`
    });
  }

  // 3c) Seller tries to tamper protected listing fields; should remain unchanged
  if (listingId) {
    const before = await seller.sb
      .from('listings')
      .select('view_count, is_verified_listing')
      .eq('id', listingId)
      .maybeSingle();

    const tamper = await seller.sb
      .from('listings')
      .update({ view_count: 999999, is_verified_listing: true })
      .eq('id', listingId)
      .select('id');

    const after = await seller.sb
      .from('listings')
      .select('view_count, is_verified_listing')
      .eq('id', listingId)
      .maybeSingle();

    const passBefore = !before.error && !!before.data;
    const passAfter = !after.error && !!after.data;
    const passNoChange =
      passBefore && passAfter &&
      before.data.view_count === after.data.view_count &&
      before.data.is_verified_listing === after.data.is_verified_listing;

    results.push({
      test: 'listing:protected_fields:unchanged',
      actor: 'seller',
      pass: passNoChange,
      detail: JSON.stringify({
        update: tamper.error?.message || JSON.stringify(tamper.data),
        before: before.data,
        after: after.data
      })
    });
  }

  // 3d) Seller tries to tamper protected listing time fields; should remain unchanged
  if (listingId) {
    const before = await seller.sb
      .from('listings')
      .select('active_until, archive_until, created_at')
      .eq('id', listingId)
      .maybeSingle();

    const tamper = await seller.sb
      .from('listings')
      .update({
        active_until: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        archive_until: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()
      })
      .eq('id', listingId)
      .select('id');

    const after = await seller.sb
      .from('listings')
      .select('active_until, archive_until, created_at')
      .eq('id', listingId)
      .maybeSingle();

    const passNoChange =
      !before.error && !after.error &&
      before.data?.active_until === after.data?.active_until &&
      before.data?.archive_until === after.data?.archive_until &&
      before.data?.created_at === after.data?.created_at;

    results.push({
      test: 'listing:protected_time_fields:unchanged',
      actor: 'seller',
      pass: passNoChange,
      detail: JSON.stringify({
        update: tamper.error?.message || JSON.stringify(tamper.data),
        before: before.data,
        after: after.data
      })
    });
  }

  // 3e) Seller can still update non-protected fields like title
  if (listingId) {
    const upd = await seller.sb
      .from('listings')
      .update({ title: 'SECURITY_TEST_LISTING_UPDATED' })
      .eq('id', listingId)
      .select('id');

    const read = await seller.sb
      .from('listings')
      .select('title')
      .eq('id', listingId)
      .maybeSingle();

    const pass = !upd.error && !read.error && read.data?.title === 'SECURITY_TEST_LISTING_UPDATED';
    results.push({
      test: 'listing:update:title_allowed',
      actor: 'seller',
      pass,
      detail: upd.error?.message || read.error?.message || `title=${read.data?.title}`
    });
  }

  // 4) Buyer tries to update/delete seller listing
  if (listingId) {
    const upd = await buyer.sb
      .from('listings')
      .update({ title: 'HACKED' })
      .eq('id', listingId)
      .select('id');

    const updBlocked = !!upd.error || (Array.isArray(upd.data) && upd.data.length === 0);
    results.push({
      test: 'listing:update:not_allowed',
      actor: 'buyer',
      pass: updBlocked,
      detail: upd.error?.message || JSON.stringify(upd.data)
    });

    const del = await buyer.sb
      .from('listings')
      .delete()
      .eq('id', listingId)
      .select('id');

    const delBlocked = !!del.error || (Array.isArray(del.data) && del.data.length === 0);
    results.push({
      test: 'listing:delete:not_allowed',
      actor: 'buyer',
      pass: delBlocked,
      detail: del.error?.message || JSON.stringify(del.data)
    });
  }

  // 5) Storage isolation: seller uploads a file under their folder; buyer should not list/download
  const ssmPath = `${seller.userId}/security-test.txt`;
  {
    const upload = await seller.sb.storage.from('ssm-documents').upload(ssmPath, Buffer.from('test'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({ test: 'storage:ssm_upload', actor: 'seller', pass: !upload.error, detail: upload.error?.message || 'ok' });

    const crossUploadPath = `${buyer.userId}/security-cross-upload.txt`;
    const crossUpload = await seller.sb.storage.from('ssm-documents').upload(crossUploadPath, Buffer.from('test'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({
      test: 'storage:ssm_cross_folder_upload_block',
      actor: 'seller',
      pass: !!crossUpload.error,
      detail: crossUpload.error?.message || 'unexpected success'
    });

    const enumRoot = await buyer.sb.storage.from('ssm-documents').list('', { limit: 20 });
    const enumBlocked = !!enumRoot.error || (Array.isArray(enumRoot.data) && enumRoot.data.length === 0);
    results.push({
      test: 'storage:ssm_enum_root_block',
      actor: 'buyer',
      pass: enumBlocked,
      detail: enumRoot.error?.message || JSON.stringify(enumRoot.data)
    });

    const list = await buyer.sb.storage.from('ssm-documents').list(seller.userId, { limit: 10 });
    const listBlocked = !!list.error || (Array.isArray(list.data) && list.data.length === 0);
    results.push({ test: 'storage:ssm_list_block', actor: 'buyer', pass: listBlocked, detail: list.error?.message || JSON.stringify(list.data) });

    const dl = await buyer.sb.storage.from('ssm-documents').download(ssmPath);
    results.push({ test: 'storage:ssm_download_block', actor: 'buyer', pass: !!dl.error, detail: dl.error?.message || 'unexpected success' });

    const adminDl = await admin.sb.storage.from('ssm-documents').download(ssmPath);
    results.push({
      test: 'storage:ssm_admin_download_allowed',
      actor: 'admin',
      pass: !adminDl.error,
      detail: adminDl.error?.message || 'ok'
    });

    const cleanup = await seller.sb.storage.from('ssm-documents').remove([ssmPath]);
    results.push({ test: 'storage:ssm_cleanup', actor: 'seller', pass: !cleanup.error, detail: cleanup.error?.message || 'ok' });
  }

  // 5a) Storage ssm-documents overwrite/upsert behavior
  {
    const anonClient = client();
    const anonUpload = await anonClient.storage
      .from('ssm-documents')
      .upload(`anon/${Date.now()}_x.txt`, Buffer.from('x'), { upsert: true, contentType: 'text/plain' });
    results.push({
      test: 'storage:ssm_anon_upload_block',
      actor: 'anon',
      pass: !!anonUpload.error,
      detail: anonUpload.error?.message || 'unexpected success'
    });

    const ownerPath = `${seller.userId}/security-upsert.txt`;
    const upload1 = await seller.sb.storage
      .from('ssm-documents')
      .upload(ownerPath, Buffer.from('v1'), { upsert: true, contentType: 'text/plain' });
    results.push({
      test: 'storage:ssm_owner_upsert_create',
      actor: 'seller',
      pass: !upload1.error,
      detail: upload1.error?.message || 'ok'
    });

    const upload2 = await seller.sb.storage
      .from('ssm-documents')
      .upload(ownerPath, Buffer.from('v2'), { upsert: true, contentType: 'text/plain' });
    results.push({
      test: 'storage:ssm_owner_upsert_overwrite',
      actor: 'seller',
      pass: !upload2.error,
      detail: upload2.error?.message || 'ok'
    });

    const crossOverwrite = await buyer.sb.storage
      .from('ssm-documents')
      .upload(ownerPath, Buffer.from('evil'), { upsert: true, contentType: 'text/plain' });
    results.push({
      test: 'storage:ssm_cross_user_overwrite_block',
      actor: 'buyer',
      pass: !!crossOverwrite.error,
      detail: crossOverwrite.error?.message || 'unexpected success'
    });

    const cleanup = await seller.sb.storage.from('ssm-documents').remove([ownerPath]);
    results.push({
      test: 'storage:ssm_upsert_cleanup',
      actor: 'seller',
      pass: !cleanup.error,
      detail: cleanup.error?.message || 'ok'
    });
  }

  // 5b) Storage listing-images (public bucket) should not allow enumeration/listing across users
  {
    const anonClient = client();
    const anonRootList = await anonClient.storage.from('listing-images').list('', { limit: 20 });
    const anonEnumBlocked = !!anonRootList.error || (Array.isArray(anonRootList.data) && anonRootList.data.length === 0);
    results.push({
      test: 'storage:listing_images:anon_enum_root_block',
      actor: 'anon',
      pass: anonEnumBlocked,
      detail: anonRootList.error?.message || JSON.stringify(anonRootList.data)
    });

    const imgPath = `${seller.userId}/security-test-image.txt`;
    const upload = await seller.sb.storage.from('listing-images').upload(imgPath, Buffer.from('test'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({
      test: 'storage:listing_images:upload_own',
      actor: 'seller',
      pass: !upload.error,
      detail: upload.error?.message || 'ok'
    });

    const sellerList = await seller.sb.storage.from('listing-images').list(seller.userId, { limit: 10 });
    const sellerCanList = !sellerList.error && Array.isArray(sellerList.data) && sellerList.data.some((o) => o.name === 'security-test-image.txt');
    results.push({
      test: 'storage:listing_images:list_own_allowed',
      actor: 'seller',
      pass: sellerCanList,
      detail: sellerList.error?.message || JSON.stringify(sellerList.data)
    });

    const buyerRootList = await buyer.sb.storage.from('listing-images').list('', { limit: 20 });
    const buyerRootBlocked = !!buyerRootList.error || (Array.isArray(buyerRootList.data) && buyerRootList.data.length === 0);
    results.push({
      test: 'storage:listing_images:buyer_enum_root_block',
      actor: 'buyer',
      pass: buyerRootBlocked,
      detail: buyerRootList.error?.message || JSON.stringify(buyerRootList.data)
    });

    const buyerOtherList = await buyer.sb.storage.from('listing-images').list(seller.userId, { limit: 10 });
    const buyerOtherBlocked = !!buyerOtherList.error || (Array.isArray(buyerOtherList.data) && buyerOtherList.data.length === 0);
    results.push({
      test: 'storage:listing_images:list_other_block',
      actor: 'buyer',
      pass: buyerOtherBlocked,
      detail: buyerOtherList.error?.message || JSON.stringify(buyerOtherList.data)
    });

    const overwriteSelf = await seller.sb.storage.from('listing-images').upload(imgPath, Buffer.from('changed'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({
      test: 'storage:listing_images:owner_upsert_overwrite',
      actor: 'seller',
      pass: !overwriteSelf.error,
      detail: overwriteSelf.error?.message || 'ok'
    });

    const crossOverwrite = await buyer.sb.storage.from('listing-images').upload(imgPath, Buffer.from('evil'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({
      test: 'storage:listing_images:cross_user_overwrite_block',
      actor: 'buyer',
      pass: !!crossOverwrite.error,
      detail: crossOverwrite.error?.message || 'unexpected success'
    });

    const crossUploadPath = `${buyer.userId}/security-cross-upload.txt`;
    const crossUpload = await seller.sb.storage.from('listing-images').upload(crossUploadPath, Buffer.from('test'), {
      upsert: true,
      contentType: 'text/plain'
    });
    results.push({
      test: 'storage:listing_images:cross_folder_upload_block',
      actor: 'seller',
      pass: !!crossUpload.error,
      detail: crossUpload.error?.message || 'unexpected success'
    });

    const cleanup = await seller.sb.storage.from('listing-images').remove([imgPath]);
    results.push({
      test: 'storage:listing_images:cleanup',
      actor: 'seller',
      pass: !cleanup.error,
      detail: cleanup.error?.message || 'ok'
    });
  }

  // Cleanup listing
  if (listingId) {
    await seller.sb.from('listings').delete().eq('id', listingId);
  }
  if (publicListingId) {
    await seller.sb.from('listings').delete().eq('id', publicListingId);
  }
  if (soldListingId) {
    await seller.sb.from('listings').delete().eq('id', soldListingId);
  }
  if (activeExpiredListingId) {
    await seller.sb.from('listings').delete().eq('id', activeExpiredListingId);
  }

  // 6) View count de-dupe: same user + same listing + same hour should only increment once
  {
    const ins = await seller.sb.from('listings').insert({
      seller_id: seller.userId,
      title: 'SECURITY_TEST_VIEW_LISTING',
      category: 'Solar Panel',
      brand: 'TestBrand',
      price_rm: 1.23,
      location_state: 'TEST',
      is_hidden: false,
      images_url: []
    }).select('id, view_count').single();

    if (ins.error) {
      results.push({ test: 'view:listing:create', actor: 'seller', pass: false, detail: ins.error.message });
    } else {
      const vid = ins.data.id;

      const before = await buyer.sb.from('listings').select('view_count').eq('id', vid).maybeSingle();
      const beforeCount = before.data?.view_count;

      const inc1 = await buyer.sb.rpc('increment_view_count', { listing_id: vid });
      const after1 = await buyer.sb.from('listings').select('view_count').eq('id', vid).maybeSingle();

      const inc2 = await buyer.sb.rpc('increment_view_count', { listing_id: vid });
      const after2 = await buyer.sb.from('listings').select('view_count').eq('id', vid).maybeSingle();

      const passIncCalls = !inc1.error && !inc2.error;
      const passBeforeReadable = !before.error && typeof beforeCount === 'number';
      const passAfterReadable = !after1.error && !after2.error;
      const passIncrementedOnce =
        passBeforeReadable && passAfterReadable &&
        typeof after1.data?.view_count === 'number' &&
        typeof after2.data?.view_count === 'number' &&
        after1.data.view_count === beforeCount + 1 &&
        after2.data.view_count === after1.data.view_count;

      results.push({
        test: 'view:increment:rpc_calls_ok',
        actor: 'buyer',
        pass: passIncCalls,
        detail: inc1.error?.message || inc2.error?.message || 'ok'
      });
      results.push({
        test: 'view:increment:dedupe_once_per_hour',
        actor: 'buyer',
        pass: passIncrementedOnce,
        detail: JSON.stringify({ before: beforeCount, after1: after1.data?.view_count, after2: after2.data?.view_count })
      });

      await seller.sb.from('listings').delete().eq('id', vid);
    }
  }

  // Print
  console.log('=== Solerz Security Test Results ===');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.test} | actor=${r.actor} | ${r.detail}`);
  }

  const failed = results.filter(r => !r.pass);
  console.log(`\nTotal: ${results.length}, Failed: ${failed.length}`);
  if (failed.length) process.exitCode = 2;
}

run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
