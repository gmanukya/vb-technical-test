import { useEffect, useState, type ReactNode } from 'react'
import { nextTheme, persistTheme, readInitialTheme, ThemeContext, type Theme } from '../theme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = readInitialTheme()
    document.documentElement.classList.toggle('dark', initial === 'dark')
    
    return initial
  })

  useEffect(() => {
    persistTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => nextTheme(current))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
