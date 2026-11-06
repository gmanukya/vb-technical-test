import { useMemo, useState } from 'react'
import { filterPokemons } from '../filterPokemons'
import { useBattleStream } from '../hooks/useBattleStream'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePokemonSelection } from '../hooks/usePokemonSelection'
import { usePokemons } from '../hooks/usePokemons'
import { useTurnBattle } from '../hooks/useTurnBattle'
import { BattleLog } from './BattleLog'
import { Header } from './Header'
import { TurnLog } from './TurnLog'
import PokemonList from './PokemonList'
import { SearchBar } from './SearchBar'
import { SelectionBar } from './SelectionBar'
import { TypeFilters } from './TypeFilters'

const PokemonApp = () => {
  const { pokemons, status, reload } = usePokemons()
  const selection = usePokemonSelection()
  const battle = useBattleStream()
  const turns = useTurnBattle()
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const debouncedQuery = useDebouncedValue(query, 200)
  const searchQuery = query.trim() === '' ? '' : debouncedQuery

  const filtered = useMemo(
    () => filterPokemons(pokemons, searchQuery, types),
    [pokemons, searchQuery, types],
  )

  const selected = useMemo(
    () => selection.selectedIds.flatMap((id) => {
      const pokemon = pokemons.find((candidate) => candidate.id === id)
      return pokemon ? [pokemon] : []
    }),
    [pokemons, selection.selectedIds],
  )

  const filtersActive = query.trim().length > 0 || types.length > 0

  const toggleType = (type: string) => {
    setTypes((current) => (
      current.includes(type) ? current.filter((selectedType) => selectedType !== type) : [...current, type]
    ))
  }

  const clearFilters = () => {
    setQuery('')
    setTypes([])
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <div className="w-full text-center text-lg">Loading Pokemons...</div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <p className="text-lg">Could not load Pokemon.</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-full bg-amber-400 px-4 py-2 text-slate-900"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen flex-col bg-amber-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${battle.status !== 'idle' || turns.status !== 'idle' ? 'pb-[50vh]' : selected.length > 0 ? 'pb-28' : ''}`}>
      <div className="sticky top-0 z-20 bg-amber-50 dark:bg-slate-900">
        <Header />
        <div className="flex flex-col gap-3 border-b border-amber-200 px-4 py-4 dark:border-slate-700">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SearchBar value={query} onChange={setQuery} />
            <div className="flex items-center gap-3 text-sm">
              <p aria-live="polite">{filtered.length} of {pokemons.length}</p>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="underline">
                  Clear filters
                </button>
              )}
            </div>
          </div>
          <TypeFilters selected={types} onToggle={toggleType} />
        </div>
      </div>
      <PokemonList
        pokemons={filtered}
        selectedIds={selection.selectedIds}
        selectionFull={selection.isFull}
        onToggle={selection.toggle}
        onClearFilters={clearFilters}
        filtersActive={filtersActive}
      />
      {battle.status !== 'idle' && (
        <BattleLog
          text={battle.text}
          status={battle.status}
          error={battle.error}
          onCancel={battle.cancel}
          onClose={battle.close}
          onRetry={battle.retry}
        />
      )}
      {turns.status !== 'idle' && (
        <TurnLog
          selected={selected}
          text={turns.text}
          rounds={turns.rounds}
          winnerId={turns.winnerId}
          status={turns.status}
          error={turns.error}
          onCancel={turns.cancel}
          onClose={turns.close}
        />
      )}
      <SelectionBar
        selected={selected}
        fighting={battle.status === 'streaming'}
        turnsBusy={turns.status === 'streaming'}
        onRemove={selection.remove}
        onClear={selection.clear}
        onFight={() => {
          turns.close()
          void battle.start(selection.selectedIds)
        }}
        onTurns={() => {
          battle.close()
          void turns.start(selection.selectedIds)
        }}
      />
    </div>
  )
}

export default PokemonApp
