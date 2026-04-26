import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Hook to detect clicks outside of a component
 * @param handler - Callback function to execute on outside click
 * @returns ref - Ref to attach to the component
 *
 * @example
 * const ref = useClickOutside(() => setIsOpen(false))
 * return <div ref={ref}>...</div>
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (!element || element.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler, ref])

  return ref
}
