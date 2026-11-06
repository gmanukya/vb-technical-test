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

const LEVEL = 50

/**
 * Level-50 damage. A type multiplier of 0 is immunity and deals 0.
 * Any other hit deals at least 1.
 */
export function computeDamage(attacker: Pick<Combatant, 'attack'>, defender: Pick<Combatant, 'defense' | 'resistances'>, move: Move): number {
	const match = defender.resistances.find((resistance) => {
		return resistance.name === move.type
	})
	let multiplier = 1
	if (match !== undefined) {
		multiplier = match.damage_multiplier
	}
	if (multiplier === 0) return 0

	let defense = 1
	if (defender.defense > 0) {
		defense = defender.defense
	}
	const base = Math.floor((((2 * LEVEL / 5 + 2) * move.power * attacker.attack / defense) / 50) + 2)
	return Math.max(1, Math.floor(base * multiplier))
}

/**
 * One round. The faster fighter hits first. Equal Speed lets the first selected Pokémon go first.
 * A fighter at 0 HP does not attack, and a KO cancels the slower hit.
 */
export function applyRound(left: Combatant, right: Combatant, leftMove: Move, rightMove: Move): RoundResult {
	const leftFirst = left.speed >= right.speed
	let order: { fighter: Combatant, move: Move }[]
	if (leftFirst) {
		order = [{ fighter: left, move: leftMove }, { fighter: right, move: rightMove }]
	} else {
		order = [{ fighter: right, move: rightMove }, { fighter: left, move: leftMove }]
	}

	let leftHp = left.hp
	let rightHp = right.hp
	const hits: RoundHit[] = []

	for (const action of order) {
		let attackerHp = rightHp
		if (action.fighter.id === left.id) {
			attackerHp = leftHp
		}
		if (attackerHp <= 0) continue

		const attackingLeft = action.fighter.id === left.id
		let defender = left
		let defenderHp = leftHp
		if (attackingLeft) {
			defender = right
			defenderHp = rightHp
		}
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

/** Both fighters at 0 HP is a draw. Otherwise the id still standing, or null when both remain. */
function winner(leftId: number, rightId: number, leftHp: number, rightHp: number): number | null {
	if (leftHp <= 0 && rightHp <= 0) return null
	if (leftHp <= 0) return rightId
	if (rightHp <= 0) return leftId
	return null
}
