'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  statsOverviewRequest,
  StatsOverviewFilters,
  StatsOverviewResponse,
} from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches KPI overview stats for the dashboard cards.
 * Call handler(cooperativeId, filters?) in the component's useEffect.
 */
export const useStatsOverview = () => {
  const { loading, data, handleRequest } = useRequest<StatsOverviewResponse>();

  const handler = async (
    cooperativeId: string,
    filters?: StatsOverviewFilters,
  ): Promise<StatsOverviewResponse | null> =>
    handleRequest(() => statsOverviewRequest(cooperativeId, filters));

  return { loading, data, handler };
};
