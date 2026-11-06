export function joinClasses(parts: readonly string[]): string {
  return parts.filter((part) => {
    return part.length > 0
  }).join(' ')
}
