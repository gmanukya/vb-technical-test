export interface PokemonType {
	name: string
	image: string
}

export interface StatBlock {
	HP: number
	attack: number
	defense: number
	special_attack: number
	special_defense: number
	speed: number
}

export type DamageRelation =
	| 'neutral'
	| 'resistant'
	| 'twice_resistant'
	| 'vulnerable'
	| 'twice_vulnerable'
	| 'immune'

export interface Resistance {
	name: string
	damage_multiplier: number
	damage_relation: DamageRelation
}

export interface Ability {
	name: string
	slug: string
}

export interface Evolution {
	name: string
	pokedexId: number
}

/** Fields the card grid needs. Built from one PokeAPI Pokémon resource. */
export interface PokemonSummary {
	id: number
	name: string
	image: string
	stats: Pick<StatBlock, 'HP' | 'attack' | 'defense' | 'speed'>
	apiTypes: { name: string }[]
}

/** Full Pokémon stored for Markdown export, including the type chart and evolution line. */
export interface Pokemon {
	id: number
	pokedexId: number
	name: string
	image: string
	sprite: string
	slug: string
	stats: StatBlock
	apiTypes: PokemonType[]
	apiGeneration: number
	apiResistances: Resistance[]
	resistanceModifyingAbilitiesForApi: Ability
	apiEvolutions: Evolution[]
	apiPreEvolution: string | 'none'
	apiResistancesWithAbilities: Resistance[]
}
