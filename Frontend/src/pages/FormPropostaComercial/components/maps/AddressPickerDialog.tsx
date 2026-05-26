import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps'

import { AddressAutocomplete } from './AddressAutocomplete'
import { parseCityState, reverseGeocode } from './geocoding'
import type { PickedAddress } from './types'
import styles from './AddressPickerDialog.module.css'

const MAP_REGISTRY_ID = 'address-picker-map'
const VECTOR_MAP_ID = 'DEMO_MAP_ID'
const BRAZIL_CENTER = { lat: -14.235, lng: -51.925 }
const BRAZIL_ZOOM = 4
const SELECTED_ZOOM = 17

type AddressPickerDialogProps = {
  title: string
  initialAddress?: string
  onClose: () => void
  onConfirm: (picked: PickedAddress) => void
}

function AddressPickerDialog({ title, initialAddress = '', onClose, onConfirm }: AddressPickerDialogProps) {
  const map = useMap(MAP_REGISTRY_ID)
  const geocodingLib = useMapsLibrary('geocoding')
  const geocoder = useMemo(
    () => (geocodingLib ? new geocodingLib.Geocoder() : null),
    [geocodingLib],
  )

  const [draft, setDraft] = useState<PickedAddress | null>(null)
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(null)
  const [externalAddressText, setExternalAddressText] = useState<string | undefined>(undefined)
  const didSeedRef = useRef(false)
  const pendingCenterRef = useRef<google.maps.LatLngLiteral | null>(null)

  // Fecha no Escape (igual ao SplitGroupDialog). O dropdown do autocomplete
  // já dá stopPropagation no seu próprio Escape, então aqui só fecha o dialog.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Tenta posicionar o mapa no endereço atual ao abrir (uma única vez).
  useEffect(() => {
    if (didSeedRef.current || !geocoder || initialAddress.trim() === '') return
    didSeedRef.current = true

    let ignore = false
    geocoder
      .geocode({ address: initialAddress, region: 'br', language: 'pt-BR' })
      .then(({ results }) => {
        const result = results[0]
        if (ignore || !result) return
        const location = result.geometry.location
        const pos = { lat: location.lat(), lng: location.lng() }
        setMarkerPos(pos)
        const { city, state } = parseCityState(result.address_components)
        setDraft({ formattedAddress: result.formatted_address, city, state, ...pos })
        recenter(pos)
      })
      .catch(() => undefined)

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocoder, initialAddress])

  // Centraliza o mapa numa posição; se a instância ainda não existe, guarda
  // a posição para aplicar assim que o <Map> registrar (flush no efeito abaixo).
  function recenter(pos: google.maps.LatLngLiteral) {
    if (map) {
      map.panTo(pos)
      map.setZoom(SELECTED_ZOOM)
    } else {
      pendingCenterRef.current = pos
    }
  }

  useEffect(() => {
    if (map && pendingCenterRef.current) {
      map.panTo(pendingCenterRef.current)
      map.setZoom(SELECTED_ZOOM)
      pendingCenterRef.current = null
    }
  }, [map])

  function applyPlace(place: google.maps.places.Place) {
    const location = place.location
    if (!location) return
    const pos = { lat: location.lat(), lng: location.lng() }
    const { city, state } = parseCityState(place.addressComponents)
    setMarkerPos(pos)
    setDraft({ formattedAddress: place.formattedAddress ?? '', city, state, ...pos })
    recenter(pos)
  }

  async function applyReverseGeocode(pos: google.maps.LatLngLiteral) {
    setMarkerPos(pos)
    if (!geocoder) return
    const result = await reverseGeocode(geocoder, pos)
    if (!result) return
    const { city, state } = parseCityState(result.address_components)
    setDraft({ formattedAddress: result.formatted_address, city, state, ...pos })
    setExternalAddressText(result.formatted_address)
  }

  function handleMapClick(event: MapMouseEvent) {
    const latLng = event.detail.latLng
    if (latLng) void applyReverseGeocode(latLng)
  }

  function handleMarkerDragEnd(event: google.maps.MapMouseEvent) {
    const latLng = event.latLng
    if (latLng) void applyReverseGeocode({ lat: latLng.lat(), lng: latLng.lng() })
  }

  function handleBackdropMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleConfirm() {
    if (!draft) return
    onConfirm(draft)
    onClose()
  }

  return createPortal(
    <div className={styles.backdrop} onMouseDown={handleBackdropMouseDown} role="presentation">
      <div aria-labelledby="address-picker-title" aria-modal="true" className={styles.dialog} role="dialog">
        <header className={styles.header}>
          <h2 className={styles.title} id="address-picker-title">
            {title}
          </h2>
          <button aria-label="Fechar" className={styles.closeButton} onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className={styles.body}>
          <AddressAutocomplete
            externalValue={externalAddressText}
            initialValue={initialAddress}
            onSelect={applyPlace}
          />

          <div className={styles.mapContainer}>
            <GoogleMap
              defaultCenter={markerPos ?? BRAZIL_CENTER}
              defaultZoom={markerPos ? SELECTED_ZOOM : BRAZIL_ZOOM}
              disableDefaultUI={false}
              gestureHandling="greedy"
              id={MAP_REGISTRY_ID}
              mapId={VECTOR_MAP_ID}
              onClick={handleMapClick}
              style={{ width: '100%', height: '100%' }}
            >
              {markerPos && (
                <AdvancedMarker draggable onDragEnd={handleMarkerDragEnd} position={markerPos} />
              )}
            </GoogleMap>
          </div>

          <p className={styles.hint}>
            {draft
              ? draft.formattedAddress
              : 'Busque um endereço acima ou clique no mapa. Arraste o marcador para ajustar.'}
          </p>
        </div>

        <footer className={styles.footer}>
          <button className={styles.cancel} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className={styles.confirm} disabled={!draft} onClick={handleConfirm} type="button">
            Confirmar endereço
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export { AddressPickerDialog }
