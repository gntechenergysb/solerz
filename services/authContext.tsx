import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { db } from './db';
import { supabase } from './supabaseClient';

interface AuthContextType {
  user: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<Profile>, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshUser(session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        refreshUser(session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error.message);
      setIsLoading(false);
      // We will throw or return false. Ideally return error message.
      // For now returning false to compatible with existing UI logic
      // but we'll expose error via toast in UI
      return false;
    }
    return true;
  };

  const register = async (data: Partial<Profile>, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          data: {
            company_name: data.company_name,
            seller_type: data.seller_type
          }
        }
      });

      if (error) throw error;

      return true;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async (email?: string) => {
    if (!email && user?.email) email = user.email;
    if (!email) return;

    const profile = await db.login(email);
    if (profile) {
      setUser(profile);
    }
    setIsLoading(false);
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading, isAuthenticated }}>
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