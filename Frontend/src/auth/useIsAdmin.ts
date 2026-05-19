import { useMsal } from '@azure/msal-react'
import { ADMIN_USER_OIDS } from './allowedUsers'

export function useIsAdmin(): boolean {
  const { accounts } = useMsal()
  const account = accounts[0]
  const oid = (account?.idTokenClaims?.oid as string | undefined) ?? account?.localAccountId
  return oid !== undefined && ADMIN_USER_OIDS.includes(oid)
}
