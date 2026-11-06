import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { usePokemons } from './hooks/usePokemons'
import { CatalogReady } from './CatalogReady'

export function CatalogPage() {
  const { pokemons, status, reload } = usePokemons()

  const retry = () => {
    void reload()
  }

  if (status === 'loading') {
    return <LoadingState />
  }

  if (status === 'error') {
    return <ErrorState onRetry={retry} />
  }
  
  return <CatalogReady pokemons={pokemons} />
}
