import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../context/AuthContext'
import type { ReactNode } from 'react'

export default function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/app/overview" replace />
  }

  return children
}