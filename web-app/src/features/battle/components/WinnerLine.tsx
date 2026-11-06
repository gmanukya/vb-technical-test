import type { BattleStatus } from '../types'

interface WinnerLineProps {
  status: BattleStatus
  text: string
}

export function WinnerLine({ status, text }: WinnerLineProps) {
  if (status !== 'done') {
    return null
  }
  
  return <p className="font-display text-4xl leading-none tracking-tight">{text}</p>
}
