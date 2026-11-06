import type { Pokemon } from '../types/pokemon'
import { TypeIcons } from './TypeIcons'

interface CardProps {
  pokemon: Pokemon | null
}

const Card = ({ pokemon }: CardProps) => {
  if (!pokemon) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 p-1 rounded-2xl w-full shadow-md outline-orange-400">
      <div className="rounded-2xl bg-gradient-to-br from-black/10 via-white/70 to-black/10 dark:from-white/10 dark:via-slate-900/80 dark:to-white/10">
        <div className="p-4 flex-col rounded-2xl">
          <div className="flex gap-3 justify-between">
            <div className="font-bold">{pokemon.name}</div>
            <div>HP: {pokemon.stats.HP}</div>
            <TypeIcons types={pokemon.apiTypes} />
          </div>
          <img
            className="bg-white dark:bg-blue-950 outline outline-2 my-3"
            src={pokemon.image}
            alt={pokemon.name}
            loading="lazy"
            style={{ width: 'auto' }}
          />
          <div>Attack: {pokemon.stats.attack}</div>
          <div>Defense: {pokemon.stats.defense}</div>
          <div>Speed: {pokemon.stats.speed}</div>
        </div>
      </div>
    </div>
  )
}

export default Card
