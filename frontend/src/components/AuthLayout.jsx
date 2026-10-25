import BrandMark from './BrandMark.jsx'

// Shared frame for the sign-in and register screens: the product mark above one centred panel
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex items-center gap-2.5">
        <BrandMark />
        <span className="text-base font-semibold">Lotline</span>
      </div>
      <section className="w-full max-w-[400px] rounded-sheet border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-[22px] leading-7 font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </section>
      <p className="mt-6 text-sm text-muted">{footer}</p>
    </main>
  )
}
