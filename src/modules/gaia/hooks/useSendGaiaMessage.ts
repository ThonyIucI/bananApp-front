'use client';

import useRequest from '@/@common/hooks/useRequest';
import { sendGaiaMessageRequest, type SendGaiaMessagePayload } from '../services/gaia.service';

/** Sends a single message to GaIA. Returns loading state and the async handler. */
export const useSendGaiaMessage = () => {
  const { loading, handler } = useRequest(
    false,
    async (payload: SendGaiaMessagePayload) => {
      const { data } = await sendGaiaMessageRequest(payload);
      return data;
    },
  );

  return { loading, handler };
};
