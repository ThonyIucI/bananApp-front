'use client';

import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { verifyEmailRequest } from '../services/auth.service';
import type { TVerifyEmailPayload, TVerifyEmailResponse } from '../types/auth.types';

export const useVerifyEmail = () => {
  const { loading, handler } = useRequest<TVerifyEmailResponse, [TVerifyEmailPayload]>(
    false,
    async (payload) => {
      const { data } = await verifyEmailRequest(payload);
      toast.success('Email verificado correctamente');
      return data;
    },
  );

  return { loading, handler };
};
