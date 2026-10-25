// Lotline's monogram: an "L" standing on a dashed lot line, in the accent colour
export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="flex-none">
      <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
      <path d="M11 8v13h10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 25h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  )
}
