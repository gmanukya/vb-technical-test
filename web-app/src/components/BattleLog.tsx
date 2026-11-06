import { useEffect, useRef } from 'react'
import type { BattleStatus } from '../hooks/useBattleStream'

interface BattleLogProps {
  text: string
  status: Exclude<BattleStatus, 'idle'>
  error: string | null
  onCancel: () => void
  onClose: () => void
  onRetry: () => void
}

export function BattleLog({ text, status, error, onCancel, onClose, onRetry }: BattleLogProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [text])

  const title = status === 'streaming'
    ? 'Battle in progress'
    : status === 'error'
      ? 'Battle failed'
      : status === 'cancelled'
        ? 'Battle cancelled'
        : 'Battle'

  return (
    <section
      aria-live="polite"
      className="fixed inset-x-3 bottom-36 z-40 max-h-[45vh] overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 text-slate-900 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:inset-x-auto sm:left-1/2 sm:w-[min(40rem,calc(100%-2rem))] sm:-translate-x-1/2"
    >
      <div className="flex items-center justify-between gap-3 border-b border-amber-200 px-4 py-3 dark:border-slate-600">
        <h2 className="font-medium">{title}</h2>
        <button type="button" onClick={onClose} className="text-sm underline">
          Close
        </button>
      </div>
      <div className="max-h-[28vh] overflow-y-auto px-4 py-3 whitespace-pre-wrap">
        {error && <p>{error}</p>}
        {text}
        <div ref={endRef} />
      </div>
      <div className="flex justify-end gap-2 px-4 py-3">
        {status === 'streaming' ? (
          <button type="button" onClick={onCancel} className="rounded-full bg-slate-900 px-4 py-1 text-sm text-amber-50">
            Cancel
          </button>
        ) : (
          <button type="button" onClick={onRetry} className="rounded-full bg-amber-400 px-4 py-1 text-sm text-slate-900">
            Fight again
          </button>
        )}
      </div>
    </section>
  )
}
