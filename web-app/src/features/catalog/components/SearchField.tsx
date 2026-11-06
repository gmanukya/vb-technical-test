import type { ChangeEvent } from 'react'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <label className="flex min-w-0 flex-1 flex-col">
      <span className="sr-only">Search by name</span>
      <input
        type="search"
        value={value}
        onChange={update}
        placeholder="Search the dex"
        className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-ink outline-none placeholder:text-muted focus-visible:border-ink"
      />
    </label>
  )
}
