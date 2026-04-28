/**
 * client/src/context/AuthContext.jsx
 * ------------------------------------
 * Global auth state — stores JWT token and decoded user from localStorage.
 * Exposes login(), logout(), and the user object to all child components.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sv_token') || null);
  const [user, setUser]   = useState(() => {
    try {
      const stored = localStorage.getItem('sv_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Normalise: legacy sessions before portal field was added default to 'student'
      if (parsed && !parsed.portal) parsed.portal = 'student';
      return parsed;
    } catch {
      return null;
    }
  });

  const login = useCallback((tokenStr, userData) => {
    localStorage.setItem('sv_token', tokenStr);
    localStorage.setItem('sv_user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
