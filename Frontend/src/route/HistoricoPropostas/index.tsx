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

type SpecEntry = { label: string; value: string }

// Fallback: extrai productId/variantId do JSONB specs quando as colunas estão vazias.
// Chaves como VARIANTE_QUADRA_TENIS=piso_asfaltico codificam produto e variante.
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

function buildSpecs(g: ProductGroupDetail): SpecEntry[] {
  const entries: SpecEntry[] = []

  if (g.largura !== null && g.comprimento !== null) {
    const dims = `${formatDec(g.largura)}m × ${formatDec(g.comprimento)}m`
    const area = g.areaTotal !== null ? ` = ${formatDec(g.areaTotal)}m²` : ''
    entries.push({ label: 'Dimensões', value: dims + area })
  } else if (g.areaTotal !== null) {
    entries.push({ label: 'Área total', value: `${formatDec(g.areaTotal)}m²` })
  }

  if (g.tipoTerreno) entries.push({ label: 'Tipo de terreno', value: g.tipoTerreno })
  if (g.dificuldadeAcesso) entries.push({ label: 'Acesso', value: g.dificuldadeAcesso })

  if (g.possuiIluminacao) {
    entries.push({ label: 'Iluminação', value: 'Sim' })
    if (g.quantidadePostesIluminacao !== null)
      entries.push({ label: 'Postes', value: String(g.quantidadePostesIluminacao) })
    if (g.alturaPostesIluminacao !== null)
      entries.push({ label: 'Altura dos postes', value: `${formatDec(g.alturaPostesIluminacao)}m` })
    if (g.quantidadeProjetores !== null)
      entries.push({ label: 'Projetores', value: String(g.quantidadeProjetores) })
    if (g.potenciaProjetores) entries.push({ label: 'Potência', value: g.potenciaProjetores })
  }

  if (g.possuiAlambrado) {
    entries.push({ label: 'Alambrado', value: 'Sim' })
    if (g.comprimentoAlambrado !== null)
      entries.push({ label: 'Comprimento alambrado', value: `${formatDec(g.comprimentoAlambrado)}m` })
    if (g.alturaAlambrado !== null)
      entries.push({ label: 'Altura alambrado', value: `${formatDec(g.alturaAlambrado)}m` })
    if (g.galvanizacao) entries.push({ label: 'Galvanização', value: g.galvanizacao })
  }

  if (g.travamento) entries.push({ label: 'Travamento', value: g.travamento })
  if (g.possuiTelaSuperior !== null)
    entries.push({ label: 'Tela superior', value: g.possuiTelaSuperior ? 'Sim' : 'Não' })
  if (g.possuiTelaSombreamento !== null)
    entries.push({ label: 'Tela sombreamento', value: g.possuiTelaSombreamento ? 'Sim' : 'Não' })

  try {
    const parsed = JSON.parse(g.specs) as Record<string, unknown>
    for (const [key, val] of Object.entries(parsed)) {
      if (val === null || val === undefined || val === '') continue
      entries.push({ label: key, value: String(val) })
    }
  } catch {
    // specs não é JSON válido — ignora
  }

  if (g.observacoes) entries.push({ label: 'Observações', value: g.observacoes })

  return entries
}

function ProductGroupCard({ group }: { group: ProductGroupDetail }) {
  const specs = buildSpecs(group)

  const fallback = (!group.productId || !group.variantId)
    ? inferProductAndVariant(group.specs)
    : null

  const effectiveProductId = group.productId || fallback?.productId || ''
  const effectiveVariantId = group.variantId || fallback?.variantId || ''

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
      {specs.length > 0 && (
        <div className={styles.specGrid}>
          {specs.map((s) => (
            <div key={s.label} className={styles.specItem}>
              <span className={styles.specLabel}>{s.label}</span>
              <span className={styles.specValue}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
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

  const contactFields: SpecEntry[] = []
  if (detail.nomeContato) contactFields.push({ label: 'Contato', value: detail.nomeContato })
  if (detail.telefone) contactFields.push({ label: 'Telefone', value: detail.telefone })
  if (detail.email) contactFields.push({ label: 'E-mail', value: detail.email })
  if (detail.enderecoObra) contactFields.push({ label: 'Endereço da obra', value: detail.enderecoObra })
  if (detail.tipoProjeto) contactFields.push({ label: 'Tipo de projeto', value: detail.tipoProjeto })

  return (
    <div className={styles.detailPanel}>
      {contactFields.length > 0 && (
        <div className={styles.contactGrid}>
          {contactFields.map((f) => (
            <div key={f.label} className={styles.specItem}>
              <span className={styles.specLabel}>{f.label}</span>
              <span className={styles.specValue}>{f.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.productGroupList}>
        {detail.productGroups.map((g) => (
          <ProductGroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  )
}

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
      .then((proposals) => {
        if (!cancelled) setEntries(proposals)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleToggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
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
            <div className={styles.emptyState}>
              <strong>Carregando histórico...</strong>
            </div>
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
