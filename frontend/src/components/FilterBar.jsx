import { useId } from 'react'

export const EMPTY_FILTERS = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }

export function hasActiveFilters(filters) {
  return Object.values(filters).some((value) => value !== '')
}

export function getPriceRangeError({ minPrice, maxPrice }) {
  if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
    return 'Min price is above max price'
  }
  return ''
}

const controlClass =
  'h-8 w-full rounded-control border border-control bg-surface px-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

function FilterField({ label, children }) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs text-muted">{label}</label>
      {children(id)}
    </div>
  )
}

// One row of filters above the table; every change is sent to the search endpoint by the page
export default function FilterBar({ filters, categories, onChange, onClear }) {
  const priceError = getPriceRangeError(filters)

  function update(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <form role="search" aria-label="Filter vehicles" onSubmit={(event) => event.preventDefault()}>
      <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_1fr_120px_120px_auto]">
        <FilterField label="Make">
          {(id) => <input id={id} name="make" value={filters.make} onChange={update} placeholder="Any make" className={controlClass} />}
        </FilterField>
        <FilterField label="Model">
          {(id) => <input id={id} name="model" value={filters.model} onChange={update} placeholder="Any model" className={controlClass} />}
        </FilterField>
        <FilterField label="Category">
          {(id) => (
            <select id={id} name="category" value={filters.category} onChange={update} className={controlClass}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          )}
        </FilterField>
        <FilterField label="Min price">
          {(id) => (
            <input id={id} name="minPrice" type="number" min="0" inputMode="numeric" value={filters.minPrice} onChange={update} placeholder="$0" aria-invalid={Boolean(priceError)} className={`num ${controlClass}`} />
          )}
        </FilterField>
        <FilterField label="Max price">
          {(id) => (
            <input id={id} name="maxPrice" type="number" min="0" inputMode="numeric" value={filters.maxPrice} onChange={update} placeholder="No limit" aria-invalid={Boolean(priceError)} className={`num ${controlClass}`} />
          )}
        </FilterField>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters(filters)}
          className="col-span-2 h-8 rounded-control px-3 text-sm font-medium text-ink hover:bg-raised disabled:text-muted disabled:hover:bg-transparent md:col-span-1"
        >
          Clear filters
        </button>
      </div>
      {priceError && <p className="mt-2 text-xs text-negative">{priceError}</p>}
    </form>
  )
}
