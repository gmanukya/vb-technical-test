import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, describe, it } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../src/app'

let baseUrl = ''
let close: () => Promise<void> = async () => {}

before(async () => {
	const server = createServer(createApp())
	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve)
	})
	const address = server.address() as AddressInfo
	baseUrl = `http://127.0.0.1:${address.port}`
	close = () => {
		return new Promise((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error)
					return
				}
				resolve()
			})
		})
	}
})

after(async () => {
	await close()
})

describe('createApp', () => {
	it('answers GET /ping', async () => {
		const response = await fetch(`${baseUrl}/ping`)
		assert.equal(response.status, 200)
		assert.equal(await response.text(), 'pong')
	})

	it('answers an unknown path with JSON', async () => {
		const response = await fetch(`${baseUrl}/missing`)
		assert.equal(response.status, 404)
		assert.deepEqual(await response.json(), { error: 'Not found' })
	})

	it('rejects a battle body before calling the chatbot', async () => {
		const response = await fetch(`${baseUrl}/battles`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{}',
		})
		assert.equal(response.status, 400)
		assert.deepEqual(await response.json(), { error: 'pokemonIds must be two distinct ids from 1 to 898' })
	})

	it('rejects a dex id before calling PokeAPI', async () => {
		const response = await fetch(`${baseUrl}/pokemons/0`)
		assert.equal(response.status, 400)
		assert.deepEqual(await response.json(), { error: 'Pokemon id must be an integer from 1 to 898' })
	})
})
