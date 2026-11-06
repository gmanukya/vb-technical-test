import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { firstJsonObject } from '../../../src/services/battle/jsonObject'

describe('firstJsonObject', () => {
	it('returns null while the braces are still open', () => {
		assert.equal(firstJsonObject('{"left":"tackle"'), null)
	})

	it('returns only the first balanced object', () => {
		assert.equal(firstJsonObject('{"a":1} {"b":2}'), '{"a":1}')
	})

	it('counts a brace inside a sentence, because the scan is not string-aware', () => {
		assert.equal(firstJsonObject('he said {hello}'), '{hello}')
	})
})
