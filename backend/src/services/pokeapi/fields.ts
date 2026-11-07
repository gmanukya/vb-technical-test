import type { ApiPokemon } from './apiTypes'

/** Official artwork URL, or the front sprite when artwork is missing. */
export const artwork = (pokemon: ApiPokemon): string => {
	const other = pokemon.sprites.other
	
	if (other !== undefined) {
		const official = other['official-artwork']

		if (official !== undefined && official.front_default !== null) {
			return official.front_default
		}
	}

	if (pokemon.sprites.front_default !== null) {
		return pokemon.sprites.front_default
	}

	return ''
}

/** A base stat by its PokeAPI name (`hp`, `attack`, `special-attack`, …). Missing stats are 0. */
export const baseStat = (pokemon: ApiPokemon, name: string): number => {
	const stat = pokemon.stats.find((entry) => {
		return entry.stat.name === name
	})

	if (stat === undefined) {
		return 0
	}

	return stat.base_stat
}
