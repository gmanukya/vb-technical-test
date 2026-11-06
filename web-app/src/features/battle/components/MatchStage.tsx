import { BATTLE_TITLE, type HitLine } from '../lib/battleCopy'
import { pairFighters, type FighterView } from '../lib/fighterModel'
import type { ActiveBattleStatus, BattleStatus } from '../types'
import { BattleStage } from './BattleStage'
import { FighterPane } from './FighterPane'
import { MatchActions } from './MatchActions'
import { MatchBody } from './MatchBody'

interface MatchStageProps {
  status: BattleStatus
  text: string
  error: string | null
  fighters: FighterView[]
  lines: HitLine[]
  winner: string
  onCancel: () => void
  onClose: () => void
}

export function MatchStage(props: MatchStageProps) {
  if (props.status === 'idle') {
    return null
  }
  
  return (
    <MatchStageOpen
      status={props.status}
      text={props.text}
      error={props.error}
      fighters={props.fighters}
      lines={props.lines}
      winner={props.winner}
      onCancel={props.onCancel}
      onClose={props.onClose}
    />
  )
}

interface MatchStageOpenProps {
  status: ActiveBattleStatus
  text: string
  error: string | null
  fighters: FighterView[]
  lines: HitLine[]
  winner: string
  onCancel: () => void
  onClose: () => void
}

function MatchStageOpen(props: MatchStageOpenProps) {
  const pair = pairFighters(props.fighters)
  const showFooter = props.status === 'streaming'

  return (
    <BattleStage
      title={BATTLE_TITLE[props.status]}
      kicker="Match"
      status={props.status}
      onClose={props.onClose}
      showFooter={showFooter}
      left={<FighterPane fighter={pair.left} />}
      right={<FighterPane fighter={pair.right} />}
      actions={<MatchActions status={props.status} onCancel={props.onCancel} />}
    >
      <MatchBody
        text={props.text}
        error={props.error}
        status={props.status}
        lines={props.lines}
        winner={props.winner}
      />
    </BattleStage>
  )
}
