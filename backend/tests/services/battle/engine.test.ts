import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyRound, computeDamage, type Combatant, type Move } from '../../../src/services/battle/engine'

const tackle: Move = { name: 'tackle', type: 'normal', power: 40 }

function combatant(overrides: Partial<Combatant> = {}): Combatant {
	return {
		id: 1,
		hp: 100,
		attack: 100,
		defense: 50,
		speed: 50,
		resistances: [{ name: 'normal', damage_multiplier: 1 }],
		...overrides,
	}
}

describe('computeDamage', () => {
	it('deals 0 when the defender is immune', () => {
		const damage = computeDamage(
			{ attack: 100 },
			{ defense: 50, resistances: [{ name: 'ghost', damage_multiplier: 0 }] },
			{ name: 'lick', type: 'ghost', power: 30 },
		)
		assert.equal(damage, 0)
	})

	it('uses 1 when the attacking type is missing from the chart', () => {
		const damage = computeDamage(
			{ attack: 100 },
			{ defense: 50, resistances: [] },
			tackle,
		)
		assert.equal(damage, 37)
	})

	it('applies a 2x and a 0.5x multiplier', () => {
		const defender = { defense: 50, resistances: [{ name: 'normal', damage_multiplier: 2 }] }
		assert.equal(computeDamage({ attack: 100 }, defender, tackle), 74)

		defender.resistances[0].damage_multiplier = 0.5
		assert.equal(computeDamage({ attack: 100 }, defender, tackle), 18)
	})

	it('deals at least 1 when a resisted hit would round to 0', () => {
		const damage = computeDamage(
			{ attack: 1 },
			{ defense: 100_000, resistances: [{ name: 'normal', damage_multiplier: 0.25 }] },
			tackle,
		)
		assert.equal(damage, 1)
	})

	it('treats 0 defense as 1', () => {
		const damage = computeDamage(
			{ attack: 100 },
			{ defense: 0, resistances: [{ name: 'normal', damage_multiplier: 1 }] },
			tackle,
		)
		assert.equal(damage, 1762)
	})
})

describe('applyRound', () => {
	it('lets the faster fighter knock out before the slower one attacks', () => {
		const slow = combatant({ id: 1, hp: 5, attack: 10, defense: 10, speed: 10 })
		const fast = combatant({ id: 2, hp: 200, attack: 200, defense: 10, speed: 100 })
		const result = applyRound(slow, fast, tackle, tackle)

		assert.equal(result.hits.length, 1)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, fast.id)
		assert.equal(result.leftHp, 0)
		assert.equal(result.winnerId, fast.id)
	})

	it('lets the first selected Pokémon go first when Speed is tied', () => {
		const left = combatant({ id: 1, hp: 80, attack: 250, speed: 40 })
		const right = combatant({ id: 2, hp: 5, attack: 10, speed: 40 })
		const result = applyRound(left, right, tackle, tackle)

		assert.equal(result.hits.length, 1)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, left.id)
		assert.equal(result.winnerId, left.id)
	})

	it('lands both hits when neither fighter faints', () => {
		const left = combatant({ id: 1, hp: 500, attack: 50, defense: 50, speed: 10 })
		const right = combatant({ id: 2, hp: 500, attack: 50, defense: 50, speed: 20 })
		const result = applyRound(left, right, tackle, tackle)

		assert.equal(result.hits.length, 2)
		const hit = result.hits[0]
		assert.ok(hit)
		assert.equal(hit.attackerId, right.id)
		assert.equal(result.leftHp, 481)
		assert.equal(result.rightHp, 481)
		assert.equal(result.winnerId, null)
	})

	it('returns a draw when both fighters are already at 0 HP', () => {
		const left = combatant({ id: 1, hp: 0, speed: 10 })
		const right = combatant({ id: 2, hp: 0, speed: 20 })
		const result = applyRound(left, right, tackle, tackle)

		assert.deepEqual(result.hits, [])
		assert.equal(result.winnerId, null)
	})
})
