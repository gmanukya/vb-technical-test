import { dexLabel, formatPokemonName } from '../../../shared/lib/formatName'
import { toSwatches, typeWash, type TypeSwatch } from '../../../shared/lib/typeColors'
import type { Pokemon } from '../../../shared/types/pokemon'
import type { BattleStatus, TurnFighter, TurnRound } from '../types'

export interface FighterView {
  id: number
  name: string
  image: string
  dexLabel: string
  types: TypeSwatch[]
  wash: string
  hpLabel: string
  hpRatio: number
  showHp: boolean
  className: string
}

export interface FighterPair {
  left: FighterView | null
  right: FighterView | null
}

export function storyFighters(selected: readonly Pokemon[]): FighterView[] {
  return selected.map((pokemon) => toFighter(pokemon, pokemon.stats.HP, pokemon.stats.HP, false, false))
}

export function matchFighters(
  selected: readonly Pokemon[],
  rounds: readonly TurnRound[],
  winnerId: number | null,
  status: BattleStatus,
): FighterView[] {
  const latest = rounds[rounds.length - 1]

  return selected.map((pokemon, index) => {
    const side = sideFor(index, latest)
    const hp = side ? side.hp : pokemon.stats.HP
    const maxHp = side ? side.maxHp : pokemon.stats.HP
    
    return toFighter(pokemon, hp, maxHp, fighterFaded(status, winnerId, pokemon.id), true)
  })
}

export function pairFighters(fighters: readonly FighterView[]): FighterPair {
  const left = fighters[0]
  const right = fighters[1]
  
  return {
    left: left ?? null,
    right: right ?? null,
  }
}

function toFighter(
  pokemon: Pokemon,
  hp: number,
  maxHp: number,
  faded: boolean,
  showHp: boolean,
): FighterView {
  return {
    id: pokemon.id,
    name: formatPokemonName(pokemon.name),
    image: pokemon.image,
    dexLabel: dexLabel(pokemon.id),
    types: toSwatches(pokemon.apiTypes),
    wash: typeWash(primaryType(pokemon)),
    hpLabel: `${hp}/${maxHp}`,
    hpRatio: hpRatio(hp, maxHp),
    showHp,
    className: fighterClassName(faded),
  }
}

function primaryType(pokemon: Pokemon): string | undefined {
  const first = pokemon.apiTypes[0]
  
  if (!first) {
    return undefined
  }
  
  return first.name
}

function sideFor(index: number, latest: TurnRound | undefined): TurnFighter | undefined {
  if (!latest) {
    return undefined
  }

  if (index === 0) {
    return latest.left
  }
  
  return latest.right
}

function fighterFaded(status: BattleStatus, winnerId: number | null, pokemonId: number): boolean {
  if (status !== 'done') {
    return false
  }

  if (winnerId === null) {
    return false
  }
  
  return winnerId !== pokemonId
}

function fighterClassName(faded: boolean): string {
  if (faded) {
    return 'flex flex-col opacity-40'
  }

  return 'flex flex-col'
}

function hpRatio(hp: number, maxHp: number): number {
  if (maxHp === 0) {
    return 0
  }
  
  return Math.max(0, Math.min(1, hp / maxHp))
}
