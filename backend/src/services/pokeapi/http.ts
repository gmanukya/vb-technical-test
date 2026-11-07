import axios from 'axios'

/** Base URL for every PokeAPI request. */
export const POKEAPI_URL = 'https://pokeapi.co/api/v2'

const POKEAPI_TIMEOUT_MS = 10_000
const POKEAPI_ATTEMPTS = 3

const requests = new Map<string, Promise<unknown>>()

/**
 * GET a JSON URL once. Callers that ask for the same URL share that request.
 * A failed request is dropped so the next call can try again.
 * A timeout, a dropped connection, 429, or 502–504 is tried up to three times.
 */
export function cachedGet<T>(url: string): Promise<T> {
	const existing = requests.get(url)

	if (existing) {
		return existing as Promise<T>
	}

	const pending = readJson<T>(url).catch((error: unknown) => {
		requests.delete(url)
		throw error
	})

	requests.set(url, pending)
	return pending
}

/**
 * A blip worth another try: no HTTP response, 429, or 502–504.
 * A 404 and any other 4xx fail on the first attempt.
 */
export function isRetriablePokeapiError(error: unknown): boolean {
	if (!axios.isAxiosError(error)) {
		return false
	}

	if (error.response === undefined) {
		return true
	}

	const status = error.response.status
	if (status === 429) {
		return true
	}

	return status >= 502 && status <= 504
}

async function readJson<T>(url: string): Promise<T> {
	let failure: unknown

	for (let attempt = 1; attempt <= POKEAPI_ATTEMPTS; attempt += 1) {
		try {
			const response = await axios.get<T>(url, { timeout: POKEAPI_TIMEOUT_MS })
			return response.data
		} catch (error) {
			failure = error
			
			if (attempt === POKEAPI_ATTEMPTS || !isRetriablePokeapiError(error)) {
				throw error
			}

			await pause(200 * attempt)
		}
	}

	throw failure
}

function pause(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

/** Numeric id at the end of a PokeAPI resource URL. */
export function idFromUrl(url: string): number {
	return Number(url.split('/').filter(Boolean).pop())
}
