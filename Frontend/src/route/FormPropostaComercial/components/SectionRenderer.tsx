import { useEffect, useRef, useState } from 'react'

import { fieldOptionsRegistry } from '../config/fieldOptionsRegistry'
import { fieldRegistry } from '../config/fieldRegistry'
import type { FieldDefinition, FormState, FormValue, SectionDefinition } from '../types/proposalForm'
import styles from './FormRenderer.module.css'

type FieldRendererProps = {
  field: FieldDefinition
  state: FormState
  disabledOptionValues?: Set<string>
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
}

type SectionCompletionStatus = 'empty' | 'partial' | 'complete'

type SectionRendererProps = {
  section: SectionDefinition
  state: FormState
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
  completionStatus?: SectionCompletionStatus
  disabledOptionValuesByFieldId?: Record<string, Set<string>>
  isCollapsed?: boolean
  isCollapsible?: boolean
  onToggle?: () => void
}

function isFullWidth(section: SectionDefinition, fieldId: string) {
  return section.layout?.[fieldId]?.span === 'full'
}

function normalizeNumberValue(value: FormValue) {
  if (value === null || value === '') {
    return ''
  }

  return String(value)
}

function readOnlyValue(field: FieldDefinition, value: FormValue) {
  if (field.id === 'responsavel_ligacao_eletrica' && value === 'cliente') {
    return 'Cliente'
  }

  return value === null ? '' : String(value)
}

function getSectionCompletionLabel(status: SectionCompletionStatus) {
  if (status === 'complete') {
    return 'completo'
  }

  if (status === 'partial') {
    return 'parcial'
  }

  return 'vazio'
}

type NumberInputProps = {
  field: FieldDefinition
  value: FormValue
  error: string | undefined
  describedBy: string | undefined
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
}

function NumberInput({ field, value, error, describedBy, onBlur, onChange }: NumberInputProps) {
  const [raw, setRaw] = useState(() => normalizeNumberValue(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setRaw(normalizeNumberValue(value))
    }
  }, [value])

  function handleBlur() {
    focusedRef.current = false
    const parsed = raw === '' ? null : Number(raw)
    onChange(field.id, parsed !== null && Number.isFinite(parsed) ? parsed : null)
    onBlur(field.id)
  }

  return (
    <span className={styles.numberControl}>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        id={field.id}
        inputMode="decimal"
        name={field.id}
        onBlur={handleBlur}
        onChange={(e) => setRaw(e.target.value)}
        onFocus={() => { focusedRef.current = true }}
        placeholder={field.placeholder}
        type="text"
        value={raw}
      />
      {field.unit && <span className={styles.unit}>{field.unit}</span>}
    </span>
  )
}

function FieldRenderer({ field, state, disabledOptionValues, onBlur, onChange }: FieldRendererProps) {
  const value = state.values[field.id]
  const error = state.touched[field.id] ? state.errors[field.id] : undefined
  const isRequired = state.requiredFields.has(field.id)
  const describedBy = field.description ? `${field.id}-helper` : undefined
  const options = field.optionsKey ? fieldOptionsRegistry[field.optionsKey] ?? [] : []

  if (field.type === 'multiselect') {
    const selectedValues = Array.isArray(value) ? (value as string[]) : []
    return (
      <fieldset className={styles.multiselectField}>
        <legend className={styles.label}>
          {field.label}
          {isRequired && <span className={styles.requiredMark}>*</span>}
        </legend>
        <div className={styles.multiselectOptions}>
          {options.map((option) => (
            <label className={styles.multiselectOption} key={option.value}>
              <input
                checked={selectedValues.includes(option.value)}
                name={field.id}
                onBlur={() => onBlur(field.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v) => v !== option.value)
                  onChange(field.id, next)
                }}
                type="checkbox"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {error && <small className={styles.errorText}>{error}</small>}
      </fieldset>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className={styles.checkboxField}>
        <input
          checked={Boolean(value)}
          id={field.id}
          name={field.id}
          onBlur={() => onBlur(field.id)}
          onChange={(event) => onChange(field.id, event.target.checked)}
          type="checkbox"
        />
        <span>
          {field.label}
          {field.description && (
            <small className={styles.helperText} id={describedBy}>
              {field.description}
            </small>
          )}
        </span>
      </label>
    )
  }

  return (
    <label className={styles.field} htmlFor={field.id}>
      <span className={styles.label}>
        {field.label}
        {isRequired && <span className={styles.requiredMark}>*</span>}
      </span>

      {field.type === 'select' || field.type === 'selectWithCustomOption' ? (
        <select
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={field.id}
          name={field.id}
          onBlur={() => onBlur(field.id)}
          onChange={(event) => onChange(field.id, event.target.value)}
          value={value === null ? '' : String(value)}
        >
          <option value="">Selecione</option>
          {options.map((option) => (
            <option disabled={disabledOptionValues?.has(option.value)} key={option.value} value={option.value}>
              {option.label}
              {disabledOptionValues?.has(option.value) ? ' — PPTX indisponível' : ''}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === 'number' ? (
        <NumberInput
          describedBy={describedBy}
          error={error}
          field={field}
          onBlur={onBlur}
          onChange={onChange}
          value={value}
        />
      ) : null}

      {(field.type === 'text' || field.type === 'date' || field.type === 'email') ? (
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={field.id}
          name={field.id}
          onBlur={() => onBlur(field.id)}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          type={field.type}
          value={value === null ? '' : String(value)}
        />
      ) : null}

      {field.type === 'textarea' ? (
        <textarea
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={field.id}
          name={field.id}
          onBlur={() => onBlur(field.id)}
          onChange={(event) => onChange(field.id, event.target.value)}
          rows={field.rows ?? 4}
          value={value === null ? '' : String(value)}
        />
      ) : null}

      {field.type === 'readonly' ? <output className={styles.readOnlyValue}>{readOnlyValue(field, value)}</output> : null}

      {field.description && (
        <small className={styles.helperText} id={describedBy}>
          {field.description}
        </small>
      )}
      {error && <small className={styles.errorText}>{error}</small>}
    </label>
  )
}

function SectionRenderer({
  section,
  state,
  onBlur,
  onChange,
  completionStatus,
  disabledOptionValuesByFieldId,
  isCollapsed = false,
  isCollapsible = false,
  onToggle,
}: SectionRendererProps) {
  const visibleFields = section.fields.filter((fieldId) => state.visibleFields.has(fieldId))
  const contentId = `${section.id}-content`

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <section className={styles.sectionCard}>
      <header className={`${styles.sectionHeader} ${isCollapsed ? styles.collapsedSectionHeader : ''}`}>
        <div className={styles.sectionHeaderContent}>
          <h2>{section.title}</h2>
          {section.description && <p>{section.description}</p>}
        </div>

        {isCollapsible && (
          <div className={styles.sectionHeaderActions}>
            {completionStatus && (
              <span
                aria-label={`Status: ${getSectionCompletionLabel(completionStatus)}`}
                className={`${styles.completionSignal} ${styles[completionStatus]}`}
                role="img"
              />
            )}
            <button
              aria-controls={contentId}
              aria-expanded={!isCollapsed}
              className={styles.sectionToggle}
              onClick={onToggle}
              type="button"
            >
              <span
                aria-hidden="true"
                className={`${styles.sectionToggleIcon} ${isCollapsed ? styles.collapsedToggleIcon : ''}`}
              >
                ⌄
              </span>
            </button>
          </div>
        )}
      </header>

      <div
        aria-hidden={isCollapsed}
        className={`${styles.sectionBody} ${isCollapsible ? styles.collapsibleSectionBody : ''} ${
          isCollapsed ? styles.collapsedSectionBody : ''
        }`}
        id={contentId}
      >
        <div className={styles.sectionBodyInner}>
          <div className={styles.formGrid}>
            {visibleFields.map((fieldId) => {
              const field = fieldRegistry[fieldId]

              if (!field) {
                return null
              }

              return (
                <div className={isFullWidth(section, fieldId) ? styles.fullSpan : undefined} key={fieldId}>
                  <FieldRenderer
                    disabledOptionValues={disabledOptionValuesByFieldId?.[fieldId]}
                    field={field}
                    onBlur={onBlur}
                    onChange={onChange}
                    state={state}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export { SectionRenderer }
export type { SectionCompletionStatus }
