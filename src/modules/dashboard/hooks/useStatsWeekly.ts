'use client';

import useRequest from '@/@common/hooks/useRequest';
import { statsWeeklyRequest, StatsWeeklyResponse } from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches weekly bundling stats for the last N weeks.
 * Optionally filtered by enfundador for the personal view.
 * Call handler(cooperativeId, weeks?, enfundadorUserId?) in the component's useEffect.
 */
export const useStatsWeekly = () => {
  const { loading, data, handleRequest } = useRequest<StatsWeeklyResponse>();

  const handler = async (
    cooperativeId: string,
    weeks = 8,
    enfundadorUserId?: string,
  ): Promise<StatsWeeklyResponse | null> =>
    handleRequest(() => statsWeeklyRequest(cooperativeId, weeks, enfundadorUserId));

  return { loading, data, handler };
};
