import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { Navigate } from 'react-router-dom'

import { loginRequest } from '@/auth/msalConfig'
import playpisoLogo from '@/assets/brand/Playpiso-Logo.png'

import styles from './Login.module.css'

function Login() {
  const isAuthenticated = useIsAuthenticated()
  const { instance } = useMsal()

  if (isAuthenticated) return <Navigate to="/form-proposta-comercial" replace />

  function handleLogin() {
    instance.loginRedirect(loginRequest)
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.brandPanel} aria-label="Playpiso">
        <img className={styles.brandLogo} src={playpisoLogo} alt="Playpiso" />
        <div className={styles.brandCopy}>
          <p className={styles.eyebrow}>Detalhe que da Jogo</p>
          <h2>Referência em pisos esportivos e comerciais no Brasil desde 1987.</h2>
          <p>
            Ambiente interno para criar, revisar e acompanhar propostas comerciais da Playpiso.
          </p>
        </div>
      </section>

      <section className={styles.formPanel} aria-labelledby="login-title">
        <div className={styles.loginForm}>
          <div className={styles.mobileBrand}>
            <img src={playpisoLogo} alt="Playpiso" />
          </div>

          <div className={styles.formHeader}>
            <h1 id="login-title">Entrar na plataforma</h1>
            <p>Use sua conta Microsoft corporativa para acessar.</p>
          </div>

          <button className={styles.msButton} type="button" onClick={handleLogin}>
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 21 21"
              width="20"
              height="20"
            >
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Entrar com Microsoft
          </button>

          <p className={styles.accessHint}>Precisa de acesso? Fale com o administrador.</p>
        </div>
      </section>
    </main>
  )
}

export default Login
