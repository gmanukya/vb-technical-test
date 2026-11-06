import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { ApiType } from '../../../src/services/pokeapi/apiTypes'
import { computeResistances } from '../../../src/services/pokeapi/resistances'

function named(name: string) {
	return { name, url: '' }
}

function namesOrEmpty(values: string[] | undefined): string[] {
	if (values === undefined) {
		return []
	}

	return values
}

function apiType(name: string, relations: { double?: string[], half?: string[], none?: string[] } = {}): ApiType {
	return {
		name,
		damage_relations: {
			double_damage_from: namesOrEmpty(relations.double).map(named),
			half_damage_from: namesOrEmpty(relations.half).map(named),
			no_damage_from: namesOrEmpty(relations.none).map(named),
		},
	}
}

function against(types: ApiType[], attacker: string) {
	const row = computeResistances(types).find((resistance) => {
		return resistance.name === attacker
	})
	assert.ok(row)
	return row
}

describe('computeResistances', () => {
	it('records a single type weakness', () => {
		const water = against([apiType('fire', { double: ['water'] })], 'water')
		assert.equal(water?.damage_multiplier, 2)
		assert.equal(water?.damage_relation, 'vulnerable')
	})

	it('multiplies dual types', () => {
		const types = [
			apiType('bug', { double: ['fire'] }),
			apiType('grass', { double: ['fire'], half: ['water'] }),
		]
		const fire = against(types, 'fire')
		assert.equal(fire?.damage_multiplier, 4)
		assert.equal(fire?.damage_relation, 'twice_vulnerable')

		const water = against(types, 'water')
		assert.equal(water?.damage_multiplier, 0.5)
		assert.equal(water?.damage_relation, 'resistant')
	})

	it('keeps immunity at 0', () => {
		const normal = against([apiType('ghost', { none: ['normal'] })], 'normal')
		assert.equal(normal?.damage_multiplier, 0)
		assert.equal(normal?.damage_relation, 'immune')
	})

	it('lists all 18 attacking types', () => {
		const rows = computeResistances([apiType('normal')])
		assert.equal(rows.length, 18)
		assert.ok(rows.some((row) => {
			return row.name === 'fairy'
		}))
		assert.ok(rows.some((row) => {
			return row.name === 'steel'
		}))
	})

	it('calls an unnamed multiplier neutral', () => {
		const types = [
			apiType('a', { double: ['water'] }),
			apiType('b', { double: ['water'] }),
			apiType('c', { double: ['water'] }),
		]
		const water = against(types, 'water')
		assert.equal(water?.damage_multiplier, 8)
		assert.equal(water?.damage_relation, 'neutral')
	})
})
