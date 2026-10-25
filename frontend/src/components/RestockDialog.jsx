import { useState } from 'react'
import Dialog from './Dialog.jsx'
import TextField from './TextField.jsx'
import Button from './Button.jsx'

export default function RestockDialog({ vehicle, onRestock, onClose }) {
  const name = `${vehicle.make} ${vehicle.model}`
  const [units, setUnits] = useState('1')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const quantity = Number(units)

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Enter a whole number above 0')
      return
    }

    setSaving(true)
    try {
      await onRestock(vehicle, quantity)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Dialog title={`Restock ${name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <p className="mb-4 text-sm text-muted">
          <span className="num text-ink">{vehicle.quantity}</span> on the lot now.
        </p>
        <TextField
          label="Units arrived"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={units}
          onChange={(event) => setUnits(event.target.value)}
          error={error}
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Restocking…' : 'Restock'}</Button>
        </div>
      </form>
    </Dialog>
  )
}
