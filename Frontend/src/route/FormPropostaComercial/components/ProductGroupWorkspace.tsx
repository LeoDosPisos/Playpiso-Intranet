import { useRef } from 'react'

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
  onActivateGroup: (groupId: string) => void
  onBuilderStateChange: (updater: (currentState: ProposalBuilderState) => ProposalBuilderState) => void
  onGroupBlur: (groupId: string, fieldId: string) => void
  onGroupChange: (groupId: string, fieldId: string, value: FormValue) => void
  onMergeWithPrevious: (group: ProposalProductGroup) => void
  onSplitGroup: (group: ProposalProductGroup) => void
  onSplitInputChange: (groupId: string, value: string) => void
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

function getDisabledVariantOptions(
  group: ProposalProductGroup,
  availabilityByProduct: Record<string, Set<string>>,
): Record<string, Set<string>> {
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
  onActivateGroup,
  onBuilderStateChange,
  onGroupBlur,
  onGroupChange,
  onMergeWithPrevious,
  onSplitGroup,
  onSplitInputChange,
}: ProductGroupWorkspaceProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const groupPanelRef = useRef<HTMLDivElement>(null)

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
    ? getDisabledVariantOptions(activeGroup, availabilityByProduct)
    : undefined

  if (builderState.productGroups.length === 0) {
    return null
  }

  return (
    // Tab/Label
    <section className={styles.productWorkspace}>
      <div className={styles.tabs} ref={tabsRef} role="tablist" aria-label="Grupos de produtos">
        {builderState.productGroups.map((group) => (
          <button
            aria-selected={activeGroup?.groupId === group.groupId}
            className={activeGroup?.groupId === group.groupId ? styles.activeTab : undefined}
            data-testid={`group-tab-${group.groupId}`}
            key={group.groupId}
            onClick={() => handleTabClick(group.groupId)}
            role="tab"
            type="button"
          >
            {getGroupLabel(group, builderState.productGroups)}
          </button>
        ))}
      </div>

      {activeGroup && (
        <div className={styles.groupPanel} ref={groupPanelRef} role="tabpanel">
          <header className={styles.groupPanelHeader}>
            <div>
              <h2>{getGroupLabel(activeGroup, builderState.productGroups)}</h2>
              <p>Configure as especificações deste grupo de produtos.</p>
            </div>

            <div className={styles.groupActions}>
              <label>
                Quantidade
                <input
                  min={1}
                  onChange={(event) =>
                    onBuilderStateChange((currentState) =>
                      updateProductGroupQuantity(currentState, activeGroup.groupId, Number(event.target.value)),
                    )
                  }
                  type="number"
                  value={activeGroup.quantity}
                />
              </label>
              <button onClick={() => onMergeWithPrevious(activeGroup)} type="button">
                Agrupar anterior
              </button>
              <button
                data-testid="btn-remove-group"
                onClick={() =>
                  onBuilderStateChange((currentState) => removeProductGroup(currentState, activeGroup.groupId))
                }
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
