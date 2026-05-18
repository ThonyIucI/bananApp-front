'use client';

/** Returns true if the Web Speech TTS API is available in this browser. */
export const isTtsSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Returns voices available on this device, optionally filtered by language prefix (e.g. 'es'). */
export const getAvailableVoices = (lang?: string): SpeechSynthesisVoice[] => {
  if (!isTtsSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return lang ? voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) : voices;
};

/**
 * Known name patterns associated with female voices per language prefix.
 * Used to score and rank voices when selecting the best female option.
 */
const FEMALE_VOICE_HINTS: Record<string, RegExp> = {
  es: /mónica|monica|paulina|laura|sabina|elena|maria|carla|isabel|helena|silvia|pilar|claudia|mujer|female|fem/i,
  en: /female|zira|hazel|susan|karen|samantha|victoria|moira|fiona|ava|allison|joanna|kimberly|kendra|ivy|siri|cortana/i,
  fr: /amélie|julie|mathilde|lucie|helena|audrey|female|fem/i,
  de: /anna|petra|klara|female|fem/i,
  pt: /female|vitoria|fernanda|fem/i,
  it: /female|fem|giulia|sofia/i,
  ru: /irina|female|fem/i,
};

/** Patterns that strongly indicate a male voice. */
const MALE_VOICE_HINTS = /\bmale\b|hombre|macho|\bdavid\b|\bjorge\b|\bcarlos\b|\bpablo\b|\bhans\b|\bmax\b|\bpierre\b|\bthomas\b|\bmarco\b/i;

/**
 * Detects a rough language prefix ('es', 'en', 'fr', etc.) from a text sample
 * using lightweight heuristics. Falls back to 'es' (GaIA is a Spanish product).
 */
export const detectLang = (text: string): string => {
  if (/[一-鿿぀-ゟ゠-ヿ]/.test(text)) return 'zh';
  if (/[Ѐ-ӿ]/.test(text)) return 'ru';
  if (/[ñ¿¡áéíóúü]/i.test(text)) return 'es';
  if (/[àâçèéêëîïôùûüÿœæ]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  if (/[àèìòùâêîôûãõ]/i.test(text)) return 'pt';
  return 'es';
};

/**
 * Picks the best female voice for the given language prefix.
 * Scoring: female-name hint (+2) > not male-name (-1 for male) > enhanced/premium (+1).
 * Falls back to any voice of that language, then any available voice.
 */
export const getBestFemaleVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (!isTtsSupported()) return null;
  const all = window.speechSynthesis.getVoices();
  if (all.length === 0) return null;

  const normalizedLang = lang.toLowerCase().split('-')[0].split('_')[0];
  const forLang = all.filter((v) => v.lang.toLowerCase().startsWith(normalizedLang));
  const pool = forLang.length > 0 ? forLang : all;

  const femaleHints = FEMALE_VOICE_HINTS[normalizedLang] ?? /female|mujer|fem/i;

  const scored = pool.map((v) => {
    let score = 0;
    if (femaleHints.test(v.name)) score += 2;
    if (MALE_VOICE_HINTS.test(v.name)) score -= 1;
    if (/enhanced|premium/i.test(v.name)) score += 1;
    return { v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.v ?? null;
};

export interface TSpeakOptions {
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

/** Stops any ongoing speech synthesis immediately. */
export const stopSpeaking = (): void => {
  if (isTtsSupported()) window.speechSynthesis.cancel();
};

/** Returns true if speech synthesis is currently playing. */
export const isSpeaking = (): boolean =>
  isTtsSupported() && window.speechSynthesis.speaking;
