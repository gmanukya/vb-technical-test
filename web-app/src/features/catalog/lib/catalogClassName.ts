export function catalogClassName(dockVisible: boolean): string {
  if (dockVisible) {
    return 'min-h-screen bg-bg pb-48 text-ink'
  }

  return 'min-h-screen bg-bg text-ink'
}

export function cardClassName(state: { selected: boolean, disabled: boolean }): string {
  const classes = [
    'group relative flex h-full w-full flex-col rounded-2xl border bg-surface p-4 text-left outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:cursor-not-allowed',
  ]

  if (state.selected) {
    classes.push('border-ink')
  } else {
    classes.push('border-line hover:border-muted')
  }

  if (state.disabled) {
    classes.push('opacity-40')
  }

  return classes.join(' ')
}

export function typeOptionClassName(selected: boolean): string {
  if (selected) {
    return 'flex items-center gap-2 rounded-xl border border-ink bg-wash px-2.5 py-2 text-left text-sm text-ink'
  }

  return 'flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left text-sm text-ink hover:border-line'
}

export function typeMenuLabel(count: number): string {
  if (count === 0) {
    return 'Type'
  }
  
  return `Type · ${count}`
}

export function showCountLabel(shown: number): string {
  return `Show ${shown}`
}
