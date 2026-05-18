'use client';

import { isPiperCached, synthesizePiper } from '@/lib/piper';
import { ETtsEngine } from '../constants';
import { makeClipFromBlob } from './clipFromBlob';
import type { ITtsClip, ITtsEngine } from './types';

/**
 * TTS engine backed by Piper WASM (offline, Spanish female voice).
 * Synthesis runs in a Web Worker — non-blocking.
 * Uses an in-memory blob cache so repeated reads of the same segment don't re-synthesize.
 */
export const piperEngine: ITtsEngine = {
  id: ETtsEngine.PIPER,

  async isAvailable(): Promise<boolean> {
    return isPiperCached();
  },

  async synthesize(text: string, signal: AbortSignal, blobCache: Map<string, Blob>): Promise<ITtsClip> {
    if (signal.aborted) return makeClipFromBlob(new Blob());

    // Return cached blob if available — avoids re-running the WASM prediction
    const cached = blobCache.get(text);
    if (cached) return makeClipFromBlob(cached);

    const blob = await synthesizePiper(text);

    // Cache even if aborted (synthesis is done; costs nothing to keep)
    blobCache.set(text, blob);

    return makeClipFromBlob(blob);
  },
};
