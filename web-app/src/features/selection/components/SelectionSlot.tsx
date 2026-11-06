import type { SlotView } from '../lib/selectionModel'
import { EmptySlot } from './EmptySlot'
import { FilledSlot } from './FilledSlot'

interface SelectionSlotProps {
  slot: SlotView
  onRemove: (id: number) => void
}

export function SelectionSlot({ slot, onRemove }: SelectionSlotProps) {
  if (slot.pokemonId === null) {
    return <EmptySlot />
  }
  
  return <FilledSlot slot={slot} onRemove={onRemove} />
}
