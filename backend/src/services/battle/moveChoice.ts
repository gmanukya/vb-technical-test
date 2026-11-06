import { isRecord } from '../../isRecord'
import { firstJsonObject } from './jsonObject'

/**
 * First JSON object whose move names are in each fighter's list.
 * @returns The matched move names, or null when the text has no usable choice.
 */
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

function matchMove(raw: string, moves: readonly string[]): string | null {
	const needle = normalizeMove(raw)
	const match = moves.find((move) => {
		return normalizeMove(move) === needle
	})
	if (!match) {
		return null
	}
	return match
}

function normalizeMove(value: string): string {
	return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}
