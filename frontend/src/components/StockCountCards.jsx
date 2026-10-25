// Count cards that filter the table by stock state (taste-skill "count cards that filter" pattern)
const CARDS = [
  { state: 'all', label: 'All models' },
  { state: 'in-stock', label: 'In stock' },
  { state: 'low', label: '1–2 left' },
  { state: 'sold-out', label: 'Sold out' },
]

export default function StockCountCards({ summary, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {CARDS.map(({ state, label }) => {
        const isSelected = selected === state
        return (
          <button
            key={state}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(state)}
            className={`flex h-[61px] flex-col justify-center rounded-card px-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? 'border-[1.5px] border-accent bg-accent-pale'
                : 'border border-border bg-surface hover:border-control'
            }`}
          >
            <span className="text-[13px] leading-4 text-muted">{label}</span>
            <span className="num mt-1 text-base leading-5 font-semibold">{summary[state]}</span>
          </button>
        )
      })}
    </div>
  )
}
