import type { PokemonSummary } from '../../types/pokemon'

/** A Pokémon loaded for a turn battle. Ability names from the card are only hit labels. */
export interface Fighter {
	id: number
	name: string
	hp: number
	maxHp: number
	attack: number
	defense: number
	speed: number
	types: string[]
	abilities: string[]
}

const FALLBACK_ABILITY = 'struggle'

/** Stats, types, and ability names already on a summary. No further PokeAPI calls. */
export function toFighter(summary: PokemonSummary): Fighter {
	const hp = summary.stats.HP
	let abilities = summary.abilities

	if (abilities.length === 0) {
		abilities = [FALLBACK_ABILITY]
	}

	return {
		id: summary.id,
		name: summary.name,
		hp,
		maxHp: hp,
		attack: summary.stats.attack,
		defense: summary.stats.defense,
		speed: summary.stats.speed,
		types: summary.apiTypes.map((type) => {
			return type.name
		}),
		abilities,
	}
}
