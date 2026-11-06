import { assertDexId, LAST_DEX_ID } from './dex'
import { HttpError } from './httpError'

const MESSAGE = `Pokemon id must be an integer from 1 to ${LAST_DEX_ID}`

/**
 * Parse a route param as a national-dex id from Bulbasaur (1) through Calyrex (898).
 * @throws {HttpError} 400 when `raw` is not an integer in that range.
 */
export function parsePokemonId(raw: string): number {
	if (!/^\d+$/.test(raw)) {
		throw new HttpError(400, MESSAGE)
	}

	return assertDexId(Number(raw), MESSAGE)
}
