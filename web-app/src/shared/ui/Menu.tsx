import { useCallback, useRef, useState, type ReactNode } from 'react'

import { useDismiss } from '../hooks/useDismiss'
import { Button } from './Button'

interface MenuProps {
  label: string
  children: ReactNode
}

export function Menu({ label, children }: MenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => {
    setOpen((current) => !current)
  }, [])

  useDismiss(open, close, rootRef)

  return (
    <div className="relative" ref={rootRef}>
      <Button tone="control" onClick={toggle} expanded={open}>{label}</Button>
      <MenuPanel open={open}>{children}</MenuPanel>
    </div>
  )
}

interface MenuPanelProps {
  open: boolean
  children: ReactNode
}

function MenuPanel({ open, children }: MenuPanelProps) {
  if (!open) {
    return null
  }

  return (
    <div className="absolute right-0 z-30 mt-2 max-h-[24rem] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-panel">
      {children}
    </div>
  )
}
