import { EmptyClear } from './EmptyClear'

interface EmptyCatalogProps {
  filtersActive: boolean
  onClear: () => void
}

export function EmptyCatalog({ filtersActive, onClear }: EmptyCatalogProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-3xl tracking-tight">No Pokémon match these filters</p>
      <p className="max-w-sm text-sm text-muted">Try another name, or clear the type filters.</p>
      <EmptyClear active={filtersActive} onClear={onClear} />
    </div>
  )
}
