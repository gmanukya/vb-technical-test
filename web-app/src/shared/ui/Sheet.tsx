import { useEffect, useRef, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const ignoreClose = useRef(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }

      return () => {
        if (!dialog.open) {
          return
        }
        
        ignoreClose.current = true
        dialog.close()
      }
    }

    if (dialog.open) {
      ignoreClose.current = true
      dialog.close()
    }
  }, [open])

  const handleClose = () => {
    if (ignoreClose.current) {
      ignoreClose.current = false
      return
    }
    
    onClose()
  }

  return (
    <dialog ref={ref} className="sheet" aria-label={title} onClose={handleClose}>
      <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />
      <div className="px-5 pb-1 pt-4">
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      {children}
    </dialog>
  )
}
