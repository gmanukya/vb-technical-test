import type { SlotView } from '../lib/selectionModel'
import { Button } from '../../../shared/ui/Button'
import { DockActions } from './DockActions'
import { SelectionSlot } from './SelectionSlot'

interface SelectionDockProps {
  visible: boolean
  slots: SlotView[]
  ready: boolean
  busy: boolean
  onRemove: (id: number) => void
  onClear: () => void
  onStory: () => void
  onMatch: () => void
}

export function SelectionDock(props: SelectionDockProps) {
  if (!props.visible) {
    return null
  }

  const slots = props.slots.map((slot) => (
    <SelectionSlot key={slot.key} slot={slot} onRemove={props.onRemove} />
  ))

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-header backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="grid grid-cols-2 gap-2">{slots}</div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button tone="ghost" onClick={props.onClear}>Clear</Button>
          <DockActions ready={props.ready} busy={props.busy} onStory={props.onStory} onMatch={props.onMatch} />
        </div>
      </div>
    </div>
  )
}
