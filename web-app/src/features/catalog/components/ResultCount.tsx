interface ResultCountProps {
  shown: number
  total: number
}

export function ResultCount({ shown, total }: ResultCountProps) {
  return (
    <p className="shrink-0 text-sm tabular-nums text-muted" aria-live="polite">
      {shown} of {total}
    </p>
  )
}
