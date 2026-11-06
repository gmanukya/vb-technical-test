import type { Resistance } from '../../types/pokemon'
import type { ApiMove, ApiPokemon, ApiPokemonMove } from '../pokeapi/apiTypes'
import { fetchPokemon } from '../pokeapi'
import { cachedGet, idFromUrl, POKEAPI_URL } from '../pokeapi/http'

/** A damaging move the fighter can choose. */
export interface FighterMove {
	name: string
	type: string
	power: number
}

/** A Pokémon loaded for a turn battle, including the moves the model may pick. */
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
	let listedMoves: ApiPokemonMove[] = []
	if (raw.moves !== undefined) {
		listedMoves = raw.moves
	}
	const moves = await damagingMoves(listedMoves)
	if (moves.length === 0) {
		moves.push(TACKLE)
	}

	return {
		id: pokemon.id,
		name: pokemon.name,
		hp: pokemon.stats.HP,
		maxHp: pokemon.stats.HP,
		attack: pokemon.stats.attack,
		defense: pokemon.stats.defense,
		speed: pokemon.stats.speed,
		types: pokemon.apiTypes.map((type) => {
			return type.name
		}),
		resistances: pokemon.apiResistances,
		moves,
	}
}

async function damagingMoves(moves: ApiPokemonMove[]): Promise<FighterMove[]> {
	const candidates = levelUpCandidates(moves).slice(0, MOVE_CANDIDATES)
	const damaging: FighterMove[] = []

	for (let index = 0; index < candidates.length && damaging.length < MOVE_GOAL; index += MOVE_GOAL) {
		const details = await Promise.all(candidates.slice(index, index + MOVE_GOAL).map((move) => {
			return cachedGet<ApiMove>(move.url)
		}))
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
	const learned = moves.flatMap((entry) => {
		const levelUps = entry.version_group_details.filter((detail) => {
			return detail.move_learn_method.name === 'level-up'
		})
		return levelUps.map((detail) => {
			return {
				name: entry.move.name,
				url: entry.move.url,
				level: detail.level_learned_at,
				groupId: idFromUrl(detail.version_group.url),
			}
		})
	})

	if (learned.length === 0) return []

	const newest = Math.max(...learned.map((move) => {
		return move.groupId
	}))
	const unique = new Map<string, { name: string, url: string, level: number }>()
	for (const move of learned.filter((entry) => {
		return entry.groupId === newest
	})) {
		const existing = unique.get(move.name)
		if (!existing || move.level > existing.level) {
			unique.set(move.name, move)
		}
	}

	return [...unique.values()]
		.sort((a, b) => {
			const byLevel = b.level - a.level
			if (byLevel !== 0) {
				return byLevel
			}
			return a.name.localeCompare(b.name)
		})
		.map(({ name, url }) => {
			return { name, url }
		})
}
