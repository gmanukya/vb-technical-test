import { type Request, type Response, Router } from 'express'

import { HttpError } from '../httpError'
import { parseBattleIds } from '../parseBattleRequest'
import { battlePrompt } from '../services/battle/prompts'
import { toFighter } from '../services/battle/fighters'
import { runTurnBattle } from '../services/battle/turnBattle'
import { fetchPokemonSummary } from '../services/pokeapi'
import { CHATBOT_STREAM_IDLE_MS, readTextStream } from '../services/virtualbrain/readTextStream'
import { completionError, openCompletionStream } from '../services/virtualbrain/streamCompletion'

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
		const upstream = await openCompletionStream(battlePrompt([left, right]), signal)
		const error = completionError(upstream.status)

		if (error) {
			upstream.stream.destroy()
			throw error
		}

		res.status(200)
		res.setHeader('Content-Type', 'text/plain; charset=utf-8')
		res.setHeader('Cache-Control', 'no-cache')
		res.flushHeaders()

		await readTextStream(upstream.stream, {
			idleMs: CHATBOT_STREAM_IDLE_MS,
			onChunk(chunk) {
				return writeChunk(res, chunk, signal)
			},
		})
		if (!signal.aborted && !res.writableEnded) {
			res.end()
		}
	} catch (error) {
		if (signal.aborted) {
			return
		}

		if (res.headersSent) {
			res.destroy(error instanceof Error ? error : undefined)
			return
		}

		throw error
	}
})

/** Round-by-round battle. Each line is JSON. The chatbot writes the narration. */
BattleController.post('/turns', async (req: Request, res: Response) => {
	const ids = parseBattleIds(req.body)
	const [left, right] = await Promise.all([
		fetchPokemonSummary(ids[0]),
		fetchPokemonSummary(ids[1]),
	])
	const signal = abortWhenClosed(res)

	let started = false
	const writeLine = async (value: unknown) => {
		if (!started) {
			res.status(200)
			res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
			res.setHeader('Cache-Control', 'no-cache')
			res.flushHeaders()
			started = true
		}
		await writeChunk(res, `${JSON.stringify(value)}\n`, signal)
	}

	try {
		const winnerId = await runTurnBattle(toFighter(left), toFighter(right), signal, writeLine)

		if (signal.aborted) {
			return
		}
		
		await writeLine({ winnerId })
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
		
		await writeLine({ error: message })
		
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

async function writeChunk(res: Response, chunk: string, signal: AbortSignal): Promise<void> {
	if (signal.aborted || res.writableEnded) {
		return
	}
	
	if (res.write(chunk)) {
		return
	}

	await new Promise<void>((resolve) => {
		const done = () => {
			res.off('drain', done)
			res.off('close', done)
			resolve()
		}

		res.once('drain', done)
		res.once('close', done)
	})
}

export { BattleController }
