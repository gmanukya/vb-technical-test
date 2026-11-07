/** Stats the damage formula reads. A loaded fighter satisfies this. */
export interface Combatant {
	id: number
	hp: number
	maxHp: number
	attack: number
	defense: number
	speed: number
}

/** One landed attack after damage is applied. `move` is the ability name the model picked. */
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
 * One hit is Attack / (Attack + Defense), times 40% of max HP.
 * Clamped to 8–34% of max HP, and at least 1. Defense of 0 is treated as 1.
 * A fighter on full HP survives the hit, unless max HP is 1.
 */
export function computeDamage(attacker: Pick<Combatant, 'attack'>, defender: Pick<Combatant, 'defense' | 'maxHp'>): number {
	let defense = defender.defense

	if (defense <= 0) {
		defense = 1
	}

	const share = attacker.attack / (attacker.attack + defense)
	const raw = Math.round(defender.maxHp * share * 0.4)
	const cap = Math.max(1, Math.floor(defender.maxHp * 0.34))
	const floor = Math.min(cap, Math.max(1, Math.ceil(defender.maxHp * 0.08)))

	if (raw < floor) {
		return floor
	}

	if (raw > cap) {
		return cap
	}

	return raw
}

/**
 * One round. The faster fighter hits first. Equal Speed lets the first selected Pokémon go first.
 * A KO cancels the slower hit.
 */
export function applyRound(left: Combatant, right: Combatant, leftMove: string, rightMove: string): RoundResult {
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

function strike(attacker: Combatant, defender: Combatant, move: string, defenderHp: number, hits: RoundHit[]): number {
	const damage = computeDamage(attacker, defender)
	const targetHp = Math.max(0, defenderHp - damage)

	hits.push({
		attackerId: attacker.id,
		move,
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
