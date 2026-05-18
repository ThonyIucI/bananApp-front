'use client';

import { useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { splitIntoSegments } from '@/@common/tts/segments';
import { parseInlineAst } from '@/@common/utils/markdown';
import type { TInlineNode } from '@/@common/utils/markdown';
import type { TTtsSegment } from '@/@common/tts/segments';

interface MarkdownTextProps {
  /** Raw text (may contain markdown). Segments are derived internally. */
  text: string;
  /** Index of the segment currently being spoken. null = not playing. */
  activeSegmentIndex: number | null;
  /** Called when user clicks the audio icon on a segment. */
  onPlaySegment?: (index: number) => void;
}

/** Renders inline AST nodes as styled React elements. */
const renderInlineNodes = (nodes: TInlineNode[], key: string) =>
  nodes.map((node, i) => {
    switch (node.type) {
      case 'bold':
        return <strong key={`${key}-${i}`} className="font-semibold">{node.content}</strong>;
      case 'italic':
        return <em key={`${key}-${i}`}>{node.content}</em>;
      case 'code':
        return (
          <code key={`${key}-${i}`} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-700">
            {node.content}
          </code>
        );
      default:
        return node.content;
    }
  });

const BULLET_RE = /^[-*•]\s+/;
const NUMBERED_RE = /^(\d+)\.\s+/;

/** Renders a single segment block: paragraph, bullet item, or numbered item. */
const SegmentBlock = ({
  segment,
  index,
  isActive,
  onPlay,
}: {
  segment: TTtsSegment;
  index: number;
  isActive: boolean;
  onPlay?: () => void;
}) => {
  const raw = segment.display;
  const isBullet = BULLET_RE.test(raw);
  const numberedMatch = NUMBERED_RE.exec(raw);
  const isNumbered = !!numberedMatch;

  const content = isBullet
    ? raw.replace(BULLET_RE, '')
    : isNumbered
      ? raw.replace(NUMBERED_RE, '')
      : raw;

  const inlineNodes = parseInlineAst(content);

  return (
    <div
      className={[
        'group/seg relative flex items-start gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors duration-300',
        isActive ? 'bg-[#3BB25E]/10 ring-1 ring-[#3BB25E]/25' : '',
      ].join(' ')}
    >
      {isBullet && (
        <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
      )}
      {isNumbered && (
        <span className="shrink-0 text-xs font-semibold leading-relaxed opacity-60">
          {numberedMatch[1]}.
        </span>
      )}

      <span className="flex-1 leading-relaxed">{renderInlineNodes(inlineNodes, `seg-${index}`)}</span>

      {onPlay && (
        <button
          type="button"
          onClick={onPlay}
          aria-label="Leer este fragmento"
          title="Leer este fragmento"
          className={[
            'ml-1 shrink-0 rounded p-0.5 transition-all duration-150',
            'text-current opacity-0 group-hover/seg:opacity-40 hover:opacity-80! active:scale-95',
          ].join(' ')}
        >
          <Volume2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

/**
 * Renders LLM markdown text as styled segments.
 * Each segment can highlight when being read and show an audio icon on hover.
 */
export const MarkdownText = ({ text, activeSegmentIndex, onPlaySegment }: MarkdownTextProps) => {
  const segments = useMemo(() => splitIntoSegments(text), [text]);

  if (segments.length === 0) {
    return <span className="leading-relaxed">{text}</span>;
  }

  return (
    <div className="space-y-0.5 text-sm">
      {segments.map((seg, i) => (
        <SegmentBlock
          key={i}
          segment={seg}
          index={i}
          isActive={activeSegmentIndex === i}
          onPlay={onPlaySegment ? () => onPlaySegment(i) : undefined}
        />
      ))}
    </div>
  );
};
