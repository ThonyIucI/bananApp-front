'use client';

import { Volume2, RotateCcw, AlertCircle } from 'lucide-react';
import type { ILocalGaiaMessage } from '../../../hooks/useGaiaConversation';

interface MessageBubbleProps {
  message: ILocalGaiaMessage;
  onRetry?: (id: string) => void;
}

/** Renders a single chat bubble. User messages align right, GaIA messages align left. */
export const MessageBubble = ({ message, onRetry }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const hasError = !!message.error;

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
          <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>

          {/* Placeholder audio button — activates in QW1.2 */}
          {!hasError && (
            <button
              type="button"
              disabled
              aria-label="Escuchar mensaje"
              className={[
                'absolute -bottom-2 opacity-0 transition-opacity group-hover:opacity-100',
                isUser ? '-left-7' : '-right-7',
                'flex h-6 w-6 items-center justify-center rounded-full shadow',
                'bg-white text-gray-400 ring-1 ring-gray-200',
                'cursor-not-allowed',
              ].join(' ')}
            >
              <Volume2 className="h-3 w-3" />
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
