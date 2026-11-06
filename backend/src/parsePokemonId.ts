import { HttpError } from './httpError'

/** National-dex ids covered by this app: Bulbasaur (1) through Calyrex (898). */
export function parsePokemonId(raw: string): number {
	if (!/^\d+$/.test(raw)) {
		throw new HttpError(400, 'Pokemon id must be an integer from 1 to 898')
	}

	const id = Number(raw)
	if (id < 1 || id > 898) {
		throw new HttpError(400, 'Pokemon id must be an integer from 1 to 898')
	}

	return id
}
