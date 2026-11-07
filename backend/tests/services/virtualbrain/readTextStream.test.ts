import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { describe, it } from 'node:test'

import { readTextStream } from '../../../src/services/virtualbrain/readTextStream'

describe('readTextStream', () => {
	it('stops when isDone is met without waiting for upstream EOF', async () => {
		const stream = new Readable({
			read() {},
		})
		const chunks: string[] = []

		const pending = readTextStream(stream, {
			idleMs: 30_000,
			isDone: (text) => {
				return text.includes('END')
			},
			onChunk(chunk) {
				chunks.push(chunk)
			},
		})

		stream.push('Bulbasaur leans in.\n')
		stream.push('END')

		const text = await finishWithin(pending)

		assert.equal(text, 'Bulbasaur leans in.\nEND')
		assert.deepEqual(chunks, ['Bulbasaur leans in.\n', 'END'])
		assert.equal(stream.destroyed, true)
	})

	it('stops after text becomes idle when upstream stays open', async () => {
		const stream = new Readable({
			read() {},
		})

		const pending = readTextStream(stream, { idleMs: 20 })
		stream.push('Charmander wins.')

		assert.equal(await finishWithin(pending), 'Charmander wins.')
		assert.equal(stream.destroyed, true)
	})

	it('does not start the idle timer before the first byte', async () => {
		const stream = new Readable({
			read() {},
		})

		const pending = readTextStream(stream, { idleMs: 20 })
		await pause(50)
		stream.push('Slow first token.')
		stream.push(null)

		assert.equal(await finishWithin(pending), 'Slow first token.')
	})
})

function finishWithin<T>(pending: Promise<T>): Promise<T> {
	let timer: ReturnType<typeof setTimeout>
	const timeout = new Promise<never>((_resolve, reject) => {
		timer = setTimeout(() => {
			reject(new Error('stream stayed open'))
		}, 500)
	})

	return Promise.race([
		pending,
		timeout,
	]).finally(() => {
		clearTimeout(timer)
	})
}

function pause(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}
