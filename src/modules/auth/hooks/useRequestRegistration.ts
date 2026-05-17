'use client';

import useRequest from '@/@common/hooks/useRequest';
import { requestRegistrationRequest } from '../services/auth.service';
import type { TRequestRegistrationResponse } from '../types/auth.types';

/** Solicita el envío del código de verificación al email indicado. */
export const useRequestRegistration = () => {
  const { loading, handler } = useRequest<TRequestRegistrationResponse, [string]>(
    false,
    async (email) => {
      const res = await requestRegistrationRequest({ email });
      return res.data;
    },
  );

  return { loading, handler };
};
