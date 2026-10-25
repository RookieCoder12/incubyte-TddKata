const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-black disabled:bg-[#8a8c8e]',
  secondary: 'border border-control bg-surface text-ink hover:bg-raised disabled:text-muted',
  danger: 'border border-negative/40 bg-surface text-negative hover:bg-pill-negative-bg',
  ghost: 'text-ink hover:bg-raised disabled:text-muted',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex flex-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}
