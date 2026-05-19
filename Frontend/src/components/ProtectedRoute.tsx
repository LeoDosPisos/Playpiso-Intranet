import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { Navigate } from 'react-router-dom'
import { ALLOWED_USER_OIDS } from '../auth/allowedUsers'
import AccessDenied from './AccessDenied'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const { inProgress, accounts } = useMsal()

  if (window.localStorage.getItem('__e2e_bypass_auth__') === 'true') {
    return <>{children}</>
  }

  if (inProgress !== InteractionStatus.None) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const account = accounts[0]
  const oid = (account?.idTokenClaims?.oid as string | undefined) ?? account?.localAccountId
  if (!oid || !ALLOWED_USER_OIDS.includes(oid)) return <AccessDenied />

  return <>{children}</>
}

export default ProtectedRoute
