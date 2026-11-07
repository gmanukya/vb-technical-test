import { isRecord } from '../../isRecord'
import type { Move } from './engine'

interface Choice {
	left?: string
	right?: string
}

/**
 * Moves named in the first `{...}` object.
 * A missing object, broken JSON, or an unknown name uses that fighter's first move.
 */
export function chooseMoves(
	text: string,
	leftMoves: readonly Move[],
	rightMoves: readonly Move[],
): { left: Move, right: Move } {
	const choice = readChoice(text)
	let leftName: string | undefined
	let rightName: string | undefined
	if (choice !== null) {
		leftName = choice.left
		rightName = choice.right
	}

	return {
		left: resolveMove(leftMoves, leftName),
		right: resolveMove(rightMoves, rightName),
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

function resolveMove(moves: readonly Move[], raw: string | undefined): Move {
	let needle: string | null = null
	if (raw !== undefined) {
		needle = normalizeMove(raw)
	}

	const match = moves.find((move) => {
		return normalizeMove(move.name) === needle
	})
	if (match !== undefined) {
		return match
	}
	return moves[0]
}

function normalizeMove(value: string): string {
	return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}
