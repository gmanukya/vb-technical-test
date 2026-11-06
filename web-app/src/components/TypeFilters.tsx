import { formatPokemonName } from '../formatName'
import { POKEMON_TYPES } from '../pokemonTypes'

interface TypeFiltersProps {
  selected: readonly string[]
  onToggle: (type: string) => void
}

export function TypeFilters({ selected, onToggle }: TypeFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible" role="group" aria-label="Filter by type">
      {POKEMON_TYPES.map((type) => {
        const isSelected = selected.includes(type.name)
        return (
          <button
            key={type.name}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(type.name)}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
              isSelected
                ? 'border-amber-500 bg-amber-400 text-slate-900'
                : 'border-amber-200 bg-white/80 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {formatPokemonName(type.name)}
          </button>
        )
      })}
    </div>
  )
}
