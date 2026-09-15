import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

const STORAGE_KEY = 'lms_theme'
const PREFERENCES = ['light', 'dark', 'system']

function readSavedPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return PREFERENCES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Light / dark mode. "system" follows the computer's setting and updates when it changes.
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readSavedPreference)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const theme = preference === 'system' ? systemTheme : preference

  // The CSS variables in styles/tokens.css switch on this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setPreference = useCallback((value) => {
    setPreferenceState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Saving can fail in private windows; the theme still works for this visit.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  const value = useMemo(() => ({ theme, preference, setPreference, toggleTheme }), [theme, preference, setPreference, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
