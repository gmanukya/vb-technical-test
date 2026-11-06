import { Button } from '../../../shared/ui/Button'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center text-ink">
      <p className="font-display text-4xl tracking-tight">Couldn't load Pokémon</p>
      <p className="max-w-sm text-sm text-muted">The list didn't come back. Try again.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
