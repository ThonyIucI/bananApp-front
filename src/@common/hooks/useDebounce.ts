import { useEffect, useState } from 'react'

export const DEBOUNCE_TIME = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 150,
  SCROLL: 100
} as const

/**
 * Hook to debounce a value
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 *
 * useEffect(() => {
 *   // API call with debouncedSearch
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = DEBOUNCE_TIME.SEARCH): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
