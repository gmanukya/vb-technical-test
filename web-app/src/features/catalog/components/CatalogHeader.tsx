import { useState } from 'react'

import { ThemeToggle } from '../../../app/ThemeToggle'
import type { SortKey } from '../lib/filterPokemons'
import { showCountLabel, typeMenuLabel } from '../lib/catalogClassName'
import { ActiveFilters } from './ActiveFilters'
import { ResultCount } from './ResultCount'
import { SearchField } from './SearchField'
import { SortSelect } from './SortSelect'
import { TypeMenu } from './TypeMenu'
import { TypeOptions } from './TypeOptions'
import { TypeSheet } from './TypeSheet'
import { Button } from '../../../shared/ui/Button'

interface CatalogHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  types: readonly string[]
  onToggleType: (type: string) => void
  onClear: () => void
  filtersActive: boolean
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  shown: number
  total: number
}

export function CatalogHeader(props: CatalogHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const menuLabel = typeMenuLabel(props.types.length)
  const countLabel = showCountLabel(props.shown)
  const openSheet = () => setSheetOpen(true)
  const closeSheet = () => setSheetOpen(false)

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-header backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">PokeBattle</h1>
          <ThemeToggle />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchField value={props.query} onChange={props.onQueryChange} />
          <div className="flex flex-wrap items-center gap-2">
            <div className="md:hidden">
              <Button tone="control" onClick={openSheet}>{menuLabel}</Button>
            </div>
            <div className="hidden md:block">
              <TypeMenu label={menuLabel}>
                <TypeOptions selected={props.types} onToggle={props.onToggleType} />
              </TypeMenu>
            </div>
            <SortSelect value={props.sort} onChange={props.onSortChange} />
            <ResultCount shown={props.shown} total={props.total} />
          </div>
        </div>
        <ActiveFilters
          types={props.types}
          onRemove={props.onToggleType}
          onClear={props.onClear}
          active={props.filtersActive}
        />
      </div>
      <TypeSheet open={sheetOpen} countLabel={countLabel} onClose={closeSheet}>
        <TypeOptions selected={props.types} onToggle={props.onToggleType} />
      </TypeSheet>
    </header>
  )
}
