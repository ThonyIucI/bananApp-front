'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import useRequest from '@/@common/hooks/useRequest';
import { sendGaiaMessageRequest } from '../services/gaia.service';
import { GAIA_PLAN_LIMITS, type TGaiaPlan } from '../constants';
import type { IGaiaHistoryMessage } from '../services/gaia.service';

const QUOTA_EXCEEDED_MESSAGE =
  'Has alcanzado tu límite diario de interacciones con GaIA. Actualiza tu plan para continuar.';

/**
 * Manages a stateless GaIA conversation: local message history, quota tracking,
 * context trimming, and 429 error handling.
 */
export const useGaiaConversation = (plan: TGaiaPlan = 'free') => {
  const [messages, setMessages] = useState<IGaiaHistoryMessage[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);

  const { loading, handleRequest } = useRequest<IGaiaHistoryMessage[] | null>(false);

  const send = async (text: string) => {
    const userMessage: IGaiaHistoryMessage = { role: 'user', text };
    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);

    const contextLimit = GAIA_PLAN_LIMITS[plan].contextMessages;
    const trimmedHistory = messages.slice(-contextLimit);

    await handleRequest(
      async () => {
        const { data } = await sendGaiaMessageRequest({
          text,
          history: trimmedHistory,
        });

        const assistantMessage: IGaiaHistoryMessage = {
          role: 'assistant',
          text: data?.reply.text ?? '',
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data?.usage != null) {
          setRemaining(data.usage.remaining);
        }

        return [...optimisticMessages, assistantMessage];
      },
      (errMessage, err) => {
        const status = isAxiosError(err) ? err.response?.status : null;

        if (status === 429) {
          toast.error(QUOTA_EXCEEDED_MESSAGE, { autoClose: 6000 });
          setRemaining(0);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: QUOTA_EXCEEDED_MESSAGE,
            },
          ]);
        } else {
          toast.error(errMessage ?? 'GaIA no está disponible en este momento. Intenta de nuevo.', {
            autoClose: 5000,
          });
          // Remove the optimistic user message on failure
          setMessages(messages);
        }
      },
    );
  };

  const clearChat = () => {
    setMessages([]);
    setRemaining(null);
  };

  return { messages, remaining, send, clearChat, loading };
};
