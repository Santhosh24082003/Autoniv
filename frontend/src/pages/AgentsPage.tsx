import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { Agent } from '../types'

export default function AgentsPage() {
  const { token, user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAgentId, setSavingAgentId] = useState('')
  const [error, setError] = useState('')

  async function loadAgents() {
    if (!token) return
    setLoading(true)
    try {
      const response = await apiRequest<{ agents: Agent[] }>('/api/agents', {}, token)
      setAgents(response.agents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [token])

  async function toggleStatus(agent: Agent) {
    if (!token) return

    const nextStatus = agent.status === 'active' ? 'disabled' : 'active'
    const previousAgents = agents

    setSavingAgentId(agent.id)
    setAgents((currentAgents) =>
      currentAgents.map((entry) => (entry.id === agent.id ? { ...entry, status: nextStatus } : entry)),
    )

    try {
      const response = await apiRequest<{ agent: Agent }>(
        `/api/agents/${agent.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: nextStatus }),
        },
        token,
      )

      setAgents((currentAgents) =>
        currentAgents.map((entry) => (entry.id === agent.id ? response.agent : entry)),
      )
    } catch (err) {
      setAgents(previousAgents)
      setError(err instanceof Error ? err.message : 'Failed to update agent status')
    } finally {
      setSavingAgentId('')
    }
  }

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading agents...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-100">
              Agent management
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">Your AI voice agents</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              View and manage the receptionist, booking, and FAQ assistants for your workspace.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Role: <span className="font-semibold text-white">{user?.role}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Receptionist', to: '/app/receptionist' },
          { label: 'Booking agent', to: '/app/booking' },
          { label: 'FAQ assistant', to: '/app/faq' },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/10">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Launch</p>
            <p className="mt-3 text-lg font-medium text-white">{item.label}</p>
            <p className="mt-2 text-sm text-slate-300">Open the browser widget for live testing.</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.id} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/80">{agent.type}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{agent.name}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">{agent.prompt}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                {agent.status}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Assistant: {agent.assistantId || 'n/a'}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Voice: {agent.voice}</span>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => toggleStatus(agent)}
                disabled={savingAgentId === agent.id}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
              >
                {savingAgentId === agent.id ? 'Updating...' : agent.status === 'active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
