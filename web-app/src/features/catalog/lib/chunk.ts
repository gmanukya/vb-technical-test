export function chunk<T>(items: readonly T[], size: number): T[][] {
  const safeSize = Math.max(1, size)
  const rows: T[][] = []

  for (let index = 0; index < items.length; index += safeSize) {
    rows.push(items.slice(index, index + safeSize))
  }
  
  return rows
}
