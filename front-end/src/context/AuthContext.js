'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

// 🔹 get cookie
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// 🔹 remove token
const removeToken = () => {
  localStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// 🔹 get token مع التحقق من الصلاحية
const getToken = () => {
  const token = getCookie('token') || localStorage.getItem('token') || null;
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // token expired
      removeToken();
      return null;
    }
  } catch (e) {
    console.error('Token parsing error:', e);
    removeToken();
    return null;
  }

  return token;
};

// 🔹 set token
const setToken = (token) => {
  if (!token) return;
  localStorage.setItem('token', token);
  document.cookie = `token=${token}; path=/; max-age=86400`; // 24 heures
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();

  // 🔹 fetch with auth header
  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    // معالجة 401
    if (response.status === 401) {
      removeToken();
      setUser(null);
      router.push('/login?expired=true');
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  }, [router]);

  // 🔹 fetch current user
  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setAuthReady(true);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        removeToken();
        setUser(null);
        router.push('/login');
        return;
      }

      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setUser(data.user ?? data);

    } catch (err) {
      console.error("fetchMe error:", err);
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

  // 🔹 login
  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    if (data.token) setToken(data.token);
    setUser(data.user ?? data);

    // refresh immediately
    await fetchMe();
    return data;
  };

  // 🔹 register
  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    if (data.token) setToken(data.token);
    setUser(data.user ?? data);

    await fetchMe();
    return data;
  };

  // 🔹 logout
  const logout = async () => {
    try {
      await authFetch(`${API}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    removeToken();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!authReady) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        authReady,
        refreshUser,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}