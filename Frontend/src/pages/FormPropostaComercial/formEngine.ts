import { conditionalRules } from './config/conditionalRules'
import { fieldRegistry } from './config/fieldRegistry'
import { productCatalog } from './config/productCatalog'
import { sectionRegistry } from './config/sectionRegistry'
import { GLOBAL_SECTION_IDS, getVariantValue, isGlobalSectionId } from './domain/proposalStructure'
import type {
  ConditionalEffect,
  ConditionalExpression,
  ConditionalPredicate,
  FormState,
  FormValue,
  ProductDefinition,
  ProductVariantDefinition,
  ProposalBuilderPayload,
  ProposalBuilderState,
  ProposalProductGroup,
  SectionDefinition,
} from './types/proposalForm'

const EMPTY_VALUES = new Set<FormValue>(['', null])

function isEmpty(value: FormValue): boolean {
  if (Array.isArray(value)) return value.length === 0
  return EMPTY_VALUES.has(value)
}

function getProduct(productId: string): ProductDefinition {
  const product = productCatalog[productId]

  if (!product) {
    throw new Error(`Produto não encontrado: ${productId}`)
  }

  return product
}

function getVariant(product: ProductDefinition, variantId?: string): ProductVariantDefinition {
  const resolvedVariantId = variantId ?? product.defaultVariantId
  const variant = product.variants[resolvedVariantId]

  if (!variant) {
    throw new Error(`Variante não encontrada: ${resolvedVariantId}`)
  }

  return variant
}

function getSections(productId: string, variantId?: string): SectionDefinition[] {
  const product = getProduct(productId)
  const variant = getVariant(product, variantId)

  return variant.sections.map((sectionId) => {
    const section = sectionRegistry[sectionId]

    if (!section) {
      throw new Error(`Seção não encontrada: ${sectionId}`)
    }

    return section
  })
}

function collectFieldIds(sections: readonly SectionDefinition[]): string[] {
  return [...new Set(sections.flatMap((section) => section.fields))]
}

function getSectionsByIds(sectionIds: readonly string[]): SectionDefinition[] {
  return sectionIds.map((sectionId) => {
    const section = sectionRegistry[sectionId]

    if (!section) {
      throw new Error(`Seção não encontrada: ${sectionId}`)
    }

    return section
  })
}

function evaluatePredicate(predicate: ConditionalPredicate, values: Record<string, FormValue>): boolean {
  const currentValue = values[predicate.field]

  if (predicate.operator === 'equals') {
    return currentValue === predicate.value
  }

  if (predicate.operator === 'notEquals') {
    return currentValue !== predicate.value
  }

  if (predicate.operator === 'truthy') {
    return Boolean(currentValue)
  }

  return !currentValue
}

function evaluateCondition(condition: ConditionalExpression | undefined, values: Record<string, FormValue>): boolean {
  if (!condition) {
    return true
  }

  if ('all' in condition) {
    return condition.all.every((predicate) => evaluatePredicate(predicate, values))
  }

  if ('any' in condition) {
    return condition.any.some((predicate) => evaluatePredicate(predicate, values))
  }

  return evaluatePredicate(condition, values)
}

function computeArea(values: Record<string, FormValue>): number | null {
  const largura = Number(values.largura)
  const comprimento = Number(values.comprimento)

  if (!Number.isFinite(largura) || !Number.isFinite(comprimento)) {
    return null
  }

  return largura * comprimento
}

function applyEffect(
  effect: ConditionalEffect,
  state: Pick<FormState, 'values' | 'visibleFields' | 'requiredFields' | 'computedOverrides'>,
) {
  const fieldBelongsToForm = Object.hasOwn(state.values, effect.field)

  if (!fieldBelongsToForm) {
    return
  }

  if (effect.type === 'show') {
    state.visibleFields.add(effect.field)
    return
  }

  if (effect.type === 'hide') {
    state.visibleFields.delete(effect.field)
    state.requiredFields.delete(effect.field)
    return
  }

  if (effect.type === 'require') {
    if (state.visibleFields.has(effect.field)) {
      state.requiredFields.add(effect.field)
    }
    return
  }

  if (effect.type === 'unrequire') {
    state.requiredFields.delete(effect.field)
    return
  }

  if (effect.type === 'clear') {
    state.values[effect.field] = null
    return
  }

  if (effect.type === 'setValue') {
    state.values[effect.field] = effect.value
    return
  }

  if (effect.type === 'setDefault') {
    if (state.values[effect.field] === undefined || state.values[effect.field] === null || state.values[effect.field] === '') {
      state.values[effect.field] = effect.value
    }
    return
  }

  if (!effect.overridable || !state.computedOverrides[effect.field]) {
    state.values[effect.field] = computeArea(state.values)
  }
}

function applyConditionalRules(
  values: Record<string, FormValue>,
  visibleFields: Set<string>,
  requiredFields: Set<string>,
  computedOverrides: Record<string, boolean>,
) {
  const nextValues = { ...values }
  const nextVisibleFields = new Set(visibleFields)
  const nextRequiredFields = new Set(requiredFields)
  const ruleState = {
    values: nextValues,
    visibleFields: nextVisibleFields,
    requiredFields: nextRequiredFields,
    computedOverrides,
  }

  for (const rule of conditionalRules) {
    const effects = evaluateCondition(rule.when, ruleState.values) ? rule.effects : rule.elseEffects ?? []

    for (const effect of effects) {
      applyEffect(effect, ruleState)
    }
  }

  for (const fieldId of Object.keys(nextValues)) {
    if (!nextVisibleFields.has(fieldId)) {
      nextRequiredFields.delete(fieldId)
    }
  }

  return {
    values: nextValues,
    visibleFields: nextVisibleFields,
    requiredFields: nextRequiredFields,
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateValues(values: Record<string, FormValue>, requiredFields: Set<string>, visibleFields: Set<string>) {
  const errors: Record<string, string> = {}

  for (const fieldId of requiredFields) {
    if (!visibleFields.has(fieldId)) {
      continue
    }

    const value = values[fieldId]

    if (isEmpty(value)) {
      errors[fieldId] = 'Campo obrigatório.'
    }
  }

  const emailValue = values['email']
  if (visibleFields.has('email') && emailValue && !EMAIL_REGEX.test(String(emailValue))) {
    errors['email'] = 'E-mail inválido.'
  }

  return errors
}

function createFormStateFromSections(
  sections: readonly SectionDefinition[],
  defaultValues: Record<string, FormValue> = {},
  applyRules = true,
): FormState {
  const fieldIds = collectFieldIds(sections)
  const values: Record<string, FormValue> = {}
  const visibleFields = new Set(fieldIds)
  const requiredFields = new Set<string>()

  for (const fieldId of fieldIds) {
    const field = fieldRegistry[fieldId]

    if (!field) {
      throw new Error(`Campo não encontrado: ${fieldId}`)
    }

    values[fieldId] = field.defaultValue ?? null

    if (field.required) {
      requiredFields.add(fieldId)
    }
  }

  Object.assign(values, defaultValues)

  const resolved = applyRules
    ? applyConditionalRules(values, visibleFields, requiredFields, {})
    : {
        values,
        visibleFields,
        requiredFields,
      }

  return {
    values: resolved.values,
    visibleFields: resolved.visibleFields,
    requiredFields: resolved.requiredFields,
    errors: {},
    touched: {},
    dirty: {},
    computedOverrides: {},
  }
}

function createInitialFormState(productId: string, variantId?: string): FormState {
  const product = getProduct(productId)
  const variant = getVariant(product, variantId)
  const sections = getSections(productId, variant.id).filter((section) => !isGlobalSectionId(section.id))

  return createFormStateFromSections(sections, variant.defaultValues)
}

function getTodayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createInitialGlobalFormState(): FormState {
  return createFormStateFromSections(
    getSectionsByIds(GLOBAL_SECTION_IDS),
    { data_solicitacao: getTodayIsoDate() },
    false,
  )
}

function cloneFormState(state: FormState): FormState {
  return {
    values: { ...state.values },
    visibleFields: new Set(state.visibleFields),
    requiredFields: new Set(state.requiredFields),
    errors: { ...state.errors },
    touched: { ...state.touched },
    dirty: { ...state.dirty },
    computedOverrides: { ...state.computedOverrides },
  }
}

function getNextGroupId(productId: string, groups: readonly ProposalProductGroup[]): string {
  const prefix = `${productId}_grupo_`
  const usedIndexes = groups
    .map((group) => group.groupId)
    .filter((groupId) => groupId.startsWith(prefix))
    .map((groupId) => Number(groupId.replace(prefix, '')))
    .filter(Number.isFinite)
  const nextIndex = usedIndexes.length > 0 ? Math.max(...usedIndexes) + 1 : 1

  return `${prefix}${nextIndex}`
}

function createProductGroup(
  productId: string,
  quantity: number,
  groups: readonly ProposalProductGroup[] = [],
  variantId?: string,
  sourceGroup?: ProposalProductGroup,
): ProposalProductGroup {
  const product = getProduct(productId)
  const formState = sourceGroup ? cloneFormState(sourceGroup.formState) : createInitialFormState(productId, variantId)

  return {
    groupId: getNextGroupId(productId, groups),
    productId,
    productLabel: product.label,
    quantity,
    formState,
    sourceGroupId: sourceGroup?.groupId,
  }
}

function createInitialProposalBuilderState(): ProposalBuilderState {
  return {
    globalForm: createInitialGlobalFormState(),
    productGroups: [],
  }
}

function updateFormValue(state: FormState, fieldId: string, value: FormValue): FormState {
  const values = {
    ...state.values,
    [fieldId]: value,
  }
  const resolved = applyConditionalRules(values, state.visibleFields, state.requiredFields, state.computedOverrides)
  const errors = validateValues(resolved.values, resolved.requiredFields, resolved.visibleFields)

  return {
    ...state,
    values: resolved.values,
    visibleFields: resolved.visibleFields,
    requiredFields: resolved.requiredFields,
    errors,
    dirty: {
      ...state.dirty,
      [fieldId]: true,
    },
  }
}

function touchField(state: FormState, fieldId: string): FormState {
  return {
    ...state,
    touched: {
      ...state.touched,
      [fieldId]: true,
    },
  }
}

function validateForm(state: FormState): FormState {
  return {
    ...state,
    errors: validateValues(state.values, state.requiredFields, state.visibleFields),
  }
}

function buildPayload(state: FormState, productId: string) {
  const values = Object.fromEntries(
    Object.entries(state.values).filter(([fieldId]) => state.visibleFields.has(fieldId)),
  )
  const product = getProduct(productId)
  const selectedVariantValue = getVariantValue(values)
  const variantId =
    selectedVariantValue === undefined
      ? undefined
      : Object.keys(product.variants).find((currentVariantId) =>
          Object.values(product.variants[currentVariantId]?.defaultValues ?? {}).includes(selectedVariantValue),
        )

  return {
    productId,
    variantId: variantId ?? selectedVariantValue,
    values,
    computed: {
      area_total_calculada: computeArea(state.values),
    },
    metadata: {
      mode: 'create',
      submittedAt: new Date().toISOString(),
    },
  }
}

function addProductGroup(state: ProposalBuilderState, productId: string, quantity: number): ProposalBuilderState {
  if (quantity <= 0) {
    return state
  }

  const group = createProductGroup(productId, quantity, state.productGroups)

  return {
    ...state,
    productGroups: [...state.productGroups, group],
    activeGroupId: group.groupId,
  }
}

function removeProductGroup(state: ProposalBuilderState, groupId: string): ProposalBuilderState {
  const productGroups = state.productGroups.filter((group) => group.groupId !== groupId)
  const activeGroupId = state.activeGroupId === groupId ? productGroups[0]?.groupId : state.activeGroupId

  return {
    ...state,
    productGroups,
    activeGroupId,
  }
}

function updateProductGroupQuantity(state: ProposalBuilderState, groupId: string, quantity: number): ProposalBuilderState {
  if (quantity <= 0) {
    return removeProductGroup(state, groupId)
  }

  return {
    ...state,
    productGroups: state.productGroups.map((group) => (group.groupId === groupId ? { ...group, quantity } : group)),
  }
}

function splitProductGroup(state: ProposalBuilderState, groupId: string, quantities: readonly number[]): ProposalBuilderState {
  const groupIndex = state.productGroups.findIndex((group) => group.groupId === groupId)
  const group = state.productGroups[groupIndex]

  if (!group) {
    return state
  }

  const normalizedQuantities = quantities.filter((quantity) => quantity > 0)
  const total = normalizedQuantities.reduce((sum, quantity) => sum + quantity, 0)

  if (normalizedQuantities.length < 2 || total !== group.quantity) {
    return state
  }

  const groupsBefore = state.productGroups.slice(0, groupIndex)
  const groupsAfter = state.productGroups.slice(groupIndex + 1)
  const firstGroup: ProposalProductGroup = {
    ...group,
    quantity: normalizedQuantities[0],
  }
  let nextGroupsSeed = [...groupsBefore, firstGroup, ...groupsAfter]
  const splitGroups = normalizedQuantities.slice(1).map((quantity) => {
    const newGroup = createProductGroup(group.productId, quantity, nextGroupsSeed, undefined, group)
    nextGroupsSeed = [...nextGroupsSeed, newGroup]
    return newGroup
  })

  return {
    ...state,
    productGroups: [...groupsBefore, firstGroup, ...splitGroups, ...groupsAfter],
    activeGroupId: firstGroup.groupId,
  }
}

function mergeProductGroups(state: ProposalBuilderState, groupIds: readonly string[]): ProposalBuilderState {
  const selectedGroups = state.productGroups.filter((group) => groupIds.includes(group.groupId))
  const [targetGroup] = selectedGroups

  if (!targetGroup || selectedGroups.length < 2) {
    return state
  }

  const mergedQuantity = selectedGroups.reduce((sum, group) => sum + group.quantity, 0)
  const selectedGroupIds = new Set(groupIds)

  return {
    ...state,
    productGroups: state.productGroups
      .filter((group) => !selectedGroupIds.has(group.groupId) || group.groupId === targetGroup.groupId)
      .map((group) => (group.groupId === targetGroup.groupId ? { ...group, quantity: mergedQuantity } : group)),
    activeGroupId: targetGroup.groupId,
  }
}

function updateProductGroupFormValue(
  state: ProposalBuilderState,
  groupId: string,
  fieldId: string,
  value: FormValue,
): ProposalBuilderState {
  return {
    ...state,
    productGroups: state.productGroups.map((group) =>
      group.groupId === groupId ? { ...group, formState: updateFormValue(group.formState, fieldId, value) } : group,
    ),
  }
}

function buildProposalBuilderPayload(state: ProposalBuilderState): ProposalBuilderPayload {
  const globalValues = Object.fromEntries(
    Object.entries(state.globalForm.values).filter(([fieldId]) => state.globalForm.visibleFields.has(fieldId)),
  )

  return {
    globalValues,
    productGroups: state.productGroups.map((group) => {
      const values = Object.fromEntries(
        Object.entries(group.formState.values).filter(([fieldId]) => group.formState.visibleFields.has(fieldId)),
      )

      return {
        groupId: group.groupId,
        productId: group.productId,
        productLabel: group.productLabel,
        quantity: group.quantity,
        variantId: getVariantValue(group.formState.values),
        values,
        computed: {
          area_total_calculada: computeArea(group.formState.values),
        },
      }
    }),
    metadata: {
      mode: 'create',
      submittedAt: new Date().toISOString(),
    },
  }
}

export {
  addProductGroup,
  buildPayload,
  buildProposalBuilderPayload,
  createInitialFormState,
  createInitialProposalBuilderState,
  createProductGroup,
  evaluateCondition,
  getSections,
  mergeProductGroups,
  removeProductGroup,
  splitProductGroup,
  touchField,
  updateFormValue,
  updateProductGroupFormValue,
  updateProductGroupQuantity,
  validateForm,
}
