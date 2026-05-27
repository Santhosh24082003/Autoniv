import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { User } from '../types'

export default function UsersPage() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')

  async function loadUsers() {
    if (!token) return
    setLoading(true)
    try {
      const response = await apiRequest<{ users: User[] }>('/api/users', {}, token)
      setUsers(response.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }, token)
    setName('')
    setEmail('')
    setPassword('')
    setRole('user')
    await loadUsers()
  }

  async function handleDelete(id: string) {
    if (!token) return
    await apiRequest(`/api/users/${id}`, { method: 'DELETE' }, token)
    await loadUsers()
  }

  async function toggleBlocked(entry: User) {
    if (!token) return
    await apiRequest(`/api/users/${entry.id}`, {
      method: 'PUT',
      body: JSON.stringify({ blocked: !entry.blocked }),
    }, token)
    await loadUsers()
  }

  if (loading) {
    return <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">Loading users...</div>
  }

  if (error) {
    return <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
          User management
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">Workspace users</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Only admins can view and manage all users in the platform.
        </p>
      </section>

      {user?.role === 'admin' ? (
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Create user</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
            <select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={role} onChange={(event) => setRole(event.target.value as 'admin' | 'user')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-5 py-3 font-semibold text-slate-950 md:col-span-4">Create user</button>
          </form>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <h2 className="text-xl font-semibold text-white">Users</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-slate-200">
              <tr>
                {['Name', 'Email', 'Role', 'Plan', 'Blocked', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/50 text-slate-300">
              {users.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-white">{entry.name}</td>
                  <td className="px-4 py-3">{entry.email}</td>
                  <td className="px-4 py-3">{entry.role}</td>
                  <td className="px-4 py-3">{entry.plan}</td>
                  <td className="px-4 py-3">{entry.blocked ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    {user?.role === 'admin' && entry.id !== user.id ? (
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white" onClick={() => toggleBlocked(entry)} type="button">
                          {entry.blocked ? 'Unblock' : 'Block'}
                        </button>
                        <button className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100" onClick={() => handleDelete(entry.id)} type="button">
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
