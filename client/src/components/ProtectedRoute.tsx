import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, guest, loading } = useAuth()

  if (guest) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-white/40">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
