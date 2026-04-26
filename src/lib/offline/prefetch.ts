import { apiClient } from '@/lib/api/client';
import type { PlotResponse } from '@/modules/plots/services/plot.service';
import type { PaginatedResponse } from '@/@common/types/api.types';
import { getDb, type PlotCacheItem, type SubPlotCacheItem } from './db';
import { syncPending } from './sync-manager';

const CACHE_TTL_MS = 4 * 60 * 60 * 1_000; // 4 hours
const META_KEY_LAST_PREFETCH = 'lastPrefetch';

const isCacheStale = async (cooperativeId: string): Promise<boolean> => {
  const db = await getDb();
  const meta = await db.get('metaCache', META_KEY_LAST_PREFETCH);
  if (!meta) return true;
  const age = Date.now() - new Date(meta.updatedAt).getTime();
  return age > CACHE_TTL_MS || (meta.value as string) !== cooperativeId;
};

/**
 * Downloads the user's accessible plots and their sub-plots into IndexedDB.
 * Called at login and after each successful sync.
 *
 * Skips the network call if the cache is fresh (< 4h) and cooperative unchanged.
 */
export const prefetchOfflineCache = async (
  cooperativeId: string,
  userId: string,
): Promise<void> => {
  if (!navigator.onLine) return;

  const stale = await isCacheStale(cooperativeId);
  if (!stale) return;

  try {
    // Fetch plots accessible to this user in the cooperative
    const res = await apiClient.get<PaginatedResponse<PlotResponse>>(
      `/users/${userId}/plots`,
      { params: { cooperativeId, limit: 500 } },
    );
    const plots: PlotResponse[] = res.data?.items ?? [];

    const db = await getDb();
    const tx = db.transaction(['plotsCache', 'subPlotsCache', 'metaCache'], 'readwrite');

    // Clear stale entries
    await tx.objectStore('plotsCache').clear();
    await tx.objectStore('subPlotsCache').clear();

    for (const p of plots) {
      const plotItem: PlotCacheItem = {
        id: p.id,
        name: p.name,
        sectorId: p.sector.id,
        sectorName: p.sector.name,
        areaHectares: p.areaHectares,
        cadastralCode: p.cadastralCode,
      };
      await tx.objectStore('plotsCache').put(plotItem);

      for (const sp of p.subPlots ?? []) {
        const subItem: SubPlotCacheItem = {
          id: sp.id,
          name: sp.name,
          plotId: p.id,
          areaHectares: sp.areaHectares,
        };
        await tx.objectStore('subPlotsCache').put(subItem);
      }
    }

    await tx.objectStore('metaCache').put({
      key: META_KEY_LAST_PREFETCH,
      value: cooperativeId,
      updatedAt: new Date().toISOString(),
    } as never);

    await tx.done;
  } catch {
    // Prefetch is best-effort — do not block the app if it fails
  }
};

/**
 * Called after a successful sync cycle: refreshes the plot cache
 * so the user's offline data stays up to date.
 */
export const postSyncRefresh = async (
  cooperativeId: string,
  userId: string,
): Promise<void> => {
  // Force stale so the next prefetch always refreshes after a sync
  try {
    const db = await getDb();
    await db.delete('metaCache', META_KEY_LAST_PREFETCH);
  } catch {
    // non-critical
  }
  await prefetchOfflineCache(cooperativeId, userId);
  await syncPending();
};
