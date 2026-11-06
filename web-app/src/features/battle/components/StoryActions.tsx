import { Button } from '../../../shared/ui/Button'
import type { ActiveBattleStatus } from '../types'

interface StoryActionsProps {
  status: ActiveBattleStatus
  onCancel: () => void
  onRetry: () => void
}

export function StoryActions({ status, onCancel, onRetry }: StoryActionsProps) {
  if (status === 'streaming') {
    return <Button onClick={onCancel}>Cancel</Button>
  }
  
  return <Button onClick={onRetry}>Fight again</Button>
}
