interface HpMeterProps {
  label: string
  ratio: number
  visible: boolean
}

export function HpMeter({ label, ratio, visible }: HpMeterProps) {
  const barStyle = { width: `${ratio * 100}%` }
  
  if (!visible) {
    return null
  }

  return (
    <div className="mt-4 w-full">
      <div className="mb-2 flex items-center justify-between text-[11px] tracking-[0.14em] uppercase text-muted">
        <span>HP</span>
        <span className="tabular-nums">{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-wash">
        <div className="h-full rounded-full bg-hp transition-[width] duration-500" style={barStyle} />
      </div>
    </div>
  )
}
