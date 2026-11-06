import type { PokemonSummary } from '../types/pokemon'

/** Short battle brief. The model writes the rounds; we only supply the two fighters. */
export function battlePrompt(pokemons: [PokemonSummary, PokemonSummary]): string {
	const [left, right] = pokemons
	const names = `${label(left.name)} and ${label(right.name)}`

	return [
		`Simulate a short Pokémon battle between ${names}.`,
		'Use their types and the stats below. Play a few rounds, apply type advantages, and end with a clear winner.',
		'Write the battle as plain text and start with the first round.',
		'',
		describe(left),
		describe(right),
	].join('\n')
}

function describe(pokemon: PokemonSummary): string {
	const types = pokemon.apiTypes.map(type => type.name).join(', ')
	const { HP, attack, defense, speed } = pokemon.stats
	return `${label(pokemon.name)} (#${pokemon.id}): ${types}. HP ${HP}, Attack ${attack}, Defense ${defense}, Speed ${speed}.`
}

function label(name: string): string {
	return name
		.split('-')
		.filter(Boolean)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}
