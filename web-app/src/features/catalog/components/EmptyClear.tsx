import { Button } from '../../../shared/ui/Button'

interface EmptyClearProps {
  active: boolean
  onClear: () => void
}

export function EmptyClear({ active, onClear }: EmptyClearProps) {
  if (!active) {
    return null
  }
  
  return <Button onClick={onClear}>Clear filters</Button>
}
