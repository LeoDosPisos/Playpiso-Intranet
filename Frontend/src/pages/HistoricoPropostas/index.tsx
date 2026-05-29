import { Fragment, useEffect, useState } from 'react'

import Header from '@/components/Header/Header'
import UserMenu from '@/components/Header/UserMenu'
import { useIsAdmin } from '@/auth/useIsAdmin'
import {
  listProposals,
  getProposalDetail,
  type ProposalSummary,
  type ProposalDetail,
  type ProductGroupDetail,
} from '@/api/proposalsApi'

import styles from './HistoricoPropostas.module.css'

const NAV_ITEMS = [
  { label: 'Nova proposta', href: '/form-proposta-comercial' },
  { label: 'Histórico', href: '/historico' },
]

// ─── Label maps ───────────────────────────────────────────────────────────────

const PRODUCT_LABELS: Record<string, string> = {
  quadra_tenis: 'Quadra de Tênis',
  quadra_poliesportiva: 'Quadra Poliesportiva',
  beach_tenis: 'Beach Tennis',
  campo: 'Campo',
  pickleball: 'Pickleball',
  padel: 'Padel',
  squash: 'Squash',
  pista: 'Pista',
  garagem_epoxi: 'Garagem Epóxi',
  softplay: 'Softplay Playground',
}

const VARIANT_LABELS: Record<string, string> = {
  piso_asfaltico: 'Piso Asfáltico',
  saibro: 'Saibro',
  grama: 'Grama',
  assoalho: 'Assoalho',
  epoxi: 'Epóxi',
  poliuretano: 'Poliuretano',
  pu_200_b: 'P.U. 200 B',
  padrao: 'Padrão',
  natural: 'Natural',
  sintetico: 'Sintético',
  grama_sintetica: 'Grama Sintética',
  mondo: 'Mondo',
  pu_500: 'PU 500',
  pu_300: 'PU 300',
  pu_250: 'PU 250',
}

// Tradução dos campos JSONB para labels em português + unidade opcional.
// Portões têm chaves camelCase (vindas via [JsonExtensionData] do C#) e os demais snake_case.
// Chaves 'variante_*' são omitidas intencionalmente — já aparecem no subtítulo do card.
const JSONB_LABELS: Record<string, { label: string; unit?: string }> = {
  // Alambrado (snake_case — enviados pelo buildSpecs() do frontend)
  sistema_alambrado: { label: 'Sistema de alambrado' },
  altura_alambrado_fundos: { label: 'Altura alambrado (fundos)', unit: 'm' },
  altura_alambrado_laterais: { label: 'Altura alambrado (laterais)', unit: 'm' },
  comprimento_alambrado_fundos: { label: 'Comprimento alambrado (fundos)', unit: 'm' },
  comprimento_alambrado_laterais: { label: 'Comprimento alambrado (laterais)', unit: 'm' },
  espacamento_postes_tubos_fundos: { label: 'Espaçamento postes (fundos)', unit: 'm' },
  espacamento_postes_tubos_laterais: { label: 'Espaçamento postes (laterais)', unit: 'm' },
  especificar_galvanizacao: { label: 'Detalhe galvanização' },
  // Portões (camelCase — mantido para exibição de registros históricos gravados antes da migração V004)
  quantidadePortoes: { label: 'Qtd. portões' },
  alturaPortoes: { label: 'Altura dos portões', unit: 'm' },
  comprimentoPortoes: { label: 'Comprimento dos portões', unit: 'm' },
  // Cobertura
  cor_tela_superior: { label: 'Cor da tela superior' },
  cor_tela_sombreamento: { label: 'Cor da tela de sombreamento' },
  // Sombreamento detalhado (quadra poliesportiva)
  possui_sombreamento_lateral_1: { label: 'Possui sombreamento', unit: 'bool' },
  altura_sombreamento_lateral_1: { label: 'Altura', unit: 'm' },
  comprimento_sombreamento_lateral_1: { label: 'Comprimento', unit: 'm' },
  possui_sombreamento_lateral_2: { label: 'Possui sombreamento', unit: 'bool' },
  altura_sombreamento_lateral_2: { label: 'Altura', unit: 'm' },
  comprimento_sombreamento_lateral_2: { label: 'Comprimento', unit: 'm' },
  possui_sombreamento_fundo_1: { label: 'Possui sombreamento', unit: 'bool' },
  altura_sombreamento_fundo_1: { label: 'Altura', unit: 'm' },
  comprimento_sombreamento_fundo_1: { label: 'Comprimento', unit: 'm' },
  possui_sombreamento_fundo_2: { label: 'Possui sombreamento', unit: 'bool' },
  altura_sombreamento_fundo_2: { label: 'Altura', unit: 'm' },
  comprimento_sombreamento_fundo_2: { label: 'Comprimento', unit: 'm' },
  // Cores de alambrado (quadra poliesportiva)
  cor_tela_alambrado: { label: 'Cor da tela do alambrado' },
  cor_tubo_alambrado: { label: 'Cor do tubo do alambrado' },
  cor_tela_malha_alambrado: { label: 'Cor da tela malha do alambrado' },
  // Portões (flag)
  possui_portoes: { label: 'Possui portões', unit: 'bool' },
  // Piso & cores
  cor_piso_asfaltico: { label: 'Cor do piso' },
  especificar_cor: { label: 'Especificar cor' },
  cor_pickleball: { label: 'Cor' },
  especificar_cor_pickleball: { label: 'Especificar cor' },
  // Extras (tênis / saibro)
  incluir_rede_tenis: { label: 'Rede de tênis', unit: 'bool' },
  possui_playcushion: { label: 'PlayCushion', unit: 'bool' },
  possui_rede: { label: 'Rede', unit: 'bool' },
  altura_rede: { label: 'Altura da rede', unit: 'm' },
  possui_kit_saibro: { label: 'Kit saibro', unit: 'bool' },
  // Grama (tênis / campo / padel)
  tipo_grama: { label: 'Tipo de grama' },
  especificar_tipo_grama: { label: 'Especificar tipo de grama' },
  tipo_grama_natural: { label: 'Tipo de grama natural' },
  especificar_tipo_grama_natural: { label: 'Especificar grama natural' },
  tipo_grama_sintetica: { label: 'Tipo de grama sintética' },
  especificar_tipo_grama_sintetica: { label: 'Especificar grama sintética' },
  tipo_grama_padel: { label: 'Tipo de grama' },
  altura_grama_sintetica: { label: 'Altura da grama sintética' },
  base_drenante: { label: 'Base drenante' },
  possui_shockpad: { label: 'Shockpad', unit: 'bool' },
  // Quadra poliesportiva / squash (madeira & poliuretano)
  tipo_madeira: { label: 'Tipo de madeira' },
  anti_chama: { label: 'Anti-chama', unit: 'bool' },
  condicao_base_piso: { label: 'Condição da base/piso' },
  tipo_poliuretano: { label: 'Tipo de poliuretano' },
  // Quadra poliesportiva (esportes)
  tipo_futsal: { label: 'Tipo de trave (futsal)' },
  possui_tenis: { label: 'Tênis', unit: 'bool' },
  possui_volei: { label: 'Vôlei', unit: 'bool' },
  possui_futebol_futsal: { label: 'Futebol/Futsal', unit: 'bool' },
  possui_basquete_adulto: { label: 'Basquete adulto', unit: 'bool' },
  possui_basquete_juvenil: { label: 'Basquete juvenil', unit: 'bool' },
  estrutura_basquete_adulto: { label: 'Estrutura basquete adulto' },
  // Campo (traves)
  possui_trave_3x2: { label: 'Trave 3x2', unit: 'bool' },
  possui_trave_4x2: { label: 'Trave 4x2', unit: 'bool' },
  possui_trave_5x2: { label: 'Trave 5x2', unit: 'bool' },
  possui_trave_oficial: { label: 'Trave oficial 7,24 × 2,42', unit: 'bool' },
  // Beach tennis
  possui_eva: { label: 'Proteção EVA', unit: 'bool' },
  tipo_areia: { label: 'Tipo de areia' },
  espessura_areia: { label: 'Espessura da areia', unit: 'cm' },
  possui_acessorio_beach_tenis: { label: 'Acessório', unit: 'bool' },
  tipo_acessorio_beach_tenis: { label: 'Regulagem' },
  // Pickleball
  possui_rede_pickleball: { label: 'Rede', unit: 'bool' },
  tipo_rede_pickleball: { label: 'Tipo da rede' },
  // Padel
  tipo_estrutura_alambrado_padel: { label: 'Tipo de estrutura do alambrado' },
  // Pista
  numero_raias: { label: 'Número de raias', unit: 'un' },
  opcao_pu_200_b_pista: { label: 'Opção PU 200 B' },
  // Softplay
  espessura_sbr: { label: 'Espessura de SBR', unit: 'cm' },
  espessura_epdm: { label: 'Espessura de EPDM', unit: 'cm' },
  // Garagem epóxi — dimensões
  largura_piso_liso: { label: 'Largura (piso liso)', unit: 'm' },
  comprimento_piso_liso: { label: 'Comprimento (piso liso)', unit: 'm' },
  area_piso_liso: { label: 'Área (piso liso)', unit: 'm²' },
  largura_piso_derrapante: { label: 'Largura (piso derrapante)', unit: 'm' },
  comprimento_piso_derrapante: { label: 'Comprimento (piso derrapante)', unit: 'm' },
  area_piso_derrapante: { label: 'Área (piso derrapante)', unit: 'm²' },
  possui_multilayer_garagem_epoxi: { label: 'Multilayer', unit: 'bool' },
  condicao_base_piso_garagem_epoxi: { label: 'Condição da base/piso' },
  metro_linear_faixa: { label: 'Metro linear de faixa', unit: 'm' },
  // Garagem epóxi — vagas
  possui_vagas_carro: { label: 'Vagas de carro', unit: 'bool' },
  quantidade_vagas_carro: { label: 'Qtd. vagas de carro', unit: 'un' },
  largura_vaga_carro: { label: 'Largura vaga carro', unit: 'm' },
  comprimento_vaga_carro: { label: 'Comprimento vaga carro', unit: 'm' },
  possui_vagas_moto: { label: 'Vagas de moto', unit: 'bool' },
  quantidade_vagas_moto: { label: 'Qtd. vagas de moto', unit: 'un' },
  largura_vaga_moto: { label: 'Largura vaga moto', unit: 'm' },
  comprimento_vaga_moto: { label: 'Comprimento vaga moto', unit: 'm' },
  possui_vagas_bicicleta: { label: 'Vagas de bicicleta', unit: 'bool' },
  quantidade_vagas_bicicleta: { label: 'Qtd. vagas de bicicleta', unit: 'un' },
  largura_vaga_bicicleta: { label: 'Largura vaga bicicleta', unit: 'm' },
  comprimento_vaga_bicicleta: { label: 'Comprimento vaga bicicleta', unit: 'm' },
  possui_vagas_pne: { label: 'Vagas PNE', unit: 'bool' },
  quantidade_vagas_pne: { label: 'Qtd. vagas PNE', unit: 'un' },
  largura_vaga_pne: { label: 'Largura vaga PNE', unit: 'm' },
  comprimento_vaga_pne: { label: 'Comprimento vaga PNE', unit: 'm' },
  // Iluminação
  iluminacao_fixada_alambrado: { label: 'Iluminação fixada no alambrado', unit: 'bool' },
  especificar_potencia_projetores: { label: 'Potência especificada' },
  tipo_coligacao: { label: 'Tipo de coligação' },
  responsavel_ligacao_eletrica: { label: 'Responsável elétrica' },
  quantidade_cruzetas: { label: 'Cruzetas' },
  cor_cruzetas: { label: 'Cor das cruzetas' },
  // Outros
  responsavel_material_pedreira: { label: 'Responsável (material/pedreira)' },
}

// Valores conhecidos com acentuação e capitalização corretas em português.
// Fonte: Frontend/src/pages/FormPropostaComercial/config/fieldOptionsRegistry.ts
const VALUE_LABELS: Record<string, string> = {
  // Variantes / produtos
  padrao: 'Padrão',
  nao_padrao: 'Não padrão',
  piso_asfaltico: 'Piso Asfáltico',
  saibro: 'Saibro',
  grama: 'Grama',
  grama_sintetica: 'Grama Sintética',
  assoalho: 'Assoalho',
  epoxi: 'Epóxi',
  natural: 'Natural',
  sintetico: 'Sintético',
  // Tipo de projeto / terreno / acesso
  obra_nova: 'Obra Nova',
  reforma: 'Reforma',
  solo_preparado: 'Solo preparado',
  laje_concreto: 'Laje/Concreto',
  facil: 'Fácil',
  dificil: 'Difícil',
  muito_dificil: 'Muito difícil',
  // Responsáveis
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  playpiso: 'Playpiso',
  // Areia (beach tennis)
  rio: 'Rio',
  quartzo: 'Quartzo',
  lavado: 'Lavado',
  // Grama natural / sintética
  esmeralda: 'Esmeralda',
  bermuda: 'Bermuda',
  bermuda_celebration: 'Bermuda Celebration',
  soccer_pro: 'Soccer Pro',
  tturf: 'TTurf',
  hero_shape: 'Hero Shape',
  super_txt: 'Super TXT',
  txt: 'TXT',
  outros: 'Outros',
  outro: 'Outro',
  '50_mm': '50 mm',
  '60_mm': '60 mm',
  com_drenagem: 'Com drenagem',
  sem_drenagem: 'Sem drenagem',
  // Madeira (assoalho / squash)
  grapia: 'Grapia',
  cumaru: 'Cumaru',
  tauari: 'Tauari',
  // Condição da base
  boa: 'Boa',
  ruim: 'Ruim',
  // Poliuretano / opção PU 200 B
  b7: 'B7',
  b9: 'B9',
  b11: 'B11',
  // Estrutura basquete
  metalica: 'Metálica',
  hidraulica: 'Hidráulica',
  comum: 'Comum',
  // Trave futsal
  mini_trave: 'Mini Trave',
  // Rede (pickleball)
  fixo: 'Fixo',
  removivel: 'Removível',
  // Coligação
  sem_coligacao: 'Sem coligação',
  lateral: 'Lateral',
  fundo: 'Fundo',
  // Galvanização
  fogo: 'Fogo',
  eletrolitico: 'Eletrolítico',
  galvanizado: 'Galvanizado',
  zincado: 'Zincado',
  pintado: 'Pintado',
  // Travamento
  sem_travamento: 'Sem travamento',
  travamento_inferior: 'Inferior',
  travamento_intermediario: 'Intermediário',
  travamento_superior: 'Superior',
  // Estrutura alambrado padel
  estrutura_vidro: 'Estrutura de vidro',
  estrutura_especial: 'Estrutura especial',
  // Sistema alambrado
  gaiola: 'Gaiola',
  gradil: 'Gradil',
  elastica: 'Elástica',
  trapezio: 'Trapézio',
  especial: 'Especial',
  // Cores
  branca: 'Branca',
  branco: 'Branco',
  amarelo: 'Amarela',
  preta: 'Preta',
  preto: 'Preto',
  verde: 'Verde',
  azul: 'Azul',
  vermelha: 'Vermelha',
}

// ─── Formatadores ─────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDec(value: number | null): string | null {
  if (value == null) return null
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function formatEnumValue(v: string): string {
  if (VALUE_LABELS[v]) return VALUE_LABELS[v]
  return v.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatSpecValue(raw: string, unit?: string): string {
  if (unit === 'bool' || raw === 'true' || raw === 'false') {
    return raw === 'true' ? 'Sim' : 'Não'
  }
  if (raw.includes(',')) {
    return raw.split(',').map(v => formatEnumValue(v.trim())).join(', ')
  }
  if (VALUE_LABELS[raw]) return VALUE_LABELS[raw]
  const formatted = /^[a-z_]/.test(raw) ? formatEnumValue(raw) : raw
  return unit && unit !== 'bool' ? `${formatted} ${unit}` : formatted
}

// ─── Inferência de produto/variante a partir de specs ────────────────────────

function inferProductAndVariant(specs: string): { productId: string; variantId: string } | null {
  try {
    const parsed = JSON.parse(specs) as Record<string, unknown>
    for (const [key, value] of Object.entries(parsed)) {
      if (key.toLowerCase().startsWith('variante_')) {
        const productId = key.replace(/^variante_/i, '').toLowerCase()
        const variantId = value ? String(value) : ''
        return { productId, variantId }
      }
    }
  } catch { /* ignore */ }
  return null
}

// ─── Agrupamento semântico de specs ──────────────────────────────────────────

type SpecEntry = { label: string; value: string }
type SpecSubSection = { title: string; entries: SpecEntry[] }
type SpecSection = { title: string; entries: SpecEntry[]; subSections?: SpecSubSection[] }

function buildGroupedSpecs(g: ProductGroupDetail): SpecSection[] {
  const sections: SpecSection[] = []

  // Dimensões
  const dimEntries: SpecEntry[] = []
  if (g.largura !== null && g.comprimento !== null) {
    const area = g.areaTotal !== null ? ` = ${formatDec(g.areaTotal)}m²` : ''
    dimEntries.push({ label: 'Medidas', value: `${formatDec(g.largura)}m × ${formatDec(g.comprimento)}m${area}` })
  } else if (g.areaTotal !== null) {
    dimEntries.push({ label: 'Área total', value: `${formatDec(g.areaTotal)}m²` })
  }
  if (g.tipoTerreno) dimEntries.push({ label: 'Tipo de terreno', value: formatSpecValue(g.tipoTerreno) })
  if (g.dificuldadeAcesso) dimEntries.push({ label: 'Acesso', value: formatSpecValue(g.dificuldadeAcesso) })
  if (g.responsavelMaterialPedreira)
    dimEntries.push({ label: 'Responsável (material/pedreira)', value: formatSpecValue(g.responsavelMaterialPedreira) })
  if (dimEntries.length) sections.push({ title: 'Dimensões & Local', entries: dimEntries })

  // Parse JSONB specs uma vez
  let specsObj: Record<string, unknown> = {}
  try { specsObj = JSON.parse(g.specs) as Record<string, unknown> } catch { /* ignore */ }

  const consumed = new Set<string>()

  function fromSpecs(keys: string[]): SpecEntry[] {
    const out: SpecEntry[] = []
    for (const key of keys) {
      const val = specsObj[key]
      if (val === null || val === undefined || val === '') continue
      const meta = JSONB_LABELS[key]
      const label = meta?.label ?? key
      const value = formatSpecValue(String(val), meta?.unit)
      out.push({ label, value })
      consumed.add(key)
    }
    return out
  }

  // Alambrado — mostra se coluna = true OU se há dados de alambrado no JSONB
  const alambradoJsonbKeys = ['sistema_alambrado', 'altura_alambrado_fundos', 'altura_alambrado_laterais',
    'comprimento_alambrado_fundos', 'comprimento_alambrado_laterais',
    'espacamento_postes_tubos_fundos', 'espacamento_postes_tubos_laterais',
    'cor_tela_alambrado', 'cor_tubo_alambrado', 'cor_tela_malha_alambrado']
  const hasAlambradoData = g.possuiAlambrado
    || alambradoJsonbKeys.some(k => specsObj[k] != null && specsObj[k] !== '')
  if (hasAlambradoData) {
    const fechEntries: SpecEntry[] = []
    if (g.galvanizacao) fechEntries.push({ label: 'Galvanização', value: formatSpecValue(g.galvanizacao) })
    if (g.travamento) fechEntries.push({ label: 'Travamento', value: formatSpecValue(g.travamento) })
    if (g.possuiTrelica !== null)
      fechEntries.push({ label: 'Trélica', value: g.possuiTrelica ? 'Sim' : 'Não' })
    fechEntries.push(...fromSpecs([...alambradoJsonbKeys, 'especificar_galvanizacao']))
    if (fechEntries.length) sections.push({ title: 'Alambrado', entries: fechEntries })
  }

  // Portões — colunas próprias (novos registros); fallback para JSONB camelCase (registros históricos)
  const portEntries: SpecEntry[] = []
  if (g.quantidadePortoes != null)
    portEntries.push({ label: 'Qtd. portões', value: String(g.quantidadePortoes) })
  if (g.alturaPortoes != null)
    portEntries.push({ label: 'Altura dos portões', value: `${formatDec(g.alturaPortoes)}m` })
  if (g.comprimentoPortoes != null)
    portEntries.push({ label: 'Comprimento dos portões', value: `${formatDec(g.comprimentoPortoes)}m` })
  if (portEntries.length === 0)
    portEntries.push(...fromSpecs(['quantidadePortoes', 'alturaPortoes', 'comprimentoPortoes']))
  // possui_portoes é flag redundante quando há contagem; consume sempre pra não vazar pra Extras
  consumed.add('possui_portoes')
  if (portEntries.length) sections.push({ title: 'Portões', entries: portEntries })

  // Iluminação
  if (g.possuiIluminacao) {
    const ilumEntries: SpecEntry[] = []
    if (g.quantidadePostesIluminacao !== null)
      ilumEntries.push({ label: 'Postes', value: String(g.quantidadePostesIluminacao) })
    if (g.alturaPostesIluminacao !== null)
      ilumEntries.push({ label: 'Altura dos postes', value: `${formatDec(g.alturaPostesIluminacao)}m` })
    if (g.quantidadeProjetores !== null)
      ilumEntries.push({ label: 'Projetores', value: String(g.quantidadeProjetores) })
    if (g.potenciaProjetores)
      ilumEntries.push({ label: 'Potência', value: formatSpecValue(g.potenciaProjetores) })
    if (g.corCruzetas)
      ilumEntries.push({ label: 'Cor das cruzetas', value: formatSpecValue(g.corCruzetas) })
    ilumEntries.push(...fromSpecs(['iluminacao_fixada_alambrado', 'especificar_potencia_projetores',
      'quantidade_cruzetas', 'cor_cruzetas', 'tipo_coligacao', 'responsavel_ligacao_eletrica']))
    if (ilumEntries.length) sections.push({ title: 'Iluminação', entries: ilumEntries })
  }

  // Cobertura
  const coberturaEntries: SpecEntry[] = []
  if (g.possuiTelaSuperior !== null)
    coberturaEntries.push({ label: 'Tela superior', value: g.possuiTelaSuperior ? 'Sim' : 'Não' })
  if (g.possuiTelaSombreamento !== null)
    coberturaEntries.push({ label: 'Tela sombreamento', value: g.possuiTelaSombreamento ? 'Sim' : 'Não' })
  if (g.alturaSombreamento !== null)
    coberturaEntries.push({ label: 'Altura sombreamento', value: `${formatDec(g.alturaSombreamento)}m` })
  if (g.comprimentoSombreamento !== null)
    coberturaEntries.push({ label: 'Comprimento sombreamento', value: `${formatDec(g.comprimentoSombreamento)}m` })
  coberturaEntries.push(...fromSpecs(['cor_tela_superior', 'cor_tela_sombreamento']))

  // Sub-seções de sombreamento detalhado (quadra poliesportiva)
  const sombreamentoSides: { suffix: string; title: string }[] = [
    { suffix: 'lateral_1', title: 'Sombreamento lateral 1' },
    { suffix: 'lateral_2', title: 'Sombreamento lateral 2' },
    { suffix: 'fundo_1',   title: 'Sombreamento fundo 1'   },
    { suffix: 'fundo_2',   title: 'Sombreamento fundo 2'   },
  ]
  const coberturaSubSections: SpecSubSection[] = []
  for (const { suffix, title } of sombreamentoSides) {
    const keys = [
      `possui_sombreamento_${suffix}`,
      `altura_sombreamento_${suffix}`,
      `comprimento_sombreamento_${suffix}`,
    ]
    const entries = fromSpecs(keys)
    if (entries.length) coberturaSubSections.push({ title, entries })
  }

  if (coberturaEntries.length || coberturaSubSections.length) {
    sections.push({
      title: 'Cobertura',
      entries: coberturaEntries,
      subSections: coberturaSubSections.length ? coberturaSubSections : undefined,
    })
  }

  // Piso & Extras — campos JSONB restantes (conhecidos ou desconhecidos, exceto variante_*)
  const extrasKnown = fromSpecs([
    'cor_piso_asfaltico', 'incluir_rede_tenis', 'possui_playcushion', 'possui_kit_saibro',
    'possui_rede', 'altura_rede',
    // poliesportiva
    'tipo_futsal', 'possui_tenis', 'possui_volei', 'possui_futebol_futsal',
    'possui_basquete_adulto', 'possui_basquete_juvenil', 'estrutura_basquete_adulto',
    // beach
    'possui_eva', 'tipo_areia', 'espessura_areia',
    'possui_acessorio_beach_tenis', 'tipo_acessorio_beach_tenis',
  ])
  const extrasUnknown: SpecEntry[] = []
  for (const [key, val] of Object.entries(specsObj)) {
    if (consumed.has(key)) continue
    if (key.toLowerCase().startsWith('variante_')) continue
    if (val === null || val === undefined || val === '') continue
    const meta = JSONB_LABELS[key]
    const label = meta?.label ?? key
    extrasUnknown.push({ label, value: formatSpecValue(String(val), meta?.unit) })
  }
  const extrasEntries = [...extrasKnown, ...extrasUnknown]
  if (extrasEntries.length) sections.push({ title: 'Extras', entries: extrasEntries })

  // Observações — sempre por último, linha completa
  if (g.observacoes) sections.push({ title: 'Observações', entries: [{ label: '', value: g.observacoes }] })

  return sections
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function ProductGroupCard({ group }: { group: ProductGroupDetail }) {
  const fallback = (!group.productId || !group.variantId)
    ? inferProductAndVariant(group.specs)
    : null
  const effectiveProductId = group.productId || fallback?.productId || ''
  const effectiveVariantId = group.variantId || fallback?.variantId || ''

  const sections = buildGroupedSpecs(group)

  return (
    <div className={styles.productGroupCard}>
      <div className={styles.productGroupHeader}>
        <span className={styles.productGroupName}>
          {PRODUCT_LABELS[effectiveProductId] ?? effectiveProductId}
        </span>
        <div className={styles.productGroupSubtitle}>
          {VARIANT_LABELS[effectiveVariantId] ?? effectiveVariantId}
          {' · '}
          {group.quantity} {group.quantity === 1 ? 'unidade' : 'unidades'}
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.title} className={styles.specSection}>
          {section.title !== 'Observações' ? (
            <>
              <div className={styles.specSectionTitle}>{section.title}</div>
              {section.entries.length > 0 && (
                <div className={styles.specGrid}>
                  {section.entries.map((e) => (
                    <div key={e.label} className={styles.specItem}>
                      <span className={styles.specLabel}>{e.label}</span>
                      <span className={styles.specValue}>{e.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {section.subSections?.map((sub) => (
                <div key={sub.title}>
                  <div className={styles.specSubSectionTitle}>{sub.title}</div>
                  <div className={styles.specGrid}>
                    {sub.entries.map((e) => (
                      <div key={e.label} className={styles.specItem}>
                        <span className={styles.specLabel}>{e.label}</span>
                        <span className={styles.specValue}>{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className={styles.observacoes}>
              <span className={styles.specLabel}>Observações</span>
              <p className={styles.observacoesText}>{section.entries[0].value}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ContactField({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.specItem}>
      <span className={styles.specLabel}>{label}</span>
      <span className={styles.specValue}>{value}</span>
    </div>
  )
}

function DetailPanel({
  detail,
  isLoading,
}: {
  detail: ProposalDetail | Error | undefined
  isLoading: boolean
}) {
  if (isLoading || detail === undefined) {
    return <div className={styles.detailLoading}>Carregando detalhes...</div>
  }
  if (detail instanceof Error) {
    return <div className={styles.detailError}>{detail.message}</div>
  }

  return (
    <div className={styles.detailPanel}>
      <div className={styles.contactSection}>
        <div className={styles.contactGroup}>
          {detail.nomeRazaoSocial && <ContactField label="Cliente" value={detail.nomeRazaoSocial} />}
          {detail.cpfCnpj && <ContactField label="CPF / CNPJ" value={detail.cpfCnpj} />}
          {detail.nomeContato && <ContactField label="Contato" value={detail.nomeContato} />}
          {detail.telefone && <ContactField label="Telefone" value={detail.telefone} />}
          {detail.email && <ContactField label="E-mail" value={detail.email} />}
        </div>
        <div className={styles.contactGroup}>
          {detail.enderecoCliente && <ContactField label="Endereço da obra" value={detail.enderecoCliente} />}
          {detail.localObra && <ContactField label="Local da obra" value={detail.localObra} />}
          <ContactField label="Cidade / Estado" value={`${detail.cidade} / ${detail.estado}`} />
          {detail.tipoProjeto && <ContactField label="Tipo de projeto" value={formatSpecValue(detail.tipoProjeto)} />}
          {detail.dataSolicitacao && <ContactField label="Data de solicitação" value={detail.dataSolicitacao} />}
        </div>
      </div>
      <div className={styles.productGroupList}>
        {detail.productGroups.map((g) => (
          <ProductGroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

function HistoricoPropostas() {
  const isAdmin = useIsAdmin()
  const [entries, setEntries] = useState<ProposalSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Map<string, ProposalDetail | Error>>(new Map())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [scope, setScope] = useState<'mine' | 'all'>(isAdmin ? 'all' : 'mine')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    listProposals({ status: 'gerada', page: 1, pageSize: 50, scope })
      .then((proposals) => { if (!cancelled) setEntries(proposals) })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [scope])

  function handleToggle(id: string) {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (details.has(id)) return
    setLoadingId(id)
    getProposalDetail(id)
      .then((d) => setDetails((prev) => new Map(prev).set(id, d)))
      .catch((e: unknown) =>
        setDetails((prev) =>
          new Map(prev).set(id, e instanceof Error ? e : new Error('Erro ao carregar detalhes.'))
        )
      )
      .finally(() => setLoadingId(null))
  }

  return (
    <>
      <Header actions={<UserMenu />} navItems={NAV_ITEMS} />
      <main>
        <div className={styles.page}>
          <div className={styles.pageTitle}>
            <h1>Histórico de propostas</h1>
            <p>Propostas comerciais geradas e registradas no banco de dados.</p>
          </div>

          {isAdmin && (
            <div className={styles.scopeToggle} role="group" aria-label="Filtro de propostas">
              <button
                type="button"
                aria-pressed={scope === 'mine'}
                className={scope === 'mine' ? styles.scopeButtonActive : styles.scopeButton}
                onClick={() => setScope('mine')}
              >
                Minhas propostas
              </button>
              <button
                type="button"
                aria-pressed={scope === 'all'}
                className={scope === 'all' ? styles.scopeButtonActive : styles.scopeButton}
                onClick={() => setScope('all')}
              >
                Todas as propostas
              </button>
            </div>
          )}

          {isLoading ? (
            <div className={styles.emptyState}><strong>Carregando histórico...</strong></div>
          ) : error ? (
            <div className={styles.errorState} role="alert">
              <strong>Não foi possível carregar o histórico.</strong>
              <p>{error}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>Nenhuma proposta gerada ainda.</strong>
              <p>As propostas geradas pelo seu usuário aparecerão aqui.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Gerada em</th>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Local</th>
                  <th>Itens</th>
                  <th>Responsável</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <Fragment key={entry.id}>
                    <tr className={expandedId === entry.id ? styles.rowExpanded : undefined}>
                      <td className={styles.dateCell}>
                        {formatDate(entry.generatedAt ?? entry.createdAt)}
                      </td>
                      <td className={styles.numberCell}>{entry.numeroProposta}</td>
                      <td className={styles.clientCell}>{entry.nomeRazaoSocial || '-'}</td>
                      <td className={styles.locationCell}>{entry.cidade} / {entry.estado}</td>
                      <td className={styles.countCell}>{entry.totalProducts}</td>
                      <td className={styles.ownerCell}>
                        {entry.createdByEmail ?? '-'}
                      </td>
                      <td className={styles.actionsCell}>
                        <span className={styles.statusBadge}>{entry.status}</span>
                        <button
                          className={`${styles.toggleButton} ${expandedId === entry.id ? styles.toggleButtonOpen : ''}`}
                          onClick={() => handleToggle(entry.id)}
                          aria-label={expandedId === entry.id ? 'Recolher detalhes' : 'Expandir detalhes'}
                          aria-expanded={expandedId === entry.id}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedId === entry.id && (
                      <tr className={styles.detailRow}>
                        <td colSpan={7}>
                          <DetailPanel
                            detail={details.get(entry.id)}
                            isLoading={loadingId === entry.id}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}

export default HistoricoPropostas
