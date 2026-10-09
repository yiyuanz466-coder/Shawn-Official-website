import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../lib/storage'

export type Theme = 'light' | 'dark'
const KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** index.html 的腳本已在渲染前設好 data-theme；這裡負責切換、記住，以及在沒有手動選擇時跟隨系統。 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) ?? systemTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => {
      const saved = readStorage(KEY)
      if (saved !== 'light' && saved !== 'dark') setTheme(systemTheme())
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    writeStorage(KEY, next)
    setTheme(next)
  }

  return { theme, toggle }
}
