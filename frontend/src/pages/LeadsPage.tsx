import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { Booking, Lead } from '../types'

export default function LeadsPage() {
  const { token } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const [leadResponse, bookingResponse] = await Promise.all([
          apiRequest<{ leads: Lead[] }>('/api/leads', {}, token),
          apiRequest<{ bookings: Booking[] }>('/api/bookings', {}, token),
        ])
        setLeads(leadResponse.leads)
        setBookings(bookingResponse.bookings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leads')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading leads and bookings...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-100">
          Data capture
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">Leads and bookings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          This is the customer data collected by the receptionist and booking agents through Vapi webhooks.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Leads</h2>
          <div className="mt-4 space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{lead.name}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {lead.status}
                  </span>
                </div>
                <p className="mt-2">{lead.phone}</p>
                <p>{lead.purpose}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{booking.serviceType}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-2">{booking.name} • {booking.phone}</p>
                <p>{new Date(booking.preferredDateTime).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
