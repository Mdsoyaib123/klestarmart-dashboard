import {
  ChevronDown,
  CreditCard,
  ExternalLink,
  Image,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { baseApi } from '@/api/baseApi'
import { useLogoutMutation } from '@/features/auth/authApi'
import { selectUser } from '@/features/auth/authSlice'
import { useGetOverviewQuery } from '@/features/stats/statsApi'
import { APP_NAME, STOREFRONT_URL } from '@/config/site'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  adminOnly?: boolean
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Store',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/payments', label: 'Payments', icon: CreditCard },
      { to: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    title: 'Website',
    items: [
      { to: '/banners', label: 'Banners', icon: Image },
      { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
    ],
  },
  {
    title: 'Admin',
    items: [{ to: '/team', label: 'Team', icon: ShieldCheck, adminOnly: true }],
  },
]

function UserMenu() {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const [logout] = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = async () => {
    await logout()
    // Drop every cached response so the next person to sign in sees nothing from this session.
    dispatch(baseApi.util.resetApiState())
  }

  if (!user) return null
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
        <span className="hidden text-left sm:block">
          <span className="block font-medium leading-tight">{user.name}</span>
          <span className="block text-xs capitalize text-muted">{user.role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-line bg-white p-1 shadow-lg">
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
          <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream">
            <KeyRound className="h-4 w-4" /> Account & password
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent hover:bg-accent-soft">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout() {
  const user = useAppSelector(selectUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  // Shares the overview's cache to show how many orders wait for confirmation.
  const { data: overview } = useGetOverviewQuery(30, { pollingInterval: 60_000 })
  const pending = overview?.pendingOrders ?? 0

  useEffect(() => setMenuOpen(false), [pathname])

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-cream hover:text-ink'}`

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-62 flex-col border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/" className="font-semibold text-brand">
            {APP_NAME}
          </Link>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto p-3">
          {sections.map((section) => {
            const items = section.items.filter((item) => !item.adminOnly || user?.role === 'admin')
            if (items.length === 0) return null
            return (
              <div key={section.title}>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted/80">{section.title}</p>
                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={link}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {to === '/orders' && pending > 0 && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white" aria-label={`${pending} pending`}>
                          {pending}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="border-t border-line p-3">
          <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-cream hover:text-ink">
            <ExternalLink className="h-4 w-4" /> View store
          </a>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
