import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clsx (condiciones) con tailwind-merge (evita clases duplicadas/conflictivas)
export function cn(...inputs: (string | undefined)[]) {
  return twMerge(clsx(inputs))
}
