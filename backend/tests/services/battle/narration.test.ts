import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { joinNarration, narrationWithoutMoveJson } from '../../../src/services/battle/narration'

describe('narrationWithoutMoveJson', () => {
	it('keeps prose that has no move JSON', () => {
		assert.equal(narrationWithoutMoveJson('Pikachu leaps.'), 'Pikachu leaps.')
	})

	it('drops a finished move object', () => {
		assert.equal(
			narrationWithoutMoveJson('Pikachu leaps. {"left":"tackle","right":"ember"}'),
			'Pikachu leaps.',
		)
	})

	it('hides an unfinished object and the fence in front of it', () => {
		assert.equal(
			narrationWithoutMoveJson('Pikachu leaps.\n```json\n{"left":'),
			'Pikachu leaps.',
		)
	})

	it('keeps the prose after the move object', () => {
		assert.equal(
			narrationWithoutMoveJson('Before {"left":"a","right":"b"} after'),
			'Before\nafter',
		)
	})

	it('strips bold markers', () => {
		assert.equal(narrationWithoutMoveJson('A **bold** hit.'), 'A bold hit.')
	})
})

describe('joinNarration', () => {
	it('inserts a blank line between two pieces', () => {
		assert.equal(joinNarration('Left.', 'Right.'), 'Left.\n\nRight.')
	})

	it('returns the only piece when the other side is empty', () => {
		assert.equal(joinNarration('', 'Right.'), 'Right.')
		assert.equal(joinNarration('Left.', ''), 'Left.')
	})
})
