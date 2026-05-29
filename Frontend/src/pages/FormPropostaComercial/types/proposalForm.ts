type FieldOption = {
  value: string
  label: string
  aliases?: readonly string[]
  isDefault?: boolean
}

type FieldType =
  | 'text'
  | 'date'
  | 'email'
  | 'number'
  | 'select'
  | 'selectWithCustomOption'
  | 'checkbox'
  | 'textarea'
  | 'readonly'
  | 'multiselect'

type FormValue = string | number | boolean | null | string[]

type FieldDefinition = {
  id: string
  label: string
  type: FieldType
  required?: boolean
  defaultValue?: FormValue
  unit?: string
  placeholder?: string
  description?: string
  optionsKey?: string
  customFieldId?: string
  rows?: number
  readOnly?: boolean
  /** Mantém o campo no estado/payload (e auto-preenchimento), mas não o renderiza no formulário. */
  hidden?: boolean
  xlsxKey?: string
  pptxKey?: string
}

type FieldLayout = {
  span?: 1 | 2 | 'full'
  subsectionTitle?: string
}

type ConditionalFieldGroup = {
  id: string
  title?: string
  triggerField?: string
  fields: readonly string[]
}

type SectionDefinition = {
  id: string
  title: string
  description?: string
  required?: boolean
  fields: readonly string[]
  groups?: readonly ConditionalFieldGroup[]
  layout?: Record<string, FieldLayout>
}

type ProductVariantDefinition = {
  id: string
  label: string
  sections: readonly string[]
  defaultValues?: Record<string, FormValue>
  sumarioTemplate?: string
}

type ProductSelectionConfig = {
  minQuantity: number
  maxQuantity: number
  defaultQuantity: number
  step: number
  allowGrouping: boolean
  allowSplitGroups: boolean
}

type ProductDefinition = {
  id: string
  label: string
  description: string
  shortDescription?: string
  imageSrc?: string
  selection?: ProductSelectionConfig
  defaultVariantId: string
  variants: Record<string, ProductVariantDefinition>
}

type ConditionalPredicate = {
  field: string
  operator: 'equals' | 'notEquals' | 'truthy' | 'falsy'
  value?: FormValue
}

type ConditionalExpression =
  | ConditionalPredicate
  | { all: readonly ConditionalPredicate[] }
  | { any: readonly ConditionalPredicate[] }

type ConditionalEffect =
  | { type: 'setDefault'; field: string; value?: FormValue; fromField?: string }
  | { type: 'compute'; field: string; expression: 'largura * comprimento'; overridable?: boolean }
  | { type: 'show'; field: string }
  | { type: 'hide'; field: string }
  | { type: 'require'; field: string }
  | { type: 'unrequire'; field: string }
  | { type: 'clear'; field: string }
  | { type: 'setValue'; field: string; value: FormValue }

type ConditionalRule = {
  id: string
  description: string
  when?: ConditionalExpression
  effects: readonly ConditionalEffect[]
  elseEffects?: readonly ConditionalEffect[]
}

type FormState = {
  values: Record<string, FormValue>
  visibleFields: Set<string>
  requiredFields: Set<string>
  errors: Record<string, string>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  computedOverrides: Record<string, boolean>
}

type ProposalProductGroup = {
  groupId: string
  productId: string
  productLabel: string
  quantity: number
  formState: FormState
  sourceGroupId?: string
}

type ProposalBuilderState = {
  globalForm: FormState
  productGroups: ProposalProductGroup[]
  activeGroupId?: string
}

type ProductGroupPayload = {
  groupId: string
  productId: string
  productLabel: string
  quantity: number
  variantId?: FormValue
  values: Record<string, FormValue>
  computed: Record<string, FormValue>
}

type ProposalBuilderPayload = {
  globalValues: Record<string, FormValue>
  productGroups: ProductGroupPayload[]
  metadata: {
    submittedAt: string
    mode: 'create'
  }
}

type ExportColumnMapping = {
  fieldId: string
  columnName: string
}

type ExportPlaceholderMapping = {
  fieldId: string
  placeholder: string
}

type ExportMappings = {
  xlsx: {
    columns: readonly ExportColumnMapping[]
  }
  pptx: {
    placeholders: readonly ExportPlaceholderMapping[]
  }
}

type SlidePlaceholder = {
  placeholder: string
  fieldId: string
}

type GlobalSlide = {
  category: 'global'
  slideId: string
  label: string
  phase: 'pre_product' | 'post_product'
  order: number
  templateFile: string
  placeholders?: readonly SlidePlaceholder[]
  dynamic?: 'sumario'
}

type ProductSlide = {
  category: 'product'
  slideId: string
  label: string
  productId: string
  orderWithinProduct: number
  templateFile: string
  placeholders?: readonly SlidePlaceholder[]
  dynamic?: 'investimento'
}

type VariantSlide = {
  category: 'variant'
  slideId: string
  label: string
  productId: string
  variantIds: readonly string[]
  orderWithinProduct: number
  templateFile: string
  placeholders?: readonly SlidePlaceholder[]
  dynamic?: 'investimento'
}

type ConditionalSlide = {
  category: 'conditional'
  slideId: string
  label: string
  productId?: string
  variantIds?: readonly string[]
  condition: ConditionalExpression
  orderWithinProduct: number
  templateFile: string
  placeholders?: readonly SlidePlaceholder[]
  dynamic?: 'fechamentos' | 'acessorios'
}

/**
 * Bloco opcional de "projetos realizados" por (produto, variante), sintetizado em
 * resolveSlideList (não declarado em slideRegistry). Posicionado entre
 * consideracoes_gerais e encerramento. O backend procura primeiro
 * slides/<product>/projetos/<variantId>/*.pptx e, se vazio/ausente, cai para
 * slides/<product>/projetos/*.pptx (nível produto). Sem nenhum dos dois → omitido.
 */
type ProjectsSlide = {
  category: 'projetos'
  slideId: string          // "projetos_<productId>__<variantId>"
  productId: string
  variantId: string        // string vazia tolerada; backend resolve via groupIndex
  templateFile: string     // '' — não usado pelo backend
  dynamic: 'projetos'
}

type SlideEntry = GlobalSlide | ProductSlide | VariantSlide | ConditionalSlide | ProjectsSlide

// ProjectsSlide é sintetizado em runtime (resolveSlideList) e não pertence ao registry estático.
type SlideRegistry = readonly Exclude<SlideEntry, ProjectsSlide>[]

export type {
  ConditionalEffect,
  ConditionalExpression,
  ConditionalFieldGroup,
  ConditionalPredicate,
  ConditionalRule,
  ConditionalSlide,
  ExportMappings,
  FieldDefinition,
  FieldOption,
  FieldType,
  FormState,
  FormValue,
  GlobalSlide,
  ProductGroupPayload,
  ProductDefinition,
  ProductSelectionConfig,
  ProductSlide,
  ProductVariantDefinition,
  ProjectsSlide,
  ProposalBuilderPayload,
  ProposalBuilderState,
  ProposalProductGroup,
  SectionDefinition,
  SlideEntry,
  SlidePlaceholder,
  SlideRegistry,
  VariantSlide,
}
