import { TypeSwatches } from '../../../shared/ui/TypeSwatches'
import type { CardModel } from '../lib/filterPokemons'
import { SlotMark } from './SlotMark'
import { StatList } from './StatList'

interface PokemonCardProps {
  card: CardModel
  onToggle: (id: number) => void
}

export function PokemonCard({ card, onToggle }: PokemonCardProps) {
  const plateStyle = {
    backgroundColor: 'var(--wash)',
    backgroundImage: card.wash,
  }
  const toggle = () => onToggle(card.id)

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={card.disabled}
      aria-pressed={card.selected}
      aria-label={card.ariaLabel}
      className={card.className}
    >
      <span className="text-[11px] tracking-[0.18em] text-muted">{card.dexLabel}</span>
      <SlotMark mark={card.slotMark} />
      <span className="mt-3 flex h-36 items-center justify-center rounded-xl" style={plateStyle}>
        <img src={card.image} alt="" className="h-28 w-28 object-contain" loading="lazy" decoding="async" />
      </span>
      <span className="mt-4 block font-display text-2xl leading-none tracking-tight">{card.name}</span>
      <span className="mt-3 block">
        <TypeSwatches types={card.types} />
      </span>
      <StatList stats={card.stats} />
    </button>
  )
}
