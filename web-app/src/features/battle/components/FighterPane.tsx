import type { FighterView } from '../lib/fighterModel'
import { FighterCard } from './FighterCard'

interface FighterPaneProps {
  fighter: FighterView | null
}

export function FighterPane({ fighter }: FighterPaneProps) {
  if (fighter === null) {
    return null
  }
  
  return <FighterCard fighter={fighter} />
}
