/** The six base stats stored for Markdown. The card grid uses HP, Attack, Defense, and Speed. */
export interface StatBlock {
	HP: number
	attack: number
	defense: number
	special_attack: number
	special_defense: number
	speed: number
}

/** How a multiplier on the type chart is named in Markdown. */
export type DamageRelation =
	| 'neutral'
	| 'resistant'
	| 'twice_resistant'
	| 'vulnerable'
	| 'twice_vulnerable'
	| 'immune'

/** How one attacking type lands on this Pokémon. */
export interface Resistance {
	name: string
	damage_multiplier: number
	damage_relation: DamageRelation
}

/** The species this Pokémon evolves into. */
export interface Evolution {
	name: string
	pokedexId: number
}

/** Fields the card grid and a turn battle need. Built from one PokeAPI Pokémon resource. */
export interface PokemonSummary {
	id: number
	name: string
	image: string
	stats: Pick<StatBlock, 'HP' | 'attack' | 'defense' | 'speed'>
	apiTypes: { name: string }[]
	abilities: string[]
}

/** Record the Markdown file is built from: stats, type chart, abilities, and evolution line. */
export interface Pokemon {
	id: number
	name: string
	stats: StatBlock
	apiTypes: { name: string }[]
	apiGeneration: number
	apiResistances: Resistance[]
	abilities: string[]
	apiEvolutions: Evolution[]
	apiPreEvolution: string | 'none'
}
