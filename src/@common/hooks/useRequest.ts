'use client';

import React from 'react';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '@/@common/utils/extract-error-message';

export const CANCEL_MESSAGE = 'canceled due to new request';

const useRequest = <T = unknown, Args extends unknown[] = unknown[]>(
  initiallyLoading?: boolean | null,
  func?: (...args: Args) => Promise<T>,
  onError?: (errMessage?: string, err?: unknown) => void,
) => {
  const notHandleLoading = initiallyLoading === null;
  const [loading, setLoading] = React.useState(initiallyLoading ?? false);
  const [error, setError] = React.useState<unknown>(null);
  const [data, setData] = React.useState<T | null>(null);
  const abortRef = React.useRef(new AbortController());

  const handleRequest = React.useCallback(
    async (
      fn: () => Promise<T>,
      errorCb?: (errMessage?: string, err?: unknown) => void,
    ): Promise<T | null> => {
      abortRef.current.abort(CANCEL_MESSAGE);
      abortRef.current = new AbortController();

      if (!notHandleLoading) setLoading(true);
      setError(null);
      try {
        const result = await fn();
        if (result && typeof result === 'object' && 'message' in result) {
          const msg = result.message;
          if (typeof msg === 'string' && msg.length > 0) {
            toast.success(msg);
          }
        }
        setData(result);
        return result;
      } catch (err) {
        if (
          err instanceof Error &&
          (err.message === CANCEL_MESSAGE || err.name === 'CanceledError')
        ) {
          return null;
        }
        const message = isAxiosError(err)
          ? extractErrorMessage(err)
          : err instanceof Error
            ? err.message
            : 'Error inesperado. Intenta de nuevo.';

        if (errorCb) {
          errorCb(message, err);
        } else if (onError) {
          onError(message, err);
        } else {
          toast.error(message, { autoClose: 5000 });
        }
        setError(err);
        return null;
      } finally {
        if (!notHandleLoading) setLoading(false);
      }
    },
    [notHandleLoading, onError],
  );

  const handler = async (...args: Args): Promise<T | null> => {
    if (func) return await handleRequest(() => func(...args));
    return null;
  };

  return { loading, error, data, handleRequest, handler, setData, abortRef };
};

export default useRequest;
