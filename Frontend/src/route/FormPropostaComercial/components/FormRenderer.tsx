import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMsal } from '@azure/msal-react'

import { productCatalog } from '../config/productCatalog'
import { getGlobalSections, getVariantValue } from '../domain/proposalStructure'
import { fetchAvailableProducts, generateProposal, type ProductAvailability } from '../generation/buildPresentation'
import {
  addProductGroup,
  buildProposalBuilderPayload,
  createInitialProposalBuilderState,
  mergeProductGroups,
  splitProductGroup,
  touchField,
  updateFormValue,
  updateProductGroupFormValue,
  validateForm,
} from '../formEngine'
import type { FormState, FormValue, ProposalProductGroup, SectionDefinition } from '../types/proposalForm'
import { saveProposalEntry } from '../history/proposalHistory'
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

function parseSplitQuantities(rawValue: string) {
  return rawValue
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((quantity) => Number.isFinite(quantity) && quantity > 0)
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

function FormRenderer() {
  const { accounts } = useMsal()
  const userEmail = accounts[0]?.username ?? 'anonymous'

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
  const [generatedFile, setGeneratedFile] = useState<{ url: string; filename: string } | null>(null)
  const [shouldScrollToError, setShouldScrollToError] = useState(false)

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
    if (availabilityStatus !== 'ready') {
      setGenerationError('A disponibilidade de geração PPTX ainda não foi confirmada.')
      return
    }

    if (!availabilityByProduct[productId]?.size) {
      setGenerationError('Este produto ainda não possui geração PPTX disponível.')
      return
    }

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

    setBuilderState(validatedState)

    if (hasErrors) {
      const firstGlobalError = findFirstErrorField(globalSections, validatedGlobalForm)
      if (firstGlobalError) {
        setCollapsedGlobalSections((prev) =>
          prev[firstGlobalError.sectionId] ? { ...prev, [firstGlobalError.sectionId]: false } : prev
        )
      }
      setShouldScrollToError(true)
      return
    }

    if (availabilityStatus !== 'ready') {
      setGenerationError('Não foi possível confirmar a disponibilidade de geração PPTX.')
      return
    }

    const unsupportedGroups = getUnsupportedGroupLabels(validatedState.productGroups, availabilityByProduct)
    if (unsupportedGroups.length > 0) {
      setGenerationError(`Geração PPTX indisponível para: ${unsupportedGroups.join(', ')}.`)
      return
    }

    const payload = buildProposalBuilderPayload(validatedState)
    setIsGenerating(true)
    generateProposal(payload)
      .then(({ url, filename }) => {
        setGeneratedFile({ url, filename })
        saveProposalEntry(userEmail, {
          id: crypto.randomUUID(),
          savedAt: new Date().toISOString(),
          filename,
          clientName: String(payload.globalValues.nome_razao_social ?? ''),
          productLabels: payload.productGroups.map((g) =>
            g.quantity > 1 ? `${g.productLabel} x${g.quantity}` : g.productLabel,
          ),
          payload,
        })
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

      {availabilityStatus === 'loading' && (
        <p className={styles.availabilityNotice} data-testid="availability-loading">
          Verificando disponibilidade de geração PPTX.
        </p>
      )}

      {availabilityStatus === 'error' && (
        <p className={styles.availabilityError} data-testid="availability-error" role="alert">
          Não foi possível verificar quais produtos geram proposta PPTX. A geração ficará bloqueada até a
          disponibilidade ser confirmada.
        </p>
      )}

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
              <p>Defina a quantidade inicial e adicione os produtos que serão orçados.</p>
            </div>
          </header>

          <ProductCarousel
            availabilityByProduct={availabilityByProduct}
            availabilityStatus={availabilityStatus}
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
          onActivateGroup={(groupId) =>
            setBuilderState((currentState) => ({
              ...currentState,
              activeGroupId: groupId,
            }))
          }
          onBuilderStateChange={setBuilderState}
          onGroupBlur={handleGroupBlur}
          onGroupChange={handleGroupChange}
          onMergeWithPrevious={handleMergeWithPrevious}
          onSplitGroup={handleSplitGroup}
          onSplitInputChange={(groupId, value) =>
            setSplitInputByGroup((currentInputs) => ({
              ...currentInputs,
              [groupId]: value,
            }))
          }
          splitInputByGroup={splitInputByGroup}
        />
      </div>

      <div className={styles.actionBar}>
        <button type="button">Cancelar</button>
        <button type="button">Salvar rascunho</button>
        <button data-testid="btn-gerar-proposta" disabled={isGenerating || availabilityStatus !== 'ready'} type="submit">
          {isGenerating ? 'Gerando...' : 'Gerar proposta'}
        </button>
      </div>

      {generationError && (
        <p className={styles.generationError} data-testid="generation-error" role="alert">
          {generationError}
        </p>
      )}

      {generatedFile && (
        <div className={styles.downloadArea} data-testid="download-area">
          <span className={styles.downloadSuccess}>✓ Proposta gerada</span>
          <span className={styles.downloadFilename}>{generatedFile.filename}</span>
          <a
            className={styles.downloadButton}
            data-testid="btn-baixar-proposta"
            download={generatedFile.filename}
            href={generatedFile.url}
          >
            Baixar PPTX
          </a>
        </div>
      )}
    </form>
  )
}

export { FormRenderer }
