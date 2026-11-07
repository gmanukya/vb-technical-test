import { assertDexId } from './dex'
import { HttpError } from './httpError'
import { isRecord } from './isRecord'

const MESSAGE = 'pokemonIds must be two distinct ids from 1 to 898'

/**
 * Body of `POST /battles` and `POST /battles/turns`.
 * @throws {HttpError} 400 when the body is not two distinct dex ids.
 */
export function parseBattleIds(body: unknown): [number, number] {
	if (!isRecord(body) || !Array.isArray(body.pokemonIds) || body.pokemonIds.length !== 2) {
		throw new HttpError(400, MESSAGE)
	}

	const ids = body.pokemonIds.map(parseId)
	if (ids[0] === ids[1]) {
		throw new HttpError(400, MESSAGE)
	}

	return [ids[0], ids[1]]
}

function parseId(value: unknown): number {
	if (typeof value !== 'number') {
		throw new HttpError(400, MESSAGE)
	}

	return assertDexId(value, MESSAGE)
}
