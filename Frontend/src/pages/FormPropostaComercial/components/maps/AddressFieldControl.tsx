import { useState } from 'react'

import type { FieldDefinition, FormValue } from '../../types/proposalForm'
import styles from '../FormRenderer.module.css'
import { AddressPickerDialog } from './AddressPickerDialog'
import { MapPinButton } from './MapPinButton'
import type { PickedAddress } from './types'
import { useMapsAvailable } from './useMapsAvailable'

type AddressFieldControlProps = {
  field: FieldDefinition
  value: FormValue
  error: string | undefined
  describedBy: string | undefined
  /** Sugestão (valor de endereco_cliente) — só para o campo local_obra. */
  suggestion?: string
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
}

function AddressFieldControl({
  field,
  value,
  error,
  describedBy,
  suggestion,
  onBlur,
  onChange,
}: AddressFieldControlProps) {
  const mapsAvailable = useMapsAvailable()
  const [isFocused, setIsFocused] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const stringValue = value === null ? '' : String(value)
  const showSuggestion =
    Boolean(suggestion) && isFocused && suggestion!.length > 0 && suggestion !== stringValue

  function handleConfirm(picked: PickedAddress) {
    onChange(field.id, picked.formattedAddress)
    onBlur(field.id)

    // Auto-preenche cidade/estado apenas para o endereço do cliente,
    // e sem sobrescrever com valores vazios não resolvidos.
    if (field.id === 'endereco_cliente') {
      if (picked.city) {
        onChange('cidade', picked.city)
        onBlur('cidade')
      }
      if (picked.state) {
        onChange('estado', picked.state)
        onBlur('estado')
      }
    }
  }

  return (
    <span className={styles.suggestionWrapper}>
      <span className={styles.addressInputRow}>
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={field.id}
          name={field.id}
          onBlur={() => {
            setIsFocused(false)
            onBlur(field.id)
          }}
          onChange={(event) => onChange(field.id, event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={field.placeholder}
          type="text"
          value={stringValue}
        />
        {mapsAvailable && (
          <MapPinButton
            label={`Selecionar ${field.label.toLowerCase()} no mapa`}
            onClick={() => setDialogOpen(true)}
          />
        )}
      </span>

      {showSuggestion && (
        <button
          className={styles.suggestionItem}
          onMouseDown={(event) => {
            event.preventDefault()
            onChange(field.id, suggestion!)
          }}
          type="button"
        >
          {suggestion}
        </button>
      )}

      {dialogOpen && (
        <AddressPickerDialog
          initialAddress={stringValue}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleConfirm}
          title={`Selecionar ${field.label.toLowerCase()}`}
        />
      )}
    </span>
  )
}

export { AddressFieldControl }
