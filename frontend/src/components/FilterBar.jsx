import { useId, useState } from 'react'

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

function FilterField({ label, hiddenOnPhone = false, className = '', children }) {
  const id = useId()
  return (
    <div className={`min-w-0 ${hiddenOnPhone ? 'max-md:hidden' : ''} ${className}`}>
      <label htmlFor={id} className="mb-1 block text-xs text-muted">{label}</label>
      {children(id)}
    </div>
  )
}

// One row of filters above the table; every change is sent to the search endpoint by the page
export default function FilterBar({ filters, categories, onChange, onClear }) {
  const priceError = getPriceRangeError(filters)
  // On phones only Make shows until "More filters" is opened, so the list starts on the first screen
  const [moreOpen, setMoreOpen] = useState(false)
  const hideOnPhone = !moreOpen
  const extraActive = ['model', 'category', 'minPrice', 'maxPrice'].filter((key) => filters[key] !== '').length

  function update(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <form role="search" aria-label="Filter vehicles" onSubmit={(event) => event.preventDefault()}>
      <div className="grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_1fr_120px_120px_auto]">
        <div className="col-span-2 flex items-end gap-2 md:contents">
        <FilterField label="Make" className="flex-1">
          {(id) => <input id={id} name="make" value={filters.make} onChange={update} placeholder="Any make" className={controlClass} />}
        </FilterField>
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(!moreOpen)}
          className="h-8 flex-none rounded-control border border-control px-3 text-sm font-medium text-ink md:hidden"
        >
          {moreOpen ? 'Fewer filters' : `More filters${extraActive ? ` (${extraActive})` : ''}`}
        </button>
        </div>
        <FilterField label="Model" hiddenOnPhone={hideOnPhone}>
          {(id) => <input id={id} name="model" value={filters.model} onChange={update} placeholder="Any model" className={controlClass} />}
        </FilterField>
        <FilterField label="Category" hiddenOnPhone={hideOnPhone}>
          {(id) => (
            <select id={id} name="category" value={filters.category} onChange={update} className={controlClass}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          )}
        </FilterField>
        <FilterField label="Min price" hiddenOnPhone={hideOnPhone}>
          {(id) => (
            <input id={id} name="minPrice" type="number" min="0" inputMode="numeric" value={filters.minPrice} onChange={update} placeholder="$0" aria-invalid={Boolean(priceError)} className={`num ${controlClass}`} />
          )}
        </FilterField>
        <FilterField label="Max price" hiddenOnPhone={hideOnPhone}>
          {(id) => (
            <input id={id} name="maxPrice" type="number" min="0" inputMode="numeric" value={filters.maxPrice} onChange={update} placeholder="No limit" aria-invalid={Boolean(priceError)} className={`num ${controlClass}`} />
          )}
        </FilterField>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters(filters)}
          className={`col-span-2 h-8 rounded-control px-3 text-sm font-medium text-ink hover:bg-raised disabled:text-muted disabled:hover:bg-transparent md:col-span-1 ${hideOnPhone ? 'max-md:hidden' : ''}`}
        >
          Clear filters
        </button>
      </div>
      {priceError && <p className="mt-2 text-xs text-negative">{priceError}</p>}
    </form>
  )
}
