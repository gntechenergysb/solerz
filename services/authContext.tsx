import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { db } from './db';

interface AuthContextType {
  user: Profile | null;
  login: (email: string) => Promise<boolean>;
  register: (data: Partial<Profile>) => Promise<boolean>;
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
    // Check local storage for session
    const storedUser = localStorage.getItem('solerz_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    const profile = await db.login(email);
    if (profile) {
      setUser(profile);
      localStorage.setItem('solerz_session', JSON.stringify(profile));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (data: Partial<Profile>) => {
    setIsLoading(true);
    try {
        const profile = await db.register(data);
        setUser(profile);
        localStorage.setItem('solerz_session', JSON.stringify(profile));
        setIsLoading(false);
        return true;
    } catch (e) {
        console.error(e);
        setIsLoading(false);
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('solerz_session');
  };

  const refreshUser = async () => {
      if (user) {
          const updated = await db.login(user.email);
          if (updated) {
              setUser(updated);
              localStorage.setItem('solerz_session', JSON.stringify(updated));
          }
      }
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