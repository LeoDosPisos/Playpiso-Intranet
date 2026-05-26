import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

import styles from './AddressPickerDialog.module.css'

const DEBOUNCE_MS = 280
const PLACE_FIELDS = ['formattedAddress', 'location', 'addressComponents']

type AddressAutocompleteProps = {
  /** Valor inicial do input (valor atual do campo). */
  initialValue?: string
  /** Texto vindo de fora (ex: reverse geocode) — sincroniza sem abrir o dropdown. */
  externalValue?: string
  /** Disparado quando o usuário escolhe uma sugestão e o Place é resolvido. */
  onSelect: (place: google.maps.places.Place) => void
}

function AddressAutocomplete({ initialValue = '', externalValue, onSelect }: AddressAutocompleteProps) {
  const placesLib = useMapsLibrary('places')
  const [inputValue, setInputValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)
  const lastExternalRef = useRef(externalValue)

  // Sincroniza texto vindo de fora (reverse geocode) sem disparar busca.
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== lastExternalRef.current) {
      lastExternalRef.current = externalValue
      setInputValue(externalValue)
      setSuggestions([])
      setActiveIndex(-1)
      setOpen(false)
    }
  }, [externalValue])

  // Limpa o timer pendente no unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      requestIdRef.current += 1 // invalida respostas em voo
    }
  }, [])

  function ensureSessionToken() {
    if (!placesLib) return null
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken()
    }
    return sessionTokenRef.current
  }

  function scheduleFetch(input: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!placesLib || input.trim().length < 3) {
      setSuggestions([])
      setActiveIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedRegionCodes: ['br'],
            language: 'pt-BR',
            region: 'br',
            sessionToken: ensureSessionToken() ?? undefined,
          })

        if (requestId !== requestIdRef.current) return // resposta stale

        const withPredictions = results.filter((suggestion) => suggestion.placePrediction)
        setSuggestions(withPredictions)
        setActiveIndex(-1)
        setOpen(withPredictions.length > 0)
      } catch {
        if (requestId !== requestIdRef.current) return
        setSuggestions([])
        setActiveIndex(-1)
      }
    }, DEBOUNCE_MS)
  }

  function handleInputChange(value: string) {
    setInputValue(value)
    setOpen(true)
    scheduleFetch(value)
  }

  async function handlePick(suggestion: google.maps.places.AutocompleteSuggestion) {
    const prediction = suggestion.placePrediction
    if (!prediction) return

    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)

    const place = prediction.toPlace()
    await place.fetchFields({ fields: PLACE_FIELDS })

    setInputValue(place.formattedAddress ?? prediction.text.text)
    lastExternalRef.current = place.formattedAddress ?? undefined
    // Renova a sessão de billing para a próxima busca.
    sessionTokenRef.current = null

    onSelect(place)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault()
        void handlePick(suggestions[activeIndex])
      }
    } else if (event.key === 'Escape') {
      // Fecha só o dropdown — não deixa o dialog fechar junto.
      event.stopPropagation()
      setOpen(false)
    }
  }

  const isLoading = placesLib === null

  return (
    <div className={styles.autocomplete}>
      <input
        aria-autocomplete="list"
        aria-expanded={open}
        autoFocus
        className={styles.autocompleteInput}
        disabled={isLoading}
        onBlur={() => {
          // Atraso para permitir o clique numa sugestão antes de fechar.
          window.setTimeout(() => setOpen(false), 120)
        }}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? 'Carregando mapa…' : 'Buscar endereço'}
        role="combobox"
        type="text"
        value={inputValue}
      />

      {open && suggestions.length > 0 && (
        <ul className={styles.suggestions} role="listbox">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            if (!prediction) return null
            return (
              <li key={prediction.placeId} role="option" aria-selected={index === activeIndex}>
                <button
                  className={`${styles.suggestion} ${index === activeIndex ? styles.suggestionActive : ''}`}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    void handlePick(suggestion)
                  }}
                  type="button"
                >
                  {prediction.text.text}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { AddressAutocomplete }
