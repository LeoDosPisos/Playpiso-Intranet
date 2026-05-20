import { slideRegistry } from '../config/slideRegistry'
import { evaluateCondition } from '../formEngine'
import type {
  ConditionalSlide,
  GlobalSlide,
  ProductGroupPayload,
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
    return evaluateCondition(
      (slide as ConditionalSlide).condition,
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
          (a as Exclude<SlideEntry, GlobalSlide>).orderWithinProduct -
          (b as Exclude<SlideEntry, GlobalSlide>).orderWithinProduct,
      )
      .map((s): ResolvedSlide => ({ entry: s, groupIndex: gi }))
    result.push(...productSlides)
  }

  const postProduct = [...slideRegistry]
    .filter((s): s is GlobalSlide => s.category === 'global' && s.phase === 'post_product')
    .sort((a, b) => a.order - b.order)
    .map((s): ResolvedSlide => ({ entry: s, groupIndex: null }))
  result.push(...postProduct)

  return result
}
