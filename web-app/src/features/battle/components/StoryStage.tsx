import { BATTLE_TITLE } from '../lib/battleCopy'
import { pairFighters, type FighterView } from '../lib/fighterModel'
import type { ActiveBattleStatus, BattleStatus } from '../types'
import { BattleStage } from './BattleStage'
import { FighterPane } from './FighterPane'
import { StoryActions } from './StoryActions'
import { StoryBody } from './StoryBody'

interface StoryStageProps {
  status: BattleStatus
  text: string
  error: string | null
  fighters: FighterView[]
  onCancel: () => void
  onClose: () => void
  onRetry: () => void
}

export function StoryStage(props: StoryStageProps) {
  if (props.status === 'idle') {
    return null
  }
  
  return (
    <StoryStageOpen
      status={props.status}
      text={props.text}
      error={props.error}
      fighters={props.fighters}
      onCancel={props.onCancel}
      onClose={props.onClose}
      onRetry={props.onRetry}
    />
  )
}

interface StoryStageOpenProps {
  status: ActiveBattleStatus
  text: string
  error: string | null
  fighters: FighterView[]
  onCancel: () => void
  onClose: () => void
  onRetry: () => void
}

function StoryStageOpen(props: StoryStageOpenProps) {
  const pair = pairFighters(props.fighters)

  return (
    <BattleStage
      title={BATTLE_TITLE[props.status]}
      kicker="Story"
      status={props.status}
      onClose={props.onClose}
      showFooter
      left={<FighterPane fighter={pair.left} />}
      right={<FighterPane fighter={pair.right} />}
      actions={<StoryActions status={props.status} onCancel={props.onCancel} onRetry={props.onRetry} />}
    >
      <StoryBody text={props.text} error={props.error} status={props.status} />
    </BattleStage>
  )
}
