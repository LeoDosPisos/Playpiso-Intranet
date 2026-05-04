// 
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// CSS
import '@/styles/global.css'
import Root from '@/route/Root.tsx'
import FormPropostaComercial from '@/route/FormPropostaComercial.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />
  },
  {
    path: '/form-proposta-comercial',
    element: <FormPropostaComercial />
  }
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
