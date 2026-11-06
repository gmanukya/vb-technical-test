import { once } from 'events'
import { type Request, type Response, Router } from 'express'
import { HttpError } from '../httpError'
import { battlePrompt } from '../services/battlePrompt'
import { loadFighter } from '../services/battle/fighters'
import { runTurnBattle } from '../services/battle/turnBattle'
import { fetchPokemonSummary } from '../services/pokeapi'
import { isUpstreamStreamError } from '../services/virtualbrain/http1'
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

	let started = false
	let sessionId: string | undefined
	const writeChunk = async (value: Uint8Array) => {
		if (!started) {
			res.status(200)
			res.setHeader('Content-Type', 'text/plain; charset=utf-8')
			res.setHeader('Cache-Control', 'no-cache')
			if (sessionId) res.setHeader('x-session-id', sessionId)
			res.flushHeaders()
			started = true
		}
		if (!res.write(Buffer.from(value))) await once(res, 'drain')
	}

	try {
		await pipeBattle(battlePrompt([left, right]), abort.signal, writeChunk, (id) => {
			sessionId = id
		})
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) res.end()
			return
		}
		if (!res.writableEnded) res.end()
	} catch (error) {
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) res.end()
			return
		}
		if (!started) throw error
		if (!res.writableEnded) res.end()
	}
})

/** Round-by-round battle. Each line is JSON. The chatbot only picks moves. */
BattleController.post('/turns', async (req: Request, res: Response) => {
	const ids = parseBattleIds(req.body)
	const [left, right] = await Promise.all([loadFighter(ids[0]), loadFighter(ids[1])])

	const abort = new AbortController()
	res.on('close', () => {
		if (!res.writableFinished) abort.abort()
	})

	let started = false
	const writeLine = (value: unknown) => {
		if (!started) {
			res.status(200)
			res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
			res.setHeader('Cache-Control', 'no-cache')
			res.flushHeaders()
			started = true
		}
		res.write(`${JSON.stringify(value)}\n`)
	}

	try {
		const winnerId = await runTurnBattle(left, right, abort.signal, writeLine, (transcript) => {
			writeLine({ text: transcript })
		})
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) res.end()
			return
		}
		writeLine({ winnerId })
		res.end()
	} catch (error) {
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) res.end()
			return
		}
		if (!started) throw error
		const message = error instanceof HttpError ? error.message : 'Battle service is unavailable'
		writeLine({ error: message })
		if (!res.writableEnded) res.end()
	}
})

async function pipeBattle(
	query: string,
	signal: AbortSignal,
	writeChunk: (value: Uint8Array) => Promise<void>,
	onSession: (sessionId: string) => void,
): Promise<void> {
	let wrote = false
	const write = async (value: Uint8Array) => {
		wrote = true
		await writeChunk(value)
	}

	try {
		await pipeOnce(query, signal, write, onSession)
	} catch (error) {
		if (signal.aborted || wrote || !isUpstreamStreamError(error)) throw error
		await pipeOnce(query, signal, write, onSession)
	}
}

async function pipeOnce(
	query: string,
	signal: AbortSignal,
	writeChunk: (value: Uint8Array) => Promise<void>,
	onSession: (sessionId: string) => void,
): Promise<void> {
	const upstream = await streamCompletion(query, signal)
	if (!upstream.ok || !upstream.body) {
		await upstream.body?.cancel()
		if (upstream.status === 401) throw new HttpError(401, 'Chatbot API key was rejected')
		if (upstream.status === 429) throw new HttpError(429, 'Battle service is busy. Try again in a moment.')
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const sessionId = upstream.headers.get('x-session-id')
	if (sessionId && /^[\w-]+$/.test(sessionId)) onSession(sessionId)

	const reader = upstream.body.getReader()
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done || signal.aborted) break
			if (value) await writeChunk(value)
		}
	} catch (error) {
		await reader.cancel().catch(() => undefined)
		throw error
	}
	reader.releaseLock()
}

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
