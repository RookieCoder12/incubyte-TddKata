import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import BrandMark from './BrandMark.jsx'
import Button from './Button.jsx'
import { CarIcon, PlusIcon, MenuIcon, CloseIcon } from './Icons.jsx'

/*
  Framed-sheet shell: the sidebar (228px) and the 48px top bar share the tinted ground with no rule
  between them; the page sits on a white sheet inset 8px from the right and bottom edges.
  Grid: 228px + 1fr columns, 48px + 1fr rows. On small screens the frame folds into a top bar.
*/
function NavItems({ isAdmin, onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors ${
      isActive ? 'bg-active text-ink' : 'text-muted hover:bg-active/60 hover:text-ink'
    }`

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      <NavLink to="/" end className={linkClass} onClick={onNavigate}>
        <CarIcon /> Inventory
      </NavLink>
      {isAdmin && (
        <NavLink to="/vehicles/new" className={linkClass} onClick={onNavigate}>
          <PlusIcon /> Add vehicle
        </NavLink>
      )}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={24} />
      <span className="text-[15px] font-semibold">Lotline</span>
    </div>
  )
}

function Account({ user, isAdmin, onSignOut }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-pale text-xs font-semibold text-accent"
      >
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden text-sm sm:inline">{user.name}</span>
      <span className="rounded-full bg-pill-neutral-bg px-2 py-0.5 text-xs font-medium text-pill-neutral-ink">
        {isAdmin ? 'Admin' : 'Sales'}
      </span>
      <Button variant="ghost" size="sm" onClick={onSignOut}>Sign out</Button>
    </div>
  )
}

export default function AppShell({ title, children }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-ground lg:grid lg:grid-cols-[228px_1fr] lg:grid-rows-[48px_1fr]">
      <aside className="hidden px-3 lg:row-span-2 lg:flex lg:flex-col">
        <div className="flex h-12 items-center px-2.5">
          <Brand />
        </div>
        <p className="mt-5 mb-2 px-2.5 text-xs text-muted">Showroom</p>
        <NavItems isAdmin={isAdmin} />
      </aside>

      <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 bg-ground px-4 lg:static lg:pr-8 lg:pl-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="-ml-1.5 flex size-11 items-center justify-center rounded-control text-ink lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <span className="lg:hidden"><Brand /></span>
          <span className="hidden text-sm text-muted lg:inline">{title}</span>
        </div>
        {user && <Account user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />}
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 top-12 bottom-0 z-10 bg-ground px-4 pt-2 lg:hidden">
          <NavItems isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
        </div>
      )}

      <main className="min-h-[calc(100vh-48px)] bg-surface px-4 py-5 sm:px-6 sm:py-6 lg:mr-2 lg:mb-2 lg:min-h-0 lg:rounded-sheet lg:border lg:border-border">
        {children}
      </main>
    </div>
  )
}
