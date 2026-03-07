'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ add

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ add

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/me', { credentials: 'include' })
      .then(async res => {
        // ✅ handle suspended mid-session
        if (res.status === 403) {
          setUser(null);
          router.push('/login?suspended=true');
          return;
        }
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => { if (data) setUser(data.user || data); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email, password,
        role:      selectedRole,
        adminCode: adminCode || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed'); // ✅ fixed: throw real Error with message
    }
    const data = await res.json();
    setUser(data.user || data);
    return data;
  };

  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullName, email, password,
        adminCode: adminCode || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed'); // ✅ fixed too
    }
    const data = await res.json();
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST', credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
