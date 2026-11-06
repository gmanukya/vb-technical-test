import { dexLabel, formatPokemonName } from '../../../shared/lib/formatName'
import { toSwatches, typeWash, type TypeSwatch } from '../../../shared/lib/typeColors'
import type { Pokemon } from '../../../shared/types/pokemon'
import { cardClassName } from './catalogClassName'

export type SortKey = 'dex' | 'name' | 'hp' | 'attack' | 'defense' | 'speed'

export interface StatItem {
  label: string
  value: number
}

export interface CardModel {
  id: number
  name: string
  dexLabel: string
  image: string
  types: TypeSwatch[]
  wash: string
  stats: StatItem[]
  selected: boolean
  disabled: boolean
  slotMark: string
  ariaLabel: string
  className: string
}

const SLOT_MARKS = ['01', '02']

/**
 * Case-insensitive name search plus type chips, then a stable sort.
 * A Pokémon matches when its name contains the query and it has any selected type.
 * No selected types means every type is allowed.
 */
export function filterPokemons(
  pokemons: readonly Pokemon[],
  query: string,
  types: readonly string[],
  sort: SortKey,
): Pokemon[] {
  const needle = normalize(query.trim())
  const matched = pokemons.filter((pokemon) => {
    const nameMatches = needle.length === 0 || normalize(pokemon.name).includes(needle)
    const typeMatches = types.length === 0 || pokemon.apiTypes.some((type) => types.includes(type.name))
    return nameMatches && typeMatches
  })

  return [...matched].sort(SORTERS[sort])
}

export function buildCatalog(
  pokemons: readonly Pokemon[],
  query: string,
  types: readonly string[],
  sort: SortKey,
  selectedIds: readonly number[],
): CardModel[] {
  return toCardModels(filterPokemons(pokemons, query, types, sort), selectedIds)
}

export function readSort(value: string): SortKey {
  if (value === 'name') {
    return 'name'
  }

  if (value === 'hp') {
    return 'hp'
  }
  
  if (value === 'attack') {
    return 'attack'
  }
  
  if (value === 'defense') {
    return 'defense'
  }
  
  if (value === 'speed') {
    return 'speed'
  }
  
  return 'dex'
}

function toCardModels(pokemons: readonly Pokemon[], selectedIds: readonly number[]): CardModel[] {
  const slotIndex = new Map(selectedIds.map((id, index) => [id, index]))
  const full = selectedIds.length >= 2

  return pokemons.map((pokemon) => {
    const name = formatPokemonName(pokemon.name)
    const selected = slotIndex.has(pokemon.id)
    const disabled = full && !selected
    
    return {
      id: pokemon.id,
      name,
      dexLabel: dexLabel(pokemon.id),
      image: pokemon.image,
      types: toSwatches(pokemon.apiTypes),
      wash: typeWash(primaryType(pokemon)),
      stats: [
        { label: 'HP', value: pokemon.stats.HP },
        { label: 'Atk', value: pokemon.stats.attack },
        { label: 'Def', value: pokemon.stats.defense },
        { label: 'Spe', value: pokemon.stats.speed },
      ],
      selected,
      disabled,
      slotMark: slotMarkFor(slotIndex.get(pokemon.id)),
      ariaLabel: selectionLabel(selected, name),
      className: cardClassName({ selected, disabled }),
    }
  })
}

function primaryType(pokemon: Pokemon): string | undefined {
  const first = pokemon.apiTypes[0]
  
  if (!first) {
    return undefined
  }
  
  return first.name
}

function slotMarkFor(index: number | undefined): string {
  if (index === undefined) {
    return ''
  }

  return SLOT_MARKS[index] ?? ''
}

function selectionLabel(selected: boolean, name: string): string {
  if (selected) {
    return `Deselect ${name}`
  }

  return `Select ${name}`
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s-]+/g, '')
}

function byDex(a: Pokemon, b: Pokemon): number {
  return a.id - b.id
}

function byName(a: Pokemon, b: Pokemon): number {
  const delta = a.name.localeCompare(b.name)
  
  if (delta !== 0) {
    return delta
  }

  return a.id - b.id
}

function byStat(read: (pokemon: Pokemon) => number) {
  return (a: Pokemon, b: Pokemon) => {
    const delta = read(b) - read(a)

    if (delta !== 0) {
      return delta
    }
    
    return a.id - b.id
  }
}

const SORTERS: Record<SortKey, (a: Pokemon, b: Pokemon) => number> = {
  dex: byDex,
  name: byName,
  hp: byStat((pokemon) => pokemon.stats.HP),
  attack: byStat((pokemon) => pokemon.stats.attack),
  defense: byStat((pokemon) => pokemon.stats.defense),
  speed: byStat((pokemon) => pokemon.stats.speed),
}
