import { msalInstance } from '../../../auth/msalConfig'
import { productCatalog } from '../config/productCatalog'
import { slideRegistry } from '../config/slideRegistry'
import type { ProposalBuilderPayload } from '../types/proposalForm'
import { buildApiPayload } from './buildApiPayload'
import { resolveInvestimentoRows } from './resolveInvestimentoRows'
import { renderSumarioText } from './renderSumarioText'
import { resolveSlideList } from './resolveSlideList'

const PPTX_API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'
const PROPOSTA_API_URL =
  (import.meta.env.VITE_PROPOSTA_API_URL as string | undefined) ?? 'http://localhost:5204'
const API_SCOPE = import.meta.env.VITE_API_SCOPE as string | undefined

type ProductAvailability = {
  productId: string
  variantIds: string[]
}

function deriveProductAvailability(availableSlideIds: Set<string>): ProductAvailability[] {
  const productVariantMap = new Map<string, Set<string>>()

  for (const slide of slideRegistry) {
    if (!('productId' in slide)) continue
    if (!availableSlideIds.has(slide.slideId)) continue

    const { productId } = slide
    if (!productVariantMap.has(productId)) {
      productVariantMap.set(productId, new Set())
    }

    if (slide.category === 'variant' && 'variantIds' in slide) {
      const variants = productVariantMap.get(productId)!
      for (const variantId of slide.variantIds) {
        variants.add(variantId)
      }
    }
  }

  // Products with no variant-specific slides get all catalog variants
  for (const [productId, variants] of productVariantMap) {
    if (variants.size === 0) {
      const product = productCatalog[productId]
      if (product) {
        for (const variantId of Object.keys(product.variants)) {
          variants.add(variantId)
        }
      }
    }
  }

  return [...productVariantMap.entries()].map(([productId, variants]) => ({
    productId,
    variantIds: [...variants],
  }))
}

export async function fetchAvailableProducts(): Promise<ProductAvailability[]> {
  const response = await fetch(`${PPTX_API_URL}/slides-disponiveis`)

  if (!response.ok) {
    throw new Error(`Erro ao verificar disponibilidade de propostas: ${response.status}`)
  }

  const slideIds = (await response.json()) as string[]
  return deriveProductAvailability(new Set(slideIds))
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const base = { 'Content-Type': 'application/json' }
  if (!API_SCOPE) return base
  const account = msalInstance.getAllAccounts()[0]
  if (!account) return base
  try {
    const { accessToken } = await msalInstance.acquireTokenSilent({ scopes: [API_SCOPE], account })
    return { ...base, Authorization: `Bearer ${accessToken}` }
  } catch {
    return base
  }
}

export async function generateProposal(
  payload: ProposalBuilderPayload,
): Promise<{ url: string; filename: string }> {
  const resolvedSlides = resolveSlideList(payload)

  const pptxRequest = {
    slideIds: resolvedSlides.map((s) => s.slideId),
    globalValues: payload.globalValues,
    productGroups: payload.productGroups.map((group) => {
      const variant = productCatalog[group.productId]?.variants[String(group.variantId)]
      const template = variant?.sumarioTemplate ?? group.productLabel
      return {
        productId: group.productId,
        quantity: group.quantity,
        variantId: String(group.variantId),
        values: group.values,
        sumarioText: renderSumarioText(template, group.values, group.quantity),
        investimentoRows: resolveInvestimentoRows(group.productId, group.values).map((r) => r.label),
      }
    }),
  }

  const headers = await getAuthHeaders()

  // 1. salvar rascunho no banco
  const createRes = await fetch(`${PROPOSTA_API_URL}/api/proposals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(buildApiPayload(payload)),
  })
  if (!createRes.ok) {
    throw new Error(`Erro ao salvar proposta: ${createRes.status}`)
  }
  const { id: proposalId } = (await createRes.json()) as { id: string }

  // 2. gerar PPTX via C# API (que chama o Python internamente)
  const generateRes = await fetch(`${PROPOSTA_API_URL}/api/proposals/${proposalId}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(pptxRequest),
  })
  if (!generateRes.ok) {
    throw new Error(`Erro ao gerar proposta: ${generateRes.status}`)
  }

  const blob = await generateRes.blob()
  const url = URL.createObjectURL(blob)
  const clienteNome = String(payload.globalValues.nome_razao_social ?? 'proposta')
    .replace(/[/\\:*?"<>|]/g, '')
    .trim()
  const filename = `Proposta Playpiso — ${clienteNome}.pptx`

  return { url, filename }
}

export type { ProductAvailability }
