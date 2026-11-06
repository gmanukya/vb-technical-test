import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { chunk } from '../lib/chunk'
import type { CardModel } from '../lib/filterPokemons'
import { useColumnCount } from '../hooks/useColumnCount'
import { EmptyCatalog } from './EmptyCatalog'
import { PokemonRow } from './PokemonRow'

interface PokemonGridProps {
  cards: CardModel[]
  onToggle: (id: number) => void
  filtersActive: boolean
  onClearFilters: () => void
  layoutKey: string
}

export function PokemonGrid(props: PokemonGridProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const columns = useColumnCount(listRef)
  const rows = chunk(props.cards, columns)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const node = listRef.current

    if (!node) {
      return
    }
    
    setScrollMargin(node.offsetTop)
  }, [props.layoutKey, props.cards.length, columns])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 340,
    overscan: 4,
    scrollMargin,
  })

  const frameStyle = { height: `${virtualizer.getTotalSize()}px` }
  const rowElements: ReactNode[] = []

  for (const virtualRow of virtualizer.getVirtualItems()) {
    const row = rows[virtualRow.index]

    if (!row) {
      continue
    }

    rowElements.push(
      <PokemonRow
        key={virtualRow.key}
        cards={row}
        columns={columns}
        onToggle={props.onToggle}
        index={virtualRow.index}
        start={virtualRow.start - scrollMargin}
        measureRef={virtualizer.measureElement}
      />,
    )
  }

  return (
    <div ref={listRef} className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6">
      <GridBody
        empty={props.cards.length === 0}
        filtersActive={props.filtersActive}
        onClearFilters={props.onClearFilters}
        frameStyle={frameStyle}
        rowElements={rowElements}
      />
    </div>
  )
}

interface GridBodyProps {
  empty: boolean
  filtersActive: boolean
  onClearFilters: () => void
  frameStyle: CSSProperties
  rowElements: ReactNode[]
}

function GridBody({ empty, filtersActive, onClearFilters, frameStyle, rowElements }: GridBodyProps) {
  if (empty) {
    return <EmptyCatalog filtersActive={filtersActive} onClear={onClearFilters} />
  }

  return (
    <div className="relative w-full" style={frameStyle}>
      {rowElements}
    </div>
  )
}
