import { getDb, purgeSyncedBundlings, type QueuedBundling, type ErrorKind } from './db';
import { createBundlingRequest } from '@/modules/bundlings/services/bundling.service';
import { ApiError } from '@/lib/api/client';

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

const broadcast = (state: SyncState) => {
  try {
    const ch = new BroadcastChannel(SYNC_CHANNEL);
    ch.postMessage(state);
    ch.close();
  } catch {
    // BroadcastChannel unavailable in some older environments
  }
};

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

// ─── Error classification ─────────────────────────────────────────────────────

/**
 * Classifies a caught error to decide retry strategy.
 * - backend  : server returned 4xx/5xx — terminal, no retry
 * - network  : no connectivity or request never reached server — retry with backoff
 * - unknown  : anything else — retry acotado
 */
const classifyError = (err: unknown): ErrorKind => {
  if (err instanceof ApiError && err.status >= 400) return 'backend';
  if (
    !navigator.onLine ||
    (err instanceof Error &&
      (err.message.includes('Failed to fetch') ||
        err.message.includes('Network Error') ||
        err.message.includes('ERR_NETWORK') ||
        err.name === 'NetworkError'))
  ) {
    return 'network';
  }
  return 'unknown';
};

// ─── Core ops ─────────────────────────────────────────────────────────────────

/** Enqueue a bundling for offline storage. */
export const enqueueBundling = async (item: QueuedBundling): Promise<void> => {
  const db = await getDb();
  await db.put('bundlingsQueue', item);
  await broadcastState();
};

/** Read all queued bundlings (all statuses) for offline display. Most recent first. */
export const getQueuedBundlings = async (): Promise<QueuedBundling[]> => {
  const db = await getDb();
  const all = await db.getAll('bundlingsQueue');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/** Read current sync state without broadcasting. */
export const getSyncState = buildState;

/**
 * Reset a failed/pending item so it will be retried on the next sync cycle.
 * If online, triggers an immediate sync.
 */
export const retryItem = async (localUuid: string): Promise<void> => {
  const db = await getDb();
  const item = await db.get('bundlingsQueue', localUuid);
  if (!item) return;
  await db.put('bundlingsQueue', {
    ...item,
    status: 'pending',
    attempts: 0,
    errorKind: undefined,
    lastError: undefined,
  });
  await broadcastState();
  if (navigator.onLine) syncPending();
};

/** Permanently remove a queued item from IndexedDB without sending it to the server. */
export const removeItem = async (localUuid: string): Promise<void> => {
  const db = await getDb();
  await db.delete('bundlingsQueue', localUuid);
  await broadcastState();
};

// ─── Sync loop ────────────────────────────────────────────────────────────────

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

    // Backend errors are terminal — skip without retrying
    if (item.errorKind === 'backend') continue;

    // Respect exponential backoff for network/unknown errors
    if (item.attempts > 0 && item.lastError) {
      const delay = BACKOFF_DELAYS_MS[Math.min(item.attempts - 1, BACKOFF_DELAYS_MS.length - 1)];
      const lastAttemptAt = item.syncedAt ?? item.createdAt;
      if (Date.now() - new Date(lastAttemptAt).getTime() < delay) continue;
    }

    await db.put('bundlingsQueue', { ...item, status: 'syncing' });

    try {
      await createBundlingRequest(item.payload);
      await db.put('bundlingsQueue', {
        ...item,
        status: 'synced',
        syncedAt: new Date().toISOString(),
        lastError: undefined,
        errorKind: undefined,
      });
    } catch (err) {
      const kind = classifyError(err);
      const errorMsg = err instanceof Error ? err.message : 'Error de sincronización';
      const nextAttempts = item.attempts + 1;

      await db.put('bundlingsQueue', {
        ...item,
        // Backend errors are immediately terminal; network/unknown use backoff
        status: kind === 'backend' || nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
        attempts: nextAttempts,
        errorKind: kind,
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

export const initAutoSync = (): (() => void) => {
  const onOnline = () => syncPending();
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') syncPending();
  };

  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisibilityChange);

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
