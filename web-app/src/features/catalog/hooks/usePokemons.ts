import { useCallback, useEffect, useState } from 'react'

import { fetchPokemonList } from '../../../api/pokemons'
import type { Pokemon } from '../../../shared/types/pokemon'

type LoadStatus = 'loading' | 'error' | 'ready'

export function usePokemons() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const reload = useCallback(async () => {
    setStatus('loading')
    
    try {
      setPokemons(await fetchPokemonList())
      setStatus('ready')
    } catch {
      setPokemons([])
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { pokemons, status, reload }
}
