import { pipeline } from 'node:stream/promises'

import { type Request, type Response, Router } from 'express'

import { HttpError } from '../httpError'
import { parseBattleIds } from '../parseBattleRequest'
import { battlePrompt } from '../services/battle/prompts'
import { toFighter } from '../services/battle/fighters'
import { runTurnBattle } from '../services/battle/turnBattle'
import { fetchPokemonSummary } from '../services/pokeapi'
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
	const signal = abortWhenClosed(res)

	try {
		const upstream = await streamCompletion(battlePrompt([left, right]), signal)
		const error = completionError(upstream.status)
		if (error) {
			upstream.stream.destroy()
			throw error
		}

		res.status(200)
		res.setHeader('Content-Type', 'text/plain; charset=utf-8')
		res.setHeader('Cache-Control', 'no-cache')
		await pipeline(upstream.stream, res, { signal })
	} catch (error) {
		if (signal.aborted || res.headersSent) {
			return
		}
		throw error
	}
})

/** Round-by-round battle. Each line is JSON. The chatbot only picks abilities. */
BattleController.post('/turns', async (req: Request, res: Response) => {
	const ids = parseBattleIds(req.body)
	const [left, right] = await Promise.all([
		fetchPokemonSummary(ids[0]),
		fetchPokemonSummary(ids[1]),
	])
	const signal = abortWhenClosed(res)

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
		const winnerId = await runTurnBattle(toFighter(left), toFighter(right), signal, writeLine, (transcript) => {
			writeLine({ text: transcript })
		})

		if (signal.aborted) {
			return
		}
		
		writeLine({ winnerId })
		res.end()
	} catch (error) {
		if (signal.aborted) {
			return
		}
		if (!started) {
			throw error
		}
		let message = 'Battle service is unavailable'
		if (error instanceof HttpError) {
			message = error.message
		}
		writeLine({ error: message })
		if (!res.writableEnded) {
			res.end()
		}
	}
})

function abortWhenClosed(res: Response): AbortSignal {
	const abort = new AbortController()
	res.on('close', () => {
		if (!res.writableFinished) {
			abort.abort()
		}
	})
	return abort.signal
}

export { BattleController }
