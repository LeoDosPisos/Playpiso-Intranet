import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { productCatalog } from '../config/productCatalog'
import { getGlobalSections, getVariantValue } from '../domain/proposalStructure'
import { fetchAvailableProducts, generateProposal, type ProductAvailability } from '../generation/buildPresentation'
import {
  addProductGroup,
  buildProposalBuilderPayload,
  createInitialProposalBuilderState,
  splitProductGroup,
  touchField,
  updateFormValue,
  updateProductGroupFormValue,
  validateForm,
} from '../formEngine'
import { useEnforcePptxAvailability } from '../hooks/useEnforcePptxAvailability'
import type { FormState, FormValue, ProposalProductGroup, SectionDefinition } from '../types/proposalForm'
import styles from './FormRenderer.module.css'
import { ProductCarousel } from './ProductCarousel'
import { ProductGroupWorkspace } from './ProductGroupWorkspace'
import { SectionRenderer, type SectionCompletionStatus } from './SectionRenderer'

const AUTO_COLLAPSE_SCROLL_DISTANCE = 240

type AvailabilityStatus = 'loading' | 'ready' | 'error'

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

function findFirstErrorField(
  sections: readonly SectionDefinition[],
  formState: FormState,
): { fieldId: string; sectionId: string } | null {
  for (const section of sections) {
    for (const fieldId of section.fields) {
      if (formState.visibleFields.has(fieldId) && formState.errors[fieldId]) {
        return { fieldId, sectionId: section.id }
      }
    }
  }
  return null
}

function touchErrors(state: FormState): FormState {
  const touched = { ...state.touched }

  for (const fieldId of Object.keys(state.errors)) {
    touched[fieldId] = true
  }

  return { ...state, touched }
}

function buildAvailabilityMap(availableProducts: readonly ProductAvailability[]): Record<string, Set<string>> {
  return Object.fromEntries(
    availableProducts.map((product) => [product.productId, new Set(product.variantIds)]),
  ) as Record<string, Set<string>>
}

function getGroupVariantId(group: ProposalProductGroup) {
  const variantValue = getVariantValue(group.formState.values)
  const fallbackVariantId = productCatalog[group.productId]?.defaultVariantId

  return variantValue == null ? fallbackVariantId : String(variantValue)
}

function getUnsupportedGroupLabels(
  groups: readonly ProposalProductGroup[],
  availabilityByProduct: Record<string, Set<string>>,
) {
  return groups
    .filter((group) => {
      const variantId = getGroupVariantId(group)
      return !variantId || !availabilityByProduct[group.productId]?.has(variantId)
    })
    .map((group) => {
      const variantId = getGroupVariantId(group)
      const product = productCatalog[group.productId]
      const variantLabel = variantId ? product?.variants[variantId]?.label : undefined

      return variantLabel ? `${group.productLabel} (${variantLabel})` : group.productLabel
    })
}

function DownloadStickyBar({
  file,
  onDismiss,
}: {
  file: { url: string; filename: string }
  onDismiss: () => void
}) {
  return createPortal(
    <div className={styles.stickyBar} data-testid="download-sticky-bar">
      <span className={styles.stickyBarSuccess}>✓ Proposta gerada</span>
      <span className={styles.stickyBarFilename}>{file.filename}</span>
      <a
        className={styles.stickyBarDownloadButton}
        data-testid="btn-baixar-proposta"
        download={file.filename}
        href={file.url}
      >
        Baixar PPTX
      </a>
      <button
        aria-label="Fechar"
        className={styles.stickyBarDismiss}
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </div>,
    document.body,
  )
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedFile, setGeneratedFile] = useState<{ url: string; filename: string } | null>(null)
  const [generationCount, setGenerationCount] = useState(0)
  const [shouldScrollToError, setShouldScrollToError] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    const url = generatedFile?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [generatedFile?.url])

  useEffect(() => {
    if (!shouldScrollToError) return
    setShouldScrollToError(false)

    const frameId = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
      }
    })

    return () => cancelAnimationFrame(frameId)
  }, [shouldScrollToError])

  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('loading')
  const [availableProducts, setAvailableProducts] = useState<ProductAvailability[]>([])
  const [enforcePptxAvailability, setEnforcePptxAvailability] = useEnforcePptxAvailability()
  const globalSections = useMemo(() => getGlobalSections(), [])
  const globalSectionStatuses = useMemo(
    () =>
      Object.fromEntries(
        globalSections.map((section) => [section.id, getSectionCompletionStatus(section, builderState.globalForm)]),
      ) as Record<string, SectionCompletionStatus>,
    [builderState.globalForm, globalSections],
  )
  const products = useMemo(() => Object.values(productCatalog), [])
  const availabilityByProduct = useMemo(() => buildAvailabilityMap(availableProducts), [availableProducts])

  useEffect(() => {
    let isMounted = true

    fetchAvailableProducts()
      .then((nextAvailableProducts) => {
        if (!isMounted) return
        setAvailableProducts(nextAvailableProducts)
        setAvailabilityStatus('ready')
      })
      .catch(() => {
        if (!isMounted) return
        setAvailableProducts([])
        setAvailabilityStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [])

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
    if (enforcePptxAvailability) {
      if (availabilityStatus !== 'ready') {
        setGenerationError('A disponibilidade de geração PPTX ainda não foi confirmada.')
        return
      }

      if (!availabilityByProduct[productId]?.size) {
        setGenerationError('Este produto ainda não possui geração PPTX disponível.')
        return
      }
    }

    const quantity = productQuantities[productId] ?? 0

    setBuilderState((currentState) => addProductGroup(currentState, productId, quantity))
  }

  function handleSplitGroup(group: ProposalProductGroup, parts: number[]) {
    setBuilderState((currentState) => splitProductGroup(currentState, group.groupId, parts))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGenerationError(null)

    const validatedGlobalForm = touchErrors(validateForm(builderState.globalForm))
    const validatedGroups = builderState.productGroups.map((group) => ({
      ...group,
      formState: touchErrors(validateForm(group.formState)),
    }))

    const hasErrors =
      Object.keys(validatedGlobalForm.errors).length > 0 ||
      validatedGroups.some((group) => Object.keys(group.formState.errors).length > 0)
    const validatedState = {
      ...builderState,
      globalForm: validatedGlobalForm,
      productGroups: validatedGroups,
    }

    if (hasErrors) {
      setSubmitAttempted(true)
      const firstGlobalError = findFirstErrorField(globalSections, validatedGlobalForm)
      if (firstGlobalError) {
        setCollapsedGlobalSections((prev) =>
          prev[firstGlobalError.sectionId] ? { ...prev, [firstGlobalError.sectionId]: false } : prev
        )
        setBuilderState(validatedState)
      } else {
        const firstBrokenGroup = validatedGroups.find(
          (group) => Object.keys(group.formState.errors).length > 0,
        )
        if (firstBrokenGroup) {
          const groupCount = validatedGroups.filter(
            (group) => Object.keys(group.formState.errors).length > 0,
          ).length
          setGenerationError(
            groupCount === 1
              ? 'Há campos obrigatórios pendentes no produto destacado. Você foi levado até ele.'
              : `Há campos obrigatórios pendentes em ${groupCount} produtos. Você foi levado ao primeiro.`,
          )
          setBuilderState({ ...validatedState, activeGroupId: firstBrokenGroup.groupId })
        } else {
          setBuilderState(validatedState)
        }
      }
      setShouldScrollToError(true)
      return
    }

    setSubmitAttempted(false)
    setBuilderState(validatedState)

    if (enforcePptxAvailability) {
      if (availabilityStatus !== 'ready') {
        setGenerationError('Não foi possível confirmar a disponibilidade de geração PPTX.')
        return
      }

      const unsupportedGroups = getUnsupportedGroupLabels(validatedState.productGroups, availabilityByProduct)
      if (unsupportedGroups.length > 0) {
        setGenerationError(`Geração PPTX indisponível para: ${unsupportedGroups.join(', ')}.`)
        return
      }
    }

    const payload = buildProposalBuilderPayload(validatedState)
    setGeneratedFile(null)
    setIsGenerating(true)
    generateProposal(payload)
      .then(({ url, filename }) => {
        setGeneratedFile({ url, filename })
        setGenerationCount((c) => c + 1)
      })
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

      <div className={styles.enforcementToggle}>
        <label className={styles.enforcementToggleLabel}>
          <input
            checked={enforcePptxAvailability}
            data-testid="toggle-enforce-pptx"
            onChange={(event) => setEnforcePptxAvailability(event.target.checked)}
            role="switch"
            type="checkbox"
          />
          <span>Bloquear produtos sem PPTX disponível</span>
        </label>
        {!enforcePptxAvailability && (
          <p className={styles.enforcementDisabledNotice} role="status">
            Restrição desativada — produtos sem template PPTX podem falhar na geração.
          </p>
        )}
      </div>

      {enforcePptxAvailability && availabilityStatus === 'loading' && (
        <p className={styles.availabilityNotice} data-testid="availability-loading">
          Verificando disponibilidade de geração PPTX.
        </p>
      )}

      {enforcePptxAvailability && availabilityStatus === 'error' && (
        <p className={styles.availabilityError} data-testid="availability-error" role="alert">
          Não foi possível verificar quais produtos geram proposta PPTX. A geração ficará bloqueada até a
          disponibilidade ser confirmada.
        </p>
      )}

      <div className={styles.sectionStack}>
        {globalSections.map((section) => (
          <SectionRenderer
            completionStatus={globalSectionStatuses[section.id]}
            disabledOptionValuesByFieldId={{ tipo_projeto: new Set(['reforma']) }}
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
              <p>Defina a quantidade inicial e adicione os produtos que serão orçados.</p>
            </div>
          </header>

          <ProductCarousel
            availabilityByProduct={availabilityByProduct}
            availabilityStatus={availabilityStatus}
            enforcePptxAvailability={enforcePptxAvailability}
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

        <ProductGroupWorkspace
          availabilityByProduct={availabilityByProduct}
          builderState={builderState}
          enforcePptxAvailability={enforcePptxAvailability}
          submitAttempted={submitAttempted}
          onActivateGroup={(groupId) =>
            setBuilderState((currentState) => ({
              ...currentState,
              activeGroupId: groupId,
            }))
          }
          onBuilderStateChange={setBuilderState}
          onGroupBlur={handleGroupBlur}
          onGroupChange={handleGroupChange}
          onSplitGroup={handleSplitGroup}
        />
      </div>

      <div className={styles.actionBar}>
        <button
          aria-busy={isGenerating}
          aria-label={isGenerating ? 'Gerando proposta' : undefined}
          data-testid="btn-gerar-proposta"
          disabled={isGenerating || (enforcePptxAvailability && availabilityStatus !== 'ready')}
          type="submit"
        >
          {isGenerating ? <span aria-hidden="true" className={styles.spinner} /> : 'Gerar proposta'}
        </button>
      </div>

      {generationError && (
        <p className={styles.generationError} data-testid="generation-error" role="alert">
          {generationError}
        </p>
      )}

      {generatedFile && (
        <DownloadStickyBar
          key={generationCount}
          file={generatedFile}
          onDismiss={() => setGeneratedFile(null)}
        />
      )}
    </form>
  )
}

export { FormRenderer }
