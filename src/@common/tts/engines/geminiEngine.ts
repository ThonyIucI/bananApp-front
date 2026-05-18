'use client';

import { gaiaTtsRequest } from '@/modules/gaia/services/gaia-tts.service';
import { ETtsEngine } from '../constants';
import { makeClipFromBlob } from './clipFromBlob';
import type { ITtsClip, ITtsEngine } from './types';

/** Converts a base64-encoded PCM audio string to a WAV Blob. */
const pcmBase64ToWavBlob = (base64: string, mimeType: string): Blob => {
  const lower = mimeType.toLowerCase();
  const isPcm = lower.startsWith('audio/pcm') || lower.startsWith('audio/l16');

  if (!isPcm) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mimeType });
  }

  const rateMatch = /rate=(\d+)/.exec(mimeType);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  const binary = atob(base64);
  const pcmBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) pcmBytes[i] = binary.charCodeAt(i);

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * TTS engine backed by Gemini TTS API (server-side, premium voice).
 * Requires the user to be on Pro or ProMax plan — the backend enforces this.
 * Synthesized blobs are cached in the session cache to avoid redundant API calls.
 */
export const geminiEngine: ITtsEngine = {
  id: ETtsEngine.GEMINI,

  async isAvailable(): Promise<boolean> {
    return true;
  },

  async synthesize(
    text: string,
    signal: AbortSignal,
    blobCache: Map<string, Blob>,
  ): Promise<ITtsClip> {
    if (signal.aborted) return makeClipFromBlob(new Blob());

    const cacheKey = `gemini:${text}`;
    const cached = blobCache.get(cacheKey);
    if (cached) return makeClipFromBlob(cached);

    const { data: response } = await gaiaTtsRequest(text);
    if (signal.aborted) return makeClipFromBlob(new Blob());

    const blob = pcmBase64ToWavBlob(response.data, response.mimeType);
    blobCache.set(cacheKey, blob);

    return makeClipFromBlob(blob);
  },
};
