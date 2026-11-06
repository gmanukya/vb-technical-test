import { HttpError } from './httpError'

/** National-dex ids covered by this app: Bulbasaur (1) through Calyrex (898). */
export const LAST_DEX_ID = 898

/** At most this many PokeAPI requests run at once for the list and the Markdown export. */
export const POKEAPI_CONCURRENCY = 8

const DEX_ID_MESSAGE = `Pokemon id must be an integer from 1 to ${LAST_DEX_ID}`

/**
 * Accept an integer id from 1 through {@link LAST_DEX_ID}.
 * @param message Replaces the default 400 text. Battle routes use their own wording.
 * @throws {HttpError} 400 when `id` is not an integer in that range.
 */
export function assertDexId(id: number, message = DEX_ID_MESSAGE): number {
	if (!Number.isInteger(id) || id < 1 || id > LAST_DEX_ID) {
		throw new HttpError(400, message)
	}

	return id
}
