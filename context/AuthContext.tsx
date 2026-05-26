'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '@/lib/apiClient';

interface AuthUser {
  _id: string;
  fullName: string;
  username: string;
  role: 'office' | 'factory' | 'admin';
  minDailyWorkHours: number;
  salaryPerDay: number;
  mobile: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token: string | null = null;
    try { token = localStorage.getItem('token'); } catch { /* ignore */ }
    try { if (!token) token = sessionStorage.getItem('token'); } catch { /* ignore */ }

    if (!token) { setLoading(false); return; }

    apiGet('/api/auth/me')
      .then((data) => {
        if (data && data._id) {
          setUser(data);
        } else {
          // Unexpected response shape — clear auth state
          try { localStorage.removeItem('token'); } catch { /* ignore */ }
          try { sessionStorage.removeItem('token'); } catch { /* ignore */ }
          setUser(null);
        }
      })
      .catch((err: any) => {
        // Only clear token on auth errors (401/403), not on transient network failures
        if (err?.status === 401 || err?.status === 403) {
          try { localStorage.removeItem('token'); } catch { /* ignore */ }
          try { sessionStorage.removeItem('token'); } catch { /* ignore */ }
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    try { localStorage.removeItem('role'); } catch { /* ignore */ }
    try { localStorage.removeItem('name'); } catch { /* ignore */ }
    try { sessionStorage.removeItem('token'); } catch { /* ignore */ }
    setUser(null);
    window.location.href = '/login';
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
