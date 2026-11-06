import { useEffect } from 'react'

interface DismissTarget {
  readonly current: HTMLElement | null
}

export function useDismiss(
  open: boolean,
  onClose: () => void,
  ref: DismissTarget,
) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onPointer = (event: PointerEvent) => {
      const node = ref.current
      if (!node) {
        return
      }

      if (!(event.target instanceof Node)) {
        return
      }

      if (node.contains(event.target)) {
        return
      }

      onClose()
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      onClose()
    }

    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, ref])
}
