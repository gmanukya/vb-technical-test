interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex flex-col gap-1 w-full max-w-md">
      <span className="text-sm">Search by name</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pikachu"
        className="rounded-full border border-amber-300 bg-white px-4 py-2 text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  )
}
