/** `mr-mime` becomes `Mr Mime`. */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
