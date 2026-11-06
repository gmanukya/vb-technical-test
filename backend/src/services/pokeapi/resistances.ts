import type { DamageRelation, Resistance } from '../../types/pokemon'
import type { ApiType } from './apiTypes'

const ATTACKING_TYPES = [
	'normal', 'fire', 'water', 'electric', 'grass', 'ice',
	'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
	'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
	0: 'immune',
	0.25: 'twice_resistant',
	0.5: 'resistant',
	1: 'neutral',
	2: 'vulnerable',
	4: 'twice_vulnerable',
}

/**
 * How much damage each of the 18 types deals to a Pokémon with these types.
 * Dual types multiply. A multiplier this chart does not name becomes `neutral`.
 */
export function computeResistances(types: ApiType[]): Resistance[] {
	return ATTACKING_TYPES.map(attacker => {
		const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
			if (relations.no_damage_from.some(type => type.name === attacker)) return 0
			if (relations.double_damage_from.some(type => type.name === attacker)) return multiplier * 2
			if (relations.half_damage_from.some(type => type.name === attacker)) return multiplier * 0.5
			return multiplier
		}, 1)

		return {
			name: attacker,
			damage_multiplier,
			damage_relation: DAMAGE_RELATIONS[damage_multiplier] ?? 'neutral',
		}
	})
}
