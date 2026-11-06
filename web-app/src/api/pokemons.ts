import axios from 'axios'
import type { Pokemon } from '../types/pokemon'
import { API_URL } from './client'

export async function fetchPokemonList(): Promise<Pokemon[]> {
  const response = await axios.get<{ pokemons: Pokemon[] }>(`${API_URL}/pokemons`)
  return response.data.pokemons
}
