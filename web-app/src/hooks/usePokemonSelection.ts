import { useCallback, useState } from 'react'

const MAX_SELECTED = 2

export function usePokemonSelection() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggle = useCallback((id: number) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id)
      }
      if (current.length >= MAX_SELECTED) {
        return current
      }
      return [...current, id]
    })
  }, [])

  const remove = useCallback((id: number) => {
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id))
  }, [])

  const clear = useCallback(() => {
    setSelectedIds([])
  }, [])

  return {
    selectedIds,
    toggle,
    remove,
    clear,
    isFull: selectedIds.length >= MAX_SELECTED,
  }
}
