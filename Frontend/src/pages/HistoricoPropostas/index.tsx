import { Fragment, useEffect, useState } from 'react'

import Header from '@/components/Header/Header'
import UserMenu from '@/components/Header/UserMenu'
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
  larguraPortoes: { label: 'Largura dos portões', unit: 'm' },
  // Cobertura (snake_case)
  cor_tela_superior: { label: 'Cor da tela superior' },
  // Piso & extras comuns (snake_case)
  cor_piso_asfaltico: { label: 'Cor do piso' },
  incluir_rede_tenis: { label: 'Rede de tênis', unit: 'bool' },
  possui_playcushion: { label: 'Playcushion', unit: 'bool' },
  possui_rede: { label: 'Rede', unit: 'bool' },
  altura_rede: { label: 'Altura da rede', unit: 'm' },
  possui_kit_saibro: { label: 'Kit saibro', unit: 'bool' },
  // Quadra poliesportiva (snake_case)
  tipo_futsal: { label: 'Tipo de piso (futsal)' },
  possui_tenis: { label: 'Tênis', unit: 'bool' },
  possui_volei: { label: 'Vôlei', unit: 'bool' },
  possui_futebol_futsal: { label: 'Futebol/Futsal', unit: 'bool' },
  possui_basquete_adulto: { label: 'Basquete adulto', unit: 'bool' },
  possui_basquete_juvenil: { label: 'Basquete juvenil', unit: 'bool' },
  estrutura_basquete_adulto: { label: 'Estrutura basquete adulto' },
  // Beach tennis (snake_case)
  possui_eva: { label: 'EVA', unit: 'bool' },
  tipo_areia: { label: 'Tipo de areia' },
  espessura_areia: { label: 'Espessura da areia', unit: 'cm' },
  // Iluminação
  iluminacao_fixada_alambrado: { label: 'Iluminação fixada no alambrado', unit: 'bool' },
  especificar_potencia_projetores: { label: 'Potência especificada' },
  tipo_coligacao: { label: 'Tipo de coligação' },
  responsavel_ligacao_eletrica: { label: 'Responsável elétrica' },
  quantidade_cruzetas: { label: 'Cruzetas' },
  // Outros
  responsavel_material_pedreira: { label: 'Responsável (material/pedreira)' },
}

// Valores conhecidos com acentuação e capitalização corretas em português.
const VALUE_LABELS: Record<string, string> = {
  padrao: 'Padrão',
  piso_asfaltico: 'Piso Asfáltico',
  saibro: 'Saibro',
  grama: 'Grama',
  grama_sintetica: 'Grama Sintética',
  assoalho: 'Assoalho',
  epoxi: 'Epóxi',
  natural: 'Natural',
  sintetico: 'Sintético',
  gaiola: 'Gaiola',
  gradil: 'Gradil',
  elastica: 'Elástica',
  galvanizado: 'Galvanizado',
  zincado: 'Zincado',
  pintado: 'Pintado',
  travamento_inferior: 'Inferior',
  travamento_intermediario: 'Intermediário',
  travamento_superior: 'Superior',
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  eletrolitico: 'Eletrolítico',
  metalica: 'Metálica',
  branca: 'Branca',
  amarelo: 'Amarela',
  preta: 'Preta',
  verde: 'Verde',
  azul: 'Azul',
  vermelha: 'Vermelha',
  obra_nova: 'Obra Nova',
  reforma: 'Reforma',
  rio: 'Rio',
  lavado: 'Lavado',
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
  if (value === null) return null
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
type SpecSection = { title: string; entries: SpecEntry[] }

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
    'espacamento_postes_tubos_fundos', 'espacamento_postes_tubos_laterais']
  const hasAlambradoData = g.possuiAlambrado
    || alambradoJsonbKeys.some(k => specsObj[k] != null && specsObj[k] !== '')
  if (hasAlambradoData) {
    const fechEntries: SpecEntry[] = []
    if (g.comprimentoAlambrado !== null)
      fechEntries.push({ label: 'Comprimento', value: `${formatDec(g.comprimentoAlambrado)}m` })
    if (g.alturaAlambrado !== null)
      fechEntries.push({ label: 'Altura', value: `${formatDec(g.alturaAlambrado)}m` })
    if (g.espacamentoPostesTubos !== null)
      fechEntries.push({ label: 'Espaçamento postes', value: `${formatDec(g.espacamentoPostesTubos)}m` })
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
  if (g.larguraPortoes != null)
    portEntries.push({ label: 'Largura dos portões', value: `${formatDec(g.larguraPortoes)}m` })
  if (portEntries.length === 0)
    portEntries.push(...fromSpecs(['quantidadePortoes', 'alturaPortoes', 'larguraPortoes']))
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
    ilumEntries.push(...fromSpecs(['iluminacao_fixada_alambrado', 'especificar_potencia_projetores',
      'quantidade_cruzetas', 'tipo_coligacao', 'responsavel_ligacao_eletrica']))
    if (ilumEntries.length) sections.push({ title: 'Iluminação', entries: ilumEntries })
  }

  // Cobertura
  const coberturaEntries: SpecEntry[] = []
  if (g.possuiTelaSuperior !== null)
    coberturaEntries.push({ label: 'Tela superior', value: g.possuiTelaSuperior ? 'Sim' : 'Não' })
  if (g.possuiTelaSombreamento !== null)
    coberturaEntries.push({ label: 'Tela sombreamento', value: g.possuiTelaSombreamento ? 'Sim' : 'Não' })
  if (g.larguraSombreamento !== null)
    coberturaEntries.push({ label: 'Largura sombreamento', value: `${formatDec(g.larguraSombreamento)}m` })
  if (g.comprimentoSombreamento !== null)
    coberturaEntries.push({ label: 'Comprimento sombreamento', value: `${formatDec(g.comprimentoSombreamento)}m` })
  coberturaEntries.push(...fromSpecs(['cor_tela_superior']))
  if (coberturaEntries.length) sections.push({ title: 'Cobertura', entries: coberturaEntries })

  // Piso & Extras — campos JSONB restantes (conhecidos ou desconhecidos, exceto variante_*)
  const extrasKnown = fromSpecs([
    'cor_piso_asfaltico', 'incluir_rede_tenis', 'possui_playcushion', 'possui_kit_saibro',
    'possui_rede', 'altura_rede', 'responsavel_material_pedreira',
    // poliesportiva
    'tipo_futsal', 'possui_tenis', 'possui_volei', 'possui_futebol_futsal',
    'possui_basquete_adulto', 'possui_basquete_juvenil', 'estrutura_basquete_adulto',
    // beach
    'possui_eva', 'tipo_areia', 'espessura_areia',
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
              <div className={styles.specGrid}>
                {section.entries.map((e) => (
                  <div key={e.label} className={styles.specItem}>
                    <span className={styles.specLabel}>{e.label}</span>
                    <span className={styles.specValue}>{e.value}</span>
                  </div>
                ))}
              </div>
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
          {detail.enderecoObra && <ContactField label="Endereço da obra" value={detail.enderecoObra} />}
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
  const [entries, setEntries] = useState<ProposalSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Map<string, ProposalDetail | Error>>(new Map())
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    listProposals({ status: 'gerada', page: 1, pageSize: 50 })
      .then((proposals) => { if (!cancelled) setEntries(proposals) })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

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
                        {entry.generatedByEmail ?? entry.createdByEmail ?? '-'}
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
