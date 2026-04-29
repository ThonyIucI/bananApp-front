'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDb, type PlotCacheItem, type SubPlotCacheItem } from '../db';

interface OfflinePlotsState {
  plots: PlotCacheItem[];
  subPlotsByPlot: Record<string, SubPlotCacheItem[]>;
  isLoaded: boolean;
}

/**
 * Returns plots and sub-plots from the offline IndexedDB cache.
 * Falls back to an empty list (not an error) when the cache is cold.
 */
export const useOfflinePlots = (): OfflinePlotsState => {
  const [state, setState] = useState<OfflinePlotsState>({
    plots: [],
    subPlotsByPlot: {},
    isLoaded: false,
  });

  const load = useCallback(async () => {
    try {
      const db = await getDb();
      const [plots, allSubPlots] = await Promise.all([
        db.getAll('plotsCache'),
        db.getAll('subPlotsCache'),
      ]);

      const subPlotsByPlot: Record<string, SubPlotCacheItem[]> = {};
      for (const sp of allSubPlots) {
        (subPlotsByPlot[sp.plotId] ??= []).push(sp);
      }

      setState({ plots, subPlotsByPlot, isLoaded: true });
    } catch {
      setState((prev) => ({ ...prev, isLoaded: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return state;
};
