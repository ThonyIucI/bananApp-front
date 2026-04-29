'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getSyncState,
  subscribeSyncState,
  syncPending,
  type SyncState,
} from '../sync-manager';

const INITIAL_STATE: SyncState = {
  pendingCount: 0,
  failedCount: 0,
  isSyncing: false,
  lastSyncAt: null,
};

/**
 * Exposes real-time sync state: counts of pending/failed items, sync progress,
 * and a manual trigger. Stays in sync across browser tabs via BroadcastChannel.
 */
export const usePendingSync = (): SyncState & { syncNow: () => void } => {
  const [state, setState] = useState<SyncState>(INITIAL_STATE);

  // Load initial state from IDB on mount
  useEffect(() => {
    getSyncState().then(setState).catch(() => {});
  }, []);

  // Subscribe to cross-tab broadcasts
  useEffect(() => {
    return subscribeSyncState(setState);
  }, []);

  const syncNow = useCallback(() => {
    syncPending().catch(() => {});
  }, []);

  return { ...state, syncNow };
};
