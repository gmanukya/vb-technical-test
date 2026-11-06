/**
 * JSON shapes returned by PokeAPI. The app's own model lives in `types/pokemon.ts`.
 */

/** A PokeAPI object reference: a name plus the URL of the full resource. */
export interface NamedResource {
	name: string
	url: string
}

/** `GET /pokemon/:id`, including stats, types, abilities, and sprite URLs. */
export interface ApiPokemon {
	id: number
	name: string
	sprites: {
		front_default: string | null
		other?: { 'official-artwork'?: { front_default: string | null } }
	}
	stats: { base_stat: number, stat: NamedResource }[]
	types: { slot: number, type: NamedResource }[]
	abilities: { ability: NamedResource }[]
	species: NamedResource
	moves: ApiPokemonMove[]
}

/** One move a Pokémon can learn, and how it was learned in each version group. */
export interface ApiPokemonMove {
	move: NamedResource
	version_group_details: {
		level_learned_at: number
		move_learn_method: NamedResource
		version_group: NamedResource
	}[]
}

/** `GET /move/:name`. `power` is null for status moves. */
export interface ApiMove {
	name: string
	power: number | null
	type: NamedResource
}

/** `GET /type/:name`. Only the defensive `*_from` relations are used. */
export interface ApiType {
	name: string
	damage_relations: {
		double_damage_from: NamedResource[]
		half_damage_from: NamedResource[]
		no_damage_from: NamedResource[]
	}
	sprites?: {
		'generation-viii'?: {
			'sword-shield'?: { name_icon: string | null }
		}
	}
}

/** `GET /pokemon-species/:id`: generation, previous species, and evolution-chain URL. */
export interface ApiSpecies {
	name: string
	generation: NamedResource
	evolves_from_species: NamedResource | null
	evolution_chain: { url: string }
}

/** One node in an evolution chain. `evolves_to` holds the direct next forms. */
export interface ApiChainLink {
	species: NamedResource
	evolves_to: ApiChainLink[]
}

/** `GET /evolution-chain/:id`. The tree starts at `chain`. */
export interface ApiEvolutionChain {
	chain: ApiChainLink
}
