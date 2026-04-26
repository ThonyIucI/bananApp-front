import { getDb, purgeSyncedBundlings, type QueuedBundling } from './db';
import { createBundlingRequest } from '@/modules/bundlings/services/bundling.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYNC_CHANNEL = 'cultiv-sync';
const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;
const BACKOFF_DELAYS_MS = [5_000, 15_000, 45_000, 120_000, 300_000];
const AUTO_SYNC_INTERVAL_MS = 30_000;

export interface SyncState {
  pendingCount: number;
  failedCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
}

// ─── Broadcast helpers ────────────────────────────────────────────────────────

/** Broadcast current sync state to all tabs via BroadcastChannel. */
const broadcast = (state: SyncState) => {
  try {
    const ch = new BroadcastChannel(SYNC_CHANNEL);
    ch.postMessage(state);
    ch.close();
  } catch {
    // BroadcastChannel unavailable in some older environments — ignore silently
  }
};

/** Subscribe to SyncState updates from other tabs. Returns unsubscribe fn. */
export const subscribeSyncState = (cb: (state: SyncState) => void): (() => void) => {
  let ch: BroadcastChannel;
  try {
    ch = new BroadcastChannel(SYNC_CHANNEL);
    ch.onmessage = (e: MessageEvent<SyncState>) => cb(e.data);
  } catch {
    return () => {};
  }
  return () => ch.close();
};

// ─── State helpers ────────────────────────────────────────────────────────────

let _isSyncing = false;
let _lastSyncAt: string | null = null;

const buildState = async (): Promise<SyncState> => {
  const db = await getDb();
  const [pending, failed] = await Promise.all([
    db.countFromIndex('bundlingsQueue', 'by-status', 'pending'),
    db.countFromIndex('bundlingsQueue', 'by-status', 'failed'),
  ]);
  return { pendingCount: pending, failedCount: failed, isSyncing: _isSyncing, lastSyncAt: _lastSyncAt };
};

const broadcastState = async () => broadcast(await buildState());

// ─── Core ops ─────────────────────────────────────────────────────────────────

/**
 * Enqueue a bundling for offline storage.
 * Stores it with status='pending' so syncPending() picks it up.
 */
export const enqueueBundling = async (item: QueuedBundling): Promise<void> => {
  const db = await getDb();
  await db.put('bundlingsQueue', item);
  await broadcastState();
};

/**
 * Read all queued bundlings (pending + failed) for offline display.
 * Includes synced items so the user sees today's registrations.
 */
export const getQueuedBundlings = async (): Promise<QueuedBundling[]> => {
  const db = await getDb();
  const all = await db.getAll('bundlingsQueue');
  // Most recent first
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/** Read current sync state without broadcasting. */
export const getSyncState = buildState;

// ─── Sync loop ────────────────────────────────────────────────────────────────

/**
 * Attempt to sync all pending/failed bundlings.
 * - Processes in batches of BATCH_SIZE
 * - Applies exponential backoff per item based on attempts
 * - Items exceeding MAX_ATTEMPTS are marked 'failed' permanently (until manually retried)
 */
export const syncPending = async (): Promise<void> => {
  if (_isSyncing || !navigator.onLine) return;

  const db = await getDb();

  const candidates: QueuedBundling[] = [
    ...(await db.getAllFromIndex('bundlingsQueue', 'by-status', 'pending')),
    ...(await db.getAllFromIndex('bundlingsQueue', 'by-status', 'failed')),
  ];

  if (candidates.length === 0) return;

  _isSyncing = true;
  await broadcastState();

  const batch = candidates.slice(0, BATCH_SIZE);

  for (const item of batch) {
    if (!navigator.onLine) break;

    // Respect exponential backoff — skip if not enough time has passed
    if (item.attempts > 0 && item.lastError) {
      const delay = BACKOFF_DELAYS_MS[Math.min(item.attempts - 1, BACKOFF_DELAYS_MS.length - 1)];
      const lastAttemptAt = item.syncedAt ?? item.createdAt;
      if (Date.now() - new Date(lastAttemptAt).getTime() < delay) continue;
    }

    // Mark as syncing
    await db.put('bundlingsQueue', { ...item, status: 'syncing' });

    try {
      await createBundlingRequest(item.payload);
      // Backend is idempotent via localUuid — safe to retry
      await db.put('bundlingsQueue', {
        ...item,
        status: 'synced',
        syncedAt: new Date().toISOString(),
        lastError: undefined,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de sincronización';
      const nextAttempts = item.attempts + 1;
      await db.put('bundlingsQueue', {
        ...item,
        status: nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
        attempts: nextAttempts,
        lastError: errorMsg,
        syncedAt: new Date().toISOString(),
      });
    }
  }

  _isSyncing = false;
  _lastSyncAt = new Date().toISOString();

  await purgeSyncedBundlings();
  await broadcastState();
};

// ─── Auto-trigger setup ───────────────────────────────────────────────────────

let _intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize auto-sync listeners. Safe to call multiple times — idempotent.
 * - Syncs on "online" event
 * - Syncs every 30s while the tab is visible
 */
export const initAutoSync = (): (() => void) => {
  const onOnline = () => syncPending();

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') syncPending();
  };

  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Start interval only when tab is visible
  if (_intervalId === null) {
    _intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') syncPending();
    }, AUTO_SYNC_INTERVAL_MS);
  }

  return () => {
    window.removeEventListener('online', onOnline);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (_intervalId !== null) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  };
};
