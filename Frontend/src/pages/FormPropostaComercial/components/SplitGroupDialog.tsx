import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { ProposalProductGroup } from '../types/proposalForm'
import styles from './SplitGroupDialog.module.css'

type SplitGroupDialogProps = {
  group: ProposalProductGroup
  onClose: () => void
  onConfirm: (parts: number[]) => void
}

function buildInitialParts(quantity: number): string[] {
  return [String(Math.max(1, quantity - 1)), '1']
}

function parsePart(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return null
  return value
}

function SplitGroupDialog({ group, onClose, onConfirm }: SplitGroupDialogProps) {
  const [parts, setParts] = useState<string[]>(() => buildInitialParts(group.quantity))
  const firstInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
    firstInputRef.current?.select()
  }, [])

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

  const parsedParts = useMemo(() => parts.map(parsePart), [parts])
  const sum = parsedParts.reduce<number>((acc, value) => acc + (value ?? 0), 0)
  const hasInvalidPart = parsedParts.some((value) => value === null)
  const canConfirm = !hasInvalidPart && parts.length >= 2 && sum === group.quantity

  function updatePart(index: number, value: string) {
    setParts((current) => current.map((part, partIndex) => (partIndex === index ? value : part)))
  }

  function addPart() {
    setParts((current) => [...current, '1'])
  }

  function removePart(index: number) {
    setParts((current) => current.filter((_, partIndex) => partIndex !== index))
  }

  function handleBackdropMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm(parsedParts.filter((value): value is number => value !== null))
  }

  const canAddPart = parts.length < group.quantity
  const sumLabelClass = sum === group.quantity && !hasInvalidPart ? styles.sumOk : styles.sumError

  return createPortal(
    <div className={styles.backdrop} onMouseDown={handleBackdropMouseDown} role="presentation">
      <div
        aria-labelledby="split-group-dialog-title"
        aria-modal="true"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.header}>
          <h2 className={styles.title} id="split-group-dialog-title">
            Dividir grupo
          </h2>
          <button
            aria-label="Fechar"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.description}>
            Este grupo tem{' '}
            <span className={styles.descriptionHighlight}>
              {group.quantity} unidades de {group.productLabel}
            </span>{' '}
            com a mesma configuração. Você pode separá-lo em grupos menores para configurar
            especificações diferentes em cada um (ex: pisos ou iluminações distintas). A soma das
            partes deve ser igual à quantidade original.
          </p>

          <span className={styles.partsLabel}>Dividir em:</span>
          <div className={styles.partsRow}>
            {parts.map((part, index) => {
              const parsed = parsedParts[index]
              const isInvalid = parsed === null
              return (
                <div className={styles.part} key={index}>
                  <input
                    aria-invalid={isInvalid}
                    aria-label={`Parte ${index + 1}`}
                    className={`${styles.partInput} ${isInvalid ? styles.partInputInvalid : ''}`}
                    inputMode="numeric"
                    min={1}
                    onChange={(event) => updatePart(index, event.target.value)}
                    ref={index === 0 ? firstInputRef : undefined}
                    type="number"
                    value={part}
                  />
                  {index >= 2 && (
                    <button
                      aria-label={`Remover parte ${index + 1}`}
                      className={styles.removePart}
                      onClick={() => removePart(index)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                  {index < parts.length - 1 && (
                    <span aria-hidden="true" className={styles.plus}>
                      +
                    </span>
                  )}
                </div>
              )
            })}
            <button
              className={styles.addPart}
              disabled={!canAddPart}
              onClick={addPart}
              type="button"
            >
              + adicionar parte
            </button>
          </div>

          <span className={sumLabelClass}>
            Soma: {sum} / {group.quantity}
            {sum === group.quantity && !hasInvalidPart ? ' ✓' : ''}
            {sum !== group.quantity && !hasInvalidPart
              ? ` — precisa ser ${group.quantity}`
              : ''}
            {hasInvalidPart ? ' — preencha todas as partes com números inteiros ≥ 1' : ''}
          </span>
        </div>

        <footer className={styles.footer}>
          <button className={styles.cancel} onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className={styles.confirm}
            data-testid="btn-confirm-split"
            disabled={!canConfirm}
            onClick={handleConfirm}
            type="button"
          >
            Dividir
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export { SplitGroupDialog }
