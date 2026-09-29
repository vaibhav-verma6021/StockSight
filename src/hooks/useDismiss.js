import { useEffect, useRef } from 'react'

/** Shared behaviour for overlays: close on Escape and lock page scroll while open. */
export function useDismiss(onDismiss) {
  // Keep the latest callback in a ref so the listener is attached only once,
  // even though the parent re-renders on every market tick.
  const callback = useRef(onDismiss)
  useEffect(() => {
    callback.current = onDismiss
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') callback.current()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [])
}
