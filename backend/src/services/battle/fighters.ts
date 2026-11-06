import type { Resistance } from '../../types/pokemon'
import type { ApiMove, ApiPokemon, ApiPokemonMove } from '../pokeapi/apiTypes'
import { fetchPokemon } from '../pokeapi'
import { cachedGet, POKEAPI_URL } from '../pokeapi/http'

export interface FighterMove {
	name: string
	type: string
	power: number
}

export interface Fighter {
	id: number
	name: string
	hp: number
	maxHp: number
	attack: number
	defense: number
	speed: number
	types: string[]
	resistances: Resistance[]
	moves: FighterMove[]
}

const TACKLE: FighterMove = { name: 'tackle', type: 'normal', power: 40 }
const MOVE_GOAL = 4
const MOVE_CANDIDATES = 12

/** Stats, type chart, and up to four damaging level-up moves for one fighter. */
export async function loadFighter(id: number): Promise<Fighter> {
	const [pokemon, raw] = await Promise.all([
		fetchPokemon(id),
		cachedGet<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`),
	])
	const moves = await damagingMoves(raw.moves ?? [])

	return {
		id: pokemon.id,
		name: pokemon.name,
		hp: pokemon.stats.HP,
		maxHp: pokemon.stats.HP,
		attack: pokemon.stats.attack,
		defense: pokemon.stats.defense,
		speed: pokemon.stats.speed,
		types: pokemon.apiTypes.map(type => type.name),
		resistances: pokemon.apiResistances,
		moves: moves.length > 0 ? moves : [TACKLE],
	}
}

async function damagingMoves(moves: ApiPokemonMove[]): Promise<FighterMove[]> {
	const candidates = levelUpCandidates(moves).slice(0, MOVE_CANDIDATES)
	const damaging: FighterMove[] = []

	for (let index = 0; index < candidates.length && damaging.length < MOVE_GOAL; index += MOVE_GOAL) {
		const details = await Promise.all(candidates.slice(index, index + MOVE_GOAL).map(move => cachedGet<ApiMove>(move.url)))
		for (const move of details) {
			if (move.power && move.power > 0 && damaging.length < MOVE_GOAL) {
				damaging.push({ name: move.name, type: move.type.name, power: move.power })
			}
		}
	}

	return damaging
}

/** Level-up moves from the newest version group, latest learned first. */
export function levelUpCandidates(moves: ApiPokemonMove[]): { name: string, url: string }[] {
	const learned = moves.flatMap(entry => entry.version_group_details
		.filter(detail => detail.move_learn_method.name === 'level-up')
		.map(detail => ({
			name: entry.move.name,
			url: entry.move.url,
			level: detail.level_learned_at,
			groupId: idFromUrl(detail.version_group.url),
		})))

	if (learned.length === 0) return []

	const newest = Math.max(...learned.map(move => move.groupId))
	const unique = new Map<string, { name: string, url: string, level: number }>()
	for (const move of learned.filter(entry => entry.groupId === newest)) {
		const existing = unique.get(move.name)
		if (!existing || move.level > existing.level) {
			unique.set(move.name, move)
		}
	}

	return [...unique.values()]
		.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
		.map(({ name, url }) => ({ name, url }))
}

function idFromUrl(url: string): number {
	return Number(url.split('/').filter(Boolean).pop())
}
