import { formatPokemonName } from '../formatName'
import { typeIconUrl } from '../pokemonTypes'
import type { Pokemon } from '../types/pokemon'
import { TypeIcons } from './TypeIcons'

interface CardProps {
  pokemon: Pokemon
  selected: boolean
  disabled: boolean
  onToggle: (id: number) => void
}

const Card = ({ pokemon, selected, disabled, onToggle }: CardProps) => {
  const name = formatPokemonName(pokemon.name)
  const types = pokemon.apiTypes.map((type) => ({
    name: type.name,
    image: typeIconUrl(type.name) ?? '',
  }))

  return (
    <button
      type="button"
      onClick={() => onToggle(pokemon.id)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? 'Deselect' : 'Select'} ${name}`}
      className={`w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 p-1 text-left shadow-md outline-none focus-visible:ring-2 focus-visible:ring-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-amber-200 ${
        selected ? 'ring-2 ring-amber-600 ring-offset-2 ring-offset-amber-50 dark:ring-offset-slate-900' : ''
      }`}
    >
      <div className="rounded-2xl bg-gradient-to-br from-black/10 via-white/70 to-black/10 dark:from-white/10 dark:via-slate-900/80 dark:to-white/10">
        <div className="flex flex-col rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="font-bold">{name}</div>
            <TypeIcons types={types} />
          </div>
          <img
            className="my-3 h-32 w-full bg-white object-contain outline outline-2 dark:bg-blue-950"
            src={pokemon.image}
            alt=""
            loading="lazy"
          />
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div>HP: {pokemon.stats.HP}</div>
            <div>Attack: {pokemon.stats.attack}</div>
            <div>Defense: {pokemon.stats.defense}</div>
            <div>Speed: {pokemon.stats.speed}</div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default Card
