import { useState } from 'react'

export const useBoolean = (initialShow = false) => {
  const [active, setActive] = useState(initialShow)
  const on = () => setActive(true)
  const off = () => setActive(false)
  const toggle = () => setActive(!active)
  const set = (value: boolean) => setActive(value)

  return { active, setActive, on, off, toggle, set }
}
