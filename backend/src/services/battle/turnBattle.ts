import { Readable } from 'node:stream'

import { HttpError } from '../../httpError'
import { completionError, isSessionId, streamCompletion } from '../virtualbrain/streamCompletion'
import { applyRound, type RoundHit } from './engine'
import type { Fighter } from './fighters'
import { chooseMoves } from './moveChoice'
import { turnPrompt } from './prompts'

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

/**
 * Ask the chatbot once per round, stream the prose, and apply the chosen abilities.
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
		if (signal.aborted) {
			return null
		}

		const currentLeft = { ...left, hp: leftHp }
		const currentRight = { ...right, hp: rightHp }
		const prefix = transcript
		const reply = await complete(turnPrompt(currentLeft, currentRight, lastHits), signal, sessionId, (visible) => {
			const next = joinText(prefix, visible)

			if (next) {
				onText(next)
			}
		})

		sessionId = reply.sessionId
		transcript = joinText(prefix, reply.narration)

		const choice = chooseMoves(reply.text, currentLeft.abilities, currentRight.abilities)
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

		if (result.winnerId !== null) {
			return result.winnerId
		}
	}

	return null
}

async function complete(
	query: string,
	signal: AbortSignal,
	sessionId: string | undefined,
	onText: (chunk: string) => void,
): Promise<{ text: string, narration: string, sessionId: string }> {
	const response = await streamCompletion(query, signal, sessionId)
	const error = completionError(response.status)
	if (error) {
		response.stream.destroy()
		throw error
	}

	if (!isSessionId(response.sessionId)) {
		response.stream.destroy()
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const read = await readReply(response.stream, onText)
	return { text: read.text, narration: read.narration, sessionId: response.sessionId }
}

/** Prose before the first `{` is narration. The rest stays available for move parsing. */
async function readReply(stream: Readable, onText: (visible: string) => void): Promise<{ text: string, narration: string }> {
	const decoder = new TextDecoder()
	let full = ''
	let shown = ''

	for await (const chunk of stream) {
		full += decoder.decode(asBytes(chunk), { stream: true })
		shown = publish(full, shown, onText)
	}

	full += decoder.decode()
	publish(full, shown, onText)
	return { text: full, narration: proseBeforeJson(full) }
}

function publish(full: string, shown: string, onText: (visible: string) => void): string {
	const visible = proseBeforeJson(full)
	if (visible && visible !== shown) {
		onText(visible)
	}
	return visible
}

function proseBeforeJson(full: string): string {
	const start = full.indexOf('{')
	let prose = full
	if (start >= 0) {
		prose = full.slice(0, start)
	}
	return prose.trim()
}

function asBytes(chunk: unknown): Uint8Array {
	if (Buffer.isBuffer(chunk)) {
		return chunk
	}
	if (chunk instanceof Uint8Array) {
		return chunk
	}
	return Buffer.from(String(chunk))
}

function joinText(left: string, right: string): string {
	if (!left) {
		return right
	}
	if (!right) {
		return left
	}
	return `${left}\n\n${right}`
}

function view(fighter: Fighter, hp: number): FighterView {
	return { id: fighter.id, name: fighter.name, hp, maxHp: fighter.maxHp }
}
