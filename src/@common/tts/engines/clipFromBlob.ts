'use client';

import type { ITtsClip } from './types';

/**
 * Wraps a Blob into a playable ITtsClip.
 * Creates a fresh Audio element + object URL on each play() call so the clip can be replayed.
 * Never touches `audio.src` on cleanup — doing so triggers a browser `error` event.
 */
export const makeClipFromBlob = (blob: Blob): ITtsClip => {
  let currentAudio: HTMLAudioElement | null = null;

  return {
    play(signal: AbortSignal): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
          resolve();
          return;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;

        const cleanup = () => {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          URL.revokeObjectURL(url);
          currentAudio = null;
        };

        const onAbort = () => {
          cleanup();
          resolve();
        };

        audio.onended = () => {
          signal.removeEventListener('abort', onAbort);
          cleanup();
          resolve();
        };

        audio.onerror = () => {
          signal.removeEventListener('abort', onAbort);
          cleanup();
          reject(new Error('Audio playback failed'));
        };

        signal.addEventListener('abort', onAbort, { once: true });

        audio.play().catch((err: unknown) => {
          signal.removeEventListener('abort', onAbort);
          cleanup();
          reject(err instanceof Error ? err : new Error('play() failed'));
        });
      });
    },

    cancel() {
      if (currentAudio) {
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.pause();
        currentAudio = null;
      }
    },
  };
};
