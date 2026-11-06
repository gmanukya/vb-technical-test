import { useMemo } from 'react'

import type { Pokemon } from '../../shared/types/pokemon'
import { battleBusy, hitLines, winnerName, winnerText } from '../battle/lib/battleCopy'
import { matchFighters, storyFighters } from '../battle/lib/fighterModel'
import { MatchStage } from '../battle/components/MatchStage'
import { StoryStage } from '../battle/components/StoryStage'
import { useBattleStream } from '../battle/hooks/useBattleStream'
import { useTurnBattle } from '../battle/hooks/useTurnBattle'
import { catalogClassName } from './lib/catalogClassName'
import { buildCatalog } from './lib/filterPokemons'
import { CatalogHeader } from './components/CatalogHeader'
import { PokemonGrid } from './components/PokemonGrid'
import { useCatalogFilters } from './hooks/useCatalogFilters'
import { SelectionDock } from '../selection/components/SelectionDock'
import { usePokemonSelection } from '../selection/hooks/usePokemonSelection'
import { dockIsVisible, selectedPokemons, selectionReady, selectionSlots } from '../selection/lib/selectionModel'

interface CatalogReadyProps {
  pokemons: Pokemon[]
}

export function CatalogReady({ pokemons }: CatalogReadyProps) {
  const selection = usePokemonSelection()
  const battle = useBattleStream()
  const turns = useTurnBattle()
  const filters = useCatalogFilters()
  const selected = selectedPokemons(pokemons, selection.selectedIds)
  const cards = useMemo(
    () => buildCatalog(pokemons, filters.searchQuery, filters.types, filters.sort, selection.selectedIds),
    [pokemons, filters.searchQuery, filters.types, filters.sort, selection.selectedIds],
  )
  const slots = selectionSlots(selected)
  const visible = dockIsVisible(selected.length)
  const ready = selectionReady(selected.length)
  const busy = battleBusy(battle.status, turns.status)
  const lines = hitLines(turns.rounds)
  const winner = winnerText(turns.winnerId, winnerName(turns.rounds, turns.winnerId))
  const storyViews = storyFighters(selected)
  const matchViews = matchFighters(selected, turns.rounds, turns.winnerId, turns.status)
  const pageClassName = catalogClassName(visible)

  const onStory = () => {
    turns.close()
    void battle.start(selection.selectedIds)
  }

  const onMatch = () => {
    battle.close()
    void turns.start(selection.selectedIds)
  }

  return (
    <div className={pageClassName}>
      <CatalogHeader
        query={filters.query}
        onQueryChange={filters.setQuery}
        types={filters.types}
        onToggleType={filters.toggleType}
        onClear={filters.clear}
        filtersActive={filters.active}
        sort={filters.sort}
        onSortChange={filters.setSort}
        shown={cards.length}
        total={pokemons.length}
      />
      <PokemonGrid
        cards={cards}
        onToggle={selection.toggle}
        filtersActive={filters.active}
        onClearFilters={filters.clear}
        layoutKey={filters.layoutKey}
      />
      <SelectionDock
        visible={visible}
        slots={slots}
        ready={ready}
        busy={busy}
        onRemove={selection.remove}
        onClear={selection.clear}
        onStory={onStory}
        onMatch={onMatch}
      />
      <StoryStage
        status={battle.status}
        text={battle.text}
        error={battle.error}
        fighters={storyViews}
        onCancel={battle.cancel}
        onClose={battle.close}
        onRetry={battle.retry}
      />
      <MatchStage
        status={turns.status}
        text={turns.text}
        error={turns.error}
        fighters={matchViews}
        lines={lines}
        winner={winner}
        onCancel={turns.cancel}
        onClose={turns.close}
      />
    </div>
  )
}
