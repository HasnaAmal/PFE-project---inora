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

  // ✅ CRITICAL: authFetch function that adds token to all requests
  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    // Handle 401 - token expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login?expired=true');
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  }, [router]);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/profile/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }

      if (!res.ok) throw new Error('Not logged in');
      
      const data = await res.json();
      setUser(data.user ?? data);
    } catch (error) {
      console.error('fetchMe error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const refreshUser = useCallback(() => fetchMe(), [fetchMe]);

  const login = async (email, password, selectedRole, adminCode) => {
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
    
    // ✅ Save token to localStorage
    if (data.token) {
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
      authFetch  // ✅ Export authFetch so other components can use it
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