import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isUpstreamStreamError } from '../../../src/services/virtualbrain/http1'

describe('isUpstreamStreamError', () => {
	it('ignores an abort and a plain error', () => {
		const abort = new Error('The operation was aborted')
		abort.name = 'AbortError'
		assert.equal(isUpstreamStreamError(abort), false)
		assert.equal(isUpstreamStreamError(new Error('nope')), false)
		assert.equal(isUpstreamStreamError('nope'), false)
	})

	it('recognizes a dropped socket, including one nested as the cause', () => {
		const terminated = new Error('terminated')
		assert.equal(isUpstreamStreamError(terminated), true)

		const reset = new Error('reset') as NodeJS.ErrnoException
		reset.code = 'ECONNRESET'
		assert.equal(isUpstreamStreamError(reset), true)

		const wrapped = new Error('outer') as Error & { cause?: unknown }
		wrapped.cause = reset
		assert.equal(isUpstreamStreamError(wrapped), true)
	})
})
