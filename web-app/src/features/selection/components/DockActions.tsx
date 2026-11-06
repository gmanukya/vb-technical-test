import { Button } from '../../../shared/ui/Button'

interface DockActionsProps {
  ready: boolean
  busy: boolean
  onStory: () => void
  onMatch: () => void
}

export function DockActions({ ready, busy, onStory, onMatch }: DockActionsProps) {
  if (!ready) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onStory} disabled={busy} title="A streamed account of the battle">Story</Button>
      <Button onClick={onMatch} disabled={busy} title="A round by round battle">Match</Button>
    </div>
  )
}
