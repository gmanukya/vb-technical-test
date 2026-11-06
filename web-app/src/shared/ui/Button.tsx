import { forwardRef, type ReactNode } from 'react'

import { joinClasses } from '../lib/classNames'

type ButtonTone = 'ink' | 'ghost' | 'control'

interface ButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: ButtonTone
  expanded?: boolean
  className?: string
  autoFocus?: boolean
  title?: string
}

const TONE_CLASS: Record<ButtonTone, string> = {
  ink: 'bg-accent text-accent-ink hover:opacity-90 disabled:opacity-40',
  ghost: 'bg-transparent text-muted hover:text-ink',
  control: 'border border-line bg-surface text-ink hover:border-ink',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const tone = props.tone ?? 'ink'
  const className = joinClasses([
    'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    TONE_CLASS[tone],
    props.className ?? '',
  ])

  return (
    <button
      ref={ref}
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-expanded={props.expanded}
      autoFocus={props.autoFocus}
      title={props.title}
      className={className}
    >
      {props.children}
    </button>
  )
})
