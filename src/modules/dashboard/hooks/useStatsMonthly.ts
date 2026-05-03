'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  statsMonthlyRequest,
  StatsMonthlyResponse,
  StatsOverviewFilters,
} from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches monthly bundling stats for the last N months.
 * Optionally filtered by plotIds for role-scoped views.
 * Call handler(cooperativeId, months?, filters?) in the component's useEffect.
 */
export const useStatsMonthly = () => {
  const { loading, data, handleRequest } = useRequest<StatsMonthlyResponse>();

  const handler = async (
    cooperativeId: string,
    months = 12,
    filters?: StatsOverviewFilters,
  ): Promise<StatsMonthlyResponse | null> =>
    handleRequest(() => statsMonthlyRequest(cooperativeId, months, filters));

  return { loading, data, handler };
};
