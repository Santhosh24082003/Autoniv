import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const baseNavItems = [
  { label: 'Overview', to: '/app/overview' },
  { label: 'Calls', to: '/app/calls' },
  { label: 'Leads', to: '/app/leads' },
  { label: 'Billing', to: '/app/billing' },
  { label: 'Receptionist', to: '/app/receptionist' },
  { label: 'Booking agent', to: '/app/booking' },
  { label: 'FAQ assistant', to: '/app/faq' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems =
    user?.role === 'admin'
      ? [{ label: 'Agents', to: '/app/agents' }, ...baseNavItems, { label: 'Users', to: '/app/users' }]
      : baseNavItems

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_26%),linear-gradient(160deg,#07111f_0%,#0b1728_50%,#111b2e_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/65 px-4 py-5 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Autoniv dashboard
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
              Voice assistant workspace
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Switch between the dashboard, users, calls, leads, and live agent launchers from the sidebar.
            </p>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200',
                      isActive
                        ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10',
                    ].join(' ')
                  }
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Open</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Current setup</p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Overview</span>
                  <span className="text-slate-100">Ready</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Calls</span>
                  <span className="text-slate-100">Synced</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Billing</span>
                  <span className="text-slate-100">Active</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Receptionist</span>
                  <span className="text-slate-100">Ready</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Booking agent</span>
                  <span className="text-slate-100">Ready</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>FAQ assistant</span>
                  <span className="text-slate-100">Ready</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Backend webhook</span>
                  <span className="text-slate-100">Connected</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Signed in as</p>
                <p className="mt-1 text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}