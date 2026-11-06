import assert from 'node:assert/strict'
import { applyRound, computeDamage, parseMoveChoice, type Combatant, type Move } from './engine'

const tackle: Move = { name: 'tackle', type: 'normal', power: 40 }
const lick: Move = { name: 'lick', type: 'ghost', power: 30 }

const immune = computeDamage(
	{ attack: 100 },
	{ defense: 50, resistances: [{ name: 'ghost', damage_multiplier: 0 }] },
	lick,
)
assert.equal(immune, 0)

const slow: Combatant = {
	id: 1,
	hp: 5,
	attack: 10,
	defense: 10,
	speed: 10,
	resistances: [{ name: 'normal', damage_multiplier: 1 }],
}
const fast: Combatant = {
	id: 2,
	hp: 200,
	attack: 200,
	defense: 10,
	speed: 100,
	resistances: [{ name: 'normal', damage_multiplier: 1 }],
}

const koFromFaster = applyRound(slow, fast, tackle, tackle)
assert.equal(koFromFaster.hits.length, 1)
assert.equal(koFromFaster.hits[0]?.attackerId, fast.id)
assert.equal(koFromFaster.leftHp, 0)
assert.equal(koFromFaster.winnerId, fast.id)

const tiedLeft: Combatant = { ...slow, hp: 80, attack: 250, speed: 40 }
const tiedRight: Combatant = { ...fast, hp: 5, attack: 10, speed: 40 }
const koFromTie = applyRound(tiedLeft, tiedRight, tackle, tackle)
assert.equal(koFromTie.hits.length, 1)
assert.equal(koFromTie.hits[0]?.attackerId, tiedLeft.id)
assert.equal(koFromTie.winnerId, tiedLeft.id)

assert.deepEqual(
	parseMoveChoice('Sure. {"left":"vine whip","right":"ember"} thanks', ['vine-whip'], ['ember']),
	{ left: 'vine-whip', right: 'ember' },
)
assert.equal(parseMoveChoice('no json here', ['tackle'], ['ember']), null)
assert.equal(parseMoveChoice('{"left":"fly","right":"ember"}', ['tackle'], ['ember']), null)

console.log('battle engine ok')
