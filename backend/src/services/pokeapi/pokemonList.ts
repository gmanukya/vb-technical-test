import pLimit from 'p-limit'
import type { PokemonSummary } from '../../types/pokemon'
import type { ApiPokemon } from './apiTypes'
import { artwork, baseStat } from './fetchPokemon'
import { cachedGet, POKEAPI_URL, remember } from './http'

const POKEMON_COUNT = 898
const LIST_CONCURRENCY = 8

const summaryCache = new Map<number, Promise<PokemonSummary>>()
let listCache: Promise<PokemonSummary[]> | null = null

/**
 * Card data from a single `GET /pokemon/:id`: image, HP, Attack, Defense, Speed, and type names.
 * Does not load species, evolutions, or the type chart.
 */
export function fetchPokemonSummary(id: number): Promise<PokemonSummary> {
	return remember(summaryCache, id, async () => {
		const pokemon = await cachedGet<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)
		return {
			id: pokemon.id,
			name: pokemon.name,
			image: artwork(pokemon),
			stats: {
				HP: baseStat(pokemon, 'hp'),
				attack: baseStat(pokemon, 'attack'),
				defense: baseStat(pokemon, 'defense'),
				speed: baseStat(pokemon, 'speed'),
			},
			apiTypes: [...pokemon.types]
				.sort((a, b) => a.slot - b.slot)
				.map(({ type }) => ({ name: type.name })),
		}
	})
}

/**
 * Summaries for national-dex ids 1 through 898 (Bulbasaur through Calyrex).
 * At most 8 requests run at once. The finished list stays in memory.
 */
export function getPokemonList(): Promise<PokemonSummary[]> {
	if (!listCache) {
		const limit = pLimit(LIST_CONCURRENCY)
		const ids = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1)
		listCache = Promise.all(ids.map(id => limit(() => fetchPokemonSummary(id)))).catch(error => {
			listCache = null
			throw error
		})
	}
	return listCache
}
