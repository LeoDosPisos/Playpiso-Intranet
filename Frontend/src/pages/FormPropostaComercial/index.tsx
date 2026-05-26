import { APIProvider } from '@vis.gl/react-google-maps'

import Header from '@/components/Header/Header'
import UserMenu from '@/components/Header/UserMenu'

import { FormRenderer } from './components/FormRenderer'
import { getMapsApiKey } from './components/maps/useMapsAvailable'

const NAV_ITEMS = [
  { label: 'Nova proposta', href: '/form-proposta-comercial' },
  { label: 'Histórico', href: '/historico' },
]

export default function FormPropostaComercial() {
  const mapsApiKey = getMapsApiKey()

  return (
    <>
      <Header actions={<UserMenu />} navItems={NAV_ITEMS} />
      <main>
        {mapsApiKey ? (
          <APIProvider apiKey={mapsApiKey} language="pt-BR" libraries={['places', 'marker']} region="BR">
            <FormRenderer />
          </APIProvider>
        ) : (
          <FormRenderer />
        )}
      </main>
    </>
  )
}
