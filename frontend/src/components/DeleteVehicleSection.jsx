import { useState } from 'react'
import FormSection from './FormSection.jsx'
import Dialog from './Dialog.jsx'
import Button from './Button.jsx'

// Destructive action, last on the page, with a confirmation that names the vehicle
export default function DeleteVehicleSection({ vehicle, onDelete }) {
  const name = `${vehicle.make} ${vehicle.model}`
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await onDelete()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  const units = vehicle.quantity === 1 ? '1 unit' : `${vehicle.quantity} units`

  return (
    <FormSection title="Remove from inventory" description="Take a discontinued model off the sales desk. This cannot be undone.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Removes {name} and its stock record.</p>
        <Button variant="danger" onClick={() => setConfirming(true)}>Remove vehicle</Button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-negative">{error}</p>}

      {confirming && (
        <Dialog title={`Remove ${name}?`} onClose={() => setConfirming(false)}>
          <p className="text-sm text-muted">
            {units} on the lot will be removed from the inventory, and sales staff will no longer see this vehicle.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>Keep vehicle</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing…' : `Remove ${name}`}
            </Button>
          </div>
        </Dialog>
      )}
    </FormSection>
  )
}
