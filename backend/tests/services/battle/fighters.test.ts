import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { ApiPokemonMove } from '../../../src/services/pokeapi/apiTypes'
import { levelUpCandidates } from '../../../src/services/battle/fighters'

function move(name: string, details: ApiPokemonMove['version_group_details']): ApiPokemonMove {
	return {
		move: { name, url: `https://pokeapi.co/api/v2/move/${name}/` },
		version_group_details: details,
	}
}

function learned(level: number, method: string, groupId: number): ApiPokemonMove['version_group_details'][number] {
	return {
		level_learned_at: level,
		move_learn_method: { name: method, url: '' },
		version_group: { name: `group-${groupId}`, url: `https://pokeapi.co/api/v2/version-group/${groupId}/` },
	}
}

describe('levelUpCandidates', () => {
	it('keeps level-up moves from the newest version group, highest level first', () => {
		const moves = [
			move('tackle', [
				learned(1, 'level-up', 1),
				learned(5, 'machine', 25),
			]),
			move('ember', [
				learned(9, 'level-up', 25),
				learned(15, 'level-up', 25),
			]),
			move('scratch', [
				learned(1, 'level-up', 25),
			]),
		]

		assert.deepEqual(levelUpCandidates(moves), [
			{ name: 'ember', url: 'https://pokeapi.co/api/v2/move/ember/' },
			{ name: 'scratch', url: 'https://pokeapi.co/api/v2/move/scratch/' },
		])
	})
})
