import { IconButton } from '../shared/ui/IconButton'
import type { Theme } from './theme'
import { useTheme } from './useTheme'

const THEME_LABEL: Record<Theme, string> = {
  light: 'Dark mode',
  dark: 'Light mode',
}

const THEME_GLYPH = {
  light: MoonGlyph,
  dark: SunGlyph,
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const Glyph = THEME_GLYPH[theme]

  return (
    <IconButton label={THEME_LABEL[theme]} onClick={toggleTheme}>
      <Glyph />
    </IconButton>
  )
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 4.5A7.5 7.5 0 1 0 19.5 15 6 6 0 0 1 15 4.5Z" />
    </svg>
  )
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3.5" />
      <path strokeLinecap="round" d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
