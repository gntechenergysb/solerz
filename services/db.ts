import { Listing, Profile } from '../types';
import { supabase } from './supabaseClient';

const sellerSelectWithPhone = 'company_name, is_verified, seller_type, handphone_no, email, business_address, company_reg_no';
const sellerSelectNoPhone = 'company_name, is_verified, seller_type, email, business_address, company_reg_no';

const isMissingHandphoneNoError = (error: any) => {
  const msg = String(error?.message || '');
  return (error?.code === '42703' && msg.includes('handphone_no')) || msg.includes('handphone_no');
};

const enrichListingsWithSeller = async (listings: any[]): Promise<Listing[]> => {
  const missingSellerIds = Array.from(
    new Set(
      (listings || [])
        .filter((l: any) => !l?.seller)
        .map((l: any) => l?.seller_id)
        .filter(Boolean)
    )
  ) as string[];

  let sellersById: Record<string, any> = {};
  if (missingSellerIds.length > 0) {
    let sellers: any[] | null = null;
    let error: any = null;

    ({ data: sellers, error } = await supabase
      .from('profiles_public')
      .select('id, company_name, is_verified, seller_type, handphone_no, email, business_address, company_reg_no')
      .in('id', missingSellerIds));

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await supabase
        .from('profiles_public')
        .select('id, company_name, is_verified, seller_type, email, business_address, company_reg_no')
        .in('id', missingSellerIds);
      sellers = retry.data;
    }

    (sellers || []).forEach((s: any) => {
      sellersById[s.id] = s;
    });
  }

  return (listings || []).map((l: any) => {
    const s = l.seller ?? sellersById[l.seller_id];
    return {
      ...l,
      seller_name: s?.company_name || 'Unknown',
      is_verified_seller: s?.is_verified || false,
      seller_type: s?.seller_type,
      seller_phone: s?.handphone_no || '',
      seller_email: s?.email || '',
      seller_business_address: s?.business_address || '',
      seller_company_reg_no: s?.company_reg_no || ''
    } as Listing;
  });
};

export const db = {
  getListings: async (): Promise<Listing[]> => {
    let { data: listings, error } = await supabase
      .from('listings')
      .select(`*, seller:profiles_public(${sellerSelectWithPhone})`)
      .order('created_at', { ascending: false });

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await supabase
        .from('listings')
        .select(`*, seller:profiles_public(${sellerSelectNoPhone})`)
        .order('created_at', { ascending: false });
      listings = retry.data;
      error = retry.error;
    }

    if (error) {
      if ((error as any)?.code === 'PGRST200') {
        const { data: baseListings, error: baseError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (baseError) {
          console.error('Error fetching listings:', baseError);
          return [];
        }

        return enrichListingsWithSeller(baseListings || []);
      }

      console.error('Error fetching listings:', error);
      return [];
    }

    return enrichListingsWithSeller(listings || []);
  },

  getMarketplaceListings: async (params?: {
    from?: number;
    to?: number;
    marketplaceLayer?: 'verified' | 'community';
    searchQuery?: string;
    state?: string;
    category?: string;
    condition?: string;
    sortBy?: 'latest' | 'price-low' | 'price-high';
  }): Promise<Listing[]> => {
    const from = params?.from ?? 0;
    const to = params?.to ?? 3;
    const marketplaceLayer = params?.marketplaceLayer ?? 'verified';
    const searchQuery = (params?.searchQuery ?? '').trim();
    const state = params?.state ?? '';
    const category = params?.category ?? '';
    const condition = (params?.condition ?? '').trim();
    const sortBy = params?.sortBy ?? 'latest';
    const nowIso = new Date().toISOString();

    const isVerifiedListing = marketplaceLayer === 'verified';

    const buildQuery = (base: any) => {
      let q = base
        .eq('is_hidden', false)
        .eq('is_sold', false)
        .eq('is_verified_listing', isVerifiedListing)
        .gt('active_until', nowIso);

      if (state) {
        q = q.eq('location_state', state);
      }

      if (category) {
        if (category === 'Miscellaneous') {
          q = q.in('category', ['Miscellaneous', 'Accessories']);
        } else {
          q = q.eq('category', category);
        }
      }

      if (condition) {
        q = q.eq('condition', condition);
      }

      if (searchQuery) {
        const normalized = searchQuery.toLowerCase().replace(/,/g, ' ').trim();
        const tokenPattern = normalized.replace(/\s+/g, '*');
        const pattern = `*${tokenPattern}*`;
        q = q.or(`title.ilike.${pattern},brand.ilike.${pattern}`);
      }

      if (sortBy === 'price-low') {
        q = q.order('price_rm', { ascending: true }).order('id', { ascending: false });
      } else if (sortBy === 'price-high') {
        q = q.order('price_rm', { ascending: false }).order('id', { ascending: false });
      } else {
        q = q.order('created_at', { ascending: false }).order('id', { ascending: false });
      }

      return q.range(from, to);
    };

    let { data: listings, error } = await buildQuery(
      supabase
        .from('listings')
        .select(`*, seller:profiles_public(${sellerSelectWithPhone})`)
    );

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await buildQuery(
        supabase
          .from('listings')
          .select(`*, seller:profiles_public(${sellerSelectNoPhone})`)
      );
      listings = retry.data;
      error = retry.error;
    }

    if (error) {
      if ((error as any)?.code === 'PGRST200') {
        const { data: baseListings, error: baseError } = await buildQuery(
          supabase
            .from('listings')
            .select('*')
        );

        if (baseError) {
          console.error('Error fetching marketplace listings:', baseError);
          return [];
        }

        return enrichListingsWithSeller(baseListings || []);
      }

      console.error('Error fetching marketplace listings:', error);
      return [];
    }

    return enrichListingsWithSeller(listings || []);
  },

  getListingsByIds: async (ids: string[]): Promise<Listing[]> => {
    if (!ids.length) return [];

    let { data: listings, error } = await supabase
      .from('listings')
      .select(`*, seller:profiles_public(${sellerSelectWithPhone})`)
      .in('id', ids);

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await supabase
        .from('listings')
        .select(`*, seller:profiles_public(${sellerSelectNoPhone})`)
        .in('id', ids);
      listings = retry.data;
      error = retry.error;
    }

    if (error) {
      if ((error as any)?.code === 'PGRST200') {
        const { data: baseListings, error: baseError } = await supabase
          .from('listings')
          .select('*')
          .in('id', ids);

        if (baseError) {
          console.error('Error fetching listings by ids:', baseError);
          return [];
        }

        const enriched = await enrichListingsWithSeller(baseListings || []);
        return ids.map(id => enriched.find(l => l.id === id)).filter(Boolean) as Listing[];
      }

      console.error('Error fetching listings by ids:', error);
      return [];
    }

    const enriched = await enrichListingsWithSeller(listings || []);
    return ids.map(id => enriched.find(l => l.id === id)).filter(Boolean) as Listing[];
  },

  getListingsBySellerId: async (sellerId: string): Promise<Listing[]> => {
    let { data: listings, error } = await supabase
      .from('listings')
      .select(`*, seller:profiles_public(${sellerSelectWithPhone})`)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await supabase
        .from('listings')
        .select(`*, seller:profiles_public(${sellerSelectNoPhone})`)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      listings = retry.data;
      error = retry.error;
    }

    if (error) {
      if ((error as any)?.code === 'PGRST200') {
        const { data: baseListings, error: baseError } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });

        if (baseError) {
          console.error('Error fetching listings by seller:', baseError);
          return [];
        }

        return enrichListingsWithSeller(baseListings || []);
      }

      console.error('Error fetching listings by seller:', error);
      return [];
    }

    return enrichListingsWithSeller(listings || []);
  },

  // Minimal version for Dashboard - only fetches essential fields (much faster)
  getListingsBySellerIdMinimal: async (sellerId: string): Promise<Partial<Listing>[]> => {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, active_until, is_hidden, is_sold, is_paused, view_count, created_at')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching minimal listings by seller:', error);
      return [];
    }

    return listings || [];
  },

  // Homepage optimized: returns N random active listings with minimal Supabase traffic
  // Uses local randomization on ID list to avoid ORDER BY RANDOM() performance hit
  getRandomListings: async (limit: number = 20, marketplaceLayer: 'verified' | 'community' = 'verified'): Promise<Listing[]> => {
    const nowIso = new Date().toISOString();

    // Step 1: Get all active listing IDs (fast - minimal data transfer)
    const { data: idRows, error: idError } = await supabase
      .from('listings')
      .select('id')
      .eq('is_hidden', false)
      .eq('is_sold', false)
      .eq('is_verified_listing', marketplaceLayer === 'verified')
      .gt('active_until', nowIso);

    if (idError) {
      console.error('Error fetching listing IDs:', idError);
      return [];
    }

    if (!idRows || idRows.length === 0) {
      return [];
    }

    // Step 2: Randomize IDs locally (no DB overhead)
    const allIds = idRows.map((r: any) => r.id);
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, limit);

    // Step 3: Fetch full data only for selected IDs
    const listings = await db.getListingsByIds(selectedIds);

    // Return in random order
    const byId = new Map(listings.map(l => [l.id, l]));
    return selectedIds.map(id => byId.get(id)).filter(Boolean) as Listing[];
  },

  getListingById: async (id: string): Promise<Listing | null> => {
    let { data, error } = await supabase
      .from('listings')
      .select(`*, seller:profiles_public(${sellerSelectWithPhone})`)
      .eq('id', id)
      .single();

    if (error && isMissingHandphoneNoError(error)) {
      const retry = await supabase
        .from('listings')
        .select(`*, seller:profiles_public(${sellerSelectNoPhone})`)
        .eq('id', id)
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      if ((error as any)?.code === 'PGRST200') {
        const { data: base, error: baseError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (baseError || !base) {
          console.error('Error getting listing by ID:', baseError);
          return null;
        }

        const enriched = await enrichListingsWithSeller([base]);
        return enriched[0] || null;
      }

      console.error("Error getting listing by ID:", error);
      return null;
    }

    const enriched = await enrichListingsWithSeller([data]);
    return enriched[0] || null;
  },

  createListing: async (listing: Omit<Listing, 'id' | 'created_at' | 'view_count' | 'seller_name' | 'is_verified_seller' | 'seller_type' | 'is_verified_listing' | 'archive_until' | 'active_until'>): Promise<boolean> => {

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user logged in to create listing");
      return false;
    }

    const { error } = await supabase
      .from('listings')
      .insert({
        ...listing,
        seller_id: user.id
      });

    if (error) {
      console.error('Error creating listing:', error);
      return false;
    }
    return true;
  },

  updateListing: async (listing: Listing): Promise<void> => {
    // Security: RLS will prevent unauthorized updates
    const { error } = await supabase
      .from('listings')
      .update({
        title: listing.title,
        category: listing.category,
        brand: listing.brand,
        condition: listing.condition,
        price_rm: listing.price_rm,
        location_state: listing.location_state,
        specs: listing.specs,
        images_url: listing.images_url,
        // Add other updatable fields as needed
      })
      .eq('id', listing.id);

    if (error) console.error("Error updating listing:", error);
  },

  setListingHidden: async (id: string, isHidden: boolean): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return false;

    const { error } = await supabase
      .from('listings')
      .update({ is_hidden: isHidden })
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) {
      console.error('Error updating listing visibility:', error);
      return false;
    }
    return true;
  },

  renewListing: async (id: string): Promise<{ active_until: string; archive_until: string } | null> => {
    const { data, error } = await supabase.rpc('renew_listing', { p_listing_id: id });
    if (error) {
      console.error('Error renewing listing:', error);
      return null;
    }

    const row = Array.isArray(data) && data.length ? data[0] : null;
    if (!row?.active_until || !row?.archive_until) return null;
    return { active_until: row.active_until, archive_until: row.archive_until };
  },

  updateViewCount: async (id: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_view_count', { listing_id: id });
    if (error) console.error("Error incrementing view count:", error);
  },

  getRecentlyViewedListingIds: async (limit: number = 24): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('listing_view_events')
      .select('listing_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching recently viewed:', error);
      return [];
    }

    const out: string[] = [];
    const seen = new Set<string>();
    for (const row of data || []) {
      const id = (row as any).listing_id as string;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      if (out.length >= limit) break;
    }
    return out;
  },

  getSavedListingIds: async (): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_listings')
      .select('listing_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved listings:', error);
      return [];
    }

    return (data || []).map((r: any) => r.listing_id).filter(Boolean);
  },

  trackSearchEvent: async (payload: {
    searchQuery?: string;
    category?: string;
    state?: string;
    condition?: string;
    marketplaceLayer?: 'verified' | 'community' | string;
  }): Promise<void> => {
    const { error } = await supabase.rpc('track_search_event', {
      p_search_query: payload.searchQuery || null,
      p_category: payload.category || null,
      p_state: payload.state || null,
      p_condition: payload.condition || null,
      p_marketplace_layer: payload.marketplaceLayer || null
    });
    if (error) console.error('Error tracking search event:', error);
  },

  trackListingContactEvent: async (listingId: string, action: 'whatsapp' | 'phone_reveal' | 'email'): Promise<void> => {
    const { error } = await supabase.rpc('track_listing_contact_event', {
      p_listing_id: listingId,
      p_action: action
    });
    if (error) console.error('Error tracking listing contact event:', error);
  },

  getMarketDemand: async (days: number = 7): Promise<Array<{ category: string; searches: number }>> => {
    const { data, error } = await supabase.rpc('get_market_demand', { p_days: days });
    if (error) {
      console.error('Error fetching market demand:', error);
      return [];
    }
    return (data || []) as any;
  },

  getSellerFunnel: async (sellerId: string, days: number = 7): Promise<{ impressions: number; views: number; contacts: number } | null> => {
    const { data, error } = await supabase.rpc('get_seller_funnel', { p_seller_id: sellerId, p_days: days });
    if (error) {
      console.error('Error fetching seller funnel:', error);
      return null;
    }
    const row = Array.isArray(data) && data.length ? (data[0] as any) : (data as any);
    if (!row) return null;
    return {
      impressions: Number(row.impressions || 0),
      views: Number(row.views || 0),
      contacts: Number(row.contacts || 0)
    };
  },

  isListingSaved: async (listingId: string): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return false;

    const { data, error } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (error) {
      console.error('Error checking saved listing:', error);
      return false;
    }

    return !!data;
  },

  toggleSavedListing: async (listingId: string): Promise<{ saved: boolean } | null> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return null;

    const { data: existing, error: findError } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (findError) {
      console.error('Error checking saved listing:', findError);
      return null;
    }

    if (existing) {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) {
        console.error('Error unsaving listing:', error);
        return null;
      }
      return { saved: false };
    }

    const { error } = await supabase
      .from('saved_listings')
      .insert({ user_id: user.id, listing_id: listingId });

    if (error) {
      console.error('Error saving listing:', error);
      return null;
    }
    return { saved: true };
  },

  getProfileById: async (id: string): Promise<Profile | null> => {
    // NOTE: This is for getting PROFILE data, not auth.
    // Auth is handled directly by supabase.auth in authContext
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        // Log network/DB errors for debugging
        console.error('Error fetching profile:', error);
        return null;
      }
      
      // data is null when user not found - this is expected for new users
      return data as Profile;
    } catch (e) {
      // Handle network or unexpected errors
      console.error('Network error fetching profile:', e);
      return null;
    }
  },

  // Return object for detailed error handling
  updateProfile: async (profile: Partial<Profile>): Promise<{ success: boolean, error?: any }> => {
    // 1. Separate ID
    const { id } = profile;
    if (!id) {
      console.error("Cannot update profile without ID");
      return { success: false, error: "Missing Profile ID" };
    }

    // 2. Whitelist Allowed Fields (Security & Stability)
    const ALLOWED_FIELDS = [
      'company_name', 'handphone_no', 'avatar_url',
      'ssm_new_no', 'ssm_old_no', 'business_address',
      'incorporation_date', 'nature_of_business', 'ssm_file_path',
      'ssm_no'
    ];

    const updates: any = {};
    Object.keys(profile).forEach(key => {
      if (ALLOWED_FIELDS.includes(key)) {
        updates[key] = (profile as any)[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'No allowed fields to update' };
    }

    // 3. Send Update
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
    return { success: true };
  },

  purchasePlan: async (newTier: Profile['tier']): Promise<{ success: boolean; error?: any }> => {
    const { error } = await supabase.rpc('purchase_plan', { new_tier: newTier });
    if (error) {
      console.error('Error purchasing plan:', error);
      return { success: false, error };
    }
    return { success: true };
  }
};