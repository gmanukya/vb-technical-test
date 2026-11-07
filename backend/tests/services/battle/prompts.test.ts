import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { PokemonSummary } from '../../../src/types/pokemon'
import type { Fighter } from '../../../src/services/battle/fighters'
import { battlePrompt, turnPrompt } from '../../../src/services/battle/prompts'

const bulbasaur: PokemonSummary = {
	id: 1,
	name: 'bulbasaur',
	image: '',
	stats: { HP: 45, attack: 49, defense: 49, speed: 45 },
	apiTypes: [{ name: 'grass' }, { name: 'poison' }],
}

const charmander: PokemonSummary = {
	id: 4,
	name: 'charmander',
	image: '',
	stats: { HP: 39, attack: 52, defense: 43, speed: 65 },
	apiTypes: [{ name: 'fire' }],
}

function fighter(id: number, name: string): Fighter {
	return {
		id,
		name,
		hp: 40,
		maxHp: 45,
		attack: 49,
		defense: 49,
		speed: 45,
		types: ['grass'],
		resistances: [],
		moves: [{ name: 'tackle', type: 'normal', power: 40 }],
	}
}

describe('battle prompts', () => {
	it('names both fighters in the story brief', () => {
		const prompt = battlePrompt([bulbasaur, charmander])
		assert.match(prompt, /Bulbasaur/)
		assert.match(prompt, /Charmander/)
	})

	it('asks for move JSON and does not recount a previous round on the opening turn', () => {
		const prompt = turnPrompt(fighter(1, 'bulbasaur'), fighter(4, 'charmander'), [])
		assert.match(prompt, /\{"left":"<move>","right":"<move>"\}/)
		assert.doesNotMatch(prompt, /The last round/)
		assert.doesNotMatch(prompt, /for \d+ damage/)
	})

	it('includes the previous hit on a follow-up turn', () => {
		const left = fighter(1, 'bulbasaur')
		const right = fighter(4, 'charmander')
		const prompt = turnPrompt(left, right, [{
			attackerId: left.id,
			move: 'tackle',
			damage: 12,
			targetHp: 27,
		}])
		assert.match(prompt, /The last round/)
		assert.match(prompt, /Bulbasaur used tackle for 12 damage/)
	})
})
