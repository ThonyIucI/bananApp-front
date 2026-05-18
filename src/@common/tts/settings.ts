'use client';

import { ETtsEngine, TTS_SETTINGS_KEY } from './constants';

export interface ITtsSettings {
  engine: ETtsEngine;
  autoRead: boolean;
}

const DEFAULT_SETTINGS: ITtsSettings = {
  engine: ETtsEngine.NATIVE,
  autoRead: false,
};

/** Reads TTS settings from localStorage. Returns defaults when unavailable. */
export const getTtsSettings = (): ITtsSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ITtsSettings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Persists TTS settings to localStorage and broadcasts a `tts-settings-changed`
 * CustomEvent so other hook instances on the same page update immediately.
 */
export const saveTtsSettings = (patch: Partial<ITtsSettings>): void => {
  const next = { ...getTtsSettings(), ...patch };
  try {
    localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // quota exceeded — ignore
  }
  window.dispatchEvent(new CustomEvent<ITtsSettings>('tts-settings-changed', { detail: next }));
};
