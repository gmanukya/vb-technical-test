export interface PokemonType {
  name: string
  image?: string
}

export interface StatBlock {
  HP: number
  attack: number
  defense: number
  speed: number
}

export interface Pokemon {
  id: number
  name: string
  image: string
  stats: StatBlock
  apiTypes: PokemonType[]
}
