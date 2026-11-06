import type { Pokemon } from './types/pokemon'

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s-]+/g, '')
}

/**
 * Case-insensitive name search plus type chips.
 * A Pokémon matches when its name contains the query and it has any selected type.
 * No selected types means every type is allowed.
 */
export function filterPokemons(pokemons: Pokemon[], query: string, types: readonly string[]): Pokemon[] {
  const needle = normalize(query.trim())

  return pokemons.filter((pokemon) => {
    const nameMatches = needle.length === 0 || normalize(pokemon.name).includes(needle)
    const typeMatches = types.length === 0 || pokemon.apiTypes.some((type) => types.includes(type.name))
    return nameMatches && typeMatches
  })
}
