import { HttpError } from '../../httpError'
import { streamCompletion } from '../virtualbrain/streamCompletion'
import { isUpstreamStreamError } from '../virtualbrain/http1'
import { applyRound, parseMoveChoice, type Move, type RoundHit } from './engine'
import type { Fighter, FighterMove } from './fighters'

const MAX_ROUNDS = 20

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

/** Ask the chatbot for moves, stream its narration, and emit one event per resolved round. */
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
		const prompt = round === 1
			? openingPrompt(currentLeft, currentRight)
			: followUpPrompt(currentLeft, currentRight, lastHits)
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
	const leftNames = left.moves.map(move => move.name)
	const rightNames = right.moves.map(move => move.name)
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
	const parsed = parseMoveChoice(reply.text, left.moves.map(move => move.name), right.moves.map(move => move.name))
	if (parsed) return { ...parsed, sessionId: reply.sessionId, narration: reply.narration }
	return {
		left: left.moves[0].name,
		right: right.moves[0].name,
		sessionId: reply.sessionId,
		narration: reply.narration,
	}
}

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
	if (!response.ok) {
		await response.body?.cancel()
		if (response.status === 401) throw new HttpError(401, 'Chatbot API key was rejected')
		if (response.status === 429) throw new HttpError(429, 'Battle service is busy. Try again in a moment.')
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const nextSession = response.headers.get('x-session-id')
	if (!nextSession || !/^[\w-]+$/.test(nextSession)) {
		await response.body?.cancel()
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const read = await readNarration(response, onText)
	return { text: read.text, narration: read.narration, sessionId: nextSession }
}

/** Forward the prose before the move JSON. The JSON stays on the server so it can be parsed. */
async function readNarration(
	response: globalThis.Response,
	onText: (visible: string) => void,
): Promise<{ text: string, narration: string }> {
	if (!response.body) {
		const text = await response.text()
		const narration = narrationWithoutMoveJson(text)
		if (narration) onText(narration)
		return { text, narration }
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let full = ''
	let shown = ''

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			full += decoder.decode(value, { stream: true })
			shown = emitNarration(full, shown, onText)
		}
	} catch (error) {
		await reader.cancel().catch(() => undefined)
		throw error
	}

	full += decoder.decode()
	shown = emitNarration(full, shown, onText)
	return { text: full, narration: shown }
}

function emitNarration(full: string, shown: string, onText: (visible: string) => void): string {
	const visible = narrationWithoutMoveJson(full)
	if (visible !== shown) onText(visible)
	return visible
}

function joinNarration(left: string, right: string): string {
	if (!left) return right
	if (!right) return left
	return `${left.replace(/\s+$/, '')}\n\n${right.replace(/^\s+/, '')}`
}

/** Prose around the first JSON object. An unfinished object, and a markdown fence around it, stay off the panel. */
function narrationWithoutMoveJson(full: string): string {
	return present(visibleNarration(full))
}

function visibleNarration(full: string): string {
	const start = full.indexOf('{')
	if (start < 0) return full.replace(/\s*```(?:json|JSON)?\s*$/, '')

	const json = firstBalancedObject(full.slice(start))
	const before = stripOpeningFence(full.slice(0, start))
	if (!json) return before

	const after = stripClosingFence(full.slice(start + json.length))
	if (!before) return after
	if (!after) return before
	return `${before}\n${after}`
}

function present(text: string): string {
	return text.replace(/\*\*/g, '')
}

function stripOpeningFence(before: string): string {
	return before.replace(/\s*```(?:json|JSON)?\s*$/, '').replace(/\s+$/, '')
}

function stripClosingFence(after: string): string {
	return after.replace(/^\s*```/, '').replace(/^\s+/, '')
}

function firstBalancedObject(text: string): string | null {
	if (!text.startsWith('{')) return null
	let depth = 0
	for (let index = 0; index < text.length; index += 1) {
		if (text[index] === '{') depth += 1
		else if (text[index] === '}') {
			depth -= 1
			if (depth === 0) return text.slice(0, index + 1)
		}
	}
	return null
}

function moveByName(moves: FighterMove[], name: string): Move {
	const move = moves.find(candidate => candidate.name === name) ?? moves[0]
	return { name: move.name, type: move.type, power: move.power }
}

function view(fighter: Fighter, hp: number): FighterView {
	return { id: fighter.id, name: fighter.name, hp, maxHp: fighter.maxHp }
}

function openingPrompt(left: Fighter, right: Fighter): string {
	return [
		'Write two short sentences. Name the attack each Pokémon chooses.',
		'Do not describe hits landing, damage, remaining HP, or a winner. The server decides whether the slower Pokémon gets to attack.',
		'After the sentences, write only this JSON and no code fence: {"left":"<move>","right":"<move>"}',
		'Use only the move names listed for that Pokémon.',
		'',
		describe(left, 'left'),
		describe(right, 'right'),
	].join('\n')
}

function followUpPrompt(left: Fighter, right: Fighter, hits: RoundHit[]): string {
	const events = hits.map(hit => {
		const attacker = hit.attackerId === left.id ? label(left.name) : label(right.name)
		const defender = hit.attackerId === left.id ? label(right.name) : label(left.name)
		return `${attacker} used ${hit.move} for ${hit.damage} damage. ${defender} has ${hit.targetHp} HP.`
	})

	return [
		'The last round:',
		...events,
		'Write two short sentences. Name the attack each Pokémon chooses.',
		'Do not describe hits landing, damage, remaining HP, or a winner. The server decides whether the slower Pokémon gets to attack.',
		'After the sentences, write only this JSON and no code fence: {"left":"<move>","right":"<move>"}',
		'Use only the move names listed for that Pokémon.',
		'',
		describe(left, 'left'),
		describe(right, 'right'),
	].join('\n')
}

function correctionPrompt(left: Fighter, right: Fighter): string {
	return [
		'That reply was not usable.',
		'Reply with only {"left":"<move>","right":"<move>"}.',
		`left moves: ${left.moves.map(move => move.name).join(', ')}`,
		`right moves: ${right.moves.map(move => move.name).join(', ')}`,
	].join('\n')
}

function describe(fighter: Fighter, side: 'left' | 'right'): string {
	return [
		`${side} is ${label(fighter.name)} (#${fighter.id}).`,
		`Types: ${fighter.types.join(', ') || 'none'}.`,
		`HP ${fighter.hp} of ${fighter.maxHp}. Attack ${fighter.attack}. Defense ${fighter.defense}. Speed ${fighter.speed}.`,
		`Moves: ${fighter.moves.map(move => move.name).join(', ')}.`,
	].join(' ')
}

function label(name: string): string {
	return name.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}
