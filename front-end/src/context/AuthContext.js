'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // MODIFIED: authFetch with Authorization header fallback
  const authFetch = async (url, options = {}) => {
    // Try to get token from cookie first, then localStorage
    let token = getCookie('token');
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    // ⚠️ ZID HAD CONSOLE.LOG
    console.log('🔑 [authFetch] URL:', url);
    console.log('🔑 [authFetch] Token exists:', token ? 'YES' : 'NO');
    if (token) {
      console.log('🔑 [authFetch] Token (first 20 chars):', token.substring(0, 20) + '...');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [authFetch] Authorization header added');
    } else {
      console.log('❌ [authFetch] No token found!');
    }
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  };

  const fetchMe = async () => {
    try {
      const res = await authFetch(`${API}/api/auth/me`);
      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user ?? data);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = () => fetchMe().catch(() => {});

  // MODIFIED: Login with localStorage fallback
  const login = async (email, password, selectedRole, adminCode) => {
    console.log('🔐 [login] Starting login...');
    
    const res = await fetch(`${API}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role: selectedRole, adminCode: adminCode || undefined }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    
    console.log('📦 [login] Response data:', data);
    console.log('🔑 [login] Token in response:', data.token ? 'YES' : 'NO');
    
    // Store token in localStorage as fallback for cross-domain
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ [login] Token stored in localStorage');
      console.log('🔑 [login] Stored token (first 20 chars):', data.token.substring(0, 20) + '...');
    } else {
      // Try to get token from cookie
      const tokenFromCookie = getCookie('token');
      console.log('🍪 [login] Token from cookie:', tokenFromCookie ? 'YES' : 'NO');
      if (tokenFromCookie) {
        localStorage.setItem('token', tokenFromCookie);
        console.log('✅ [login] Token from cookie stored in localStorage');
      } else {
        console.log('❌ [login] No token found anywhere!');
      }
    }
    
    // Verify token was stored
    const storedToken = localStorage.getItem('token');
    console.log('🔍 [login] Verify localStorage token:', storedToken ? 'YES' : 'NO');
    
    setUser(data.user ?? data);
    return data;
  };

  // MODIFIED: Register with localStorage fallback
  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password, adminCode: adminCode || undefined }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    
    // Store token if returned
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    setUser(data.user ?? data);
    return data;
  };

  // MODIFIED: Logout with localStorage cleanup
  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, login, register, logout, loading, refreshUser, 
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