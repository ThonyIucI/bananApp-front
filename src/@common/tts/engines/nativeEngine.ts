'use client';

import { getBestFemaleVoice, detectLang, isTtsSupported, stopSpeaking } from '@/@common/utils/tts';
import { ETtsEngine } from '../constants';
import type { ITtsClip, ITtsEngine } from './types';

/** Creates a playable clip from a SpeechSynthesisUtterance. Synthesis is instant for native TTS. */
const makeNativeClip = (utterance: SpeechSynthesisUtterance): ITtsClip => ({
  play(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }

      const onAbort = () => {
        stopSpeaking();
        resolve();
      };

      utterance.onend = () => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      };

      utterance.onerror = () => {
        signal.removeEventListener('abort', onAbort);
        resolve(); // resolve so queue continues; non-critical native errors shouldn't halt the whole queue
      };

      signal.addEventListener('abort', onAbort, { once: true });
      window.speechSynthesis.speak(utterance);
    });
  },
  cancel() {
    stopSpeaking();
  },
});

/**
 * TTS engine backed by the browser's native Web Speech API (SpeechSynthesis).
 * Synthesis is instantaneous — no pre-computation needed.
 * Automatically selects the best female voice for the detected language.
 */
export const nativeEngine: ITtsEngine = {
  id: ETtsEngine.NATIVE,

  async isAvailable(): Promise<boolean> {
    if (!isTtsSupported()) return false;
    // Voices may load asynchronously on first call — check if any are available
    const voices = window.speechSynthesis.getVoices();
    return voices.length > 0;
  },

  synthesize(text: string, _signal: AbortSignal, _blobCache: Map<string, Blob>): Promise<ITtsClip> {
    const lang = detectLang(text);
    const voice = getBestFemaleVoice(lang);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 1.05;
    return Promise.resolve(makeNativeClip(utterance));
  },
};
