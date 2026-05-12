import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { generateProposal } from '../generation/buildPresentation'
import { fieldOptionsRegistry } from '../config/fieldOptionsRegistry'
import { fieldRegistry } from '../config/fieldRegistry'
import { productCatalog } from '../config/productCatalog'
import { sectionRegistry } from '../config/sectionRegistry'
import {
  addProductGroup,
  buildProposalBuilderPayload,
  createInitialProposalBuilderState,
  getSections,
  mergeProductGroups,
  removeProductGroup,
  splitProductGroup,
  touchField,
  updateFormValue,
  updateProductGroupFormValue,
  updateProductGroupQuantity,
  validateForm,
} from '../formEngine'
import type {
  FieldDefinition,
  FormState,
  FormValue,
  ProductDefinition,
  ProposalProductGroup,
  SectionDefinition,
} from '../types/proposalForm'
import styles from './FormRenderer.module.css'

type FieldRendererProps = {
  field: FieldDefinition
  state: FormState
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
}

type SectionCompletionStatus = 'empty' | 'partial' | 'complete'

const GLOBAL_SECTION_IDS = ['dados_proposta', 'dados_cliente', 'dados_obra'] as const
const AUTO_COLLAPSE_SCROLL_DISTANCE = 240
const VARIANT_FIELD_IDS = [
  'variante_quadra_tenis',
  'variante_quadra_poliesportiva',
  'variante_beach_tenis',
  'variante_campo',
  'variante_pickleball',
  'variante_padel',
  'variante_squash',
  'variante_pista',
  'variante_garagem_epoxi',
  'variante_softplay',
] as const

function getGlobalSections() {
  return GLOBAL_SECTION_IDS.map((sectionId) => sectionRegistry[sectionId]).filter((section): section is SectionDefinition =>
    Boolean(section),
  )
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

function hasFieldValue(value: FormValue) {
  return value !== null && value !== ''
}

function getSectionCompletionStatus(section: SectionDefinition, state: FormState): SectionCompletionStatus {
  const visibleFields = section.fields.filter((fieldId) => state.visibleFields.has(fieldId))
  const requiredFields = visibleFields.filter((fieldId) => state.requiredFields.has(fieldId))
  const hasAnyValue = visibleFields.some((fieldId) => hasFieldValue(state.values[fieldId]))
  const hasAllRequiredValues = requiredFields.every((fieldId) => hasFieldValue(state.values[fieldId]))

  if (!hasAnyValue) {
    return 'empty'
  }

  if (hasAllRequiredValues) {
    return 'complete'
  }

  return 'partial'
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

function getVariantValue(values: Record<string, FormValue>) {
  return VARIANT_FIELD_IDS.map((fieldId) => values[fieldId]).find((value) => value !== undefined && value !== null)
}

function readOnlyValue(field: FieldDefinition, value: FormValue) {
  if (field.id === 'responsavel_ligacao_eletrica' && value === 'cliente') {
    return 'Cliente'
  }

  return value === null ? '' : String(value)
}

function FieldRenderer({ field, state, onBlur, onChange }: FieldRendererProps) {
  const value = state.values[field.id]
  const error = state.touched[field.id] ? state.errors[field.id] : undefined
  const isRequired = state.requiredFields.has(field.id)
  const describedBy = field.description ? `${field.id}-helper` : undefined
  const options = field.optionsKey ? fieldOptionsRegistry[field.optionsKey] ?? [] : []

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
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === 'number' ? (
        <span className={styles.numberControl}>
          <input
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            id={field.id}
            name={field.id}
            onBlur={() => onBlur(field.id)}
            onChange={(event) => onChange(field.id, event.target.value === '' ? null : Number(event.target.value))}
            placeholder={field.placeholder}
            type="number"
            value={normalizeNumberValue(value)}
          />
          {field.unit && <span className={styles.unit}>{field.unit}</span>}
        </span>
      ) : null}

      {field.type === 'text' ? (
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={field.id}
          name={field.id}
          onBlur={() => onBlur(field.id)}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          type="text"
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
  isCollapsed = false,
  isCollapsible = false,
  onToggle,
}: {
  section: SectionDefinition
  state: FormState
  onBlur: (fieldId: string) => void
  onChange: (fieldId: string, value: FormValue) => void
  completionStatus?: SectionCompletionStatus
  isCollapsed?: boolean
  isCollapsible?: boolean
  onToggle?: () => void
}) {
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
                <FieldRenderer field={field} onBlur={onBlur} onChange={onChange} state={state} />
              </div>
            )
          })}
          </div>
        </div>
      </div>
    </section>
  )
}


// Sugestões de Melhorias
// 1. Posicionar o componente em outro arquivo
// 2. Criar um componente que modele a UI de um card para ProductCard herdar propriedades e parametrizar
// 
function ProductCard({
  product,
  quantity,
  onAdd,
  onQuantityChange,
}: {
  product: ProductDefinition
  quantity: number
  onAdd: () => void
  onQuantityChange: (quantity: number) => void
}) {
  const minQuantity = product.selection?.minQuantity ?? 0
  const maxQuantity = product.selection?.maxQuantity ?? 99
  const step = product.selection?.step ?? 1

  function clampQuantity(nextQuantity: number) {
    return Math.min(maxQuantity, Math.max(minQuantity, nextQuantity))
  }

  return (
    <article className={styles.productCard}>
      {product.imageSrc ? (
        <img alt="" className={styles.productImage} src={product.imageSrc} />
      ) : (
        <div className={styles.productImagePlaceholder} aria-hidden="true">
          {product.label.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className={styles.productCardBody}>
        <h3>{product.label}</h3>
        <p>{product.shortDescription ?? product.description}</p>
      </div>

      <div className={styles.productCardFooter}>
        <div className={styles.stepper} aria-label={`Quantidade de ${product.label}`}>
          <button onClick={() => onQuantityChange(clampQuantity(quantity - step))} type="button">
            -
          </button>
          <input
            aria-label="Quantidade"
            max={maxQuantity}
            min={minQuantity}
            onChange={(event) => onQuantityChange(clampQuantity(Number(event.target.value)))}
            type="number"
            value={quantity}
          />
          <button onClick={() => onQuantityChange(clampQuantity(quantity + step))} type="button">
            +
          </button>
        </div>
        <button disabled={quantity <= 0} onClick={onAdd} type="button">
          Adicionar
        </button>
      </div>
    </article>
  )
}

function ProductCarousel({
  products,
  quantities,
  onAdd,
  onQuantityChange,
}: {
  products: readonly ProductDefinition[]
  quantities: Record<string, number>
  onAdd: (productId: string) => void
  onQuantityChange: (productId: string, quantity: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollProducts(direction: 'previous' | 'next') {
    const track = trackRef.current

    if (!track) {
      return
    }

    const card = track.querySelector<HTMLElement>(`.${styles.productSlide}`)
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    const distance = card ? card.offsetWidth + gap : track.clientWidth / 3

    track.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    })
  }

  return (
    <div className={styles.productCarousel}>
      <div className={styles.carouselControls} aria-label="Navegacao de produtos">
        <button
          aria-label="Produto anterior"
          className={styles.carouselButton}
          onClick={() => scrollProducts('previous')}
          type="button"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          aria-label="Proximo produto"
          className={styles.carouselButton}
          onClick={() => scrollProducts('next')}
          type="button"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className={styles.productTrack} ref={trackRef} tabIndex={0}>
        {products.map((product) => (
          <div className={styles.productSlide} key={product.id}>
            <ProductCard
              onAdd={() => onAdd(product.id)}
              onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
              product={product}
              quantity={quantities[product.id] ?? 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function getGroupLabel(group: ProposalProductGroup, groups: readonly ProposalProductGroup[]) {
  const sameProductGroups = groups.filter((currentGroup) => currentGroup.productId === group.productId)

  if (sameProductGroups.length <= 1) {
    return `${group.productLabel} x${group.quantity}`
  }

  const groupIndex = sameProductGroups.findIndex((currentGroup) => currentGroup.groupId === group.groupId)
  const suffix = String.fromCharCode(65 + Math.max(0, groupIndex))

  return `${group.productLabel} ${suffix} x${group.quantity}`
}

function parseSplitQuantities(rawValue: string) {
  return rawValue
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((quantity) => Number.isFinite(quantity) && quantity > 0)
}

function FormRenderer() {
  const [builderState, setBuilderState] = useState(() => createInitialProposalBuilderState())
  const [collapsedGlobalSections, setCollapsedGlobalSections] = useState<Record<string, boolean>>({})
  const completionScrollAnchorsRef = useRef<Record<string, number>>({})
  const autoCollapsedSectionsRef = useRef<Record<string, boolean>>({})
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.values(productCatalog).map((product) => [product.id, product.selection?.defaultQuantity ?? 0]),
    ),
  )
  const [splitInputByGroup, setSplitInputByGroup] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const globalSections = useMemo(() => getGlobalSections(), [])
  const globalSectionStatuses = useMemo(
    () =>
      Object.fromEntries(
        globalSections.map((section) => [section.id, getSectionCompletionStatus(section, builderState.globalForm)]),
      ) as Record<string, SectionCompletionStatus>,
    [builderState.globalForm, globalSections],
  )
  const products = useMemo(() => Object.values(productCatalog), [])
  const activeGroup =
    builderState.productGroups.find((group) => group.groupId === builderState.activeGroupId) ??
    builderState.productGroups[0]
  const activeGroupVariantId = activeGroup ? getVariantValue(activeGroup.formState.values) : undefined
  const activeGroupSections = activeGroup
    ? getSections(activeGroup.productId, activeGroupVariantId == null ? undefined : String(activeGroupVariantId)).filter(
        (section) => !GLOBAL_SECTION_IDS.includes(section.id as (typeof GLOBAL_SECTION_IDS)[number]),
      )
    : []

  useEffect(() => {
    for (const section of globalSections) {
      const isComplete = globalSectionStatuses[section.id] === 'complete'

      if (isComplete && completionScrollAnchorsRef.current[section.id] === undefined) {
        completionScrollAnchorsRef.current[section.id] = window.scrollY
      }

      if (!isComplete) {
        delete completionScrollAnchorsRef.current[section.id]
        delete autoCollapsedSectionsRef.current[section.id]
      }
    }
  }, [globalSectionStatuses, globalSections])

  useEffect(() => {
    function autoCollapseCompletedSections() {
      for (const section of globalSections) {
        const anchor = completionScrollAnchorsRef.current[section.id]

        if (
          anchor !== undefined &&
          globalSectionStatuses[section.id] === 'complete' &&
          !autoCollapsedSectionsRef.current[section.id] &&
          window.scrollY - anchor >= AUTO_COLLAPSE_SCROLL_DISTANCE
        ) {
          setCollapsedGlobalSections((currentSections) => ({
            ...currentSections,
            [section.id]: true,
          }))
          autoCollapsedSectionsRef.current[section.id] = true
        }
      }
    }

    window.addEventListener('scroll', autoCollapseCompletedSections, { passive: true })

    return () => window.removeEventListener('scroll', autoCollapseCompletedSections)
  }, [globalSectionStatuses, globalSections])

  function handleGlobalChange(fieldId: string, value: FormValue) {
    setBuilderState((currentState) => ({
      ...currentState,
      globalForm: updateFormValue(currentState.globalForm, fieldId, value),
    }))
  }

  function handleGlobalBlur(fieldId: string) {
    setBuilderState((currentState) => ({
      ...currentState,
      globalForm: touchField(validateForm(currentState.globalForm), fieldId),
    }))
  }

  function handleGroupChange(groupId: string, fieldId: string, value: FormValue) {
    setBuilderState((currentState) => updateProductGroupFormValue(currentState, groupId, fieldId, value))
  }

  function handleGroupBlur(groupId: string, fieldId: string) {
    setBuilderState((currentState) => ({
      ...currentState,
      productGroups: currentState.productGroups.map((group) =>
        group.groupId === groupId
          ? {
              ...group,
              formState: touchField(validateForm(group.formState), fieldId),
            }
          : group,
      ),
    }))
  }

  function handleAddProduct(productId: string) {
    const quantity = productQuantities[productId] ?? 0

    setBuilderState((currentState) => addProductGroup(currentState, productId, quantity))
  }

  function handleSplitGroup(group: ProposalProductGroup) {
    const quantities = parseSplitQuantities(splitInputByGroup[group.groupId] ?? '')

    setBuilderState((currentState) => splitProductGroup(currentState, group.groupId, quantities))
  }

  function handleMergeWithPrevious(group: ProposalProductGroup) {
    const sameProductGroups = builderState.productGroups.filter((currentGroup) => currentGroup.productId === group.productId)
    const groupIndex = sameProductGroups.findIndex((currentGroup) => currentGroup.groupId === group.groupId)
    const previousGroup = sameProductGroups[groupIndex - 1]

    if (!previousGroup) {
      return
    }

    setBuilderState((currentState) => mergeProductGroups(currentState, [previousGroup.groupId, group.groupId]))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validatedGlobalForm = validateForm(builderState.globalForm)
    const validatedGroups = builderState.productGroups.map((group) => ({
      ...group,
      formState: validateForm(group.formState),
    }))
    const hasErrors =
      Object.keys(validatedGlobalForm.errors).length > 0 ||
      validatedGroups.some((group) => Object.keys(group.formState.errors).length > 0)
    const validatedState = {
      ...builderState,
      globalForm: validatedGlobalForm,
      productGroups: validatedGroups,
    }

    setBuilderState(validatedState)

    if (hasErrors) {
      return
    }

    const payload = buildProposalBuilderPayload(validatedState)
    setGenerationError(null)
    setIsGenerating(true)
    generateProposal(payload)
      .catch((err: unknown) => {
        setGenerationError(err instanceof Error ? err.message : 'Erro ao gerar proposta.')
      })
      .finally(() => setIsGenerating(false))
  }

  return (
    <form className={styles.formShell} onSubmit={handleSubmit}>
      <div className={styles.pageTitle}>
        <h1>Nova proposta comercial</h1>
        <p>Preencha os dados gerais, selecione os produtos e configure cada grupo da proposta.</p>
      </div>

      <div className={styles.sectionStack}>
        {globalSections.map((section) => (
          <SectionRenderer
            completionStatus={globalSectionStatuses[section.id]}
            isCollapsed={Boolean(collapsedGlobalSections[section.id])}
            isCollapsible
            key={section.id}
            onBlur={handleGlobalBlur}
            onChange={handleGlobalChange}
            onToggle={() =>
              setCollapsedGlobalSections((currentSections) => ({
                ...currentSections,
                [section.id]: !currentSections[section.id],
              }))
            }
            section={section}
            state={builderState.globalForm}
          />
        ))}

        <section className={styles.sectionCard}>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionHeaderContent}>
              <h2>Produtos</h2>
              <p>Defina a quantidade inicial e adicione os produtos que serao orcados.</p>
            </div>
          </header>

          <ProductCarousel
            onAdd={handleAddProduct}
            onQuantityChange={(productId, quantity) =>
              setProductQuantities((currentQuantities) => ({
                ...currentQuantities,
                [productId]: quantity,
              }))
            }
            products={products}
            quantities={productQuantities}
          />
        </section>

        {builderState.productGroups.length > 0 && (
          <section className={styles.productWorkspace}>
            <div className={styles.tabs} role="tablist" aria-label="Grupos de produtos">
              {builderState.productGroups.map((group) => (
                <button
                  aria-selected={activeGroup?.groupId === group.groupId}
                  className={activeGroup?.groupId === group.groupId ? styles.activeTab : undefined}
                  key={group.groupId}
                  onClick={() =>
                    setBuilderState((currentState) => ({
                      ...currentState,
                      activeGroupId: group.groupId,
                    }))
                  }
                  role="tab"
                  type="button"
                >
                  {getGroupLabel(group, builderState.productGroups)}
                </button>
              ))}
            </div>

            {activeGroup && (
              <div className={styles.groupPanel} role="tabpanel">
                <header className={styles.groupPanelHeader}>
                  <div>
                    <h2>{getGroupLabel(activeGroup, builderState.productGroups)}</h2>
                    <p>Configure as especificacoes deste grupo de produtos.</p>
                  </div>

                  <div className={styles.groupActions}>
                    <label>
                      Quantidade
                      <input
                        min={1}
                        onChange={(event) =>
                          setBuilderState((currentState) =>
                            updateProductGroupQuantity(currentState, activeGroup.groupId, Number(event.target.value)),
                          )
                        }
                        type="number"
                        value={activeGroup.quantity}
                      />
                    </label>
                    <button onClick={() => handleMergeWithPrevious(activeGroup)} type="button">
                      Agrupar anterior
                    </button>
                    <button
                      onClick={() => setBuilderState((currentState) => removeProductGroup(currentState, activeGroup.groupId))}
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                </header>

                {activeGroup.quantity > 1 && (
                  <div className={styles.splitControl}>
                    <label>
                      Dividir grupo
                      <input
                        onChange={(event) =>
                          setSplitInputByGroup((currentInputs) => ({
                            ...currentInputs,
                            [activeGroup.groupId]: event.target.value,
                          }))
                        }
                        placeholder={`Ex: ${activeGroup.quantity - 1},1`}
                        type="text"
                        value={splitInputByGroup[activeGroup.groupId] ?? ''}
                      />
                    </label>
                    <button onClick={() => handleSplitGroup(activeGroup)} type="button">
                      Aplicar divisao
                    </button>
                  </div>
                )}

                <div className={styles.sectionStack}>
                  {activeGroupSections.map((section) => (
                    <SectionRenderer
                      key={section.id}
                      onBlur={(fieldId) => handleGroupBlur(activeGroup.groupId, fieldId)}
                      onChange={(fieldId, value) => handleGroupChange(activeGroup.groupId, fieldId, value)}
                      section={section}
                      state={activeGroup.formState}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <div className={styles.actionBar}>
        <button type="button">Cancelar</button>
        <button type="button">Salvar rascunho</button>
        <button disabled={isGenerating} type="submit">
          {isGenerating ? 'Gerando...' : 'Gerar proposta'}
        </button>
      </div>

      {generationError && (
        <p className={styles.generationError} role="alert">
          {generationError}
        </p>
      )}
    </form>
  )
}

export { FormRenderer }
