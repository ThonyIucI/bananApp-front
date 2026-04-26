'use client';

import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import type { AuthUser } from '../types/auth.types';
import { AUTH_ROUTES } from '@/@common/constants/routes';
import { getProfileRequest } from '../services/auth.service';

const ACCESS_TOKEN_KEY = 'cultiv_at';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  sessionExpired: boolean;
  isSuperadmin: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  subPlotSessionExpired: () => void;
}

type State = {
  user: AuthUser | null;
  accessToken: string | null;
  sessionExpired: boolean;
  isInitialized: boolean;
  isSuperadmin: boolean;
};

type Action =
  | { type: 'INIT'; user: AuthUser | null; accessToken: string | null }
  | { type: 'SET_SESSION'; user: AuthUser; accessToken: string }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SESSION_EXPIRED' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return { ...state, user: action.user, accessToken: action.accessToken, isInitialized: true };
    case 'SET_SESSION':
      return { user: action.user, accessToken: action.accessToken, isSuperadmin: action.user?.isSuperadmin, sessionExpired: false, isInitialized: true };
    case 'CLEAR_SESSION':
      return { user: null, accessToken: null, sessionExpired: false, isInitialized: true, isSuperadmin: false };
    case 'SESSION_EXPIRED':
      return { ...state, sessionExpired: true };
  }
}

const AuthContext = createContext<AuthState | null>(null);

export { AUTH_ROUTES };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    accessToken: null,
    sessionExpired: false,
    isInitialized: false,
    isSuperadmin: false,
  });

  useEffect(() => {
    // TODO: manage localStora using store (with get, set, remove...)
    // TODO: use zustand to manage persistance and general data as: coooperatives, users, etc.
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!stored) {
      dispatch({ type: 'INIT', user: null, accessToken: null });
      return;
    }

    let token: string | null = null;
    try {
      const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
      token = parsed.token ?? null;
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      dispatch({ type: 'INIT', user: null, accessToken: null });
      return;
    }

    if (!token) {
      dispatch({ type: 'INIT', user: null, accessToken: null });
      return;
    }

    // Always fetch fresh profile on init to ensure cooperatives are up to date
    getProfileRequest()
      .then((profile) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify({ token, user: profile }));
        dispatch({ type: 'INIT', user: profile, accessToken: token });
      })
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        dispatch({ type: 'INIT', user: null, accessToken: null });
      });
  }, []);

  useEffect(() => {
    const handler = () => dispatch({ type: 'SESSION_EXPIRED' });
    window.addEventListener('session:expired', handler);
    return () => window.removeEventListener('session:expired', handler);
  }, []);

  const setSession = useCallback((user: AuthUser, accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify({ token: accessToken, user }));
    dispatch({ type: 'SET_SESSION', user, accessToken });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  const subPlotSessionExpired = useCallback(() => {
    dispatch({ type: 'SESSION_EXPIRED' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: !!state.accessToken,
        isInitialized: state.isInitialized,
        sessionExpired: state.sessionExpired,
        isSuperadmin: state.isSuperadmin,
        setSession,
        clearSession,
        subPlotSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Returns the current auth context. Must be used inside AuthProvider. */
export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within <AuthProvider>');
  return context;
}
