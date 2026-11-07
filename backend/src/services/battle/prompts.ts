import type { PokemonSummary } from '../../types/pokemon'
import type { RoundHit } from './engine'
import type { Fighter } from './fighters'

/** Short battle brief. The model writes the rounds; we only supply the two fighters. */
export function battlePrompt(pokemons: [PokemonSummary, PokemonSummary]): string {
	const [left, right] = pokemons
	const names = `${label(left.name)} and ${label(right.name)}`

	return [
		`Simulate a short Pokémon battle between ${names}.`,
		'Use their types and the stats below. Play a few rounds, apply type advantages, and end with a clear winner.',
		'Write the battle as plain text and start with the first round.',
		'',
		describeSummary(left),
		describeSummary(right),
	].join('\n')
}

/**
 * One turn. The model names two moves and must not narrate damage.
 * Hits from the previous round are included when there are any.
 */
export function turnPrompt(left: Fighter, right: Fighter, hits: RoundHit[]): string {
	const lines = [
		'Write two short sentences. Name the attack each Pokémon chooses.',
		'Do not describe hits landing, damage, remaining HP, or a winner. The server decides whether the slower Pokémon gets to attack.',
		'After the sentences, write only this JSON and no code fence: {"left":"<move>","right":"<move>"}',
		'Use only the move names listed for that Pokémon.',
		'',
		describeFighter(left, 'left'),
		describeFighter(right, 'right'),
	]

	if (hits.length === 0) {
		return lines.join('\n')
	}

	return [
		'The last round:',
		...hits.map((hit) => {
			return describeHit(left, right, hit)
		}),
		...lines,
	].join('\n')
}

function describeHit(left: Fighter, right: Fighter, hit: RoundHit): string {
	let attacker = label(right.name)
	let defender = label(left.name)
	if (hit.attackerId === left.id) {
		attacker = label(left.name)
		defender = label(right.name)
	}
	return `${attacker} used ${hit.move} for ${hit.damage} damage. ${defender} has ${hit.targetHp} HP.`
}

function describeSummary(pokemon: PokemonSummary): string {
	const types = pokemon.apiTypes.map((type) => {
		return type.name
	}).join(', ')
	const { HP, attack, defense, speed } = pokemon.stats
	return `${label(pokemon.name)} (#${pokemon.id}): ${types}. HP ${HP}, Attack ${attack}, Defense ${defense}, Speed ${speed}.`
}

function describeFighter(fighter: Fighter, side: 'left' | 'right'): string {
	return [
		`${side} is ${label(fighter.name)} (#${fighter.id}).`,
		`Types: ${fighter.types.join(', ') || 'none'}.`,
		`HP ${fighter.hp} of ${fighter.maxHp}. Attack ${fighter.attack}. Defense ${fighter.defense}. Speed ${fighter.speed}.`,
		`Moves: ${fighter.moves.map((move) => {
			return move.name
		}).join(', ')}.`,
	].join(' ')
}

function label(name: string): string {
	return name.split('-').filter(Boolean).map((part) => {
		return part.charAt(0).toUpperCase() + part.slice(1)
	}).join(' ')
}
