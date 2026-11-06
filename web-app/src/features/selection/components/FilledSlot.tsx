import type { SlotView } from '../lib/selectionModel'

interface FilledSlotProps {
  slot: SlotView
  onRemove: (id: number) => void
}

export function FilledSlot({ slot, onRemove }: FilledSlotProps) {
  const remove = () => {
    if (slot.pokemonId === null) {
      return
    }
    
    onRemove(slot.pokemonId)
  }

  return (
    <div className="flex min-h-[4.75rem] items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2">
      <img src={slot.image} alt="" className="h-12 w-12 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] tracking-[0.16em] text-muted">{slot.dexLabel}</p>
        <p className="truncate font-display text-base leading-tight sm:text-lg">{slot.name}</p>
      </div>
      <button
        type="button"
        onClick={remove}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-muted"
        aria-label={slot.removeLabel}
      >
        ×
      </button>
    </div>
  )
}
