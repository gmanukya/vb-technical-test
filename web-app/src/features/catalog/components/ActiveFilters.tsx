import { Button } from '../../../shared/ui/Button'
import { FilterChips } from './FilterChips'

interface ActiveFiltersProps {
  types: readonly string[]
  onRemove: (type: string) => void
  onClear: () => void
  active: boolean
}

export function ActiveFilters({ types, onRemove, onClear, active }: ActiveFiltersProps) {
  if (!active) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChips types={types} onRemove={onRemove} />
      <Button tone="ghost" onClick={onClear}>Clear</Button>
    </div>
  )
}
