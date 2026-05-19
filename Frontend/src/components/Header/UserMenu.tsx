import { useEffect, useRef, useState } from 'react'
import { useMsal } from '@azure/msal-react'

import styles from './UserMenu.module.css'

function UserMenu() {
  const { instance, accounts } = useMsal()
  const account = accounts[0]
  const [isOpen, setIsOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!account) return
    let objectUrl: string
    instance
      .acquireTokenSilent({ scopes: ['User.Read'], account })
      .then((res) =>
        fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: { Authorization: `Bearer ${res.accessToken}` },
        })
      )
      .then((r) => {
        if (!r.ok) throw new Error('no photo')
        return r.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setPhotoUrl(objectUrl)
      })
      .catch(() => {})
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [account, instance])

  useEffect(() => {
    if (!isOpen) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const initials =
    account?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') ?? '?'

  function handleLogout() {
    instance.logoutRedirect({ postLogoutRedirectUri: '/login' })
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        className={styles.avatarButton}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Menu do usuário"
      >
        {photoUrl ? (
          <img src={photoUrl} alt={account?.name ?? ''} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarInitials} aria-hidden="true">
            {initials}
          </span>
        )}
      </button>

      {isOpen && (
        <div role="dialog" aria-label="Perfil do usuário" className={styles.dialog}>
          <div className={styles.profile}>
            {photoUrl ? (
              <img src={photoUrl} alt={account?.name ?? ''} className={styles.profileImg} />
            ) : (
              <span className={styles.profileInitials} aria-hidden="true">
                {initials}
              </span>
            )}
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{account?.name}</span>
              <span className={styles.profileEmail}>{account?.username}</span>
            </div>
          </div>

          <button className={styles.logoutButton} type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
