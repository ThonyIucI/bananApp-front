'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  statsWeeklyRequest,
  StatsWeeklyResponse,
  StatsOverviewFilters,
} from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches weekly bundling stats for the last N weeks.
 * Optionally filtered by enfundador or plotIds.
 * Call handler(cooperativeId, weeks?, enfundadorUserId?, filters?) in the component's useEffect.
 */
export const useStatsWeekly = () => {
  const { loading, data, handleRequest } = useRequest<StatsWeeklyResponse>();

  const handler = async (
    cooperativeId: string,
    weeks = 8,
    enfundadorUserId?: string,
    filters?: StatsOverviewFilters,
  ): Promise<StatsWeeklyResponse | null> =>
    handleRequest(() => statsWeeklyRequest(cooperativeId, weeks, enfundadorUserId, filters));

  return { loading, data, handler };
};
