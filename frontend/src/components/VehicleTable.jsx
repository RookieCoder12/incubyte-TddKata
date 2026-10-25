import { formatPrice } from '../utils/inventory.js'
import LotBays from './LotBays.jsx'
import Button from './Button.jsx'

const COLUMN_COUNT = 5

function MessageRow({ children }) {
  return (
    <tr>
      <td colSpan={COLUMN_COUNT} className="py-3">
        <div className="rounded-card border border-dashed border-control px-4 py-3 text-sm text-muted">{children}</div>
      </td>
    </tr>
  )
}

// Flat grey bars at the real size of each value, so nothing shifts when the data lands
function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="h-12 border-b border-rule" aria-hidden="true">
      <td><span className="block h-3.5 w-40 rounded bg-raised" /></td>
      <td className="hidden sm:table-cell"><span className="block h-3.5 w-16 rounded bg-raised" /></td>
      <td><span className="ml-auto block h-3.5 w-20 rounded bg-raised" /></td>
      <td><span className="block h-3.5 w-24 rounded bg-raised" /></td>
      <td />
    </tr>
  ))
}

export default function VehicleTable({ vehicles, status, error, emptyMessage, onRetry, onPurchase, purchasingId, renderAdminActions }) {
  return (
    <div className="sm:overflow-x-auto">
      {/* Below 640px each row becomes two lines: name and price, then stock and the action */}
      <table className="w-full border-collapse text-sm max-sm:block sm:min-w-[560px]">
        <thead className="max-sm:hidden">
          <tr className="h-10 text-left text-xs text-muted">
            <th className="w-[38%] font-normal">Vehicle</th>
            <th className="hidden font-normal sm:table-cell">Category</th>
            <th className="pr-6 text-right font-normal">Price</th>
            <th className="font-normal">On the lot</th>
            <th className="font-normal"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {status === 'loading' && <LoadingRows />}

          {status === 'error' && (
            <MessageRow>
              <span className="text-ink">Couldn't load the inventory. {error}</span>{' '}
              <button type="button" onClick={onRetry} className="font-medium text-accent hover:underline">Retry</button>
            </MessageRow>
          )}

          {status === 'ready' && vehicles.length === 0 && <MessageRow>{emptyMessage}</MessageRow>}

          {status === 'ready' && vehicles.map((vehicle) => {
            const name = `${vehicle.make} ${vehicle.model}`
            return (
              <tr key={vehicle.id} className="h-12 border-t border-rule max-sm:grid max-sm:h-auto max-sm:grid-cols-[1fr_auto] max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-2 max-sm:py-3">
                <td className="py-2 pr-4 max-sm:p-0">
                  <span className="font-medium text-ink">{name}</span>
                  <span className="block text-xs text-muted sm:hidden">{vehicle.category}</span>
                </td>
                <td className="hidden pr-4 text-muted sm:table-cell">{vehicle.category}</td>
                <td className="num pr-6 text-right whitespace-nowrap max-sm:p-0 max-sm:font-medium">{formatPrice(vehicle.price)}</td>
                <td className="pr-4 max-sm:p-0">
                  <span className="flex items-center gap-3">
                    <span className="num w-6 text-right max-sm:w-auto">{vehicle.quantity}</span>
                    <LotBays quantity={vehicle.quantity} />
                  </span>
                </td>
                <td className={`py-2 text-right max-sm:p-0 ${renderAdminActions ? 'max-sm:col-span-2' : ''}`}>
                  <span className="flex items-center justify-end gap-1">
                    {renderAdminActions?.(vehicle)}
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Purchase ${name}`}
                      disabled={vehicle.quantity === 0 || purchasingId === vehicle.id}
                      onClick={() => onPurchase?.(vehicle)}
                    >
                      {purchasingId === vehicle.id ? 'Selling…' : 'Purchase'}
                    </Button>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
