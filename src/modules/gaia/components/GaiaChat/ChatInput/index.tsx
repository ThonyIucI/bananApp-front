'use client';

import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

/** Text input with send button. Enter submits (Shift+Enter = newline). Mic placeholder for QW1.3. */
export const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Escribe un mensaje..."
          rows={1}
          className={[
            'flex-1 resize-none rounded-xl border bg-gray-50 px-3 py-2.5 text-sm',
            'placeholder:text-gray-400 outline-none transition-colors',
            'max-h-32 min-h-[44px] overflow-y-auto',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'border-gray-200 focus:border-[#3BB25E] focus:bg-white focus:ring-2 focus:ring-[#3BB25E]/20',
          ].join(' ')}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        {/* Placeholder mic button — activates in QW1.3 */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled
          aria-label="Entrada de voz (disponible pronto)"
          className="hidden shrink-0 cursor-not-allowed opacity-40 sm:flex"
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          aria-label="Enviar mensaje"
          className="shrink-0 bg-[#3BB25E] hover:bg-[#2d9a4e] active:scale-[0.97] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span className="ml-1.5 sm:inline">Enviar</span>
        </Button>
      </div>
    </div>
  );
};
