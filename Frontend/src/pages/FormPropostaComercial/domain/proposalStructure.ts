import { sectionRegistry } from '../config/sectionRegistry'
import type { FormValue, SectionDefinition } from '../types/proposalForm'

const GLOBAL_SECTION_IDS = ['dados_proposta', 'dados_cliente', 'dados_obra'] as const

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

function getGlobalSections(): SectionDefinition[] {
  return GLOBAL_SECTION_IDS.map((sectionId) => {
    const section = sectionRegistry[sectionId]

    if (!section) {
      throw new Error(`Seção global não encontrada: ${sectionId}`)
    }

    return section
  })
}

function isGlobalSectionId(sectionId: string): sectionId is (typeof GLOBAL_SECTION_IDS)[number] {
  return GLOBAL_SECTION_IDS.includes(sectionId as (typeof GLOBAL_SECTION_IDS)[number])
}

function getVariantValue(values: Record<string, FormValue>): FormValue | undefined {
  return VARIANT_FIELD_IDS.map((fieldId) => values[fieldId]).find((value) => value !== undefined && value !== null)
}

export { GLOBAL_SECTION_IDS, VARIANT_FIELD_IDS, getGlobalSections, getVariantValue, isGlobalSectionId }
