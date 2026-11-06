import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'theme'

export function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // Private browsing can block storage. Fall through to the system preference.
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function persistTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // The class on the document is enough for this visit.
  }
}

export function nextTheme(theme: Theme): Theme {
  if (theme === 'light') {
    return 'dark'
  }
  
  return 'light'
}
