import { Button } from '../../../shared/ui/Button'
import type { ActiveBattleStatus } from '../types'

interface MatchActionsProps {
  status: ActiveBattleStatus
  onCancel: () => void
}

export function MatchActions({ status, onCancel }: MatchActionsProps) {
  if (status !== 'streaming') {
    return null
  }
  
  return <Button onClick={onCancel}>Cancel</Button>
}
