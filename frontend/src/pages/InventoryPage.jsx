import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchVehicles, searchVehicles, purchaseVehicle } from '../api/vehicles.js'
import { summarizeStock, filterByStock, sortVehicles } from '../utils/inventory.js'
import AppShell from '../components/AppShell.jsx'
import StockCountCards from '../components/StockCountCards.jsx'
import VehicleTable from '../components/VehicleTable.jsx'
import FilterBar, { EMPTY_FILTERS, hasActiveFilters, getPriceRangeError } from '../components/FilterBar.jsx'
import Toast from '../components/Toast.jsx'
import { PlusIcon } from '../components/Icons.jsx'

function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export default function InventoryPage() {
  const { token, isAdmin } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [categories, setCategories] = useState([])
  const [purchasingId, setPurchasingId] = useState(null)
  const [toast, setToast] = useState({ message: '', tone: 'neutral' })
  const dismissToast = useCallback(() => setToast({ message: '', tone: 'neutral' }), [])

  function replaceVehicle(updated) {
    setVehicles((current) => current.map((vehicle) => (vehicle.id === updated.id ? updated : vehicle)))
  }

  async function handlePurchase(vehicle) {
    const name = `${vehicle.make} ${vehicle.model}`
    setPurchasingId(vehicle.id)
    try {
      const updated = await purchaseVehicle(token, vehicle.id)
      replaceVehicle(updated)
      const left = updated.quantity === 0 ? 'none' : updated.quantity
      setToast({ message: `Sold 1 ${name} · ${left} left on the lot`, tone: 'neutral' })
    } catch (err) {
      // Someone else sold the last unit first: show it as sold out
      if (err.status === 400) {
        replaceVehicle({ ...vehicle, quantity: 0 })
      }
      setToast({ message: err.message, tone: 'error' })
    } finally {
      setPurchasingId(null)
    }
  }

  // No filters: the full list (which also gives the category options); otherwise the search endpoint
  const loadVehicles = useCallback(async (activeFilters) => {
    setStatus('loading')
    try {
      if (hasActiveFilters(activeFilters)) {
        setVehicles(sortVehicles(await searchVehicles(token, activeFilters)))
      } else {
        const allVehicles = await fetchVehicles(token)
        setVehicles(sortVehicles(allVehicles))
        setCategories([...new Set(allVehicles.map((vehicle) => vehicle.category))].sort())
      }
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [token])

  // Wait until typing stops before searching; skip an impossible price range
  useEffect(() => {
    if (getPriceRangeError(filters)) {
      return undefined
    }
    const timer = setTimeout(() => loadVehicles(filters), hasActiveFilters(filters) ? 300 : 0)
    return () => clearTimeout(timer)
  }, [filters, loadVehicles])

  const summary = summarizeStock(vehicles)
  const visibleVehicles = filterByStock(vehicles, stockFilter)

  return (
    <AppShell title="Inventory">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] leading-7 font-semibold">Inventory</h1>
          <p className="mt-1 text-sm text-muted">
            {status !== 'ready' && 'Loading the lot…'}
            {status === 'ready' && !hasActiveFilters(filters) &&
              `${pluralize(summary['sold-out'], 'model')} sold out · ${pluralize(summary.units, 'unit')} on the lot`}
            {status === 'ready' && hasActiveFilters(filters) &&
              `${pluralize(summary.all, 'model')} match · ${pluralize(summary.units, 'unit')} on the lot`}
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/vehicles/new"
            className="inline-flex h-8 items-center gap-2 rounded-control bg-primary px-3 text-sm font-medium text-white hover:bg-black"
          >
            <PlusIcon /> Add vehicle
          </Link>
        )}
      </div>

      <div className="mt-6">
        <StockCountCards summary={summary} selected={stockFilter} onSelect={setStockFilter} />
      </div>

      <div className="mt-6">
        <FilterBar filters={filters} categories={categories} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
      </div>

      <div className="mt-4">
        <VehicleTable
          vehicles={visibleVehicles}
          status={status}
          error={error}
          onRetry={() => loadVehicles(filters)}
          onPurchase={handlePurchase}
          purchasingId={purchasingId}
          emptyMessage={hasActiveFilters(filters) ? 'No vehicles match these filters.' : vehicles.length === 0 ? 'No vehicles on the lot yet.' : 'No vehicles in this stock group.'}
        />
      </div>

      <Toast message={toast.message} tone={toast.tone} onDismiss={dismissToast} />
    </AppShell>
  )
}
