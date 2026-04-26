import { useEffect, useState } from 'react'

export const useMediaQueryScreen = (query = '(min-width: 576px)') => {
  const [mQuery, setMQuery] = useState({
    matches: window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    mediaQuery.addEventListener('change', setMQuery)

    return () => mediaQuery.removeEventListener('change', setMQuery)
  }, [])

  const status = Boolean(mQuery && mQuery.matches)

  return status
}
