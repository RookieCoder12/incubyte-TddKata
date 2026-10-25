import { getStockState } from '../utils/inventory.js'

const MAX_BAYS = 10

/*
  Lotline's signature element: stock drawn as parking bays, one bay per car on the lot.
  Up to 10 bays are drawn; beyond that a "+n" follows. A sold-out model shows one empty dashed bay.
*/
export default function LotBays({ quantity }) {
  const state = getStockState(quantity)

  if (state === 'sold-out') {
    return (
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3.5 w-[5px] rounded-[2px] border border-dashed border-control" />
        <span className="rounded-full bg-pill-negative-bg px-2 py-0.5 text-xs font-medium whitespace-nowrap text-pill-negative-ink">
          Sold out
        </span>
      </span>
    )
  }

  const bays = Math.min(quantity, MAX_BAYS)

  return (
    <span className="flex items-center gap-2" title={`${quantity} on the lot`}>
      <span aria-hidden="true" className="flex gap-[3px]">
        {Array.from({ length: bays }, (_, index) => (
          <span key={index} className="h-3.5 w-[5px] rounded-[2px] bg-accent" />
        ))}
      </span>
      {quantity > MAX_BAYS && <span aria-hidden="true" className="text-xs text-muted">+{quantity - MAX_BAYS}</span>}
      {state === 'low' && (
        <span className="text-xs font-medium whitespace-nowrap text-pill-warning-ink">{quantity === 1 ? 'Last one' : 'Low'}</span>
      )}
    </span>
  )
}
