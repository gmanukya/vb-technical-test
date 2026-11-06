import { once } from 'events'
import { type Request, type Response, Router } from 'express'

import { parseBattleIds } from './parseBattleRequest'

import { HttpError } from '../httpError'
import { battlePrompt } from '../services/battle/prompts'
import { loadFighter } from '../services/battle/fighters'
import { runTurnBattle } from '../services/battle/turnBattle'
import { fetchPokemonSummary } from '../services/pokeapi'
import { isUpstreamStreamError } from '../services/virtualbrain/http1'
import { completionError, streamCompletion } from '../services/virtualbrain/streamCompletion'

/** `POST /battles` streams a story. `POST /battles/turns` streams a round-by-round match. */
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
		if (!res.writableFinished) {
			abort.abort()
		}
	})

	let started = false
	const writeChunk = async (value: Uint8Array) => {
		if (!started) {
			res.status(200)
			res.setHeader('Content-Type', 'text/plain; charset=utf-8')
			res.setHeader('Cache-Control', 'no-cache')
			res.flushHeaders()
			started = true
		}

		if (!res.write(Buffer.from(value))) {
			await once(res, 'drain')
		}
	}

	try {
		await pipeBattle(battlePrompt([left, right]), abort.signal, writeChunk)
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) {
				res.end()
			}

			return
		}
		if (!res.writableEnded) {
			res.end()
		}
	} catch (error) {
		if (abort.signal.aborted) {
			if (started && !res.writableEnded) {
				res.end()
			}

			return
		}

		if (!started) {
			throw error
		}

		// A finished body looks like a complete story. Drop the socket so the client shows an error.
		if (!res.writableEnded) {
			res.destroy()
		}
	}
})

/** Round-by-round battle. Each line is JSON. The chatbot only picks moves. */
BattleController.post('/turns', async (req: Request, res: Response) => {
	const ids = parseBattleIds(req.body)
	const [left, right] = await Promise.all([loadFighter(ids[0]), loadFighter(ids[1])])

	const abort = new AbortController()
	res.on('close', () => {
		if (!res.writableFinished) {
			abort.abort()
		}
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
		let message = 'Battle service is unavailable'
		if (error instanceof HttpError) {
			message = error.message
		}
		writeLine({ error: message })
		if (!res.writableEnded) res.end()
	}
})

/**
 * Pipe one chatbot reply to the client.
 * A dropped stream is retried only when no byte was written. An abort ends quietly.
 */
async function pipeBattle(
	query: string,
	signal: AbortSignal,
	writeChunk: (value: Uint8Array) => Promise<void>,
): Promise<void> {
	let wrote = false
	const write = async (value: Uint8Array) => {
		wrote = true
		await writeChunk(value)
	}

	try {
		await pipeOnce(query, signal, write)
	} catch (error) {
		if (signal.aborted || wrote || !isUpstreamStreamError(error)) {
			throw error
		}

		await pipeOnce(query, signal, write)
	}
}

async function pipeOnce(
	query: string,
	signal: AbortSignal,
	writeChunk: (value: Uint8Array) => Promise<void>,
): Promise<void> {
	const upstream = await streamCompletion(query, signal)
	const error = completionError(upstream)

	if (error !== null || upstream.body === null) {
		if (upstream.body !== null) {
			await upstream.body.cancel()
		}
		if (error === null) {
			throw new HttpError(502, 'Battle service is unavailable')
		}
		throw error
	}

	const reader = upstream.body.getReader()
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done || signal.aborted) break
			if (value) await writeChunk(value)
		}
	} catch (error) {
		await reader.cancel().catch(() => {
			return undefined
		})
		throw error
	}
	reader.releaseLock()
}

export { BattleController }
