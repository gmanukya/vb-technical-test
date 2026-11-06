import { useMemo, useState } from 'react'

import { useDebouncedValue } from './useDebouncedValue'
import type { SortKey } from '../lib/filterPokemons'

export function useCatalogFilters() {
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('dex')
  const debouncedQuery = useDebouncedValue(query, 200)
  const searchQuery = searchNeedle(query, debouncedQuery)

  const layoutKey = useMemo(
    () => `${types.join('|')}:${query}`,
    [types, query],
  )

  const toggleType = (type: string) => {
    setTypes((current) => toggleInList(current, type))
  }

  const clear = () => {
    setQuery('')
    setTypes([])
  }

  return {
    query,
    setQuery,
    types,
    sort,
    setSort,
    searchQuery,
    toggleType,
    clear,
    active: filtersActive(query, types),
    layoutKey,
  }
}

function searchNeedle(query: string, debounced: string): string {
  if (query.trim() === '') {
    return ''
  }

  return debounced
}

function filtersActive(query: string, types: readonly string[]): boolean {
  if (query.trim() === '') {
    return types.length > 0
  }

  return true
}

function toggleInList(current: readonly string[], type: string): string[] {
  if (current.includes(type)) {
    return current.filter((item) => item !== type)
  }
  
  return [...current, type]
}
