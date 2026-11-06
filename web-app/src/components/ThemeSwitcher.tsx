import { IoIosMoon, IoIosSunny } from 'react-icons/io'
import { useTheme } from '../hooks/useTheme'

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'light' ? 'Dark mode' : 'Light mode'

  return (
    <button type="button" onClick={toggleTheme} aria-label={label} className="max-w-fit">
      <div className="flex items-center gap-2">
        {theme === 'light' ? <IoIosMoon /> : <IoIosSunny />}
        {label}
      </div>
    </button>
  )
}

export default ThemeSwitcher
