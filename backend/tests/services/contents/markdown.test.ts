import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Pokemon } from '../../../src/types/pokemon'
import { markdownFilename, pokemonToMarkdown } from '../../../src/services/contents/markdown'

function pokemon(overrides: Partial<Pokemon> = {}): Pokemon {
	return {
		id: 25,
		name: 'Pikachu',
		stats: {
			HP: 35,
			attack: 55,
			defense: 40,
			special_attack: 50,
			special_defense: 50,
			speed: 90,
		},
		apiTypes: [{ name: 'electric' }],
		apiGeneration: 1,
		apiResistances: [{ name: 'ground', damage_multiplier: 2, damage_relation: 'vulnerable' }],
		abilities: [],
		apiEvolutions: [],
		apiPreEvolution: 'pichu',
		...overrides,
	}
}

describe('pokemonToMarkdown', () => {
	it('keeps the same headings and empty sections', () => {
		const markdown = pokemonToMarkdown(pokemon())
		assert.match(markdown, /^# Pikachu/)
		assert.match(markdown, /## Base stats/)
		assert.match(markdown, /## Resistances/)
		assert.match(markdown, /## Abilities\n\n- none/)
		assert.match(markdown, /## Evolution/)
		assert.match(markdown, /\*\*Pre-evolution:\*\* pichu/)
		assert.match(markdown, /\*\*Evolves into:\*\*\n\n- none/)
		assert.match(markdown, /\| Special Attack \| 50 \|/)
	})
})

describe('markdownFilename', () => {
	it('pads the id and strips characters outside the dex filename', () => {
		assert.equal(markdownFilename({ id: 25, name: 'Pikachu' }), '025-pikachu.md')
		assert.equal(markdownFilename({ id: 122, name: 'Mr. Mime' }), '122-mrmime.md')
	})
})
