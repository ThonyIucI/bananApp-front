'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { initAutoSync, syncPending } from './sync-manager';

interface OfflineContextValue {
  /** Trigger a manual sync cycle. */
  syncNow: () => void;
}

const OfflineContext = createContext<OfflineContextValue>({ syncNow: () => {} });

/** Access the offline context. Components rarely need this directly — prefer `usePendingSync`. */
export const useOfflineContext = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: React.ReactNode;
}

/**
 * Initialises the offline infrastructure at app startup:
 * - Registers online/visibility auto-sync listeners
 * - Runs an immediate sync attempt on mount
 *
 * Mount outside `AuthProvider` is fine; the SyncManager guards against
 * unauthenticated API calls because the apiClient interceptor will get a 401
 * and the item stays in the queue for retry.
 */
export const OfflineProvider = ({ children }: OfflineProviderProps) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = initAutoSync();
    // Attempt to flush any stale queue items from a previous session
    syncPending().catch(() => {});

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const syncNow = () => syncPending().catch(() => {});

  return <OfflineContext.Provider value={{ syncNow }}>{children}</OfflineContext.Provider>;
};
