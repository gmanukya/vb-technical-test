import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseBattleIds } from '../../src/controllers/parseBattleRequest'
import { HttpError } from '../../src/httpError'

function rejects(run: () => void): void {
	assert.throws(run, (error: unknown) => {
		return error instanceof HttpError && error.status === 400
	})
}

describe('parseBattleIds', () => {
	it('accepts two distinct ids', () => {
		assert.deepEqual(parseBattleIds({ pokemonIds: [1, 4] }), [1, 4])
	})

	it('rejects a bad body', () => {
		rejects(() => {
			parseBattleIds({ pokemonIds: [1, 1] })
		})
		rejects(() => {
			parseBattleIds({ pokemonIds: [1] })
		})
		rejects(() => {
			parseBattleIds({ pokemonIds: ['1', '4'] })
		})
		rejects(() => {
			parseBattleIds({})
		})
		rejects(() => {
			parseBattleIds(null)
		})
		rejects(() => {
			parseBattleIds({ pokemonIds: [0, 1] })
		})
		rejects(() => {
			parseBattleIds({ pokemonIds: [1, 899] })
		})
		rejects(() => {
			parseBattleIds({ pokemonIds: [1, 1.5] })
		})
	})
})
