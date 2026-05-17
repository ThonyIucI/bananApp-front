'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import useRequest from '@/@common/hooks/useRequest';
import { sendGaiaMessageRequest } from '../services/gaia.service';
import { GAIA_PLAN_LIMITS, type TGaiaPlan } from '../constants';
import type { IGaiaHistoryMessage } from '../services/gaia.service';

const STORAGE_KEY = 'gaia_chat_v1';

const QUOTA_EXCEEDED_MESSAGE =
  'Has alcanzado tu límite diario de interacciones con GaIA. Actualiza tu plan para continuar.';

/** Local message with optional error state for retry UI. */
export interface ILocalGaiaMessage {
  id: string;
  role: IGaiaHistoryMessage['role'];
  text: string;
  /** True when the send failed and the message can be retried. */
  error?: boolean;
}

const readStorage = (): ILocalGaiaMessage[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ILocalGaiaMessage[]) : [];
  } catch {
    return [];
  }
};

const writeStorage = (messages: ILocalGaiaMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage quota exceeded — not critical
  }
};

/** Builds the history array to send to the API (only clean sent messages). */
const toApiHistory = (messages: ILocalGaiaMessage[]): IGaiaHistoryMessage[] =>
  messages
    .filter((m) => !m.error)
    .map(({ role, text }) => ({ role, text }));

/**
 * Manages a GaIA conversation with local persistence, context trimming,
 * error state per message, and retry support.
 */
export const useGaiaConversation = (plan: TGaiaPlan = 'free') => {
  const [messages, setMessages] = useState<ILocalGaiaMessage[]>(readStorage);
  const [remaining, setRemaining] = useState<number | null>(null);
  const sendingIdRef = useRef<string | null>(null);

  const { loading, handleRequest } = useRequest(false);

  useEffect(() => {
    writeStorage(messages);
  }, [messages]);

  const updateMessage = useCallback((id: string, patch: Partial<ILocalGaiaMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }, []);

  const send = useCallback(
    async (text: string, existingId?: string) => {
      const id = existingId ?? crypto.randomUUID();
      sendingIdRef.current = id;

      const userMessage: ILocalGaiaMessage = { id, role: 'user', text, error: false };

      setMessages((prev) => {
        const withoutExisting = prev.filter((m) => m.id !== id);
        return [...withoutExisting, userMessage];
      });

      const contextLimit = GAIA_PLAN_LIMITS[plan].contextMessages;

      await handleRequest(
        async () => {
          const currentMessages = readStorage();
          const cleanHistory = toApiHistory(currentMessages.filter((m) => m.id !== id));
          const trimmedHistory = cleanHistory.slice(-contextLimit);

          const { data } = await sendGaiaMessageRequest({ text, history: trimmedHistory });

          const assistantMessage: ILocalGaiaMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: data?.reply.text ?? '',
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (data?.usage != null) {
            setRemaining(data.usage.remaining);
          }

          return data;
        },
        (errMessage, err) => {
          // Mark the user message as errored instead of removing it
          updateMessage(id, { error: true });

          const status = isAxiosError(err) ? err.response?.status : null;

          if (status === 429) {
            toast.error(QUOTA_EXCEEDED_MESSAGE, { autoClose: 6000 });
            setRemaining(0);
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: QUOTA_EXCEEDED_MESSAGE,
              },
            ]);
          } else {
            toast.error(
              errMessage ?? 'GaIA no está disponible en este momento. Intenta de nuevo.',
              { autoClose: 5000 },
            );
          }
        },
      );
    },
    [plan, handleRequest, updateMessage],
  );

  /** Retries a previously failed user message by its id. */
  const retry = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.role !== 'user') return;
      send(message.text, messageId);
    },
    [messages, send],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setRemaining(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, remaining, send, retry, clearChat, loading };
};
