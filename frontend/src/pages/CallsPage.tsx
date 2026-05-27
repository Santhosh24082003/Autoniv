import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { CallRecord } from '../types'

export default function CallsPage() {
  const { token } = useAuth()
  const [calls, setCalls] = useState<CallRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const response = await apiRequest<{ calls: CallRecord[] }>('/api/calls', {}, token)
        setCalls(response.calls)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calls')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading call history...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
      <div className="mb-5">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
          Call monitoring
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">Call history</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-slate-200">
            <tr>
              {['Caller', 'Agent', 'Status', 'Duration', 'Summary'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/50 text-slate-300">
            {calls.map((call) => (
              <tr key={call.id}>
                <td className="px-4 py-3 text-white">{call.callerName || 'Unknown'}</td>
                <td className="px-4 py-3">{call.agentId}</td>
                <td className="px-4 py-3">{call.status}</td>
                <td className="px-4 py-3">{call.durationMinutes} min</td>
                <td className="px-4 py-3">{call.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
