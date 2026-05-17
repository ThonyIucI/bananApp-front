'use client';

import { Volume2 } from 'lucide-react';
import type { IGaiaHistoryMessage } from '../../../services/gaia.service';

interface MessageBubbleProps {
  message: IGaiaHistoryMessage;
}

/** Renders a single chat bubble. User messages align right, GaIA messages align left. */
export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3BB25E] text-xs font-bold text-white shadow-sm">
          G
        </div>
      )}

      <div
        className={[
          'group relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          'animate-message-in',
          isUser
            ? 'rounded-br-sm bg-[#3BB25E] text-white'
            : 'rounded-bl-sm bg-white text-gray-800 ring-1 ring-gray-100',
        ].join(' ')}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        {/* Placeholder audio button — activates in QW1.2 */}
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
      </div>
    </div>
  );
};
