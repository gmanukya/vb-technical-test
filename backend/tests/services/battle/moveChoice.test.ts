import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { chooseMoves } from '../../../src/services/battle/moveChoice'

const left = [
	{ name: 'vine-whip', type: 'grass', power: 45 },
	{ name: 'tackle', type: 'normal', power: 40 },
]
const right = [{ name: 'ember', type: 'fire', power: 40 }]

describe('chooseMoves', () => {
	it('uses the moves named in the first object', () => {
		assert.deepEqual(
			chooseMoves('Sure. {"left":"vine whip","right":"ember"} thanks', left, right),
			{ left: left[0], right: right[0] },
		)
	})

	it('matches case, spaces, and underscores to the listed move', () => {
		assert.deepEqual(
			chooseMoves('{"left":"Vine_Whip","right":" EMBER "}', left, right),
			{ left: left[0], right: right[0] },
		)
	})

	it('uses that fighter\'s first move when the reply is not usable', () => {
		assert.deepEqual(chooseMoves('no json here', left, right), { left: left[0], right: right[0] })
		assert.deepEqual(chooseMoves('{"left":', left, right), { left: left[0], right: right[0] })
		assert.deepEqual(
			chooseMoves('{"left":"fly","right":"ember"}', left, right),
			{ left: left[0], right: right[0] },
		)
		assert.deepEqual(
			chooseMoves('{"left":1,"right":"ember"}', left, right),
			{ left: left[0], right: right[0] },
		)
	})
})
