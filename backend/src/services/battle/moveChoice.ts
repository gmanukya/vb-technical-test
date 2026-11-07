import { isRecord } from '../../isRecord'

interface Choice {
	left?: string
	right?: string
}

/**
 * Ability names in the first `{...}` object.
 * A missing object, broken JSON, or an unknown name uses that fighter's first ability.
 */
export function chooseMoves(
	text: string,
	leftAbilities: readonly string[],
	rightAbilities: readonly string[],
): { left: string, right: string } {
	const choice = readChoice(text)
	let leftName: string | undefined
	let rightName: string | undefined

	if (choice !== null) {
		leftName = choice.left
		rightName = choice.right
	}

	return {
		left: resolveAbility(leftAbilities, leftName),
		right: resolveAbility(rightAbilities, rightName),
	}
}

function readChoice(text: string): Choice | null {
	const start = text.indexOf('{')
	const end = text.indexOf('}', start)

	if (start < 0 || end < 0) {
		return null
	}

	try {
		const body: unknown = JSON.parse(text.slice(start, end + 1))

		if (!isRecord(body)) {
			return null
		}

		const choice: Choice = {}

		if (typeof body.left === 'string') {
			choice.left = body.left
		}

		if (typeof body.right === 'string') {
			choice.right = body.right
		}

		return choice
	} catch {
		return null
	}
}

function resolveAbility(abilities: readonly string[], raw: string | undefined): string {
	let needle: string | null = null

	if (raw !== undefined) {
		needle = normalizeName(raw)
	}

	const match = abilities.find((ability) => {
		return normalizeName(ability) === needle
	})

	if (match !== undefined) {
		return match
	}

	return abilities[0] ?? 'struggle'
}

function normalizeName(value: string): string {
	return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}
