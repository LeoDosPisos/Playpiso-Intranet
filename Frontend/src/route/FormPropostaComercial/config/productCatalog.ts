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
  "produto_variante_beach_tenis",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_beach_tenis",
  "acessorios_beach_tenis",
  "iluminacao",
  "fechamentos_protecoes_beach_tenis",
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
  "produto_variante_pickleball",
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
  "produto_variante_padel",
  "dimensoes",
  "condicoes_obra",
  "especificacoes_padel",
  "fechamentos_padel",
  "observacoes",
] as const;

const squashSections = [
  "dados_cliente",
  "dados_obra",
  "produto_variante_squash",
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
  "produto_variante_garagem_epoxi",
  "dimensoes_garagem_epoxi",
  "especificacoes_garagem_epoxi",
  "vagas_garagem_epoxi",
  "observacoes",
] as const;

const softplaySections = [
  "dados_cliente",
  "dados_obra",
  "produto_variante_softplay",
  "dimensoes",
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
        },
        sumarioTemplate:
          "{quantity} quadra(s) de tênis de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta por piso de base asfáltica" +
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
        },
        sumarioTemplate:
          "{quantity} quadra(s) de tênis saibro coberta(s) de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta por piso em saibro" +
          "{?possui_alambrado:, alambrado}{?possui_kit_saibro:, acessórios}{?possui_iluminacao:, iluminação}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      grama: {
        id: "grama",
        label: "Grama",
        sections: quadraTenisSections,
        defaultValues: {
          variante_quadra_tenis: "grama",
        },
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
        },
        sumarioTemplate:
          "{quantity} quadra(s) poliesportiva(s) de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta por piso de base asfáltica" +
          "{?possui_basquete_adulto:, acessório basquete adulto}" +
          "{?possui_basquete_juvenil:, basquete juvenil}" +
          "{?possui_volei:, vôlei}" +
          "{?possui_futebol_futsal:, futebol/futsal}" +
          "{?possui_alambrado:, alambrado}{?possui_iluminacao:, iluminação}, " +
          "com acesso {dificuldade_acesso} executada sobre {tipo_terreno}.",
      },
      assoalho: {
        id: "assoalho",
        label: "Assoalho",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "assoalho",
        },
      },
      epoxi: {
        id: "epoxi",
        label: "Epóxi",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "epoxi",
        },
      },
      pu_200_b: {
        id: "pu_200_b",
        label: "P.U. 200 B",
        sections: quadraPoliesportivaSections,
        defaultValues: {
          variante_quadra_poliesportiva: "pu_200_b",
        },
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
        },
        sumarioTemplate:
          "{quantity} quadra(s) de Beach Tennis de {area_total}m² ({largura}m x {comprimento}m), " +
          "composta pelo sistema de drenagem, mureta e {tipo_areia}, " +
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
        },
      },
    },
  },
};

export { productCatalog };
