import { HttpError } from '../../httpError'
import { CHATBOT_STREAM_IDLE_MS, readTextStream } from '../virtualbrain/readTextStream'
import { completionError, isSessionId, openCompletionStream } from '../virtualbrain/streamCompletion'
import { applyRound, type RoundHit } from './engine'
import type { Fighter } from './fighters'
import { chooseMoves, hasMoveChoice, textBeforeJson } from './moveChoice'
import { turnPrompt } from './prompts'

/** One resolved round sent to the client as a JSON line. */
export interface TurnEvent {
	round: number
	narration: string
	left: FighterView
	right: FighterView
	hits: RoundHit[]
	winnerId: number | null
}

interface FighterView {
	id: number
	name: string
	hp: number
	maxHp: number
}

/**
 * Ask the chatbot once per round for the two move names. Damage does not use them.
 * @returns The winner's id, or null when the client aborts.
 */
export async function runTurnBattle(
	left: Fighter,
	right: Fighter,
	signal: AbortSignal,
	onRound: (event: TurnEvent) => void | Promise<void>,
): Promise<number | null> {
	let sessionId: string | undefined
	let leftHp = left.hp
	let rightHp = right.hp
	let lastHits: RoundHit[] = []

	for (let round = 1; ; round += 1) {
		if (signal.aborted) {
			return null
		}

		const currentLeft = { ...left, hp: leftHp }
		const currentRight = { ...right, hp: rightHp }
		const reply = await complete(turnPrompt(currentLeft, currentRight, lastHits), signal, sessionId)

		sessionId = reply.sessionId

		const choice = chooseMoves(reply.text, currentLeft.abilities, currentRight.abilities)
		const result = applyRound(currentLeft, currentRight, choice.left, choice.right)
		leftHp = result.leftHp
		rightHp = result.rightHp
		lastHits = result.hits

		await onRound({
			round,
			narration: textBeforeJson(reply.text),
			left: view(currentLeft, leftHp),
			right: view(currentRight, rightHp),
			hits: result.hits,
			winnerId: result.winnerId,
		})

		if (result.winnerId !== null) {
			return result.winnerId
		}
	}
}

async function complete(
	query: string,
	signal: AbortSignal,
	sessionId: string | undefined,
): Promise<{ text: string, sessionId: string }> {
	const response = await openCompletionStream(query, signal, sessionId)
	const error = completionError(response.status)
	if (error) {
		response.stream.destroy()
		throw error
	}

	if (!isSessionId(response.sessionId)) {
		response.stream.destroy()
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const text = await readTextStream(response.stream, {
		idleMs: CHATBOT_STREAM_IDLE_MS,
		isDone: hasMoveChoice,
	})
	return { text, sessionId: response.sessionId }
}

function view(fighter: Fighter, hp: number): FighterView {
	return { id: fighter.id, name: fighter.name, hp, maxHp: fighter.maxHp }
}
