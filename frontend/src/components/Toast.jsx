import { useEffect } from 'react'

// A short message in the corner that clears itself; it floats, so it may carry a shadow
export default function Toast({ message, tone = 'neutral', onDismiss }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-30 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div role="status" aria-live="polite">
        {message && (
          <p
            className={`pointer-events-auto flex items-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
              tone === 'error' ? 'text-pill-negative-ink' : 'text-ink'
            }`}
          >
            <span aria-hidden="true" className={`size-1.5 flex-none rounded-full ${tone === 'error' ? 'bg-negative' : 'bg-positive'}`} />
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
