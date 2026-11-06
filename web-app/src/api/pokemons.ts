import axios from 'axios'
import type { Pokemon } from '../types/pokemon'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export async function fetchPokemonList(): Promise<Pokemon[]> {
  const response = await axios.get<{ pokemons: Pokemon[] }>(`${API_URL}/pokemons`)
  return response.data.pokemons
}
