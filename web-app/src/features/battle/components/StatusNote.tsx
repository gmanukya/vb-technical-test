import { STATUS_NOTE } from '../lib/battleCopy'
import type { BattleStatus } from '../types'

interface StatusNoteProps {
  status: BattleStatus
}

export function StatusNote({ status }: StatusNoteProps) {
  const note = STATUS_NOTE[status]

  if (note.length === 0) {
    return null
  }
  
  return <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{note}</p>
}
