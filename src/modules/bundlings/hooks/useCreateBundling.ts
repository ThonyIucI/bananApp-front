'use client';

import useRequest from '@/@common/hooks/useRequest';
import { enqueueBundling } from '@/lib/offline/sync-manager';
import { toast } from 'react-toastify';
import { ApiError } from '@/lib/api/client';
import {
  createBundlingRequest,
  isBundlingArray,
  type CreateBundlingPayload,
  type BundlingResponse,
  type SubPlotEntryPayload,
} from '../services/bundling.service';

/**
 * Creates one or multiple bundling records.
 *
 * Single mode (no subPlotEntries):
 *   - Online → POST → BundlingResponse
 *   - Offline → enqueue 1 item → synthetic BundlingResponse
 *
 * Multi mode (subPlotEntries present):
 *   - Online → 1 POST with array → BundlingResponse[]
 *   - Offline → enqueue N items (one per entry) → synthetic BundlingResponse[]
 *
 * Network errors while online are treated as offline (item(s) enqueued).
 */
export const useCreateBundling = (): {
  loading: boolean;
  handler: (payload: CreateBundlingPayload) => Promise<BundlingResponse | BundlingResponse[] | null>;
} => {
  const { loading, handler } = useRequest<
    BundlingResponse | BundlingResponse[] | null,
    [CreateBundlingPayload]
  >(false, async (payload) => {
    const isMulti = (payload.subPlotEntries?.length ?? 0) > 0;
    const isOnline = navigator.onLine;

    if (isMulti) {
      return isOnline
        ? handleMultiOnline(payload)
        : handleMultiOffline(payload);
    }
    return isOnline ? handleSingleOnline(payload) : handleSingleOffline(payload);
  });

  return { loading, handler };
};

// ─── Single mode ──────────────────────────────────────────────────────────────

const handleSingleOnline = async (
  payload: CreateBundlingPayload,
): Promise<BundlingResponse | null> => {
  try {
    const result = await createBundlingRequest(payload);
    const single = isBundlingArray(result) ? result[0] : result;

    await enqueueBundling({
      localUuid: payload.localUuid!,
      payload: payload as Required<Pick<CreateBundlingPayload, 'localUuid'>> & CreateBundlingPayload,
      status: 'synced',
      attempts: 0,
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    }).catch(() => {});

    toast.success(`Enfunde registrado: ${single.quantity} fundas en ${single.plot.name}`, {
      autoClose: 5000,
    });
    return single;
  } catch (err) {
    if (err instanceof ApiError && err.status >= 400) {
      toast.error(err.message, { autoClose: 7000 });
      return null;
    }
    return handleSingleOffline(payload);
  }
};

const handleSingleOffline = async (
  payload: CreateBundlingPayload,
): Promise<BundlingResponse> => {
  await enqueueBundling({
    localUuid: payload.localUuid!,
    payload: payload as Required<Pick<CreateBundlingPayload, 'localUuid'>> & CreateBundlingPayload,
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
  navigator.vibrate?.(200);
  toast.info('Guardado offline. Se sincronizará al volver la conexión.', { autoClose: 5000 });
  return buildOfflineResponse(payload);
};

// ─── Multi mode ───────────────────────────────────────────────────────────────

const handleMultiOnline = async (
  payload: CreateBundlingPayload,
): Promise<BundlingResponse[] | null> => {
  try {
    const result = await createBundlingRequest(payload);
    const arr = isBundlingArray(result) ? result : [result];

    await Promise.all(
      arr.map((b, i) => {
        const entry = payload.subPlotEntries![i];
        return enqueueBundling({
          localUuid: b.localUuid,
          payload: buildEntryPayload(payload, entry),
          status: 'synced',
          attempts: 0,
          createdAt: new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        }).catch(() => {});
      }),
    );

    toast.success(`${arr.length} enfundes registrados`, { autoClose: 5000 });
    return arr;
  } catch (err) {
    if (err instanceof ApiError && err.status >= 400) {
      toast.error(err.message, { autoClose: 7000 });
      return null;
    }
    return handleMultiOffline(payload);
  }
};

const handleMultiOffline = async (
  payload: CreateBundlingPayload,
): Promise<BundlingResponse[]> => {
  const entries = payload.subPlotEntries!;
  const results: BundlingResponse[] = [];

  for (const entry of entries) {
    const singlePayload = buildEntryPayload(payload, entry);
    await enqueueBundling({
      localUuid: entry.localUuid,
      payload: singlePayload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
    });
    results.push(buildOfflineResponse(singlePayload));
  }

  navigator.vibrate?.(200);
  toast.info(
    `${entries.length} enfundes guardados offline. Se sincronizarán al volver la conexión.`,
    { autoClose: 5000 },
  );
  return results;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reconstructs a single-mode payload from a multi-mode entry. */
const buildEntryPayload = (
  base: CreateBundlingPayload,
  entry: SubPlotEntryPayload,
): CreateBundlingPayload => ({
  cooperativeId: base.cooperativeId,
  plotId: base.plotId,
  bundledAt: base.bundledAt,
  subPlotId: entry.subPlotId,
  enfundadorUserId: entry.enfundadorUserId,
  quantity: entry.quantity,
  localUuid: entry.localUuid,
  ribbonColorFree: entry.ribbonColorFree,
  ribbonCalendarId: entry.ribbonCalendarId,
  notes: entry.notes,
});

/** Builds a synthetic BundlingResponse from a single-mode payload for optimistic UI. */
const buildOfflineResponse = (payload: CreateBundlingPayload): BundlingResponse => ({
  id: payload.localUuid!,
  quantity: payload.quantity ?? 0,
  bundledAt: payload.bundledAt,
  ribbonColorFree: payload.ribbonColorFree ?? null,
  ribbonCalendar: null,
  notes: payload.notes ?? null,
  localUuid: payload.localUuid!,
  syncedAt: null,
  createdAt: new Date().toISOString(),
  plot: { id: payload.plotId, name: '' },
  subPlot: null,
  enfundadorUser: { id: payload.enfundadorUserId ?? '', fullName: '' },
});
