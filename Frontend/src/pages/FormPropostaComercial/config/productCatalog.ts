import type { ProductDefinition } from "../types/proposalForm";

const quadraTenisSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "produto_variante",
  "especificacoes_variante",
  "iluminacao",
  "fechamentos_protecoes",
  "acessorios",
  "observacoes",
] as const;

const quadraPoliesportivaSections = [
  "dados_cliente",
  "dados_obra",
  "produto_variante_quadra_poliesportiva",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_variante_quadra_poliesportiva",
  "acessorios_quadra_poliesportiva",
  "iluminacao",
  "fechamentos_protecoes",
  "observacoes",
] as const;

const beachTenisSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_beach_tenis",
  "acessorios_beach_tenis",
  "iluminacao",
  "fechamentos_protecoes",
  "observacoes",
] as const;

const campoSections = [
  "dados_cliente",
  "dados_obra",
  "produto_variante_campo",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_variante_campo",
  "acessorios_campo",
  "iluminacao",
  "fechamentos_protecoes",
  "observacoes",
] as const;

const pickleballSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_pickleball",
  "acessorios_pickleball",
  "iluminacao",
  "fechamentos_protecoes",
  "observacoes",
] as const;

const padelSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_padel",
  "acessorios_padel",
  "iluminacao",
  "fechamentos_padel",
  "observacoes",
] as const;

const squashSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_squash",
  "iluminacao",
  "observacoes",
] as const;

const pistaSections = [
  "dados_cliente",
  "dados_obra",
  "produto_variante_pista",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_pista",
  "observacoes",
] as const;

const garagemEpoxiSections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes_garagem_epoxi",
  "especificacoes_garagem_epoxi",
  "vagas_garagem_epoxi",
  "observacoes",
] as const;

const softplaySections = [
  "dados_cliente",
  "dados_obra",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_softplay",
  "observacoes",
] as const;

const productCatalog: Record<string, ProductDefinition> = {
  quadra_tenis: {
    id: "quadra_tenis",
    label: "Quadra de Tênis",
    description: "Formulário para proposta comercial de quadra de tênis.",
    shortDescription:
      "Quadras de tênis em piso asfáltico, saibro ou grama natural.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "piso_asfaltico",
    variants: {
      piso_asfaltico: {
        id: "piso_asfaltico",
        label: "Piso Asfáltico",
        sections: quadraTenisSections,
        defaultValues: {
          variante_quadra_tenis: "piso_asfaltico",
          cor_piso_asfaltico: "padrao",                                     
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 8,
          quantidade_projetores: 16,
          quantidade_cruzetas: 4,
        },
        sumarioTemplate:
          "{quantity} quadra(s) de tênis de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) por piso de base asfáltica" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}" +
          "{?possui_playcushion:, playcushion (opcional)}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      saibro: {
        id: "saibro",
        label: "Saibro",
        sections: quadraTenisSections,
        defaultValues: {
          variante_quadra_tenis: "saibro",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 8,
          quantidade_projetores: 16,
          quantidade_cruzetas: 4,
        },
        sumarioTemplate:
          "{quantity} quadra(s) de tênis saibro coberta(s) de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) por piso em saibro" +
          "{?possui_alambrado:, alambrado}{?possui_kit_saibro:, acessórios}{?possui_iluminacao:, iluminação}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      grama_natural: {
        id: "grama_natural",
        label: "Grama Natural",
        sections: quadraTenisSections,
        defaultValues: {
          variante_quadra_tenis: "grama_natural",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 8,
          quantidade_projetores: 16,
          quantidade_cruzetas: 4,
        },
        sumarioTemplate:
          "{quantity} quadra(s) de tênis em grama natural de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) por piso em grama natural" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
    },
  },
  quadra_poliesportiva: {
    id: "quadra_poliesportiva",
    label: "Quadra Poliesportiva",
    description: "Formulário para proposta comercial de quadra poliesportiva.",
    shortDescription:
      "Quadras poliesportivas em base asfáltica, assoalho, epóxi ou P.U. 200 B.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "piso_asfaltico",
    variants: {
      piso_asfaltico: {
        id: "piso_asfaltico",
        label: "Piso Asfáltico",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "piso_asfaltico",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 12,
          quantidade_cruzetas: 3,
        },
        sumarioTemplate:
          "{quantity} quadra(s) poliesportiva(s) de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) por piso de base asfáltica" +
          "{?possui_basquete_adulto:, acessório basquete adulto}" +
          "{?possui_basquete_juvenil:, basquete juvenil}" +
          "{?possui_volei:, vôlei}" +
          "{?possui_futebol_futsal:, futebol/futsal}" +
          "{?possui_tenis:, tênis}" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}" +
          "{?possui_tela_superior:, tela superior}{?possui_tela_sombreamento:, tela de sombreamento}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      assoalho: {
        id: "assoalho",
        label: "Assoalho",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "assoalho",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 12,
          quantidade_cruzetas: 3,
        },
        sumarioTemplate:
          "{quantity} quadra(s) poliesportiva(s) em assoalho de madeira de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) por piso em madeira {tipo_madeira}" +
          "{?anti_chama:, com tratamento anti-chama}" +
          "{?possui_basquete_adulto:, acessório basquete adulto}" +
          "{?possui_basquete_juvenil:, basquete juvenil}" +
          "{?possui_volei:, vôlei}" +
          "{?possui_futebol_futsal:, futebol/futsal}" +
          "{?possui_tenis:, tênis}" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}" +
          "{?possui_tela_superior:, tela superior}{?possui_tela_sombreamento:, tela de sombreamento}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      epoxi: {
        id: "epoxi",
        label: "Epóxi",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "epoxi",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 12,
          quantidade_cruzetas: 3,
        },
      },
      poliuretano: {
        id: "poliuretano",
        label: "Poliuretano",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "poliuretano",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 12,
          quantidade_cruzetas: 3,
        },
        sumarioTemplate:
          "{quantity} quadra(s) poliesportiva(s) em poliuretano {tipo_poliuretano} de {area_total}m² ({largura}m x {comprimento}m), " +
          "aplicada(s) sobre {tipo_terreno}" +
          "{?anti_chama:, com tratamento anti-chama}" +
          "{?possui_basquete_adulto:, acessório basquete adulto}" +
          "{?possui_basquete_juvenil:, basquete juvenil}" +
          "{?possui_volei:, vôlei}" +
          "{?possui_futebol_futsal:, futebol/futsal}" +
          "{?possui_tenis:, tênis}" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}" +
          "{?possui_tela_superior:, tela superior}{?possui_tela_sombreamento:, tela de sombreamento}, " +
          "com acesso {dificuldade_acesso}.",
      },
    },
  },
  beach_tenis: {
    id: "beach_tenis",
    label: "Beach Tennis",
    description: "Formulário para proposta comercial de quadra de Beach Tennis.",
    shortDescription:
      "Quadra de Beach Tennis com dimensões, areia, iluminação, alambrado e acessório de vôlei.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "padrao",
    variants: {
      padrao: {
        id: "padrao",
        label: "Padrão",
        sections: beachTenisSections,
        defaultValues: {
          variante_beach_tenis: "padrao",
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 8,
          potencia_projetores: "300",
          quantidade_cruzetas: 4,
        },
        sumarioTemplate:
          "{quantity} quadra(s) de Beach Tennis de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta(s) pelo sistema de drenagem, mureta e {tipo_areia}, " +
          "{?possui_eva:proteção EVA, }{?possui_alambrado:alambrado, }" +
          "{?possui_iluminacao:iluminação, }acessório, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
    },
  },
  campo: {
    id: "campo",
    label: "Campo",
    description: "Formulário para proposta comercial de campo.",
    shortDescription:
      "Campo natural ou sintético com dimensões, grama, iluminação, alambrado e traves.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "natural",
    variants: {
      natural: {
        id: "natural",
        label: "Natural",
        sections: campoSections,
        defaultValues: {
          variante_campo: "natural",
        },
      },
      sintetico: {
        id: "sintetico",
        label: "Sintético",
        sections: campoSections,
        defaultValues: {
          variante_campo: "sintetico",
        },
      },
    },
  },
  pickleball: {
    id: "pickleball",
    label: "Pickleball",
    description: "Formulário para proposta comercial de quadra de Pickleball.",
    shortDescription:
      "Quadra de Pickleball com dimensões, cor, rede, iluminação e alambrado.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "padrao",
    variants: {
      padrao: {
        id: "padrao",
        label: "Padrão",
        sections: pickleballSections,
        defaultValues: {
          variante_pickleball: "padrao",
          largura: 6.10,
          comprimento: 13.41,
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 8,
          quantidade_cruzetas: 2,
        },
      },
    },
  },
  padel: {
    id: "padel",
    label: "Padel",
    description: "Formulário para proposta comercial de quadra de Padel.",
    shortDescription:
      "Quadra de Padel em grama sintética com alambrado obrigatório.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "grama_sintetica",
    variants: {
      grama_sintetica: {
        id: "grama_sintetica",
        label: "Grama Sintética",
        sections: padelSections,
        defaultValues: {
          variante_padel: "grama_sintetica",
          largura: 10,
          comprimento: 20,
          quantidade_postes_iluminacao: 4,
          altura_postes_iluminacao: 6,
          quantidade_projetores: 8,
          quantidade_cruzetas: 2,
        },
      },
    },
  },
  squash: {
    id: "squash",
    label: "Squash",
    description: "Formulário para proposta comercial de quadra de Squash.",
    shortDescription:
      "Quadra de Squash com madeira, anti-chama, iluminação e dimensões oficiais.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "padrao",
    variants: {
      padrao: {
        id: "padrao",
        label: "Padrão",
        sections: squashSections,
        defaultValues: {
          variante_squash: "padrao",
          largura: 6.4,
          comprimento: 9.75,
        },
      },
    },
  },
  pista: {
    id: "pista",
    label: "Pista",
    description: "Formulário para proposta comercial de pista.",
    shortDescription:
      "Pistas de atletismo e caminhada com sistemas Mondo ou PU.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "mondo",
    variants: {
      mondo: {
        id: "mondo",
        label: "Mondo",
        sections: pistaSections,
        defaultValues: {
          variante_pista: "mondo",
        },
      },
      pu_500: {
        id: "pu_500",
        label: "PU 500",
        sections: pistaSections,
        defaultValues: {
          variante_pista: "pu_500",
        },
      },
      pu_300: {
        id: "pu_300",
        label: "PU 300",
        sections: pistaSections,
        defaultValues: {
          variante_pista: "pu_300",
        },
      },
      pu_250: {
        id: "pu_250",
        label: "PU 250",
        sections: pistaSections,
        defaultValues: {
          variante_pista: "pu_250",
        },
      },
      pu_200_b: {
        id: "pu_200_b",
        label: "PU 200 B",
        sections: pistaSections,
        defaultValues: {
          variante_pista: "pu_200_b",
        },
      },
    },
  },
  garagem_epoxi: {
    id: "garagem_epoxi",
    label: "Garagem Epóxi",
    description: "Formulário para proposta comercial de garagem epóxi.",
    shortDescription:
      "Garagem epóxi com piso liso, piso derrapante, multilayer, base e vagas.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "padrao",
    variants: {
      padrao: {
        id: "padrao",
        label: "Padrão",
        sections: garagemEpoxiSections,
        defaultValues: {
          variante_garagem_epoxi: "padrao",
        },
      },
    },
  },
  softplay: {
    id: "softplay",
    label: "Softplay Playground",
    description:
      "Formulário para proposta comercial de Softplay Playground.",
    shortDescription:
      "Softplay Playground com dimensões e espessuras de SBR e EPDM.",
    selection: {
      minQuantity: 0,
      maxQuantity: 99,
      defaultQuantity: 0,
      step: 1,
      allowGrouping: true,
      allowSplitGroups: true,
    },
    defaultVariantId: "padrao",
    variants: {
      padrao: {
        id: "padrao",
        label: "Padrão",
        sections: softplaySections,
        defaultValues: {
          variante_softplay: "padrao",
          espessura_epdm: 1,
          tipo_epdm: "1 a 3",
        },
      },
    },
  },
};

export { productCatalog };
