export function columnCountFor(width: number): number {
  if (width >= 1200) {
    return 4
  }

  if (width >= 860) {
    return 3
  }

  if (width >= 560) {
    return 2
  }
  
  return 1
}
