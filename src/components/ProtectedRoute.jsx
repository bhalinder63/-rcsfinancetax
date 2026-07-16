import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-night">
        <span className="text-[15px] tracking-[2px] text-gold-bright">Loading…</span>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/portal'} replace />
  }
  return children
}
