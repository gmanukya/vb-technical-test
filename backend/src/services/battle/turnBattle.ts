import { HttpError } from '../../httpError'
import { completionError, isSessionId, streamCompletion } from '../virtualbrain/streamCompletion'
import { isUpstreamStreamError } from '../virtualbrain/http1'
import { applyRound, type Move, type RoundHit } from './engine'
import type { Fighter, FighterMove } from './fighters'
import { joinNarration, readNarration } from './narration'
import { parseMoveChoice } from './moveChoice'
import { correctionPrompt, followUpPrompt, openingPrompt } from './prompts'

const MAX_ROUNDS = 20

/** One resolved round sent to the client as a JSON line. */
export interface TurnEvent {
	round: number
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

interface Completion {
	text: string
	narration: string
	sessionId: string
}

/**
 * Ask the chatbot for moves, stream its narration, and emit one event per resolved round.
 * @returns The winner's id, or null when the client aborts or 20 rounds end without a KO.
 */
export async function runTurnBattle(
	left: Fighter,
	right: Fighter,
	signal: AbortSignal,
	onRound: (event: TurnEvent) => void,
	onText: (chunk: string) => void = () => {},
): Promise<number | null> {
	let sessionId: string | undefined
	let leftHp = left.hp
	let rightHp = right.hp
	let lastHits: RoundHit[] = []

	let transcript = ''

	for (let round = 1; round <= MAX_ROUNDS; round += 1) {
		if (signal.aborted) return null

		const currentLeft = { ...left, hp: leftHp }
		const currentRight = { ...right, hp: rightHp }
		let prompt = followUpPrompt(currentLeft, currentRight, lastHits)
		if (round === 1) {
			prompt = openingPrompt(currentLeft, currentRight)
		}
		const prefix = transcript
		const choice = await chooseMoves(currentLeft, currentRight, prompt, signal, sessionId, (visible) => {
			const next = joinNarration(prefix, visible)
			if (next) onText(next)
		})
		sessionId = choice.sessionId
		transcript = joinNarration(prefix, choice.narration)

		const result = applyRound(currentLeft, currentRight, choice.left, choice.right)
		leftHp = result.leftHp
		rightHp = result.rightHp
		lastHits = result.hits
		onRound({
			round,
			left: view(currentLeft, leftHp),
			right: view(currentRight, rightHp),
			hits: result.hits,
			winnerId: result.winnerId,
		})

		if (result.winnerId !== null) return result.winnerId
	}

	return null
}

async function chooseMoves(
	left: Fighter,
	right: Fighter,
	prompt: string,
	signal: AbortSignal,
	sessionId: string | undefined,
	onText: (chunk: string) => void,
): Promise<{ left: Move, right: Move, sessionId: string, narration: string }> {
	const leftNames = left.moves.map((move) => {
		return move.name
	})
	const rightNames = right.moves.map((move) => {
		return move.name
	})
	const first = await complete(prompt, signal, sessionId, onText)
	const parsed = parseMoveChoice(first.text, leftNames, rightNames)
	if (parsed) {
		return {
			left: moveByName(left.moves, parsed.left),
			right: moveByName(right.moves, parsed.right),
			sessionId: first.sessionId,
			narration: first.narration,
		}
	}

	const told = first.narration
	const fallback = await correct(left, right, signal, first.sessionId, (visible) => {
		onText(joinNarration(told, visible))
	})
	return {
		left: moveByName(left.moves, fallback.left),
		right: moveByName(right.moves, fallback.right),
		sessionId: fallback.sessionId,
		narration: joinNarration(told, fallback.narration),
	}
}

async function correct(
	left: Fighter,
	right: Fighter,
	signal: AbortSignal,
	sessionId: string,
	onText: (chunk: string) => void,
): Promise<{ left: string, right: string, sessionId: string, narration: string }> {
	const reply = await complete(correctionPrompt(left, right), signal, sessionId, onText)
	const parsed = parseMoveChoice(reply.text, left.moves.map((move) => {
		return move.name
	}), right.moves.map((move) => {
		return move.name
	}))
	if (parsed) return { ...parsed, sessionId: reply.sessionId, narration: reply.narration }
	return {
		left: left.moves[0].name,
		right: right.moves[0].name,
		sessionId: reply.sessionId,
		narration: reply.narration,
	}
}

/**
 * One retry when the chatbot stream drops before a reply arrives.
 * A second drop, or any other failure, is rethrown. The second drop becomes 502.
 * An abort is rethrown so the caller can end quietly.
 */
async function complete(
	query: string,
	signal: AbortSignal,
	sessionId: string | undefined,
	onText: (chunk: string) => void,
): Promise<Completion> {
	try {
		return await completeOnce(query, signal, sessionId, onText)
	} catch (error) {
		if (signal.aborted || !isUpstreamStreamError(error)) throw error
		try {
			return await completeOnce(query, signal, sessionId, onText)
		} catch (retryError) {
			if (signal.aborted || !isUpstreamStreamError(retryError)) throw retryError
			throw new HttpError(502, 'Battle service is unavailable')
		}
	}
}

async function completeOnce(
	query: string,
	signal: AbortSignal,
	sessionId: string | undefined,
	onText: (chunk: string) => void,
): Promise<Completion> {
	const response = await streamCompletion(query, signal, sessionId)
	const error = completionError(response)
	if (error) {
		if (response.body !== null) {
			await response.body.cancel()
		}
		throw error
	}

	const nextSession = response.headers.get('x-session-id')
	if (!isSessionId(nextSession)) {
		if (response.body !== null) {
			await response.body.cancel()
		}
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const read = await readNarration(response, onText)
	return { text: read.text, narration: read.narration, sessionId: nextSession }
}

function moveByName(moves: FighterMove[], name: string): Move {
	let move = moves[0]
	const found = moves.find((candidate) => {
		return candidate.name === name
	})
	if (found !== undefined) {
		move = found
	}
	return { name: move.name, type: move.type, power: move.power }
}

function view(fighter: Fighter, hp: number): FighterView {
	return { id: fighter.id, name: fighter.name, hp, maxHp: fighter.maxHp }
}
