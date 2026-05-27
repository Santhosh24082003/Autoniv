import { FormEvent, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('clinic@autoniv.ai')
  const [password, setPassword] = useState('Clinic123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/app'
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_26%),linear-gradient(160deg,#07111f_0%,#0b1728_50%,#111b2e_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
          <section className="p-8 sm:p-10 lg:p-12">
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Autoniv SaaS dashboard
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Sign in to manage voice agents, calls, and billing.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Use the clinic demo account or the admin account to explore the platform. The backend
              stores users, agents, calls, leads, bookings, and plan data in a lightweight database.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Admin access', value: 'Manage users and plans' },
                { label: 'Client access', value: 'Own agents and calls only' },
                { label: 'Vapi sync', value: 'Webhook-driven call data' },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">{item.label}</p>
                  <p className="mt-3 text-lg font-medium text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-white/10 bg-white/5 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">Login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Demo credentials are prefilled so you can enter the dashboard immediately.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Enter dashboard'}
              </button>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Admin demo</span>
                  <span className="text-slate-100">admin@autoniv.ai / Admin123!</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Client demo</span>
                  <span className="text-slate-100">clinic@autoniv.ai / Clinic123!</span>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
