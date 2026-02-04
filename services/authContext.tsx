import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Profile } from '../types';
import { db } from './db';
import { supabase } from './supabaseClient';

 const AUTH_CACHE_USER_ID_KEY = 'solerz_auth_user_id_v1';
 const AUTH_CACHE_EMAIL_KEY = 'solerz_auth_email_v1';
 const PROFILE_CACHE_KEY = 'solerz_profile_cache_v1';

 const readCachedAuthUserId = (): string | null => {
   try {
     if (typeof window === 'undefined') return null;
     return window.localStorage.getItem(AUTH_CACHE_USER_ID_KEY);
   } catch {
     return null;
   }
 };

 const writeCachedAuthUserId = (id: string | null) => {
   try {
     if (typeof window === 'undefined') return;
     if (!id) {
       window.localStorage.removeItem(AUTH_CACHE_USER_ID_KEY);
       return;
     }
     window.localStorage.setItem(AUTH_CACHE_USER_ID_KEY, id);
   } catch {
     return;
   }
 };

 const readCachedAuthEmail = (): string | null => {
   try {
     if (typeof window === 'undefined') return null;
     return window.localStorage.getItem(AUTH_CACHE_EMAIL_KEY);
   } catch {
     return null;
   }
 };

 const writeCachedAuthEmail = (email: string | null) => {
   try {
     if (typeof window === 'undefined') return;
     if (!email) {
       window.localStorage.removeItem(AUTH_CACHE_EMAIL_KEY);
       return;
     }
     window.localStorage.setItem(AUTH_CACHE_EMAIL_KEY, email);
   } catch {
     return;
   }
 };

 const readCachedProfile = (): Profile | null => {
   try {
     if (typeof window === 'undefined') return null;
     const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
     if (!raw) return null;
     return JSON.parse(raw) as Profile;
   } catch {
     return null;
   }
 };

 const writeCachedProfile = (profile: Profile | null) => {
   try {
     if (typeof window === 'undefined') return;
     if (!profile) {
       window.localStorage.removeItem(PROFILE_CACHE_KEY);
       return;
     }
     window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
   } catch {
     return;
   }
 };

const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
  let t: any;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_resolve, reject) => {
        t = setTimeout(() => reject(new Error(`${label}_timeout`)), ms);
      })
    ]);
  } finally {
    if (t) clearTimeout(t);
  }
};

interface AuthContextType {
  user: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<Profile>, password: string) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  authEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => readCachedProfile());
  const [authUserId, setAuthUserId] = useState<string | null>(() => {
    const cachedProfile = readCachedProfile();
    return readCachedAuthUserId() || cachedProfile?.id || null;
  });
  const [authEmail, setAuthEmail] = useState<string | null>(() => {
    const cachedProfile = readCachedProfile();
    return cachedProfile?.email || readCachedAuthEmail();
  });
  const [isLoading, setIsLoading] = useState(true);

  const isMountedRef = useRef(true);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);

  const refreshUser = async (userId?: string) => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const p = (async () => {
      try {
        const id = userId;
        let resolvedId = id;

        if (!resolvedId) {
          const { data, error } = await withTimeout(supabase.auth.getUser(), 10000, 'auth_get_user');
          if (error) throw error;
          resolvedId = data.user?.id;
        }

        const finalId = resolvedId;
        if (!finalId) {
          return;
        }

        const profile = await withTimeout(db.getProfileById(finalId), 5000, 'db_get_profile');
        if (isMountedRef.current) {
          setAuthUserId(finalId);
          writeCachedAuthUserId(finalId);
          setUser(profile);
          writeCachedProfile(profile);
          setAuthEmail(profile?.email || null);
          writeCachedAuthEmail(profile?.email || null);
        }
      } catch (e: any) {
        const msg = String(e?.message || e);
        const isAbort = e?.name === 'AbortError' || msg.includes('signal is aborted');
        const isTimeout = msg.endsWith('_timeout');
        if (!isTimeout) {
          console.error(e);
        }
        // AbortErrors can happen due to Supabase auth internal locking/refresh.
        // Do not wipe local auth state on transient aborts.
        if (isMountedRef.current) {
          if (!isAbort && !isTimeout) {
            setUser(null);
            writeCachedProfile(null);
          }
          // If we timed out fetching auth user, treat session as unusable so the app can show /login.
        }
      } finally {
        if (isMountedRef.current) setIsLoading(false);
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = p;
    return p;
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
        writeCachedAuthUserId(session.user.id);
        setAuthEmail(session.user.email || null);
        writeCachedAuthEmail(session.user.email || null);
        const cached = readCachedProfile();
        if (cached && cached.id === session.user.id) {
          setUser(cached);
          setAuthEmail(cached.email || session.user.email || null);
          writeCachedAuthEmail(cached.email || session.user.email || null);
          setIsLoading(false);
        }
        refreshUser(session.user.id);
      } else {
        setAuthUserId(null);
        setUser(null);
        setAuthEmail(null);
        writeCachedAuthUserId(null);
        writeCachedAuthEmail(null);
        writeCachedProfile(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id) {
        setAuthUserId(session.user.id);
        writeCachedAuthUserId(session.user.id);
        setAuthEmail(session.user.email || null);
        writeCachedAuthEmail(session.user.email || null);
        await refreshUser(session.user.id);
        return;
      }

      if (isMountedRef.current) {
        setAuthUserId(null);
        setUser(null);
        setAuthEmail(null);
        writeCachedAuthUserId(null);
        writeCachedAuthEmail(null);
        writeCachedProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password
        }),
        12000,
        'auth_signin'
      );

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }

      const id = data.user?.id;
      if (id) {
        setAuthUserId(id);
        writeCachedAuthUserId(id);
        setAuthEmail(data.user?.email || email);
        writeCachedAuthEmail(data.user?.email || email);
        void refreshUser(id);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const register = async (data: Partial<Profile>, password: string) => {
    setIsLoading(true);
    try {
      // 1. Force clear any existing zombie sessions to prevent "browser cache" issues
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.warn('Pre-signup signOut failed (ignored):', e);
      }

      // 2. SignUp with metadata (Triggers handle_new_user to write to profiles)
      const { error } = await withTimeout(supabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          data: {
            company_name: data.company_name,
            seller_type: data.seller_type,
            role: data.role
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      }), 25000, 'auth_signup');

      if (error) throw error;

      // Ensure profile data is updated with all fields (like handphone_no)
      if (data && data.email) {
        await new Promise(r => setTimeout(r, 1000));
        const userResponse = await withTimeout(supabase.auth.getUser(), 3500, 'auth_get_user');
        if (userResponse.data.user) {
          await withTimeout(db.updateProfile({
            id: userResponse.data.user.id,
            ...data
          }), 3500, 'db_update_profile');
        }
      }

      if (isMountedRef.current) setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      let msg = e.message || 'Registration failed';

      if (msg === 'auth_signup_timeout') {
        return { success: true, msg: 'Account may have been created. Please check your email (and spam folder) to verify, then log in.' };
      }

      // Mask system-specific rate limit errors
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('security purposes')) {
        msg = "Too many attempts. Please wait 1 hour before trying again.";
      }

      return { success: false, msg };
    }
  };

  const logout = async () => {
    // Non-blocking logout: clear local state immediately to prevent UI freeze.
    if (isMountedRef.current) {
      setAuthUserId(null);
      setUser(null);
      setAuthEmail(null);
      writeCachedAuthUserId(null);
      writeCachedAuthEmail(null);
      writeCachedProfile(null);
      setIsLoading(false);
    }

    // Best-effort signOut in background (can hang intermittently on network issues).
    void (async () => {
      try {
        await withTimeout(supabase.auth.signOut(), 3500, 'auth_signout');
      } catch (e) {
        console.warn('signOut failed (ignored):', e);
      }
    })();
  };

  const isAuthenticated = !!authUserId;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading, isAuthenticated, authEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};