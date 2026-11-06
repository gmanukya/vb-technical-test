import { dexLabel, formatPokemonName } from '../../../shared/lib/formatName'
import type { Pokemon } from '../../../shared/types/pokemon'

export interface SlotView {
  key: string
  pokemonId: number | null
  name: string
  image: string
  dexLabel: string
  removeLabel: string
}

export function selectionSlots(selected: readonly Pokemon[]): SlotView[] {
  const slots: SlotView[] = selected.map((pokemon) => {
    const name = formatPokemonName(pokemon.name)
    
    return {
      key: String(pokemon.id),
      pokemonId: pokemon.id,
      name,
      image: pokemon.image,
      dexLabel: dexLabel(pokemon.id),
      removeLabel: `Remove ${name}`,
    }
  })

  while (slots.length < 2) {
    slots.push({
      key: `empty-${slots.length}`,
      pokemonId: null,
      name: '',
      image: '',
      dexLabel: '',
      removeLabel: '',
    })
  }

  return slots
}

export function selectedPokemons(pokemons: readonly Pokemon[], ids: readonly number[]): Pokemon[] {
  const byId = new Map(pokemons.map((pokemon) => [pokemon.id, pokemon]))
  const selected: Pokemon[] = []
  
  for (const id of ids) {
    const pokemon = byId.get(id)
    
    if (!pokemon) {
      continue
    }

    selected.push(pokemon)
  }
  return selected
}

export function dockIsVisible(count: number): boolean {
  return count > 0
}

export function selectionReady(count: number): boolean {
  return count === 2
}
