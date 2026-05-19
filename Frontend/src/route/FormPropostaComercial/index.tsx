import Header from '@/components/Header/Header'
import UserMenu from '@/components/Header/UserMenu'

import { FormRenderer } from './components/FormRenderer'

const NAV_ITEMS = [
  { label: 'Nova proposta', href: '/form-proposta-comercial' },
  { label: 'Histórico', href: '/historico' },
]

export default function FormPropostaComercial() {
  return (
    <>
      <Header actions={<UserMenu />} navItems={NAV_ITEMS} />
      <main>
        <FormRenderer />
      </main>
    </>
  )
}
