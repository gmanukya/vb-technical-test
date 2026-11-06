export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <div className="flex flex-col items-center gap-5">
        <p className="font-display text-4xl tracking-tight">PokeBattle</p>
        <div className="h-px w-24 overflow-hidden bg-line">
          <div className="h-full w-1/2 animate-shimmer bg-ink" />
        </div>
        <p className="text-sm tracking-wide text-muted">Gathering the dex</p>
      </div>
    </div>
  )
}
