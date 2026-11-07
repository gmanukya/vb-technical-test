import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyRound, computeDamage, type Combatant } from '../../../src/services/battle/engine'

function combatant(overrides: Partial<Combatant> = {}): Combatant {
	return {
		id: 1,
		hp: 100,
		maxHp: 100,
		attack: 100,
		defense: 100,
		speed: 50,
		...overrides,
	}
}

describe('computeDamage', () => {
	it('deals 20% of max HP when Attack equals Defense', () => {
		const damage = computeDamage({ attack: 100 }, { defense: 100, maxHp: 100 })
		assert.equal(damage, 20)
	})

	it('caps a lopsided hit at 34% of max HP', () => {
		const damage = computeDamage({ attack: 500 }, { defense: 1, maxHp: 100 })
		assert.equal(damage, 34)
	})

	it('deals at least 8% of max HP when Attack is tiny', () => {
		const damage = computeDamage({ attack: 1 }, { defense: 100_000, maxHp: 100 })
		assert.equal(damage, 8)
	})

	it('treats 0 defense as 1 and still respects the cap', () => {
		const damage = computeDamage({ attack: 100 }, { defense: 0, maxHp: 100 })
		assert.equal(damage, 34)
	})

	it('deals 1 when max HP is 1', () => {
		const damage = computeDamage({ attack: 100 }, { defense: 100, maxHp: 1 })
		assert.equal(damage, 1)
	})
})

describe('applyRound', () => {
	it('lets the faster fighter knock out before the slower one attacks', () => {
		const slow = combatant({ id: 1, hp: 5, maxHp: 100, attack: 10, defense: 10, speed: 10 })
		const fast = combatant({ id: 2, hp: 200, maxHp: 200, attack: 200, defense: 10, speed: 100 })
		const result = applyRound(slow, fast, 'static', 'overgrow')

		assert.equal(result.hits.length, 1)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, fast.id)
		assert.equal(hit.move, 'overgrow')
		assert.equal(result.leftHp, 0)
		assert.equal(result.winnerId, fast.id)
	})

	it('lets the first selected Pokémon go first when Speed is tied', () => {
		const left = combatant({ id: 1, hp: 80, maxHp: 100, attack: 100, defense: 50, speed: 40 })
		const right = combatant({ id: 2, hp: 5, maxHp: 100, attack: 10, defense: 50, speed: 40 })
		const result = applyRound(left, right, 'overgrow', 'blaze')

		assert.equal(result.hits.length, 1)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, left.id)
		assert.equal(result.winnerId, left.id)
	})

	it('leaves both fighters standing after one round from full HP', () => {
		const left = combatant({ id: 1, hp: 100, maxHp: 100, attack: 100, defense: 100, speed: 10 })
		const right = combatant({ id: 2, hp: 100, maxHp: 100, attack: 100, defense: 100, speed: 20 })
		const result = applyRound(left, right, 'overgrow', 'blaze')

		assert.equal(result.hits.length, 2)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, right.id)
		assert.equal(result.leftHp, 80)
		assert.equal(result.rightHp, 80)
		assert.equal(result.winnerId, null)
	})
})
