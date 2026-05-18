'use client';

import { useMemo } from 'react';
import { Volume2, VolumeX, RotateCcw, AlertCircle } from 'lucide-react';
import { MarkdownText } from '@/@common/components/MarkdownText';
import { splitIntoSegments } from '@/@common/tts/segments';
import type { ILocalGaiaMessage } from '../../../hooks/useGaiaConversation';
import type { ITtsControl } from '@/@common/hooks/useTextToSpeech';

interface MessageBubbleProps {
  message: ILocalGaiaMessage;
  onRetry?: (id: string) => void;
  tts?: ITtsControl;
}

/** Renders a single chat bubble. User messages align right, GaIA messages align left. */
export const MessageBubble = ({ message, onRetry, tts }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const hasError = !!message.error;
  const isAssistant = message.role === 'assistant';
  const reading = tts?.isReadingId(message.id) ?? false;

  // Memoize segments so the same split is shared by both MarkdownText and TTS calls
  const segments = useMemo(
    () => (isAssistant ? splitIntoSegments(message.text) : []),
    [isAssistant, message.text],
  );

  const activeSegmentIndex = reading ? (tts?.activeSegmentIndex ?? null) : null;

  const handlePlaySegment = (index: number) => {
    tts?.readFromSegment(message.text, message.id, index);
  };

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3BB25E] text-xs font-bold text-white shadow-sm">
          G
        </div>
      )}

      <div className={`flex max-w-[75%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={[
            'group relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            'animate-message-in',
            isUser && !hasError
              ? 'rounded-br-sm bg-[#3BB25E] text-white'
              : isUser && hasError
                ? 'rounded-br-sm bg-red-50 text-red-800 ring-1 ring-red-200'
                : 'rounded-bl-sm bg-white text-gray-800 ring-1 ring-gray-100',
          ].join(' ')}
        >
          {isAssistant && !hasError ? (
            <MarkdownText
              text={message.text}
              activeSegmentIndex={activeSegmentIndex}
              onPlaySegment={segments.length > 1 ? handlePlaySegment : undefined}
            />
          ) : (
            <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
          )}

          {/* Global audio button — reads the whole message from the start */}
          {isAssistant && !hasError && tts && (
            <button
              type="button"
              onClick={() => tts.read(message.text, message.id)}
              aria-label={reading ? 'Detener lectura' : 'Escuchar mensaje'}
              title={reading ? 'Detener lectura' : 'Escuchar mensaje'}
              className={[
                'absolute -bottom-2 -right-7',
                'flex h-11 w-11 items-center justify-center rounded-full shadow-sm',
                'bg-white ring-1 transition-all duration-150',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                reading
                  ? 'scale-110 animate-pulse ring-[#3BB25E] text-[#3BB25E]'
                  : 'ring-gray-200 text-gray-400 hover:text-[#3BB25E] hover:ring-[#3BB25E] active:scale-95',
              ].join(' ')}
            >
              {reading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        {hasError && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-red-500">Error al enviar</span>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-[#3BB25E] transition-colors hover:bg-[#3BB25E]/10 active:scale-[0.97]"
              >
                <RotateCcw className="h-3 w-3" />
                Reintentar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
