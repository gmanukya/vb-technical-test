import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseMoveChoice } from '../../../src/services/battle/moveChoice'

const left = ['vine-whip', 'tackle']
const right = ['ember']

describe('parseMoveChoice', () => {
	it('reads the move names out of surrounding prose', () => {
		assert.deepEqual(
			parseMoveChoice('Sure. {"left":"vine whip","right":"ember"} thanks', ['vine-whip'], ['ember']),
			{ left: 'vine-whip', right: 'ember' },
		)
	})

	it('returns null when there is no JSON', () => {
		assert.equal(parseMoveChoice('no json here', ['tackle'], ['ember']), null)
	})

	it('returns null when a name is not in that fighter\'s list', () => {
		assert.equal(parseMoveChoice('{"left":"fly","right":"ember"}', ['tackle'], ['ember']), null)
	})

	it('matches case, spaces, and underscores to the listed move', () => {
		assert.deepEqual(
			parseMoveChoice('{"left":"Vine_Whip","right":" EMBER "}', left, right),
			{ left: 'vine-whip', right: 'ember' },
		)
	})

	it('returns null for broken JSON and for non-string names', () => {
		assert.equal(parseMoveChoice('{"left":', left, right), null)
		assert.equal(parseMoveChoice('{"left":1,"right":"ember"}', left, right), null)
	})

	it('uses the first object and ignores a later one', () => {
		assert.deepEqual(
			parseMoveChoice('{"left":"tackle","right":"ember"} {"left":"fly","right":"fly"}', left, right),
			{ left: 'tackle', right: 'ember' },
		)
	})
})
