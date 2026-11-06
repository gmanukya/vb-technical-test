import ThemeSwitcher from './ThemeSwitcher'

export function Header() {
  return (
    <header className="flex w-full items-center justify-between gap-4 bg-amber-100 px-4 py-4 text-slate-700 shadow-lg dark:bg-slate-800 dark:text-white sm:px-7 sm:py-6">
      <h1 className="font-thin text-4xl sm:text-5xl lg:text-7xl">PokeBattle</h1>
      <ThemeSwitcher />
    </header>
  )
}
