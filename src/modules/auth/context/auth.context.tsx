'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AuthUser } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'banan_at';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
        setAccessToken(parsed.token);
        setUser(parsed.user);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }
  }, []);

  const setSession = useCallback((user: AuthUser, accessToken: string) => {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      JSON.stringify({ token: accessToken, user }),
    );
    setUser(user);
    setAccessToken(accessToken);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        setSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return context;
}
