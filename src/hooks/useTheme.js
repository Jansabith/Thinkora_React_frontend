import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

// Usage: const { theme, toggleTheme } = useTheme()
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme() must be used inside <ThemeProvider>')
  }
  return context
}
