import type { HitLine } from '../lib/battleCopy'

interface MoveTimelineProps {
  lines: HitLine[]
}

export function MoveTimeline({ lines }: MoveTimelineProps) {
  if (lines.length === 0) {
    return null
  }

  const items = lines.map((line) => <MoveLine key={line.id} text={line.text} />)
  
  return <ol className="space-y-2 border-t border-line pt-4">{items}</ol>
}

interface MoveLineProps {
  text: string
}

function MoveLine({ text }: MoveLineProps) {
  return <li className="text-sm leading-6 text-muted">{text}</li>
}
