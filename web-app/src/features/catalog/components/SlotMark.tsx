interface SlotMarkProps {
  mark: string
}

export function SlotMark({ mark }: SlotMarkProps) {
  if (mark.length === 0) {
    return null
  }
  
  return (
    <span className="absolute right-4 top-4 text-[11px] tracking-[0.2em] text-muted">{mark}</span>
  )
}
