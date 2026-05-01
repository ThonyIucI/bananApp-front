'use client';

import useRequest from '@/@common/hooks/useRequest';
import { statsMonthlyRequest, StatsMonthlyResponse } from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches monthly bundling stats for the last N months.
 * Call handler(cooperativeId, months?) in the component's useEffect.
 */
export const useStatsMonthly = () => {
  const { loading, data, handleRequest } = useRequest<StatsMonthlyResponse>();

  const handler = async (cooperativeId: string, months = 12): Promise<StatsMonthlyResponse | null> =>
    handleRequest(() => statsMonthlyRequest(cooperativeId, months));

  return { loading, data, handler };
};
