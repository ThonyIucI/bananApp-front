'use client';

import useRequest from '@/@common/hooks/useRequest';
import { listCooperativesRequest } from '../services/cooperative.service';

export const useListCooperatives = () => {
  const { loading, data, handler } = useRequest(
    false,
    async () => listCooperativesRequest(),
  );

  return { loading, data, handler };
};
