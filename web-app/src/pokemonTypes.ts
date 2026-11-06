/** Sword/Shield type icons, in the usual type-chart order. Ids match PokeAPI. */
export const POKEMON_TYPES = [
  { name: 'normal', icon: typeIcon(1) },
  { name: 'fire', icon: typeIcon(10) },
  { name: 'water', icon: typeIcon(11) },
  { name: 'electric', icon: typeIcon(13) },
  { name: 'grass', icon: typeIcon(12) },
  { name: 'ice', icon: typeIcon(15) },
  { name: 'fighting', icon: typeIcon(2) },
  { name: 'poison', icon: typeIcon(4) },
  { name: 'ground', icon: typeIcon(5) },
  { name: 'flying', icon: typeIcon(3) },
  { name: 'psychic', icon: typeIcon(14) },
  { name: 'bug', icon: typeIcon(7) },
  { name: 'rock', icon: typeIcon(6) },
  { name: 'ghost', icon: typeIcon(8) },
  { name: 'dragon', icon: typeIcon(16) },
  { name: 'dark', icon: typeIcon(17) },
  { name: 'steel', icon: typeIcon(9) },
  { name: 'fairy', icon: typeIcon(18) },
] as const

const TYPE_ICONS: Record<string, string> = Object.fromEntries(
  POKEMON_TYPES.map((type) => [type.name, type.icon]),
)

export function typeIconUrl(name: string): string | undefined {
  return TYPE_ICONS[name]
}

function typeIcon(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`
}
