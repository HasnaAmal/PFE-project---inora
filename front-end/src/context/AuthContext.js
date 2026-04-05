'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ authFetch function that adds token to all requests
  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [authFetch] Added Authorization header for:', url);
    } else {
      console.warn('⚠️ [authFetch] No token for:', url);
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      console.log('❌ [authFetch] Got 401 for:', url);
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login?expired=true');
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  }, [router]);

  // ✅ FIXED: Use authFetch instead of fetch
  const fetchMe = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      console.log('🔍 [fetchMe] No token, skipping');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 [fetchMe] Fetching profile with token...');
      // ✅ Use authFetch here!
      const res = await authFetch(`${API}/api/profile/me`, {
        method: 'GET',
      });

      console.log('🔍 [fetchMe] Response status:', res.status);

      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }

      if (!res.ok) throw new Error('Not logged in');
      
      const data = await res.json();
      console.log('✅ [fetchMe] User loaded:', data.user?.email);
      setUser(data.user ?? data);
    } catch (error) {
      console.error('❌ [fetchMe] Error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const refreshUser = useCallback(() => fetchMe(), [fetchMe]);

  const login = async (email, password, selectedRole, adminCode) => {
    console.log('🔐 [login] Attempting login...');
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        email, 
        password, 
        role: selectedRole, 
        adminCode: adminCode || undefined 
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    
    if (data.token) {
      console.log('✅ [login] Saving token to localStorage');
      localStorage.setItem('token', data.token);
    }

    setUser(data.user ?? data);
    return data;
  };

  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        fullName, 
        email, 
        password, 
        adminCode: adminCode || undefined 
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }

    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    setUser(data.user ?? data);
    return data;
  };

  const logout = async () => {
    try {
      await authFetch(`${API}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      register, 
      logout, 
      loading, 
      refreshUser,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}