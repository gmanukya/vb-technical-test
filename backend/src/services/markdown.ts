import type { Pokemon } from '../types/pokemon'

/**
 * One Pokémon as Markdown for a VirtualBrain document.
 * The headings stay the same for every file so the brain can compare them.
 */
export function pokemonToMarkdown(pokemon: Pokemon): string {
	const types = pokemon.apiTypes.map(type => type.name).join(', ') || 'none'
	const abilities = pokemon.abilities.map(ability => `- ${ability.name}`).join('\n') || '- none'
	const evolutions = pokemon.apiEvolutions.length === 0
		? '- none'
		: pokemon.apiEvolutions.map(evolution => `- ${evolution.name} (#${evolution.pokedexId})`).join('\n')

	const stats = [
		['HP', pokemon.stats.HP],
		['Attack', pokemon.stats.attack],
		['Defense', pokemon.stats.defense],
		['Special Attack', pokemon.stats.special_attack],
		['Special Defense', pokemon.stats.special_defense],
		['Speed', pokemon.stats.speed],
	].map(([stat, value]) => `| ${stat} | ${value} |`).join('\n')

	const resistances = pokemon.apiResistances
		.map(resistance => `| ${resistance.name} | ${resistance.damage_relation} | ${resistance.damage_multiplier} |`)
		.join('\n')

	return [
		`# ${pokemon.name}`,
		'',
		`- **Id:** ${pokemon.id}`,
		`- **Generation:** ${pokemon.apiGeneration}`,
		`- **Types:** ${types}`,
		'',
		'## Base stats',
		'',
		'| Stat | Value |',
		'| --- | --- |',
		stats,
		'',
		'## Resistances',
		'',
		'| Type | Relation | Multiplier |',
		'| --- | --- | --- |',
		resistances,
		'',
		'## Abilities',
		'',
		abilities,
		'',
		'## Evolution',
		'',
		`- **Pre-evolution:** ${pokemon.apiPreEvolution}`,
		'',
		'**Evolves into:**',
		'',
		evolutions,
		'',
	].join('\n')
}

/** `025-pikachu.md`. The id is padded so a folder listing stays in dex order. */
export function markdownFilename(pokemon: Pick<Pokemon, 'id' | 'name'>): string {
	const id = String(pokemon.id).padStart(3, '0')
	const name = pokemon.name.toLowerCase().replace(/[^a-z0-9-]+/g, '')
	return `${id}-${name}.md`
}
