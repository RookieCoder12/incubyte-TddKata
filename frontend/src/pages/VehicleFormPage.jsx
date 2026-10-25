import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles.js'
import { validateVehicleForm } from '../utils/validation.js'
import { formatPrice } from '../utils/inventory.js'
import AppShell from '../components/AppShell.jsx'
import FormSection from '../components/FormSection.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import DeleteVehicleSection from '../components/DeleteVehicleSection.jsx'

const EMPTY_FORM = { make: '', model: '', category: '', price: '', quantity: '' }

// One page for adding (/vehicles/new) and editing (/vehicles/:id/edit) a vehicle
export default function VehicleFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [vehicle, setVehicle] = useState(null)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Load the lot for the category suggestions, and the vehicle itself when editing
  useEffect(() => {
    fetchVehicles(token)
      .then((vehicles) => {
        setCategories([...new Set(vehicles.map((v) => v.category))].sort())
        if (isEditing) {
          const found = vehicles.find((v) => v.id === id)
          if (!found) {
            setStatus('missing')
            return
          }
          setVehicle(found)
          setForm({
            make: found.make,
            model: found.model,
            category: found.category,
            price: String(found.price),
            quantity: String(found.quantity),
          })
        }
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('ready')
      })
  }, [token, id, isEditing])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const errors = validateVehicleForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    setSaving(true)
    try {
      if (isEditing) {
        await updateVehicle(token, id, payload)
      } else {
        await createVehicle(token, payload)
      }
      navigate('/')
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setFieldErrors(err.errors)
      } else {
        setError(err.message)
      }
      setSaving(false)
    }
  }

  // Only lock the fields while an existing vehicle is still loading
  const loadingVehicle = isEditing && status === 'loading'
  const title = isEditing ? (vehicle ? `${vehicle.make} ${vehicle.model}` : 'Edit vehicle') : 'Add vehicle'

  return (
    <AppShell title={isEditing ? 'Edit vehicle' : 'Add vehicle'}>
      <div className="mx-auto max-w-[1152px]">
        <p className="text-sm text-muted">
          <Link to="/" className="hover:text-ink">Inventory</Link> <span aria-hidden="true">/</span> {isEditing ? 'Edit' : 'New'}
        </p>
        <h1 className="mt-1 text-[22px] leading-7 font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {isEditing ? 'Changes show on the sales desk as soon as you save.' : 'The vehicle appears on the sales desk once added.'}
        </p>

        {status === 'missing' ? (
          <div className="mt-8 rounded-card border border-dashed border-control px-4 py-3 text-sm text-muted">
            This vehicle is no longer in the inventory. <Link to="/" className="font-medium text-accent hover:underline">Back to inventory</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-8">
            {error && (
              <p role="alert" className="mb-6 rounded-control bg-pill-negative-bg px-3 py-2 text-sm text-pill-negative-ink">{error}</p>
            )}

            <FormSection title="Vehicle" description="How the vehicle is listed and found in search.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Make" name="make" value={form.make} onChange={handleChange} error={fieldErrors.make} placeholder="Toyota" disabled={loadingVehicle} />
                <TextField label="Model" name="model" value={form.model} onChange={handleChange} error={fieldErrors.model} placeholder="Corolla" disabled={loadingVehicle} />
                <TextField
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={fieldErrors.category}
                  placeholder="Sedan"
                  list="category-options"
                  hint={categories.length ? `On the lot: ${categories.join(', ')}` : undefined}
                  className="sm:col-span-2"
                  disabled={loadingVehicle}
                />
                <datalist id="category-options">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </div>
            </FormSection>

            <FormSection
              title="Price and stock"
              description="The sticker price, and how many units are on the lot right now."
              aside={vehicle ? `Listed at ${formatPrice(vehicle.price)} · ${vehicle.quantity} on the lot` : undefined}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Price (USD)" name="price" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={handleChange} error={fieldErrors.price} placeholder="24500" disabled={loadingVehicle} />
                <TextField label="Units on the lot" name="quantity" type="number" min="0" step="1" inputMode="numeric" value={form.quantity} onChange={handleChange} error={fieldErrors.quantity} placeholder="3" disabled={loadingVehicle} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Link to="/" className="inline-flex h-10 items-center rounded-control px-4 text-sm font-medium text-ink hover:bg-surface">Cancel</Link>
                <Button type="submit" disabled={saving || loadingVehicle}>
                  {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add to inventory'}
                </Button>
              </div>
            </FormSection>
          </form>
        )}

        {isEditing && vehicle && (
          <DeleteVehicleSection
            vehicle={vehicle}
            onDelete={async () => {
              await deleteVehicle(token, id)
              navigate('/')
            }}
          />
        )}
      </div>
    </AppShell>
  )
}
