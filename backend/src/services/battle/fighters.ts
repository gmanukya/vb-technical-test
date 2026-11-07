import type { Resistance } from '../../types/pokemon'
import type { ApiMove, ApiPokemon, ApiPokemonMove, ApiType } from '../pokeapi/apiTypes'
import { baseStat } from '../pokeapi/fields'
import { cachedGet, POKEAPI_URL } from '../pokeapi/http'
import { computeResistances } from '../pokeapi/resistances'

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

/** Stats, type chart, and up to four damaging level-up moves for one fighter. */
export async function loadFighter(id: number): Promise<Fighter> {
	const pokemon = await cachedGet<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)
	const types = await Promise.all(
		[...pokemon.types]
			.sort((a, b) => {
				return a.slot - b.slot
			})
			.map((entry) => {
				return cachedGet<ApiType>(entry.type.url)
			}),
	)
	const moves = await damagingMoves(pokemon.moves)
	if (moves.length === 0) {
		moves.push(TACKLE)
	}

	const hp = baseStat(pokemon, 'hp')
	return {
		id: pokemon.id,
		name: pokemon.name,
		hp,
		maxHp: hp,
		attack: baseStat(pokemon, 'attack'),
		defense: baseStat(pokemon, 'defense'),
		speed: baseStat(pokemon, 'speed'),
		types: types.map((type) => {
			return type.name
		}),
		resistances: computeResistances(types),
		moves,
	}
}

/** The first damaging level-up moves, in the order PokeAPI lists them. */
async function damagingMoves(moves: ApiPokemonMove[]): Promise<FighterMove[]> {
	const damaging: FighterMove[] = []

	for (const entry of moves) {
		if (damaging.length >= MOVE_GOAL) {
			break
		}
		if (!isLevelUp(entry)) {
			continue
		}

		const move = await cachedGet<ApiMove>(entry.move.url)
		if (move.power !== null && move.power > 0) {
			damaging.push({ name: move.name, type: move.type.name, power: move.power })
		}
	}

	return damaging
}

function isLevelUp(entry: ApiPokemonMove): boolean {
	return entry.version_group_details.some((detail) => {
		return detail.move_learn_method.name === 'level-up'
	})
}
