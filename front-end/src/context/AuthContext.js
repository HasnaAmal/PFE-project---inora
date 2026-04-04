'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ⚠️ MODIFICATION 1: N7eydo getToken (ma3adch localStorage)
  // const getToken = () => {
  //   return localStorage.getItem('token');
  // };

  // ⚠️ MODIFICATION 2: authFetch mbeddel (ma3adch yjib token mn localStorage)
  const authFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include', // ← HAD CHI KAYB3AT L COOKIE AUTOMATIQUEMENT
      headers: {
        'Content-Type': 'application/json',
        // ⚠️ N7EYDO had l Authorization (cookie fiha token)
        // ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
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

  // ⚠️ MODIFICATION 3: LOGIN (n7eydo localStorage)
  const login = async (email, password, selectedRole, adminCode) => {
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
    
    // ⚠️ COMMENTI HADI (ma3adch nkhzno token f localStorage)
    // if (data.token) {
    //   localStorage.setItem('token', data.token);
    // }
    
    setUser(data.user ?? data);
    return data;
  };

  // ⚠️ MODIFICATION 4: REGISTER (n7eydo localStorage)
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
    
    // ⚠️ COMMENTI HADI (register ma3adch kayrj3 token)
    // if (data.token) {
    //   localStorage.setItem('token', data.token);
    // }
    
    setUser(data.user ?? data);
    return data;
  };

  // ⚠️ MODIFICATION 5: LOGOUT (n7eydo localStorage)
  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    // ⚠️ COMMENTI HADI (cookie kaytms7 mn backend)
    // localStorage.removeItem('token');
    setUser(null);
    router.push('/');     // ← redirect to landing page
    router.refresh();     // ← force re-render so Navbar/DraftBanner reset
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, login, register, logout, loading, refreshUser, 
      authFetch, // ⚠️ getToken m7yodi (ma3adch mawjod)
      // getToken // ← N7EYDO HADI (optionnel)
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