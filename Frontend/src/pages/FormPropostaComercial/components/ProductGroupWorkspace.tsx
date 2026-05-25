import { useCallback, useEffect, useRef, useState } from 'react'

import { fieldRegistry } from '../config/fieldRegistry'
import { productCatalog } from '../config/productCatalog'
import { VARIANT_FIELD_IDS, getVariantValue, isGlobalSectionId } from '../domain/proposalStructure'
import {
  getSections,
  removeProductGroup,
  updateProductGroupQuantity,
} from '../formEngine'
import type { FormValue, ProposalBuilderState, ProposalProductGroup } from '../types/proposalForm'
import styles from './FormRenderer.module.css'
import { SectionRenderer } from './SectionRenderer'

type ProductGroupWorkspaceProps = {
  builderState: ProposalBuilderState
  splitInputByGroup: Record<string, string>
  availabilityByProduct: Record<string, Set<string>>
  enforcePptxAvailability: boolean
  submitAttempted: boolean
  onActivateGroup: (groupId: string) => void
  onBuilderStateChange: (updater: (currentState: ProposalBuilderState) => ProposalBuilderState) => void
  onGroupBlur: (groupId: string, fieldId: string) => void
  onGroupChange: (groupId: string, fieldId: string, value: FormValue) => void
  onSplitGroup: (group: ProposalProductGroup) => void
  onSplitInputChange: (groupId: string, value: string) => void
}

function getGroupErrorLabels(group: ProposalProductGroup): string[] {
  return Object.keys(group.formState.errors).map(
    (fieldId) => fieldRegistry[fieldId]?.label ?? fieldId,
  )
}

function getGroupLabel(group: ProposalProductGroup, groups: readonly ProposalProductGroup[]) {
  const sameProductGroups = groups.filter((currentGroup) => currentGroup.productId === group.productId)

  if (sameProductGroups.length <= 1) {
    return group.productLabel
  }

  const groupIndex = sameProductGroups.findIndex((currentGroup) => currentGroup.groupId === group.groupId)
  const suffix = String.fromCharCode(65 + Math.max(0, groupIndex))

  return `${group.productLabel} ${suffix}`
}

function getDisabledVariantOptions(
  group: ProposalProductGroup,
  availabilityByProduct: Record<string, Set<string>>,
  enforcePptxAvailability: boolean,
): Record<string, Set<string>> {
  if (!enforcePptxAvailability) {
    return {}
  }

  const product = productCatalog[group.productId]
  const availableVariants = availabilityByProduct[group.productId] ?? new Set<string>()
  const variantFieldId = VARIANT_FIELD_IDS.find((fieldId) => group.formState.visibleFields.has(fieldId))

  if (!product || !variantFieldId) {
    return {}
  }

  const disabledVariants = Object.keys(product.variants).filter((variantId) => !availableVariants.has(variantId))

  if (disabledVariants.length === 0) {
    return {}
  }

  return {
    [variantFieldId]: new Set(disabledVariants),
  }
}

function ProductGroupWorkspace({
  builderState,
  splitInputByGroup,
  availabilityByProduct,
  enforcePptxAvailability,
  submitAttempted,
  onActivateGroup,
  onBuilderStateChange,
  onGroupBlur,
  onGroupChange,
  onSplitGroup,
  onSplitInputChange,
}: ProductGroupWorkspaceProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const groupPanelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)
  const [isTabsStuck, setIsTabsStuck] = useState(false)
  const [openMenuGroupId, setOpenMenuGroupId] = useState<string | null>(null)

  useEffect(() => {
    if (!openMenuGroupId) return

    function handlePointerDown(event: MouseEvent) {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setOpenMenuGroupId(null)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenuGroupId(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenuGroupId])

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null

    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsTabsStuck(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(node)
    observerRef.current = observer
  }, [])

  function handleTabClick(groupId: string) {
    onActivateGroup(groupId)
    requestAnimationFrame(() => {
      const panel = groupPanelRef.current
      const tabs = tabsRef.current
      if (!panel) return

      const tabsHeight = tabs?.offsetHeight ?? 0
      const panelAbsoluteTop = panel.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: panelAbsoluteTop - tabsHeight, behavior: 'smooth' })
    })
  }
  const activeGroup =
    builderState.productGroups.find((group) => group.groupId === builderState.activeGroupId) ??
    builderState.productGroups[0]
  const activeGroupVariantId = activeGroup ? getVariantValue(activeGroup.formState.values) : undefined
  const activeGroupSections = activeGroup
    ? getSections(activeGroup.productId, activeGroupVariantId == null ? undefined : String(activeGroupVariantId)).filter(
        (section) => !isGlobalSectionId(section.id),
      )
    : []
  const disabledOptionValuesByFieldId = activeGroup
    ? getDisabledVariantOptions(activeGroup, availabilityByProduct, enforcePptxAvailability)
    : undefined

  if (builderState.productGroups.length === 0) {
    return null
  }

  return (
    <section className={styles.productWorkspace}>
      <div ref={setSentinelRef} className={styles.tabsSentinel} />
      <div
        className={isTabsStuck ? `${styles.tabs} ${styles.tabsStuck}` : styles.tabs}
        ref={tabsRef}
        role="tablist"
        aria-label="Grupos de produtos"
      >
        {builderState.productGroups.map((group) => {
          const isActive = activeGroup?.groupId === group.groupId
          const isMenuOpen = openMenuGroupId === group.groupId
          const errorLabels = submitAttempted ? getGroupErrorLabels(group) : []
          const errorCount = errorLabels.length

          function changeQuantity(delta: number) {
            onBuilderStateChange((currentState) =>
              updateProductGroupQuantity(currentState, group.groupId, Math.max(1, group.quantity + delta)),
            )
          }

          return (
            <div
              className={`${styles.tabItem} ${isActive ? styles.activeTab : ''}`}
              data-testid={`group-tab-${group.groupId}`}
              key={group.groupId}
            >
              <button
                aria-selected={isActive}
                className={styles.tabLabel}
                onClick={() => handleTabClick(group.groupId)}
                role="tab"
                type="button"
              >
                {getGroupLabel(group, builderState.productGroups)}
                {errorCount > 0 && (
                  <span
                    aria-label={`${errorCount} ${errorCount === 1 ? 'campo pendente' : 'campos pendentes'}`}
                    className={styles.tabErrorBadge}
                    data-testid={`group-tab-errors-${group.groupId}`}
                    title={`Campos pendentes: ${errorLabels.join(', ')}`}
                  >
                    <span aria-hidden="true">⚠</span>
                    {errorCount}
                  </span>
                )}
              </button>
              <div className={styles.tabQuantityControl}>
                <input
                  aria-label="Quantidade"
                  className={styles.tabQuantity}
                  min={1}
                  onChange={(event) =>
                    onBuilderStateChange((currentState) =>
                      updateProductGroupQuantity(currentState, group.groupId, Number(event.target.value)),
                    )
                  }
                  type="number"
                  value={group.quantity}
                />
                <div className={styles.tabQuantitySteppers}>
                  <button
                    aria-label="Aumentar quantidade"
                    className={styles.tabStepper}
                    onClick={() => changeQuantity(1)}
                    tabIndex={-1}
                    type="button"
                  >
                    <span aria-hidden="true">▲</span>
                  </button>
                  <button
                    aria-label="Diminuir quantidade"
                    className={styles.tabStepper}
                    disabled={group.quantity <= 1}
                    onClick={() => changeQuantity(-1)}
                    tabIndex={-1}
                    type="button"
                  >
                    <span aria-hidden="true">▼</span>
                  </button>
                </div>
              </div>
              <div
                className={styles.tabMenu}
                ref={isMenuOpen ? menuContainerRef : undefined}
              >
                <button
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Mais ações"
                  className={styles.tabMenuTrigger}
                  onClick={() => setOpenMenuGroupId(isMenuOpen ? null : group.groupId)}
                  type="button"
                >
                  <span aria-hidden="true">⋮</span>
                </button>
                {isMenuOpen && (
                  <div className={styles.tabMenuDropdown} role="menu">
                    <button
                      className={styles.tabMenuItem}
                      data-testid="btn-remove-group"
                      onClick={() => {
                        setOpenMenuGroupId(null)
                        onBuilderStateChange((currentState) => removeProductGroup(currentState, group.groupId))
                      }}
                      role="menuitem"
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activeGroup && (
        <div className={styles.groupPanel} ref={groupPanelRef} role="tabpanel">
          {activeGroup.quantity > 1 && (
            <div className={styles.splitControl}>
              <label>
                Dividir grupo
                <input
                  onChange={(event) => onSplitInputChange(activeGroup.groupId, event.target.value)}
                  placeholder={`Ex: ${activeGroup.quantity - 1},1`}
                  type="text"
                  value={splitInputByGroup[activeGroup.groupId] ?? ''}
                />
              </label>
              <button onClick={() => onSplitGroup(activeGroup)} type="button">
                Aplicar divisão
              </button>
            </div>
          )}

          <div className={styles.sectionStack}>
            {activeGroupSections.map((section) => (
              <SectionRenderer
                disabledOptionValuesByFieldId={disabledOptionValuesByFieldId}
                key={section.id}
                onBlur={(fieldId) => onGroupBlur(activeGroup.groupId, fieldId)}
                onChange={(fieldId, value) => onGroupChange(activeGroup.groupId, fieldId, value)}
                section={section}
                state={activeGroup.formState}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export { ProductGroupWorkspace }
