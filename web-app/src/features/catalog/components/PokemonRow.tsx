import type { CardModel } from '../lib/filterPokemons'
import { PokemonCard } from './PokemonCard'

interface PokemonRowProps {
  cards: CardModel[]
  columns: number
  onToggle: (id: number) => void
  index: number
  start: number
  measureRef: (node: HTMLDivElement | null) => void
}

export function PokemonRow({ cards, columns, onToggle, index, start, measureRef }: PokemonRowProps) {
  const frameStyle = { transform: `translateY(${start}px)` }
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
  const items = cards.map((card) => (
    <PokemonCard key={card.id} card={card} onToggle={onToggle} />
  ))

  return (
    <div
      data-index={index}
      ref={measureRef}
      className="absolute left-0 top-0 w-full pb-4"
      style={frameStyle}
    >
      <div className="grid gap-4" style={gridStyle}>
        {items}
      </div>
    </div>
  )
}
