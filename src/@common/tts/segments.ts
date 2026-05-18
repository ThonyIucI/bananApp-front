import { stripMarkdown } from '@/@common/utils/markdown';
import { MAX_SEGMENT_CHARS } from './constants';

/** A single TTS segment: `display` retains markdown for rendering, `spoken` is clean for TTS. */
export interface TTtsSegment {
  display: string;
  spoken: string;
}

const SENTENCE_TERMINATORS = /[.!?;:]/;
const MIN_SENTENCE_CHARS = 20;

/**
 * Splits a markdown text into small segments suitable for progressive TTS synthesis.
 * Rules:
 * 1. Split first at newlines / blank lines (each paragraph/list item is a natural break).
 * 2. Long lines (> MAX_SEGMENT_CHARS) are further split at sentence-terminator boundaries.
 * 3. Each segment carries both the original display text and the stripped spoken text.
 */
export const splitIntoSegments = (text: string): TTtsSegment[] => {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const segments: TTtsSegment[] = [];

  for (const line of lines) {
    if (line.length <= MAX_SEGMENT_CHARS) {
      segments.push({ display: line, spoken: stripMarkdown(line) });
      continue;
    }

    // Split long line at sentence terminators
    let start = 0;
    for (let i = 0; i < line.length; i++) {
      if (SENTENCE_TERMINATORS.test(line[i]) && i - start >= MIN_SENTENCE_CHARS) {
        const chunk = line.slice(start, i + 1).trim();
        if (chunk) segments.push({ display: chunk, spoken: stripMarkdown(chunk) });
        start = i + 1;
        while (start < line.length && line[start] === ' ') start++;
        i = start - 1;
      }
    }
    if (start < line.length) {
      const chunk = line.slice(start).trim();
      if (chunk) segments.push({ display: chunk, spoken: stripMarkdown(chunk) });
    }
  }

  return segments.filter((s) => s.spoken.trim().length > 0);
};
