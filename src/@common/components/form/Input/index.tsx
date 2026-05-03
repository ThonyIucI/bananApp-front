'use client';

import { Badge } from '@/components/ui/badge';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isOptional?: boolean;
}

/** Styled text input with label and inline error message. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isOptional, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
          {label} {isOptional && <Badge variant="secondary" className='text-xs'>Opcional</Badge>}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={[
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900',
          'placeholder:text-gray-400 outline-none transition-colors',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 disabled:opacity-60 enabled:hover:border-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
