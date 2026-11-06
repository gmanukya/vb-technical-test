import type { BattleStatus } from '../types'

interface StreamingBarProps {
  status: BattleStatus
}

export function StreamingBar({ status }: StreamingBarProps) {
  if (status !== 'streaming') {
    return null
  }
  
  return (
    <div className="h-px overflow-hidden bg-line">
      <div className="h-full w-1/3 animate-shimmer bg-ink" />
    </div>
  )
}
