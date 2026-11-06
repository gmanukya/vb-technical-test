import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import type { Pokemon } from '../types/pokemon'
import PokemonList from './PokemonList'
import { Header } from './Header'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

type LoadStatus = 'loading' | 'error' | 'ready'

const PokemonApp = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const loadPokemon = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await axios.get<{ pokemon: Pokemon }>(`${API_URL}/pokemons/1`)
      setPokemon(response.data.pokemon)
      setStatus('ready')
    } catch {
      setPokemon(null)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void loadPokemon()
  }, [loadPokemon])

  if (status === 'loading') {
    return (
      <div className="flex items-center h-screen bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <div className="text-lg text-center w-full">Loading Pokemons...</div>
      </div>
    )
  }

  if (status === 'error' || !pokemon) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <p className="text-lg">Could not load Pokemon.</p>
        <button
          type="button"
          onClick={() => void loadPokemon()}
          className="rounded-full bg-amber-400 px-4 py-2 text-slate-900"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 flex flex-col items-center min-h-screen">
      <Header />
      <PokemonList pokemons={[pokemon]} />
    </div>
  )
}

export default PokemonApp
