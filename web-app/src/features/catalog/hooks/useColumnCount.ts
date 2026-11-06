import { useLayoutEffect, useState, type RefObject } from 'react'

import { columnCountFor } from '../lib/columns'

export function useColumnCount(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(() => window.innerWidth)

  useLayoutEffect(() => {
    const node = ref.current
    
    if (!node) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (!entry) {
        return
      }

      setWidth(entry.contentRect.width)
    })

    observer.observe(node)
    setWidth(node.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [ref])

  return columnCountFor(width)
}
