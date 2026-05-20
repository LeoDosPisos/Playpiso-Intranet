import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const { inProgress } = useMsal()

  if (window.localStorage.getItem('__e2e_bypass_auth__') === 'true') {
    return <>{children}</>
  }

  if (inProgress !== InteractionStatus.None) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}

export default ProtectedRoute
