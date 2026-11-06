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
	return ATTACKING_TYPES.map((attacker) => {
		const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
			const immune = relations.no_damage_from.some((type) => {
				return type.name === attacker
			})

			if (immune) {
				return 0
			}

			const weak = relations.double_damage_from.some((type) => {
				return type.name === attacker
			})

			if (weak) {
				return multiplier * 2
			}

			const resisted = relations.half_damage_from.some((type) => {
				return type.name === attacker
			})

			if (resisted) {
				return multiplier * 0.5
			}

			return multiplier
		}, 1)

		let damageRelation: DamageRelation = 'neutral'
		const namedRelation = DAMAGE_RELATIONS[damage_multiplier]
		
		if (namedRelation !== undefined) {
			damageRelation = namedRelation
		}

		return {
			name: attacker,
			damage_multiplier,
			damage_relation: damageRelation,
		}
	})
}
