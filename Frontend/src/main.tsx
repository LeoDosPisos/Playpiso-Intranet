import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'

import '@/styles/tokens.css'
import '@/styles/global.css'

import { msalInstance } from '@/auth/msalConfig'
import ProtectedRoute from '@/components/ProtectedRoute'
import Root from '@/pages/Root.tsx'
import FormPropostaComercial from '@/pages/FormPropostaComercial'
import HistoricoPropostas from '@/pages/HistoricoPropostas'
import Login from '@/pages/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><Root /></ProtectedRoute>
  },
  {
    path: '/form-proposta-comercial',
    element: <ProtectedRoute><FormPropostaComercial /></ProtectedRoute>
  },
  {
    path: '/historico',
    element: <ProtectedRoute><HistoricoPropostas /></ProtectedRoute>
  },
  {
    path: '/login',
    element: <Login />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />
    </MsalProvider>
  </StrictMode>,
)
