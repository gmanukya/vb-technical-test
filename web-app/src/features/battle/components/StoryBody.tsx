import type { ActiveBattleStatus } from '../types'
import { ErrorText } from './ErrorText'
import { Narration } from './Narration'
import { StatusNote } from './StatusNote'

interface StoryBodyProps {
  text: string
  error: string | null
  status: ActiveBattleStatus
}

export function StoryBody({ text, error, status }: StoryBodyProps) {
  return (
    <div className="flex flex-col gap-5 lg:py-4">
      <StatusNote status={status} />
      <ErrorText message={error} />
      <Narration text={text} display />
    </div>
  )
}
