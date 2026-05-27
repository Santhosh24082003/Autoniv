import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { Booking, CallRecord, Lead, Agent } from '../types'

interface SummaryResponse {
  user: {
    id: string
    role: string
    name: string
    email: string
    plan: string
    usageMinutes: number
    usageLimit: number | null
  }
  metrics: {
    totalUsers: number
    totalAgents: number
    totalCalls: number
    answeredCalls: number
    missedCalls: number
    minutesUsed: number
    leadsCount: number
    bookingsCount: number
    plan: string
    usageLimit: number | null
  }
  recentAgents: Agent[]
  recentCalls: CallRecord[]
  recentLeads: Lead[]
  recentBookings: Booking[]
}

export default function OverviewPage() {
  const { token, user } = useAuth()
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const response = await apiRequest<SummaryResponse>('/api/dashboard/summary', {}, token)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading overview...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  if (!data) return null

  const metrics = [
    { label: 'Total agents', value: data.metrics.totalAgents },
    { label: 'Total calls', value: data.metrics.totalCalls },
    { label: 'Answered calls', value: data.metrics.answeredCalls },
    { label: 'Missed calls', value: data.metrics.missedCalls },
    { label: 'Leads', value: data.metrics.leadsCount },
    { label: 'Bookings', value: data.metrics.bookingsCount },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Dashboard overview
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              This snapshot shows your current agents, calls, leads, bookings, and usage.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Plan: <span className="font-semibold text-white">{data.user.plan}</span>
            <div className="mt-1 text-slate-400">
              Usage: {data.user.usageMinutes} / {data.user.usageLimit ?? 'Unlimited'} minutes
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Recent calls</h2>
          <div className="mt-4 space-y-3">
            {data.recentCalls.map((call) => (
              <div key={call.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{call.callerName || 'Unknown caller'}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {call.status}
                  </span>
                </div>
                <p className="mt-2">{call.summary}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Agents</h2>
          <div className="mt-4 space-y-3">
            {data.recentAgents.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{agent.name}</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-2">{agent.prompt}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
