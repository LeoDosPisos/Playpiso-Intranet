import { msalInstance } from '@/auth/msalConfig'

const PROPOSTA_API_URL =
  (import.meta.env.VITE_PROPOSTA_API_URL as string | undefined) ?? 'http://localhost:5204'
const API_SCOPE = import.meta.env.VITE_API_SCOPE as string | undefined

type ProposalSummary = {
  id: string
  numeroProposta: string
  status: string
  nomeRazaoSocial: string
  cidade: string
  estado: string
  dataSolicitacao: string | null
  dataEnvio: string | null
  pptxUrl: string | null
  xlsxUrl: string | null
  createdByEmail: string
  generatedByUserId: string | null
  generatedByEmail: string | null
  generatedAt: string | null
  createdAt: string
  totalProducts: number
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!API_SCOPE) return {}

  const account = msalInstance.getAllAccounts()[0]
  if (!account) return {}

  const { accessToken } = await msalInstance.acquireTokenSilent({ scopes: [API_SCOPE], account })
  return { Authorization: `Bearer ${accessToken}` }
}

async function listProposals(params: {
  status?: string
  page?: number
  pageSize?: number
} = {}): Promise<ProposalSummary[]> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await fetch(`${PROPOSTA_API_URL}/api/proposals?${query.toString()}`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Erro ao carregar histórico: ${response.status}`)
  }

  return response.json() as Promise<ProposalSummary[]>
}

type ProductGroupDetail = {
  id: string
  productId: string
  variantId: string
  quantity: number
  groupIndex: number
  largura: number | null
  comprimento: number | null
  areaTotal: number | null
  tipoTerreno: string | null
  dificuldadeAcesso: string | null
  possuiIluminacao: boolean
  quantidadePostesIluminacao: number | null
  alturaPostesIluminacao: number | null
  quantidadeProjetores: number | null
  potenciaProjetores: string | null
  possuiAlambrado: boolean
  comprimentoAlambrado: number | null
  alturaAlambrado: number | null
  galvanizacao: string | null
  travamento: string | null
  possuiTelaSuperior: boolean | null
  possuiTelaSombreamento: boolean | null
  observacoes: string | null
  specs: string
}

type ProposalDetail = {
  id: string
  numeroProposta: string
  nomeRazaoSocial: string
  cpfCnpj: string | null
  nomeContato: string | null
  telefone: string | null
  email: string | null
  enderecoObra: string
  cidade: string
  estado: string
  tipoProjeto: string
  dataSolicitacao: string | null
  dataEnvio: string | null
  pptxUrl: string | null
  createdByEmail: string | null
  generatedByEmail: string | null
  generatedAt: string | null
  createdAt: string
  productGroups: ProductGroupDetail[]
}

async function getProposalDetail(id: string): Promise<ProposalDetail> {
  const response = await fetch(`${PROPOSTA_API_URL}/api/proposals/${id}`, {
    headers: await getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`Erro ao carregar proposta: ${response.status}`)
  return response.json() as Promise<ProposalDetail>
}

export type { ProposalSummary, ProposalDetail, ProductGroupDetail }
export { listProposals, getProposalDetail }
