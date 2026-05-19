import { useMsal } from '@azure/msal-react'

function AccessDenied() {
  const { instance } = useMsal()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '1rem',
      fontFamily: 'sans-serif',
      color: '#333',
    }}>
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Acesso negado</h1>
      <p style={{ margin: 0, color: '#666' }}>
        Você não tem permissão para acessar este sistema. Entre em contato com o administrador.
      </p>
      <button
        onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: '/login' })}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1.25rem',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
        }}
      >
        Sair
      </button>
    </div>
  )
}

export default AccessDenied
