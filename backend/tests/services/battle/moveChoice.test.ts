import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { chooseMoves } from '../../../src/services/battle/moveChoice'

const left = ['vine-whip', 'tackle']
const right = ['ember']

describe('chooseMoves', () => {
	it('uses the abilities named in the first object', () => {
		assert.deepEqual(
			chooseMoves('Sure. {"left":"vine whip","right":"ember"} thanks', left, right),
			{ left: 'vine-whip', right: 'ember' },
		)
	})

	it('matches case, spaces, and underscores to the listed ability', () => {
		assert.deepEqual(
			chooseMoves('{"left":"Vine_Whip","right":" EMBER "}', left, right),
			{ left: 'vine-whip', right: 'ember' },
		)
	})

	it('uses that fighter\'s first ability when the reply is not usable', () => {
		assert.deepEqual(chooseMoves('no json here', left, right), { left: 'vine-whip', right: 'ember' })
		assert.deepEqual(chooseMoves('{"left":', left, right), { left: 'vine-whip', right: 'ember' })
		assert.deepEqual(
			chooseMoves('{"left":"fly","right":"ember"}', left, right),
			{ left: 'vine-whip', right: 'ember' },
		)
		assert.deepEqual(
			chooseMoves('{"left":1,"right":"ember"}', left, right),
			{ left: 'vine-whip', right: 'ember' },
		)
	})
})
