import { useEffect } from 'react'
import { useToastStore } from '../../lib/toastStore'

const AUTO_DISMISS_MS = 5000

export function Toast() {
  const message = useToastStore((state) => state.message)
  const clear = useToastStore((state) => state.clear)

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(clear, AUTO_DISMISS_MS)
    return () => clearTimeout(timeout)
  }, [message, clear])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg shadow-pop">
        <span>{message}</span>
        <button
          type="button"
          onClick={clear}
          aria-label="Dismiss"
          className="focus-ring pressable rounded-full text-fg-muted hover:text-fg"
        >
          ×
        </button>
      </div>
    </div>
  )
}
