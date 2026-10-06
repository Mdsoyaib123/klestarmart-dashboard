import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetMeQuery } from '@/features/auth/authApi'
import { selectAuthStatus, selectIsAdmin } from '@/features/auth/authSlice'
import { Loading } from '@/components/ui/States'

// Checks the session cookie once, then sends signed-out visitors to the login page.
export function RequireAuth() {
  useGetMeQuery()
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  if (status === 'checking') return <Loading label="Checking your session…" />
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

// Pages only admins may open; staff are sent back to the overview.
export function RequireAdmin() {
  const isAdmin = useAppSelector(selectIsAdmin)
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
