import type { ApiChainLink, ApiEvolutionChain, ApiPokemon, ApiSpecies, ApiType } from './apiTypes'
import { baseStat } from './fields'
import { cachedGet, idFromUrl, POKEAPI_URL } from './http'
import { computeResistances } from './resistances'

import type { Evolution, Pokemon } from '../../types/pokemon'

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined => {
	if (link.species.name === speciesName) {
		return link
	}

	for (const child of link.evolves_to) {
		const found = findChainLink(child, speciesName)
		if (found) {
			return found
		}
	}

	return undefined
}

/** Full Pokémon used for Markdown: species, evolution line, type chart, and abilities. */
export function fetchPokemon(id: number): Promise<Pokemon> {
	return loadPokemon(id)
}

async function loadPokemon(id: number): Promise<Pokemon> {
	const pokemon = await cachedGet<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)

	const [types, species] = await Promise.all([
		Promise.all(
			[...pokemon.types]
				.sort((a, b) => {
					return a.slot - b.slot
				})
				.map(({ type }) => {
					return cachedGet<ApiType>(type.url)
				})
		),
		cachedGet<ApiSpecies>(pokemon.species.url),
	])

	const evolutionChain = await cachedGet<ApiEvolutionChain>(species.evolution_chain.url)
	const chainLink = findChainLink(evolutionChain.chain, species.name)
	let nextForms: ApiChainLink[] = []

	if (chainLink !== undefined) {
		nextForms = chainLink.evolves_to
	}
	
	const apiEvolutions: Evolution[] = nextForms.map(({ species: evolution }) => {
		return { name: evolution.name, pokedexId: idFromUrl(evolution.url) }
	})

	const apiResistances = computeResistances(types)

	return {
		id: pokemon.id,
		name: pokemon.name,
		stats: {
			HP: baseStat(pokemon, 'hp'),
			attack: baseStat(pokemon, 'attack'),
			defense: baseStat(pokemon, 'defense'),
			special_attack: baseStat(pokemon, 'special-attack'),
			special_defense: baseStat(pokemon, 'special-defense'),
			speed: baseStat(pokemon, 'speed'),
		},
		apiTypes: types.map((type) => {
			return { name: type.name }
		}),
		apiGeneration: idFromUrl(species.generation.url),
		apiResistances,
		abilities: pokemon.abilities.map(({ ability }) => {
			return ability.name
		}),
		apiEvolutions,
		apiPreEvolution: preEvolutionName(species),
	}
}

function preEvolutionName(species: ApiSpecies): Pokemon['apiPreEvolution'] {
	if (species.evolves_from_species === null) {
		return 'none'
	}

	return species.evolves_from_species.name
}
