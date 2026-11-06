import axios from 'axios'

/** Base URL for every PokeAPI request. */
export const POKEAPI_URL = 'https://pokeapi.co/api/v2'

const requests = new Map<string, Promise<unknown>>()

/**
 * GET a JSON URL once. Callers that ask for the same URL share that request.
 * A failed request is dropped so the next call can try again.
 */
export function cachedGet<T>(url: string): Promise<T> {
	return remember(requests as Map<string, Promise<T>>, url, () => {
		return axios.get<T>(url).then((response) => {
			return response.data
		})
	})
}

/** Numeric id at the end of a PokeAPI resource URL. */
export function idFromUrl(url: string): number {
	return Number(url.split('/').filter(Boolean).pop())
}

/**
 * Return the cached promise for `key`, or store the promise from `load`.
 * The entry is removed if `load` rejects.
 */
export function remember<K, V>(cache: Map<K, Promise<V>>, key: K, load: () => Promise<V>): Promise<V> {
	const existing = cache.get(key)

	if (existing) {
		return existing
	}

	const pending = load().catch(error => {
		cache.delete(key)
		throw error
	})

	cache.set(key, pending)

	return pending
}
