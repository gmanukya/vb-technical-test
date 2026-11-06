import type { ReactNode } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Sheet } from '../../../shared/ui/Sheet'

interface TypeSheetProps {
  open: boolean
  countLabel: string
  onClose: () => void
  children: ReactNode
}

export function TypeSheet({ open, countLabel, onClose, children }: TypeSheetProps) {
  return (
    <Sheet open={open} title="Types" onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">{children}</div>
      <div className="border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button onClick={onClose} className="w-full">{countLabel}</Button>
      </div>
    </Sheet>
  )
}
