import { X } from 'lucide-react'
import { Button } from './Button.jsx'
import { useDismiss } from '../hooks/useDismiss.js'

export function Modal({ title, description, onClose, children }) {
  useDismiss(onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl animate-pop-in overflow-y-auto rounded-card border border-border-strong bg-bg-elevated shadow-float">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-body text-text-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close" autoFocus>
            <X size={16} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  )
}
