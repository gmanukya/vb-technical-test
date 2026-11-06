import type { PokemonType } from '../types/pokemon'

interface TypeIconsProps {
  types: PokemonType[]
}

export function TypeIcons({ types }: TypeIconsProps) {
  return types.map((type) => <TypeIcon key={type.name} type={type} />)
}

function TypeIcon({ type }: { type: PokemonType }) {
  if (!type.image) {
    return <span className="text-xs">{type.name}</span>
  }

  return (
    <img
      className="h-4 w-auto"
      src={type.image}
      alt={type.name}
      loading="lazy"
    />
  )
}
