import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { HttpError } from '../src/httpError'
import { parsePokemonId } from '../src/parsePokemonId'

function rejects(run: () => void): void {
	assert.throws(run, (error: unknown) => {
		return error instanceof HttpError && error.status === 400
	})
}

describe('parsePokemonId', () => {
	it('accepts ids from 1 through 898', () => {
		assert.equal(parsePokemonId('1'), 1)
		assert.equal(parsePokemonId('25'), 25)
		assert.equal(parsePokemonId('898'), 898)
	})

	it('rejects ids outside the dex and non-integers', () => {
		rejects(() => {
			parsePokemonId('0')
		})
		rejects(() => {
			parsePokemonId('899')
		})
		rejects(() => {
			parsePokemonId('1.5')
		})
		rejects(() => {
			parsePokemonId('abc')
		})
		rejects(() => {
			parsePokemonId('')
		})
	})
})
