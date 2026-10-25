import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchVehicles } from '../api/vehicles.js'
import { summarizeStock, filterByStock, sortVehicles } from '../utils/inventory.js'
import AppShell from '../components/AppShell.jsx'
import StockCountCards from '../components/StockCountCards.jsx'
import VehicleTable from '../components/VehicleTable.jsx'
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

  const loadVehicles = useCallback(async () => {
    setStatus('loading')
    try {
      setVehicles(sortVehicles(await fetchVehicles(token)))
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [token])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const summary = summarizeStock(vehicles)
  const visibleVehicles = filterByStock(vehicles, stockFilter)

  return (
    <AppShell title="Inventory">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] leading-7 font-semibold">Inventory</h1>
          <p className="mt-1 text-sm text-muted">
            {status === 'ready'
              ? `${pluralize(summary['sold-out'], 'model')} sold out · ${pluralize(summary.units, 'unit')} on the lot`
              : 'Loading the lot…'}
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
        <VehicleTable
          vehicles={visibleVehicles}
          status={status}
          error={error}
          onRetry={loadVehicles}
          emptyMessage={vehicles.length === 0 ? 'No vehicles on the lot yet.' : 'No vehicles in this stock group.'}
        />
      </div>
    </AppShell>
  )
}
