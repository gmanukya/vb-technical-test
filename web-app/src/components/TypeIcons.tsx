import type { PokemonType } from '../types/pokemon'

interface TypeIconProps {
  type: PokemonType
}

function TypeIcon({ type }: TypeIconProps) {
  return (
    <img
      className="self-end w-5"
      src={type.image}
      alt={type.name}
      loading="lazy"
    />
  )
}

interface TypeIconsProps {
  types: PokemonType[]
}

export function TypeIcons({ types }: TypeIconsProps) {
  return types.map((type) => <TypeIcon key={type.name} type={type} />)
}
