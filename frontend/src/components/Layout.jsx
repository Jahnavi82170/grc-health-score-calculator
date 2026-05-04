import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',      icon: <GridIcon /> },
  { to: '/records',    label: 'Health Records',  icon: <ClipIcon /> },
  { to: '/analytics',  label: 'Analytics',       icon: <ChartIcon /> },
  { to: '/audit-log',  label: 'Audit Log',       icon: <ShieldIcon />, adminOnly: true },
]

export default function Layout() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logoutUser(); navigate('/login') }

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label
    || (location.pathname.includes('/records/new') ? 'New Record'
    : location.pathname.includes('/edit') ? 'Edit Record'
    : location.pathname.includes('/records/') ? 'Record Detail' : '')

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8]">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col flex-shrink-0 bg-navy-800 text-white">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center flex-shrink-0">
              <HeartIcon />
            </div>
            <div>
              <p className="font-display text-base leading-tight">Tool-86</p>
              <p className="text-navy-200 text-[10px] tracking-widest uppercase">Health Score</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.filter(n => !n.adminOnly || user?.role === 'ADMIN').map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="w-4 h-4 flex-shrink-0">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}

          <div className="pt-4 pb-1">
            <p className="px-4 text-[9px] uppercase tracking-widest text-navy-300 font-semibold mb-2">Actions</p>
            <NavLink to="/records/new"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="w-4 h-4 flex-shrink-0"><PlusIcon /></span>
              New Record
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-[10px] text-navy-300 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="nav-link w-full text-navy-300 hover:text-white">
            <span className="w-4 h-4"><LogoutIcon /></span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-navy-50 flex items-center px-6 gap-4">
          <button className="md:hidden btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </button>
          <h1 className="font-display text-lg text-navy-800 flex-1">{pageTitle}</h1>
          <NavLink to="/records/new" className="btn-mint text-xs py-2 px-3">
            <PlusIcon /> New Record
          </NavLink>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 flex flex-col bg-navy-800 text-white h-full shadow-2xl">
            <div className="px-5 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <p className="font-display text-base">Tool-86</p>
                  <p className="text-navy-200 text-[10px] tracking-widest uppercase">Health Score</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV.filter(n => !n.adminOnly || user?.role === 'ADMIN').map(n => (
                <NavLink key={n.to} to={n.to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <span className="w-4 h-4">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}

// ── Inline icons (no dependency needed) ──────────────
function HeartIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> }
function GridIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function ClipIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
function ChartIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function ShieldIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function PlusIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function LogoutIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function MenuIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }
