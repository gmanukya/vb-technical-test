/** Stats the damage formula reads. A loaded fighter satisfies this. */
export interface Combatant {
	id: number
	hp: number
	attack: number
	defense: number
	speed: number
	resistances: { name: string, damage_multiplier: number }[]
}

/** A move applied by the damage formula. */
export interface Move {
	name: string
	type: string
	power: number
}

/** One landed attack after damage is applied. */
export interface RoundHit {
	attackerId: number
	move: string
	damage: number
	targetHp: number
}

/** HP after one round. `winnerId` is null when nobody has fainted, or when both have. */
export interface RoundResult {
	leftHp: number
	rightHp: number
	hits: RoundHit[]
	winnerId: number | null
}

/**
 * Damage is power times Attack divided by Defense, times the type multiplier.
 * Immunity deals 0. Any other hit deals at least 1. Defense of 0 is treated as 1.
 */
export function computeDamage(attacker: Pick<Combatant, 'attack'>, defender: Pick<Combatant, 'defense' | 'resistances'>, move: Move): number {
	const match = defender.resistances.find((resistance) => {
		return resistance.name === move.type
	})

	let multiplier = 1

	if (match !== undefined) {
		multiplier = match.damage_multiplier
	}

	if (multiplier === 0) {
		return 0
	}

	let defense = defender.defense

	if (defense <= 0) {
		defense = 1
	}

	const raw = Math.floor(move.power * attacker.attack / defense * multiplier)

	if (raw < 1) {
		return 1
	}

	return raw
}

/**
 * One round. The faster fighter hits first. Equal Speed lets the first selected Pokémon go first.
 * A KO cancels the slower hit.
 */
export function applyRound(left: Combatant, right: Combatant, leftMove: Move, rightMove: Move): RoundResult {
	let leftHp = left.hp
	let rightHp = right.hp
	const hits: RoundHit[] = []

	if (left.speed >= right.speed) {
		rightHp = strike(left, right, leftMove, rightHp, hits)

		if (rightHp > 0) {
			leftHp = strike(right, left, rightMove, leftHp, hits)
		}
	} else {
		leftHp = strike(right, left, rightMove, leftHp, hits)

		if (leftHp > 0) {
			rightHp = strike(left, right, leftMove, rightHp, hits)
		}
	}

	return {
		leftHp,
		rightHp,
		hits,
		winnerId: winner(left.id, right.id, leftHp, rightHp),
	}
}

function strike(attacker: Combatant, defender: Combatant, move: Move, defenderHp: number, hits: RoundHit[]): number {
	const damage = computeDamage(attacker, defender, move)
	const targetHp = Math.max(0, defenderHp - damage)

	hits.push({
		attackerId: attacker.id,
		move: move.name,
		damage,
		targetHp,
	})

	return targetHp
}

/** Both fighters at 0 HP is a draw. Otherwise the id still standing, or null when both remain. */
function winner(leftId: number, rightId: number, leftHp: number, rightHp: number): number | null {
	if (leftHp <= 0 && rightHp <= 0) {
		return null
	}

	if (leftHp <= 0) {
		return rightId
	}

	if (rightHp <= 0) {
		return leftId
	}
	
	return null
}
