// 16px outline icons at 1.5px stroke, one set for the whole app
function Icon({ children, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      {children}
    </svg>
  )
}

export function CarIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 17h14M4 13l2-5.5A2 2 0 0 1 7.9 6h8.2a2 2 0 0 1 1.9 1.5L20 13" />
      <rect x="3" y="13" width="18" height="5" rx="1.5" />
      <circle cx="7.5" cy="18.5" r="1.5" /><circle cx="16.5" cy="18.5" r="1.5" />
    </Icon>
  )
}

export function PlusIcon(props) {
  return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
}

export function MenuIcon(props) {
  return <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
}

export function CloseIcon(props) {
  return <Icon {...props}><path d="M6 6l12 12M18 6L6 18" /></Icon>
}

export function SearchIcon(props) {
  return <Icon {...props}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Icon>
}
