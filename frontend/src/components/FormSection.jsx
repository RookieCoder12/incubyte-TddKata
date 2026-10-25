// Settings-style row: title and description on the left, a grey panel with the fields on the right
export default function FormSection({ title, description, aside, children }) {
  return (
    <section className="grid gap-4 border-t border-border py-8 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6">
      <div className="md:pt-2">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
        {aside && <p className="num mt-4 text-sm text-ink">{aside}</p>}
      </div>
      <div className="rounded-sheet bg-raised p-4">{children}</div>
    </section>
  )
}
