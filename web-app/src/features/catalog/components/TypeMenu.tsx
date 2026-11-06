import type { ReactNode } from 'react'

import { Menu } from '../../../shared/ui/Menu'

interface TypeMenuProps {
  label: string
  children: ReactNode
}

export function TypeMenu({ label, children }: TypeMenuProps) {
  return <Menu label={label}>{children}</Menu>
}
