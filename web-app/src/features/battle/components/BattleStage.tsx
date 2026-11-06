import { useEffect, type ReactNode } from 'react'
import { Button } from '../../../shared/ui/Button'
import type { ActiveBattleStatus } from '../types'
import { StreamingBar } from './StreamingBar'

interface BattleStageProps {
  title: string
  kicker: string
  status: ActiveBattleStatus
  onClose: () => void
  showFooter: boolean
  left: ReactNode
  right: ReactNode
  children: ReactNode
  actions: ReactNode
}

export function BattleStage({ title, kicker, status, onClose, showFooter, left, right, children, actions }: BattleStageProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      onClose()
    }

    window.addEventListener('keydown', onKey)
    
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <section className="fixed inset-0 z-50 flex flex-col bg-bg text-ink" role="dialog" aria-modal="true" aria-label={title}>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{kicker}</p>
            <h2 className="font-display text-2xl leading-none">{title}</h2>
          </div>
          <Button tone="ghost" onClick={onClose} autoFocus>Close</Button>
        </div>
        <StreamingBar status={status} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <BattleLayout left={left} right={right}>
          {children}
        </BattleLayout>
      </div>
      <StageFooter show={showFooter}>{actions}</StageFooter>
    </section>
  )
}

interface BattleLayoutProps {
  left: ReactNode
  right: ReactNode
  children: ReactNode
}

function BattleLayout({ left, right, children }: BattleLayoutProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-start gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-12">
      <div className="lg:sticky lg:top-8">{left}</div>
      <div className="lg:sticky lg:top-8 lg:col-start-3">{right}</div>
      <div className="col-span-2 border-t border-line pt-6 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:border-0 lg:pt-0">
        {children}
      </div>
    </div>
  )
}

interface StageFooterProps {
  show: boolean
  children: ReactNode
}

function StageFooter({ show, children }: StageFooterProps) {
  if (!show) {
    return null
  }
  
  return (
    <footer className="border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl justify-end">{children}</div>
    </footer>
  )
}
