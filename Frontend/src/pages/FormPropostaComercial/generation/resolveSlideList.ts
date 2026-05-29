import { slideRegistry } from '../config/slideRegistry'
import { evaluateCondition } from '../formEngine'
import type {
  ConditionalSlide,
  GlobalSlide,
  ProductGroupPayload,
  ProjectsSlide,
  ProposalBuilderPayload,
  SlideEntry,
  VariantSlide,
} from '../types/proposalForm'

export type ResolvedSlide = {
  readonly entry: SlideEntry
  /** Index into ProposalBuilderPayload.productGroups; null for global slides. */
  readonly groupIndex: number | null
}

function getProductGroupValues(group: ProductGroupPayload): Record<string, unknown> {
  return group.values as Record<string, unknown>
}

function includeSlideForGroup(slide: SlideEntry, group: ProductGroupPayload): boolean {
  if (slide.category === 'global') return false

  const productSlide = slide as Exclude<SlideEntry, GlobalSlide>
  if (productSlide.productId !== group.productId) return false

  if (slide.category === 'variant') {
    return (slide as VariantSlide).variantIds.includes(String(group.variantId))
  }

  if (slide.category === 'conditional') {
    const conditionalSlide = slide as ConditionalSlide
    if (conditionalSlide.variantIds && !conditionalSlide.variantIds.includes(String(group.variantId))) {
      return false
    }
    return evaluateCondition(
      conditionalSlide.condition,
      getProductGroupValues(group) as Record<string, import('../types/proposalForm').FormValue>,
    )
  }

  return true
}

export function resolveSlideList(payload: ProposalBuilderPayload): ResolvedSlide[] {
  const result: ResolvedSlide[] = []

  const preProduct = [...slideRegistry]
    .filter((s): s is GlobalSlide => s.category === 'global' && s.phase === 'pre_product')
    .sort((a, b) => a.order - b.order)
    .map((s): ResolvedSlide => ({ entry: s, groupIndex: null }))
  result.push(...preProduct)

  for (let gi = 0; gi < payload.productGroups.length; gi++) {
    const group = payload.productGroups[gi]
    const productSlides = [...slideRegistry]
      .filter((s) => includeSlideForGroup(s, group))
      .sort(
        (a, b) =>
          (a as Exclude<SlideEntry, GlobalSlide | ProjectsSlide>).orderWithinProduct -
          (b as Exclude<SlideEntry, GlobalSlide | ProjectsSlide>).orderWithinProduct,
      )
      .map((s): ResolvedSlide => ({ entry: s, groupIndex: gi }))
    result.push(...productSlides)
  }

  const postProduct = [...slideRegistry]
    .filter((s): s is GlobalSlide => s.category === 'global' && s.phase === 'post_product')
    .sort((a, b) => a.order - b.order)

  // Particiona o post_product no encerramento para injetar, entre `consideracoes_gerais`
  // e `encerramento`, um bloco de "projetos realizados" por productId único.
  const encerramentoIdx = postProduct.findIndex((s) => s.slideId === 'encerramento')
  const beforeEncerramento = encerramentoIdx >= 0 ? postProduct.slice(0, encerramentoIdx) : postProduct
  const fromEncerramento = encerramentoIdx >= 0 ? postProduct.slice(encerramentoIdx) : []

  result.push(...beforeEncerramento.map((s): ResolvedSlide => ({ entry: s, groupIndex: null })))

  // Dedupe por (productId, variantId) em ordem de primeira aparição: a mesma
  // combinação não duplica. O backend procura primeiro
  // slides/<product>/projetos/<variantId>/*.pptx e cai p/ slides/<product>/projetos/
  // (nível produto) se a pasta da variante não tiver arquivos; sem nenhum dos dois, omite.
  const seenCombos = new Set<string>()
  for (let gi = 0; gi < payload.productGroups.length; gi++) {
    const group = payload.productGroups[gi]
    const variantId = String(group.variantId ?? '')
    const key = `${group.productId}__${variantId}`
    if (seenCombos.has(key)) continue
    seenCombos.add(key)
    const entry: ProjectsSlide = {
      category: 'projetos',
      slideId: `projetos_${key}`,
      productId: group.productId,
      variantId,
      templateFile: '',
      dynamic: 'projetos',
    }
    result.push({ entry, groupIndex: gi })
  }

  result.push(...fromEncerramento.map((s): ResolvedSlide => ({ entry: s, groupIndex: null })))

  return result
}
