'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getToken = () => {
  return getCookie('token') || localStorage.getItem('token') || null;
};

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();

  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user ?? data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const refreshUser = useCallback(() => fetchMe(), [fetchMe]);

  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        role: selectedRole,
        adminCode: adminCode || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      const cookieToken = getCookie('token');
      if (cookieToken) localStorage.setItem('token', cookieToken);
    }

    setUser(data.user ?? data);
    return data;
  };

  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullName,
        email,
        password,
        adminCode: adminCode || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }

    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user ?? data);
    return data;
  };

  const logout = async () => {
    try {
      await authFetch(`${API}/api/auth/logout`, { method: 'POST' });
    } catch {}
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!authReady) return null;

  return (
    <AuthContext.Provider value={{
      user, setUser,
      login, register, logout,
      loading, authReady,
      refreshUser, authFetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}