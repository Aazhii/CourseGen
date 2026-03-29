import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../services/apiClient';

export interface User {
  id?: string;
  username: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Try to fetch user profile with the stored token
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiFetch('/api/auth/me');
      if (response?.data) {
        setUser(response.data);
      } else if (response && typeof response === 'object') {
        setUser(response as User);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Token might be invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, userData?: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (userData) {
      setUser(userData);
    } else {
      // Fetch user profile if not provided
      fetchUserProfile();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    token,
    user,
    loading,
    login,
    logout,
    setUser,
    isAuthenticated: token !== null && user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

