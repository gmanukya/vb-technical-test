import type { Evolution, Pokemon } from '../../types/pokemon'
import type { ApiChainLink, ApiEvolutionChain, ApiPokemon, ApiSpecies, ApiType } from './apiTypes'
import { cachedGet, POKEAPI_URL, remember } from './http'
import { computeResistances } from './resistances'

/** Official artwork URL, or the front sprite when artwork is missing. */
export const artwork = (pokemon: ApiPokemon): string =>
	pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default ?? ''

/** A base stat by its PokeAPI name (`hp`, `attack`, `special-attack`, …). Missing stats are 0. */
export const baseStat = (pokemon: ApiPokemon, name: string): number =>
	pokemon.stats.find(stat => stat.stat.name === name)?.base_stat ?? 0

const idFromUrl = (url: string): number => Number(url.split('/').filter(Boolean).pop())

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined =>
	link.species.name === speciesName
		? link
		: link.evolves_to.map(child => findChainLink(child, speciesName)).find(Boolean)

const pokemonCache = new Map<number, Promise<Pokemon>>()

/**
 * Full Pokémon used for Markdown: species, evolution line, type chart, and abilities.
 * Repeated calls for the same id reuse one request.
 */
export function fetchPokemon(id: number): Promise<Pokemon> {
	return remember(pokemonCache, id, () => loadPokemon(id))
}

async function loadPokemon(id: number): Promise<Pokemon> {
	const pokemon = await cachedGet<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)

	const [types, species] = await Promise.all([
		Promise.all(
			[...pokemon.types]
				.sort((a, b) => a.slot - b.slot)
				.map(({ type }) => cachedGet<ApiType>(type.url))
		),
		cachedGet<ApiSpecies>(pokemon.species.url),
	])

	const evolutionChain = await cachedGet<ApiEvolutionChain>(species.evolution_chain.url)
	const apiEvolutions: Evolution[] = (findChainLink(evolutionChain.chain, species.name)?.evolves_to ?? [])
		.map(({ species: evolution }) => ({ name: evolution.name, pokedexId: idFromUrl(evolution.url) }))

	const apiResistances = computeResistances(types)
	const firstAbility = pokemon.abilities[0]?.ability

	return {
		id: pokemon.id,
		pokedexId: pokemon.id,
		name: pokemon.name,
		image: artwork(pokemon),
		sprite: pokemon.sprites.front_default ?? '',
		slug: pokemon.name,
		stats: {
			HP: baseStat(pokemon, 'hp'),
			attack: baseStat(pokemon, 'attack'),
			defense: baseStat(pokemon, 'defense'),
			special_attack: baseStat(pokemon, 'special-attack'),
			special_defense: baseStat(pokemon, 'special-defense'),
			speed: baseStat(pokemon, 'speed'),
		},
		apiTypes: types.map(type => ({
			name: type.name,
			image: type.sprites?.['generation-viii']?.['sword-shield']?.name_icon ?? '',
		})),
		apiGeneration: idFromUrl(species.generation.url),
		apiResistances,
		resistanceModifyingAbilitiesForApi: { name: firstAbility?.name ?? '', slug: firstAbility?.name ?? '' },
		apiEvolutions,
		apiPreEvolution: species.evolves_from_species?.name ?? 'none',
		apiResistancesWithAbilities: apiResistances,
	}
}
