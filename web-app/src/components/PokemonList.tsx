import type { Pokemon } from '../types/pokemon'
import Card from './Card'

interface PokemonListProps {
  pokemons: Pokemon[]
  selectedIds: readonly number[]
  selectionFull: boolean
  onToggle: (id: number) => void
  onClearFilters: () => void
  filtersActive: boolean
}

const PokemonList = ({
  pokemons,
  selectedIds,
  selectionFull,
  onToggle,
  onClearFilters,
  filtersActive,
}: PokemonListProps) => {
  if (pokemons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-lg">No Pokémon match these filters.</p>
        {filtersActive && (
          <button type="button" onClick={onClearFilters} className="rounded-full bg-amber-400 px-4 py-2 text-slate-900">
            Clear filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 p-4">
      {pokemons.map((pokemon) => {
        const selected = selectedIds.includes(pokemon.id)
        return (
          <Card
            key={pokemon.id}
            pokemon={pokemon}
            selected={selected}
            disabled={selectionFull && !selected}
            onToggle={onToggle}
          />
        )
      })}
    </div>
  )
}

export default PokemonList
