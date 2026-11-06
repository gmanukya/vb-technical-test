import { formatPokemonName } from '../formatName'
import type { Pokemon } from '../types/pokemon'

interface SelectionBarProps {
  selected: Pokemon[]
  onRemove: (id: number) => void
  onClear: () => void
}

export function SelectionBar({ selected, onRemove, onClear }: SelectionBarProps) {
  if (selected.length === 0) {
    return null
  }

  const matchup = selected.map((pokemon) => formatPokemonName(pokemon.name)).join(' vs ')

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-500 bg-amber-400 text-slate-900 shadow-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="font-medium">
          {selected.length === 2 ? matchup : `${matchup} selected. Choose one more.`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((pokemon) => (
            <button
              key={pokemon.id}
              type="button"
              onClick={() => onRemove(pokemon.id)}
              className="rounded-full bg-slate-900 px-3 py-1 text-sm text-amber-50"
            >
              Remove {formatPokemonName(pokemon.name)}
            </button>
          ))}
          <button type="button" onClick={onClear} className="rounded-full px-3 py-1 text-sm underline">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
