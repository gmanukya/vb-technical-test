import { useEffect, useRef } from 'react'
import type { HitLine } from '../lib/battleCopy'
import type { ActiveBattleStatus } from '../types'
import { ErrorText } from './ErrorText'
import { MoveTimeline } from './MoveTimeline'
import { Narration } from './Narration'
import { StatusNote } from './StatusNote'
import { WinnerLine } from './WinnerLine'

interface MatchBodyProps {
  text: string
  error: string | null
  status: ActiveBattleStatus
  lines: HitLine[]
  winner: string
}

export function MatchBody({ text, error, status, lines, winner }: MatchBodyProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [text, lines.length])

  return (
    <div className="flex flex-col gap-5 lg:py-2">
      <StatusNote status={status} />
      <ErrorText message={error} />
      <WinnerLine status={status} text={winner} />
      <Narration text={text} display={false} />
      <MoveTimeline lines={lines} />
      <div ref={endRef} />
    </div>
  )
}
