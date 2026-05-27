import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { Plan, User } from '../types'

export default function BillingPage() {
  const { token, user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const billing = await apiRequest<{ plans?: Plan[]; users?: User[]; plan?: string; usageMinutes?: number; usageLimit?: number | null }>('/api/billing', {}, token)
        setPlans(billing.plans || [])
        setUsers(billing.users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading billing...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
          Billing and usage
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">Current plan and usage</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Track usage and compare plans for the current workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[{ label: 'Plan', value: user?.plan || 'starter' }, { label: 'Minutes used', value: user?.usageMinutes ?? 0 }, { label: 'Limit', value: user?.usageLimit ?? 'Unlimited' }].map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/80">Plan</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{plan.monthlyMinutes} monthly minutes</p>
            <p className="mt-4 text-3xl font-semibold text-white">${plan.price}</p>
          </article>
        ))}
      </section>

      {users.length ? (
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Workspace billing view</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  {['User', 'Role', 'Plan', 'Usage', 'Limit'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/50 text-slate-300">
                {users.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-white">{entry.name}</td>
                    <td className="px-4 py-3">{entry.role}</td>
                    <td className="px-4 py-3">{entry.plan}</td>
                    <td className="px-4 py-3">{entry.usageMinutes}</td>
                    <td className="px-4 py-3">{entry.usageLimit ?? 'Unlimited'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
