import { once } from 'events'
import { type Request, type Response, Router } from 'express'
import { HttpError } from '../httpError'
import { battlePrompt } from '../services/battlePrompt'
import { fetchPokemonSummary } from '../services/pokeapi'
import { streamCompletion } from '../services/virtualbrain/streamCompletion'

const BattleController = Router()

/**
 * Stream a battle for exactly two Pokémon.
 * The chatbot token stays on the server. Closing the response aborts the upstream request.
 */
BattleController.post('/', async (req: Request, res: Response) => {
	const ids = parseBattleIds(req.body)
	const [left, right] = await Promise.all([
		fetchPokemonSummary(ids[0]),
		fetchPokemonSummary(ids[1]),
	])

	const abort = new AbortController()
	res.on('close', () => {
		if (!res.writableFinished) abort.abort()
	})

	let upstream: globalThis.Response
	try {
		upstream = await streamCompletion(battlePrompt([left, right]), abort.signal)
	} catch (error) {
		if (abort.signal.aborted) return
		throw error
	}

	if (!upstream.ok || !upstream.body) {
		await upstream.body?.cancel()
		if (upstream.status === 401) {
			throw new HttpError(401, 'Chatbot API key was rejected')
		}
		if (upstream.status === 429) {
			throw new HttpError(429, 'Battle service is busy. Try again in a moment.')
		}
		throw new HttpError(502, 'Battle service is unavailable')
	}

	res.status(200)
	res.setHeader('Content-Type', 'text/plain; charset=utf-8')
	res.setHeader('Cache-Control', 'no-cache')
	const sessionId = upstream.headers.get('x-session-id')
	if (sessionId && /^[\w-]+$/.test(sessionId)) {
		res.setHeader('x-session-id', sessionId)
	}
	res.flushHeaders()

	const reader = upstream.body.getReader()
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			if (!res.write(Buffer.from(value))) {
				await once(res, 'drain')
			}
		}
		res.end()
	} catch (error) {
		if (!abort.signal.aborted) {
			console.error(error)
		}
		if (!res.writableEnded) res.end()
	}
})

function parseBattleIds(body: unknown): [number, number] {
	if (!isRecord(body) || !Array.isArray(body.pokemonIds) || body.pokemonIds.length !== 2) {
		throw new HttpError(400, 'pokemonIds must be two distinct ids from 1 to 898')
	}

	const ids = body.pokemonIds.map(parseId)
	if (ids[0] === ids[1]) {
		throw new HttpError(400, 'pokemonIds must be two distinct ids from 1 to 898')
	}

	return [ids[0], ids[1]]
}

function parseId(value: unknown): number {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 898) {
		throw new HttpError(400, 'pokemonIds must be two distinct ids from 1 to 898')
	}
	return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

export { BattleController }
