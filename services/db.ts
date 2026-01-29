import { Listing, Profile } from '../types';
import { supabase } from './supabaseClient';

export const db = {
  getListings: async (): Promise<Listing[]> => {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, seller:profiles(company_name, is_verified, seller_type)')
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      console.error('Error fetching listings:', error);
      return [];
    }

    // Map Supabase response to our Listing type
    return listings.map((l: any) => ({
      ...l,
      seller_name: l.seller?.company_name || 'Unknown',
      is_verified_seller: l.seller?.is_verified || false,
      seller_type: l.seller?.seller_type
    }));
  },

  getListingById: async (id: string): Promise<Listing | null> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles(company_name, is_verified, seller_type)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Error getting listing by ID:", error);
      return null;
    }

    return {
      ...data,
      seller_name: data.seller?.company_name || 'Unknown',
      is_verified_seller: data.seller?.is_verified || false,
      seller_type: data.seller?.seller_type
    };
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
        price_rm: listing.price_rm,
        specs: listing.specs,
        images_url: listing.images_url,
        // Add other updatable fields as needed
      })
      .eq('id', listing.id);

    if (error) console.error("Error updating listing:", error);
  },

  updateViewCount: async (id: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_view_count', { listing_id: id });
    if (error) console.error("Error incrementing view count:", error);
  },

  login: async (email: string): Promise<Profile | null> => {
    // NOTE: This is for getting PROFILE data, not auth. 
    // Auth is handled directly by supabase.auth in authContext
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data as Profile;
  },

  // This function is less relevant with Supabase Auth (handled by Context), keeping for possible profile updates
  updateProfile: async (profile: Partial<Profile>): Promise<void> => {
    // Only update fields that are present
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id);

    if (error) console.error("Error updating profile:", error);
  }
};