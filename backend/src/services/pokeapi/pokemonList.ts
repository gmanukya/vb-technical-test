import pLimit from 'p-limit'

import type { ApiPokemon } from './apiTypes'
import { artwork, baseStat } from './fields'
import { cachedGet, POKEAPI_URL } from './http'

import { LAST_DEX_ID, POKEAPI_CONCURRENCY } from '../../dex'
import type { PokemonSummary } from '../../types/pokemon'

let listCache: Promise<PokemonSummary[]> | null = null

/**
 * Card data from a single `GET /pokemon/:id`: image, stats, types, and ability names.
 * Does not load species, evolutions, or the type chart.
 */
export async function fetchPokemonSummary(id: number): Promise<PokemonSummary> {
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
			.sort((a, b) => {
				return a.slot - b.slot
			})
			.map(({ type }) => {
				return { name: type.name }
			}),
		abilities: pokemon.abilities.map(({ ability }) => {
			return ability.name
		}),
	}
}

/**
 * Summaries for national-dex ids 1 through 898 (Bulbasaur through Calyrex).
 * At most 8 requests run at once. The finished list stays in memory.
 */
export function getPokemonList(): Promise<PokemonSummary[]> {
	if (!listCache) {
		const ids = Array.from({ length: LAST_DEX_ID }, (_, index) => {
			return index + 1
		})

		const limit = pLimit(POKEAPI_CONCURRENCY)
		listCache = Promise.all(ids.map((id) => {
			return limit(() => {
				return fetchPokemonSummary(id)
			})
		})).catch((error: unknown) => {
			listCache = null
			throw error
		})
	}

	return listCache
}
