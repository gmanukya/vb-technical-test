import { formatPokemonName } from '../../../shared/lib/formatName'
import { typeColor } from '../../../shared/lib/typeColors'
import { Chip } from '../../../shared/ui/Chip'

interface FilterChipsProps {
  types: readonly string[]
  onRemove: (type: string) => void
}

export function FilterChips({ types, onRemove }: FilterChipsProps) {
  if (types.length === 0) {
    return null
  }

  const chips = types.map((type) => (
    <Chip
      key={type}
      label={formatPokemonName(type)}
      color={typeColor(type)}
      onRemove={() => onRemove(type)}
    />
  ))

  return <div className="flex flex-wrap gap-2">{chips}</div>
}
