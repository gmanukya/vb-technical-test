import axios from 'axios'

import type { Pokemon } from '../shared/types/pokemon'

export async function fetchPokemonList(): Promise<Pokemon[]> {
  const response = await axios.get<{ pokemons: Pokemon[] }>('/pokemons')
  return response.data.pokemons
}
