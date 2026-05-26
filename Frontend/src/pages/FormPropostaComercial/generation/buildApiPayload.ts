import type { FormValue, ProposalBuilderPayload } from '../types/proposalForm'

// Campos que têm colunas explícitas em proposal_product_groups.
// Tudo que não estiver aqui vai para o JSONB `specs` via [JsonExtensionData] no C#.
const NORMALIZED_KEYS = new Set([
  'largura', 'comprimento', 'area_total',
  'tipo_terreno', 'dificuldade_acesso', 'responsavel_material_pedreira',
  'possui_iluminacao', 'iluminacao_fixada_alambrado', 'quantidade_postes_iluminacao',
  'altura_postes_iluminacao', 'quantidade_projetores', 'potencia_projetores',
  'especificar_potencia_projetores', 'quantidade_cruzetas', 'responsavel_ligacao_eletrica',
  'tipo_coligacao',
  'possui_alambrado',
  'galvanizacao', 'especificar_galvanizacao', 'travamento',
  'quantidade_portoes', 'altura_portoes', 'comprimento_portoes',
  'possui_tela_superior', 'possui_tela_sombreamento', 'altura_sombreamento',
  'comprimento_sombreamento',
  'observacoes',
])

function str(v: FormValue): string | null {
  if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : null
  return v != null && v !== '' ? String(v) : null
}

function num(v: FormValue): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function bool(v: FormValue): boolean {
  return v === true || v === 'true' || v === 1
}

function boolOrNull(v: FormValue): boolean | null {
  if (v == null || v === '') return null
  return bool(v)
}

function buildSpecs(values: Record<string, FormValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).filter(([k]) => !NORMALIZED_KEYS.has(k)),
  )
}

export function buildApiPayload(payload: ProposalBuilderPayload): object {
  const g = payload.globalValues

  return {
    numeroProposta: str(g.numero_proposta) ?? '',
    dataSolicitacao: str(g.data_solicitacao),
    dataEnvio: str(g.data_envio),

    nomeRazaoSocial: str(g.nome_razao_social) ?? '',
    cpfCnpj: str(g.cpf_cnpj),
    nomeContato: str(g.nome_contato),
    telefone: str(g.telefone),
    email: str(g.email),

    enderecoCliente: str(g.endereco_cliente) ?? '',
    localObra: str(g.local_obra) ?? '',
    cidade: str(g.cidade) ?? '',
    estado: str(g.estado) ?? '',
    tipoProjeto: str(g.tipo_projeto) ?? '',

    productGroups: payload.productGroups.map((group, index) => {
      const v = group.values
      return {
        productId: group.productId,
        variantId: String(group.variantId ?? ''),
        quantity: group.quantity,
        groupIndex: index,

        // dimensoes
        largura: num(v.largura),
        comprimento: num(v.comprimento),
        areaTotal: num(v.area_total),

        // condicoes_obra
        tipoTerreno: str(v.tipo_terreno),
        dificuldadeAcesso: str(v.dificuldade_acesso),
        responsavelMaterialPedreira: str(v.responsavel_material_pedreira),

        // iluminacao
        possuiIluminacao: bool(v.possui_iluminacao),
        iluminacaoFixadaAlambrado: boolOrNull(v.iluminacao_fixada_alambrado),
        quantidadePostesIluminacao: num(v.quantidade_postes_iluminacao),
        alturaPostesIluminacao: num(v.altura_postes_iluminacao),
        quantidadeProjetores: num(v.quantidade_projetores),
        potenciaProjetores: str(v.potencia_projetores),
        especificarPotenciaProjetores: str(v.especificar_potencia_projetores),
        quantidadeCruzetas: num(v.quantidade_cruzetas),
        responsavelLigacaoEletrica: str(v.responsavel_ligacao_eletrica) ?? 'cliente',
        tipoColigacao: str(v.tipo_coligacao),

        // fechamentos_protecoes
        possuiAlambrado: bool(v.possui_alambrado),
        galvanizacao: str(v.galvanizacao),
        especificarGalvanizacao: str(v.especificar_galvanizacao),
        travamento: str(v.travamento),
        quantidadePortoes: num(v.quantidade_portoes),
        alturaPortoes: num(v.altura_portoes),
        comprimentoPortoes: num(v.comprimento_portoes),
        possuiTelaSuperior: boolOrNull(v.possui_tela_superior),
        possuiTelaSombreamento: boolOrNull(v.possui_tela_sombreamento),
        alturaSombreamento: num(v.altura_sombreamento),
        comprimentoSombreamento: num(v.comprimento_sombreamento),

        observacoes: str(v.observacoes),

        // campos especificos do produto/variante: ficam no nivel raiz do objeto
        // e sao capturados pelo [JsonExtensionData] no C# -> coluna specs JSONB
        ...buildSpecs(v),
      }
    }),
  }
}
