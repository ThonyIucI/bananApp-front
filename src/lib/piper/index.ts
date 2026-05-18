'use client';

import * as tts from '@diffusionstudio/vits-web';

/** Female Spanish voice, high quality (~63 MB). */
export const PIPER_VOICE_ID: tts.VoiceId = 'es_MX-claude-high';

/** Approximate download size shown to the user. */
export const PIPER_VOICE_SIZE_MB = 63;

/** Returns true if the Piper voice model is already cached in OPFS. */
export const isPiperCached = async (): Promise<boolean> => {
  try {
    const stored = await tts.stored();     
    return stored.includes(PIPER_VOICE_ID);
  } catch {
    return false;
  }
};

/**
 * Downloads the Piper voice model to OPFS.
 * Reports progress as a 0–100 integer via `onProgress`.
 */
export const downloadPiper = async (onProgress: (pct: number) => void): Promise<void> => {
  await tts.download(PIPER_VOICE_ID, (progress) => {
    const pct = progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;
    onProgress(pct);
  });
};

/** Removes the Piper voice model from OPFS. */
export const uninstallPiper = async (): Promise<void> => {
  await tts.remove(PIPER_VOICE_ID);
};

/**
 * Synthesizes `text` with Piper and returns the raw audio Blob.
 * Callers are responsible for creating and managing the Audio element.
 * Runs in a Web Worker — non-blocking.
 */
export const synthesizePiper = async (text: string): Promise<Blob> => {
  return tts.predict({ text, voiceId: PIPER_VOICE_ID });
};
