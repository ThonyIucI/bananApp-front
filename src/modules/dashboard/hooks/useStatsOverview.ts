'use client';

import useRequest from '@/@common/hooks/useRequest';
import { statsOverviewRequest, StatsOverviewResponse } from '@/modules/bundlings/services/bundling.service';

/**
 * Fetches KPI overview stats for the dashboard cards.
 * Call handler(cooperativeId) in the component's useEffect.
 */
export const useStatsOverview = () => {
  const { loading, data, handleRequest } = useRequest<StatsOverviewResponse>();

  const handler = async (cooperativeId: string): Promise<StatsOverviewResponse | null> =>
    handleRequest(() => statsOverviewRequest(cooperativeId));

  return { loading, data, handler };
};
