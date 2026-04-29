import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CreateBundlingPayload } from '@/modules/bundlings/services/bundling.service';

// ─── Sync status ─────────────────────────────────────────────────────────────

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/** Classifies why a sync item failed — drives retry vs terminal decision. */
export type ErrorKind = 'backend' | 'network' | 'unknown';

// ─── Stored types ─────────────────────────────────────────────────────────────

export interface QueuedBundling {
  /** Matches the `localUuid` field sent to the API — acts as idempotency key. */
  localUuid: string;
  payload: CreateBundlingPayload;
  status: SyncStatus;
  attempts: number;
  /** Backend errors are terminal; network/unknown errors are retried with backoff. */
  errorKind?: ErrorKind;
  lastError?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface PlotCacheItem {
  id: string;
  name: string;
  sectorId: string;
  sectorName: string;
  areaHectares: number | null;
  cadastralCode: string | null;
}

export interface SubPlotCacheItem {
  id: string;
  name: string;
  plotId: string;
  areaHectares: number | null;
}

export interface RibbonCalendarCacheItem {
  key: string; // `${coopId}:${year}`
  cooperativeId: string;
  year: number;
  startColorIndex: number;
}

export interface MetaCacheValue {
  value: unknown;
  updatedAt: string;
}

// ─── DB Schema ───────────────────────────────────────────────────────────────

interface CultivDb extends DBSchema {
  bundlingsQueue: {
    key: string; // localUuid
    value: QueuedBundling;
    indexes: { 'by-status': SyncStatus };
  };
  plotsCache: {
    key: string; // plotId
    value: PlotCacheItem;
  };
  subPlotsCache: {
    key: string; // subPlotId
    value: SubPlotCacheItem;
    indexes: { 'by-plot': string };
  };
  ribbonCalendarCache: {
    key: string; // `${coopId}:${year}`
    value: RibbonCalendarCacheItem;
  };
  metaCache: {
    key: string;
    value: MetaCacheValue;
  };
}

const DB_NAME = 'cultiv-offline';
// Bumped to 2: added errorKind field to QueuedBundling
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<CultivDb> | null = null;

/** Singleton that opens (or returns the already-open) IndexedDB database. */
export const getDb = async (): Promise<IDBPDatabase<CultivDb>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CultivDb>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const queue = db.createObjectStore('bundlingsQueue', { keyPath: 'localUuid' });
        queue.createIndex('by-status', 'status');

        db.createObjectStore('plotsCache', { keyPath: 'id' });

        const subPlots = db.createObjectStore('subPlotsCache', { keyPath: 'id' });
        subPlots.createIndex('by-plot', 'plotId');

        db.createObjectStore('ribbonCalendarCache', { keyPath: 'key' });
        db.createObjectStore('metaCache', { keyPath: 'key' as never });
      }
      // v1→v2: errorKind is optional — existing records are valid without it (undefined = 'unknown')
    },
    blocked() {
      console.warn('[CultivDB] Upgrade blocked by another tab. Please reload all tabs.');
    },
    blocking() {
      dbInstance?.close();
      dbInstance = null;
    },
  });

  return dbInstance;
};

/** Purge bundlings with status "synced" older than 7 days. */
export const purgeSyncedBundlings = async (): Promise<void> => {
  const db = await getDb();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000).toISOString();
  const all = await db.getAllFromIndex('bundlingsQueue', 'by-status', 'synced');
  const tx = db.transaction('bundlingsQueue', 'readwrite');
  await Promise.all(
    all
      .filter((b) => (b.syncedAt ?? '') < cutoff)
      .map((b) => tx.store.delete(b.localUuid)),
  );
  await tx.done;
};
