import type { FieldOption } from "../types/proposalForm";

const varianteQuadraTenisOptions = [
  {
    value: "piso_asfaltico",
    label: "Piso Asfáltico",
    aliases: [
      "Quadra de Tênis P.A.",
      "Quadra de Tênis PA",
      "Quadra Tênis P.A.",
      "Quadra Tênis PA",
      "Tênis P.A.",
      "Tênis PA",
    ],
    isDefault: true,
  },
  {
    value: "saibro",
    label: "Saibro",
  },
  {
    value: "grama_natural",
    label: "Grama Natural",
  },
] as const satisfies readonly FieldOption[];

const varianteQuadraPoliesportivaOptions = [
  {
    value: "piso_asfaltico",
    label: "Piso Asfáltico",
    aliases: ["Quadra Poliesportiva"],
    isDefault: true,
  },
  {
    value: "assoalho",
    label: "Assoalho",
    aliases: ["Quadra Poliesportiva Assoalho"],
  },
  {
    value: "epoxi",
    label: "Epóxi",
    aliases: ["Quadra Poliesportiva Epóxi"],
  },
  {
    value: "poliuretano",
    label: "Poliuretano",
    aliases: ["Quadra Poliesportiva Poliuretano", "Quadra Poliesportiva P.U. 200 B"],
  },
] as const satisfies readonly FieldOption[];

const varianteBeachTenisOptions = [
  {
    value: "padrao",
    label: "Padrão",
    aliases: ["Beach Tennis"],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const tipoAreiaOptions = [
  {
    value: "rio",
    label: "Areia de rio lavada",
  },
  {
    value: "quartzo",
    label: "Areia de quartzo especial tratada",
  },
] as const satisfies readonly FieldOption[];

const varianteCampoOptions = [
  {
    value: "natural",
    label: "Natural",
    aliases: ["Campo", "Campo Natural", "Campo de Futebol Natural"],
    isDefault: true,
  },
  {
    value: "sintetico",
    label: "Sintético",
    aliases: [
      "Campo Sintético",
      "Campo de Futebol Sintético",
    ],
  },
] as const satisfies readonly FieldOption[];

const variantePickleballOptions = [
  {
    value: "padrao",
    label: "Padrão",
    aliases: ["Pickleball", "Quadra de Pickleball", "Quadra Pickleball"],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const variantePadelOptions = [
  {
    value: "grama_sintetica",
    label: "Grama Sintética",
    aliases: [
      "Padel",
      "Quadra de Padel",
      "Quadra Padel",
      "Padel Grama Sintética",
    ],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const varianteSquashOptions = [
  {
    value: "padrao",
    label: "Padrão",
    aliases: ["Squash", "Quadra de Squash", "Quadra Squash"],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const variantePistaOptions = [
  {
    value: "mondo",
    label: "Mondo",
    aliases: [
      "Pista",
      "Pista de Atletismo",
      "Pista de Caminhada",
      "Pista Mondo",
    ],
    isDefault: true,
  },
  {
    value: "pu_500",
    label: "PU 500",
    aliases: ["Pista PU 500"],
  },
  {
    value: "pu_300",
    label: "PU 300",
    aliases: ["Pista PU 300"],
  },
  {
    value: "pu_250",
    label: "PU 250",
    aliases: ["Pista PU 250"],
  },
  {
    value: "pu_200_b",
    label: "PU 200 B",
    aliases: ["Pista PU 200 B"],
  },
] as const satisfies readonly FieldOption[];

const varianteGaragemEpoxiOptions = [
  {
    value: "padrao",
    label: "Padrão",
    aliases: [
      "Garagem Epóxi",
      "Piso de Garagem Epóxi",
      "Garagem",
    ],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const varianteSoftplayOptions = [
  {
    value: "padrao",
    label: "Padrão",
    aliases: [
      "Softplay",
      "Softplay Playground",
      "Playground Softplay",
      "Playground",
    ],
    isDefault: true,
  },
] as const satisfies readonly FieldOption[];

const tipoEpdmOptions = [
  { value: "1 a 3", label: "1 a 3", isDefault: true },
  { value: "2 a 4", label: "2 a 4" },
] as const satisfies readonly FieldOption[];

const opcaoPu200BPistaOptions = [
  {
    value: "b7",
    label: "B7",
  },
  {
    value: "b9",
    label: "B9",
  },
  {
    value: "b11",
    label: "B11",
  },
] as const satisfies readonly FieldOption[];

const tipoProjetoOptions = [
  {
    value: "obra_nova",
    label: "Obra Nova",
  },
  {
    value: "reforma",
    label: "Reforma",
  },
] as const satisfies readonly FieldOption[];

const tipoTerrenoOptions = [
  {
    value: "solo_preparado",
    label: "Solo Preparado",
  },
  {
    value: "laje_concreto",
    label: "Laje/Concreto",
  },
] as const satisfies readonly FieldOption[];

const dificuldadeAcessoOptions = [
  {
    value: "facil",
    label: "Fácil",
  },
  {
    value: "dificil",
    label: "Difícil",
  },
  {
    value: "muito_dificil",
    label: "Muito difícil",
  },
] as const satisfies readonly FieldOption[];

const responsavelMaterialPedreiraOptions = [
  {
    value: "playpiso",
    label: "Playpiso",
  },
  {
    value: "cliente",
    label: "Cliente",
  },
] as const satisfies readonly FieldOption[];

const corPisoAsfalticoOptions = [
  {
    value: "padrao",
    label: "Padrão",
  },
  {
    value: "nao_padrao",
    label: "Não padrão",
  },
  {
    value: "azul",
    label: "Azul",
  },
] as const satisfies readonly FieldOption[];

const corPickleballOptions = [
  {
    value: "padrao",
    label: "Padrão",
  },
  {
    value: "nao_padrao",
    label: "Não padrão",
  },
  {
    value: "azul",
    label: "Azul",
  },
] as const satisfies readonly FieldOption[];

const tipoGramaNaturalOptions = [
  {
    value: "esmeralda",
    label: "Esmeralda",
  },
  {
    value: "bermuda",
    label: "Bermuda",
  },
  {
    value: "bermuda_celebration",
    label: "Bermuda Celebration",
  },
  {
    value: "outros",
    label: "Outros",
  },
] as const satisfies readonly FieldOption[];

const tipoGramaSinteticaOptions = [
  {
    value: "soccer_pro",
    label: "Soccer Pro",
  },
  {
    value: "tturf",
    label: "TTurf",
  },
  {
    value: "hero_shape",
    label: "Hero Shape",
  },
  {
    value: "outros",
    label: "Outros",
  },
] as const satisfies readonly FieldOption[];

const tipoGramaPadelOptions = [
  {
    value: "super_txt",
    label: "Super TXT",
  },
  {
    value: "txt",
    label: "TXT",
  },
  {
    value: "mondo",
    label: "Mondo",
  },
] as const satisfies readonly FieldOption[];

const alturaGramaSinteticaOptions = [
  {
    value: "50_mm",
    label: "50 mm",
  },
  {
    value: "60_mm",
    label: "60 mm",
  },
] as const satisfies readonly FieldOption[];

const baseDrenanteOptions = [
  {
    value: "com_drenagem",
    label: "Com drenagem",
  },
  {
    value: "sem_drenagem",
    label: "Sem drenagem",
  },
] as const satisfies readonly FieldOption[];

const tipoMadeiraOptions = [
  {
    value: "grapia",
    label: "Grapia",
  },
  {
    value: "cumaru",
    label: "Cumaru",
  },
  {
    value: "tauari",
    label: "Tauari",
  },
] as const satisfies readonly FieldOption[];

const condicaoBasePisoOptions = [
  {
    value: "boa",
    label: "Boa",
  },
  {
    value: "ruim",
    label: "Ruim",
  },
] as const satisfies readonly FieldOption[];

const tipoPoliuretanoOptions = [
  {
    value: "b7",
    label: "B7",
  },
  {
    value: "b9",
    label: "B9",
  },
  {
    value: "b11",
    label: "B11",
  },
] as const satisfies readonly FieldOption[];

const estruturaBasqueteOptions = [
  {
    value: "metalica",
    label: "Metálica",
  },
  {
    value: "hidraulica",
    label: "Hidráulica",
  },
  {
    value: "comum",
    label: "Comum",
  },
] as const satisfies readonly FieldOption[];

const tipoFutsalOptions = [
  {
    value: "padrao",
    label: "Padrão",
  },
  {
    value: "mini_trave",
    label: "Mini Trave",
  },
] as const satisfies readonly FieldOption[];

const tipoRedePickleballOptions = [
  {
    value: "fixo",
    label: "Fixo",
  },
  {
    value: "removivel",
    label: "Removível",
  },
] as const satisfies readonly FieldOption[];

const tipoColigacaoOptions = [
  {
    value: "sem_coligacao",
    label: "Sem coligação",
  },
  {
    value: "lateral",
    label: "Lateral",
  },
  {
    value: "fundo",
    label: "Fundo",
  },
] as const satisfies readonly FieldOption[];

const potenciaProjetoresOptions = [
  {
    value: "200",
    label: "200",
  },
  {
    value: "250",
    label: "250",
  },
  {
    value: "300",
    label: "300",
  },
  {
    value: "400",
    label: "400",
  },
  {
    value: "outro",
    label: "Outro",
  },
] as const satisfies readonly FieldOption[];

const galvanizacaoOptions = [
  {
    value: "fogo",
    label: "Fogo",
  },
  {
    value: "eletrolitico",
    label: "Eletrolítico",
  },
  {
    value: "outro",
    label: "Outro",
  },
] as const satisfies readonly FieldOption[];


// Opções: Travamento Superior, Intermediário e inferior
// Checkbox para preencher se haverá travamento Superior, Intermediário e inferior
const travamentoOptions = [
  {
    value: "sem_travamento",
    label: "Sem travamento",
  },
  {
    value: "travamento_inferior",
    label: "Inferior",
  },
  {
    value: "travamento_intermediario",
    label: "Intermediário",
  },
  {
    value: "travamento_superior",
    label: "Superior",
  },
] as const satisfies readonly FieldOption[];

const tipoEstruturaAlambradoPadelOptions = [
  {
    value: "estrutura_vidro",
    label: "Estrutura de vidro",
  },
  {
    value: "estrutura_especial",
    label: "Estrutura especial",
  },
] as const satisfies readonly FieldOption[];

const sistemaAlambradoOptions = [
  {
    value: "gaiola",
    label: "Gaiola",
  },
  {
    value: "trapezio",
    label: "Trapézio",
  },
  {
    value: "especial",
    label: "Especial",
  },
] as const satisfies readonly FieldOption[];

const corTelaSombreamentoOptions = [
  {
    value: "verde",
    label: "Verde",
  },
  {
    value: "preta",
    label: "Preta",
  },
] as const satisfies readonly FieldOption[];

const fieldOptionsRegistry: Record<string, readonly FieldOption[]> = {
  variante_quadra_tenis: varianteQuadraTenisOptions,
  variante_quadra_poliesportiva: varianteQuadraPoliesportivaOptions,
  variante_beach_tenis: varianteBeachTenisOptions,
  variante_campo: varianteCampoOptions,
  variante_pickleball: variantePickleballOptions,
  variante_padel: variantePadelOptions,
  variante_squash: varianteSquashOptions,
  variante_pista: variantePistaOptions,
  variante_garagem_epoxi: varianteGaragemEpoxiOptions,
  variante_softplay: varianteSoftplayOptions,
  tipo_epdm: tipoEpdmOptions,
  opcao_pu_200_b_pista: opcaoPu200BPistaOptions,
  tipo_projeto: tipoProjetoOptions,
  tipo_terreno: tipoTerrenoOptions,
  dificuldade_acesso: dificuldadeAcessoOptions,
  responsavel_material_pedreira: responsavelMaterialPedreiraOptions,
  cor_piso_asfaltico: corPisoAsfalticoOptions,
  cor_pickleball: corPickleballOptions,
  tipo_grama_natural: tipoGramaNaturalOptions,
  tipo_grama_sintetica: tipoGramaSinteticaOptions,
  tipo_grama_padel: tipoGramaPadelOptions,
  altura_grama_sintetica: alturaGramaSinteticaOptions,
  base_drenante: baseDrenanteOptions,
  tipo_madeira: tipoMadeiraOptions,
  condicao_base_piso: condicaoBasePisoOptions,
  tipo_poliuretano: tipoPoliuretanoOptions,
  tipo_areia: tipoAreiaOptions,
  estrutura_basquete: estruturaBasqueteOptions,
  tipo_futsal: tipoFutsalOptions,
  tipo_rede_pickleball: tipoRedePickleballOptions,
  tipo_coligacao: tipoColigacaoOptions,
  potencia_projetores: potenciaProjetoresOptions,
  galvanizacao: galvanizacaoOptions,
  travamento: travamentoOptions,
  tipo_estrutura_alambrado_padel: tipoEstruturaAlambradoPadelOptions,
  sistema_alambrado: sistemaAlambradoOptions,
  cor_tela_sombreamento: corTelaSombreamentoOptions,
};

export { fieldOptionsRegistry };
