'use client';

import { useEffect, useState } from 'react';
import { getTtsSettings, saveTtsSettings } from '@/@common/tts/settings';
import type { ITtsSettings } from '@/@common/tts/settings';

/**
 * Reactive hook for TTS settings persisted in localStorage.
 * Changes broadcast via CustomEvent so other instances on the same page stay in sync.
 */
export const useTtsSettings = () => {
  const [settings, setSettings] = useState<ITtsSettings>(getTtsSettings);

  useEffect(() => {
    const handler = (e: Event) => {
      setSettings((e as CustomEvent<ITtsSettings>).detail);
    };
    window.addEventListener('tts-settings-changed', handler);
    return () => window.removeEventListener('tts-settings-changed', handler);
  }, []);

  const update = (patch: Partial<ITtsSettings>) => {
    saveTtsSettings(patch);
  };

  return { ...settings, update };
};
