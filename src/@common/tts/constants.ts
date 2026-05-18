/** Available TTS engine modes. */
export enum ETtsEngine {
  NATIVE = 'native',
  PIPER = 'piper',
  GEMINI = 'gemini',
}

export const ttsEngineLabels: Record<ETtsEngine, string> = {
  [ETtsEngine.NATIVE]: 'Voz del dispositivo',
  [ETtsEngine.PIPER]: 'Voz integrada (offline)',
  [ETtsEngine.GEMINI]: 'Voz premium (Gemini)',
};

/** localStorage key for persisted TTS settings. */
export const TTS_SETTINGS_KEY = 'gaia_tts_settings_v1';

/**
 * Maximum characters per TTS segment.
 * Long lines are split at sentence boundaries to keep per-segment synthesis fast.
 */
export const MAX_SEGMENT_CHARS = 200;

/** Number of segments to pre-synthesize ahead of the current playing segment. */
export const SEGMENT_LOOKAHEAD = 1;
