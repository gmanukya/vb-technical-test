import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  onClick: () => void
  children: ReactNode
}

export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink outline-none transition-colors hover:border-ink focus-visible:ring-2 focus-visible:ring-ink"
    >
      {children}
    </button>
  )
}
