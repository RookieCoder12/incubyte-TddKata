import { useEffect, useId } from 'react'

// Modal dialog: it floats, so it carries the app's one real shadow. Escape or the backdrop closes it.
export default function Dialog({ title, onClose, children }) {
  const titleId = useId()

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-[400px] rounded-sheet border border-border bg-surface p-6 shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
      >
        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
