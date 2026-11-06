import type { Pokemon } from '../types/pokemon'
import Card from './Card'

interface PokemonListProps {
  pokemons: Pokemon[]
}

const PokemonList = ({ pokemons }: PokemonListProps) => {
  if (pokemons.length === 0) {
    return (
      <div className="flex items-center">
        <div className="text-lg text-center w-full">No Pokemon found</div>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-10 place-items-center w-full">
      {pokemons.map((pokemon) => (
        <Card key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  )
}

export default PokemonList
