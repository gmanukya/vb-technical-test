export interface Combatant {
	id: number
	hp: number
	attack: number
	defense: number
	speed: number
	resistances: { name: string, damage_multiplier: number }[]
}

export interface Move {
	name: string
	type: string
	power: number
}

export interface RoundHit {
	attackerId: number
	move: string
	damage: number
	targetHp: number
}

export interface RoundResult {
	leftHp: number
	rightHp: number
	hits: RoundHit[]
	winnerId: number | null
}

const LEVEL = 50

/**
 * Level-50 damage. A type multiplier of 0 is immunity and deals 0.
 * Any other hit deals at least 1.
 */
export function computeDamage(attacker: Pick<Combatant, 'attack'>, defender: Pick<Combatant, 'defense' | 'resistances'>, move: Move): number {
	const multiplier = defender.resistances.find(resistance => resistance.name === move.type)?.damage_multiplier ?? 1
	if (multiplier === 0) return 0

	const defense = defender.defense > 0 ? defender.defense : 1
	const base = Math.floor((((2 * LEVEL / 5 + 2) * move.power * attacker.attack / defense) / 50) + 2)
	return Math.max(1, Math.floor(base * multiplier))
}

/**
 * One round. The faster fighter hits first. Equal Speed lets the first selected Pokémon go first.
 * A fighter at 0 HP does not attack, and a KO cancels the slower hit.
 */
export function applyRound(left: Combatant, right: Combatant, leftMove: Move, rightMove: Move): RoundResult {
	const leftFirst = left.speed >= right.speed
	const order = leftFirst
		? [{ fighter: left, move: leftMove }, { fighter: right, move: rightMove }]
		: [{ fighter: right, move: rightMove }, { fighter: left, move: leftMove }]

	let leftHp = left.hp
	let rightHp = right.hp
	const hits: RoundHit[] = []

	for (const action of order) {
		const attackerHp = action.fighter.id === left.id ? leftHp : rightHp
		if (attackerHp <= 0) continue

		const attackingLeft = action.fighter.id === left.id
		const defender = attackingLeft ? right : left
		const defenderHp = attackingLeft ? rightHp : leftHp
		if (defenderHp <= 0) continue

		const damage = computeDamage(action.fighter, defender, action.move)
		const targetHp = Math.max(0, defenderHp - damage)
		if (attackingLeft) rightHp = targetHp
		else leftHp = targetHp

		hits.push({ attackerId: action.fighter.id, move: action.move.name, damage, targetHp })
		if (targetHp <= 0) break
	}

	return {
		leftHp,
		rightHp,
		hits,
		winnerId: winner(left.id, right.id, leftHp, rightHp),
	}
}

/** First JSON object whose move names are in each fighter's list. */
export function parseMoveChoice(text: string, leftMoves: readonly string[], rightMoves: readonly string[]): { left: string, right: string } | null {
	const json = firstJsonObject(text)
	if (!json) return null

	let body: unknown
	try {
		body = JSON.parse(json)
	} catch {
		return null
	}

	if (!isRecord(body) || typeof body.left !== 'string' || typeof body.right !== 'string') {
		return null
	}

	const left = matchMove(body.left, leftMoves)
	const right = matchMove(body.right, rightMoves)
	if (!left || !right) return null
	return { left, right }
}

function winner(leftId: number, rightId: number, leftHp: number, rightHp: number): number | null {
	if (leftHp <= 0 && rightHp <= 0) return null
	if (leftHp <= 0) return rightId
	if (rightHp <= 0) return leftId
	return null
}

function matchMove(raw: string, moves: readonly string[]): string | null {
	const needle = normalizeMove(raw)
	return moves.find(move => normalizeMove(move) === needle) ?? null
}

function normalizeMove(value: string): string {
	return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}

function firstJsonObject(text: string): string | null {
	const start = text.indexOf('{')
	if (start < 0) return null

	let depth = 0
	for (let index = start; index < text.length; index += 1) {
		if (text[index] === '{') depth += 1
		else if (text[index] === '}') {
			depth -= 1
			if (depth === 0) return text.slice(start, index + 1)
		}
	}

	return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}
