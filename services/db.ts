import { Listing, Profile, AuthState } from '../types';
import { MOCK_LISTINGS, MOCK_USERS } from '../constants';

// Keys for localStorage
const LS_LISTINGS = 'solerz_listings';
const LS_USERS = 'solerz_users';

// Initialize Mock DB
const initDB = () => {
  if (!localStorage.getItem(LS_LISTINGS)) {
    localStorage.setItem(LS_LISTINGS, JSON.stringify(MOCK_LISTINGS));
  }
  if (!localStorage.getItem(LS_USERS)) {
    localStorage.setItem(LS_USERS, JSON.stringify(MOCK_USERS));
  }
};

initDB();

export const db = {
  getListings: async (): Promise<Listing[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const listingsStr = localStorage.getItem(LS_LISTINGS);
    const usersStr = localStorage.getItem(LS_USERS);
    const listings: Listing[] = listingsStr ? JSON.parse(listingsStr) : [];
    const users: Profile[] = usersStr ? JSON.parse(usersStr) : [];

    // Join with user data
    return listings.map(l => {
      const seller = users.find(u => u.id === l.seller_id);
      return {
        ...l,
        seller_name: seller?.company_name || 'Unknown',
        is_verified_seller: seller?.is_verified || false
      };
    });
  },

  getListingById: async (id: string): Promise<Listing | null> => {
     await new Promise(resolve => setTimeout(resolve, 300));
     const listings = await db.getListings();
     return listings.find(l => l.id === id) || null;
  },

  createListing: async (listing: Omit<Listing, 'id' | 'created_at' | 'view_count' | 'seller_name' | 'is_verified_seller'>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const listingsStr = localStorage.getItem(LS_LISTINGS);
    const listings: Listing[] = listingsStr ? JSON.parse(listingsStr) : [];
    
    const newListing: Listing = {
      ...listing,
      id: `list-${Date.now()}`,
      created_at: new Date().toISOString(),
      view_count: 0
    };

    listings.unshift(newListing);
    localStorage.setItem(LS_LISTINGS, JSON.stringify(listings));
    return true;
  },
  
  updateViewCount: async (id: string): Promise<void> => {
     const listingsStr = localStorage.getItem(LS_LISTINGS);
     let listings: Listing[] = listingsStr ? JSON.parse(listingsStr) : [];
     listings = listings.map(l => l.id === id ? { ...l, view_count: l.view_count + 1 } : l);
     localStorage.setItem(LS_LISTINGS, JSON.stringify(listings));
  },

  login: async (email: string): Promise<Profile | null> => {
     await new Promise(resolve => setTimeout(resolve, 600));
     const usersStr = localStorage.getItem(LS_USERS);
     const users: Profile[] = usersStr ? JSON.parse(usersStr) : [];
     const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
     return user || null;
  },

  updateProfile: async (profile: Profile): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const usersStr = localStorage.getItem(LS_USERS);
    let users: Profile[] = usersStr ? JSON.parse(usersStr) : [];
    users = users.map(u => u.id === profile.id ? profile : u);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
};