import axios from 'axios'
import type { DamageRelation, Evolution, Pokemon, Resistance } from '../types/pokemon'

const POKEAPI_URL = 'https://pokeapi.co/api/v2'

interface NamedResource {
	name: string
	url: string
}

interface ApiPokemon {
	id: number
	name: string
	sprites: {
		front_default: string | null
		other: { 'official-artwork': { front_default: string | null } }
	}
	stats: { base_stat: number, stat: NamedResource }[]
	types: { slot: number, type: NamedResource }[]
	abilities: { ability: NamedResource }[]
	species: NamedResource
}

interface ApiType {
	name: string
	damage_relations: {
		double_damage_from: NamedResource[]
		half_damage_from: NamedResource[]
		no_damage_from: NamedResource[]
	}
	sprites?: {
		'generation-viii'?: {
			'sword-shield'?: { name_icon: string | null }
		}
	}
}

interface ApiSpecies {
	name: string
	generation: NamedResource
	evolves_from_species: NamedResource | null
	evolution_chain: { url: string }
}

interface ApiChainLink {
	species: NamedResource
	evolves_to: ApiChainLink[]
}

interface ApiEvolutionChain {
	chain: ApiChainLink
}

const ATTACKING_TYPES = [
	'normal', 'fire', 'water', 'electric', 'grass', 'ice',
	'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
	'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
	0: 'immune',
	0.25: 'twice_resistant',
	0.5: 'resistant',
	1: 'neutral',
	2: 'vulnerable',
	4: 'twice_vulnerable'
}

/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split('/').filter(Boolean).pop())

const baseStat = (pokemon: ApiPokemon, name: string): number =>
	pokemon.stats.find(s => s.stat.name === name)?.base_stat ?? 0

const computeResistances = (types: ApiType[]): Resistance[] =>
	ATTACKING_TYPES.map(attacker => {
		const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
			if (relations.no_damage_from.some(t => t.name === attacker)) return 0
			if (relations.double_damage_from.some(t => t.name === attacker)) return multiplier * 2
			if (relations.half_damage_from.some(t => t.name === attacker)) return multiplier * 0.5
			return multiplier
		}, 1)

		return {
			name: attacker,
			damage_multiplier,
			damage_relation: DAMAGE_RELATIONS[damage_multiplier] ?? 'neutral',
		}
	})

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined =>
	link.species.name === speciesName
		? link
		: link.evolves_to.map(child => findChainLink(child, speciesName)).find(Boolean)

/**
 * Fetch a pokemon from PokeAPI and adapt it to the legacy pokebuildapi `Pokemon` shape
 */
export async function fetchPokemon(id: number): Promise<Pokemon> {
	const { data: pokemon } = await axios.get<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)

	const [types, { data: species }] = await Promise.all([
		Promise.all(
			[...pokemon.types]
				.sort((a, b) => a.slot - b.slot)
				.map(({ type }) => axios.get<ApiType>(type.url).then(r => r.data))
		),
		axios.get<ApiSpecies>(pokemon.species.url)
	])

	const { data: evolutionChain } = await axios.get<ApiEvolutionChain>(species.evolution_chain.url)

	const apiEvolutions: Evolution[] = (findChainLink(evolutionChain.chain, species.name)?.evolves_to ?? [])
		.map(({ species: evolution }) => ({ name: evolution.name, pokedexId: idFromUrl(evolution.url) }))

	const apiResistances = computeResistances(types)
	const firstAbility = pokemon.abilities[0]?.ability

	return {
		id: pokemon.id,
		pokedexId: pokemon.id,
		name: pokemon.name,
		image: pokemon.sprites.other['official-artwork'].front_default ?? '',
		sprite: pokemon.sprites.front_default ?? '',
		slug: pokemon.name,
		stats: {
			HP: baseStat(pokemon, 'hp'),
			attack: baseStat(pokemon, 'attack'),
			defense: baseStat(pokemon, 'defense'),
			special_attack: baseStat(pokemon, 'special-attack'),
			special_defense: baseStat(pokemon, 'special-defense'),
			speed: baseStat(pokemon, 'speed')
		},
		apiTypes: types.map(type => ({
			name: type.name,
			image: type.sprites?.['generation-viii']?.['sword-shield']?.name_icon ?? ''
		})),
		apiGeneration: idFromUrl(species.generation.url),
		apiResistances,
		// PokeAPI has no equivalent: best effort with the first ability
		resistanceModifyingAbilitiesForApi: { name: firstAbility?.name ?? '', slug: firstAbility?.name ?? '' },
		apiEvolutions,
		apiPreEvolution: species.evolves_from_species?.name ?? 'none',
		// PokeAPI does not compute ability effects on resistances
		apiResistancesWithAbilities: apiResistances
	}
}
