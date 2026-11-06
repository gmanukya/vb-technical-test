import type { ChangeEvent } from 'react'

import { readSort, type SortKey } from '../lib/filterPokemons'

interface SortSelectProps {
  value: SortKey
  onChange: (sort: SortKey) => void
}

const SORTS: { value: SortKey, label: string }[] = [
  { value: 'dex', label: 'Dex' },
  { value: 'name', label: 'Name' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'speed', label: 'Speed' },
]

export function SortSelect({ value, onChange }: SortSelectProps) {
  const options = SORTS.map((sort) => (
    <option key={sort.value} value={sort.value}>{sort.label}</option>
  ))
  const change = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(readSort(event.target.value))
  }

  return (
    <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm">
      <span className="text-muted">Sort</span>
      <select value={value} onChange={change} className="bg-transparent text-ink outline-none">
        {options}
      </select>
    </label>
  )
}
