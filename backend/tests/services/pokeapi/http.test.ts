import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import axios from 'axios'

import { isRetriablePokeapiError } from '../../../src/services/pokeapi/http'

function httpError(status: number) {
	return new axios.AxiosError('request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
		status,
		statusText: '',
		headers: {},
		config: { headers: new axios.AxiosHeaders() },
		data: null,
	})
}

describe('isRetriablePokeapiError', () => {
	it('retries a 429', () => {
		assert.equal(isRetriablePokeapiError(httpError(429)), true)
	})

	it('retries a timeout, which has no response', () => {
		const error = new axios.AxiosError('timeout', 'ECONNABORTED')
		assert.equal(isRetriablePokeapiError(error), true)
	})

	it('does not retry a 404', () => {
		assert.equal(isRetriablePokeapiError(httpError(404)), false)
	})
})
