interface ChipProps {
  label: string
  color: string
  onRemove: () => void
}

export function Chip({ label, color, onRemove }: ChipProps) {
  const dotStyle = { backgroundColor: color }
  const removeLabel = `Remove ${label}`

  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={removeLabel}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-ink"
    >
      <span className="h-2 w-2 rounded-full" style={dotStyle} />
      {label}
    </button>
  )
}
