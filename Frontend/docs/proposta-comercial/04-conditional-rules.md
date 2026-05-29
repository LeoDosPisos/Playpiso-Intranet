# Conditional Rules — Quadra de Tenis

## 1. Objetivo

Este documento define as regras condicionais codaveis do formulario comercial de **Quadra de Tenis**.

As regras abaixo devem ser interpretadas pelo `FormRenderer` para controlar:

```txt
- valores padrao
- calculos automaticos
- visibilidade de campos
- obrigatoriedade condicional
- limpeza de campos ocultos
- aliases de produto e variante
```

As opcoes tecnicas usadas nas condicoes devem vir de `08-field-options-registry.md`.

---

## 2. Tipos de efeito suportados

O renderizador deve suportar, no minimo, estes efeitos:

```ts
type ConditionalEffect =
  | { type: "setDefault"; field: string; value: unknown }
  | { type: "compute"; field: string; expression: string; overridable?: boolean }
  | { type: "show"; field: string }
  | { type: "hide"; field: string }
  | { type: "require"; field: string }
  | { type: "unrequire"; field: string }
  | { type: "clear"; field: string }
  | { type: "setValue"; field: string; value: unknown };
```

Campos ocultos devem ser limpos quando a regra definir `clear`.

Campos ocultos nao devem bloquear validacao nem entrar no payload final.

---

## 3. Regras declarativas

```ts
type ConditionalPredicate = {
  field: string;
  operator: "equals" | "notEquals" | "in" | "truthy" | "falsy";
  value?: unknown;
};

type ConditionalRule = {
  id: string;
  description: string;
  when?: ConditionalPredicate | { all: ConditionalPredicate[] } | { any: ConditionalPredicate[] };
  effects: ConditionalEffect[];
  elseEffects?: ConditionalEffect[];
};
```

---

## 4. Regras de inicializacao

```ts
const initializationRules: ConditionalRule[] = [
  {
    id: "default_largura_quadra_tenis",
    description: "Aplicar largura padrao da Quadra de Tenis.",
    effects: [
      { type: "setDefault", field: "largura", value: 18 }
    ]
  },
  {
    id: "default_comprimento_quadra_tenis",
    description: "Aplicar comprimento padrao da Quadra de Tenis.",
    effects: [
      { type: "setDefault", field: "comprimento", value: 36 }
    ]
  },
  {
    id: "default_variante_quadra_tenis",
    description: "Iniciar Quadra de Tenis com Piso Asfaltico como variante padrao.",
    effects: [
      { type: "setDefault", field: "variante_quadra_tenis", value: "piso_asfaltico" }
    ]
  },
  {
    id: "default_responsavel_ligacao_eletrica",
    description: "Responsavel pela ligacao eletrica deve ser sempre Cliente.",
    effects: [
      { type: "setDefault", field: "responsavel_ligacao_eletrica", value: "cliente" }
    ]
  }
];
```

---

## 5. Regras de calculo

```ts
const computationRules: ConditionalRule[] = [
  {
    id: "compute_area_total",
    description: "Calcular area total por largura x comprimento enquanto o usuario nao sobrescrever manualmente.",
    effects: [
      {
        type: "compute",
        field: "area_total",
        expression: "largura * comprimento",
        overridable: true
      }
    ]
  }
];
```

Comportamento esperado:

```txt
- Se largura ou comprimento mudar, recalcular area_total.
- Se area_total tiver sido editada manualmente, nao sobrescrever automaticamente.
- O estado de sobrescrita manual deve ser mantido em computedOverrides.
```

---

## 6. Regras de variante

```ts
const variantRules: ConditionalRule[] = [
  {
    id: "variant_piso_asfaltico_fields",
    description: "Piso Asfaltico exibe Cor e PlayCushion.",
    when: {
      field: "variante_quadra_tenis",
      operator: "equals",
      value: "piso_asfaltico"
    },
    effects: [
      { type: "show", field: "cor_piso_asfaltico" },
      { type: "show", field: "possui_playcushion" },
      { type: "require", field: "cor_piso_asfaltico" }
    ],
    elseEffects: [
      { type: "hide", field: "cor_piso_asfaltico" },
      { type: "clear", field: "cor_piso_asfaltico" },
      { type: "hide", field: "especificar_cor" },
      { type: "clear", field: "especificar_cor" },
      { type: "hide", field: "possui_playcushion" },
      { type: "clear", field: "possui_playcushion" },
      { type: "unrequire", field: "cor_piso_asfaltico" },
      { type: "unrequire", field: "especificar_cor" }
    ]
  },
  {
    id: "variant_saibro_fields",
    description: "Saibro exibe Kit Saibro.",
    when: {
      field: "variante_quadra_tenis",
      operator: "equals",
      value: "saibro"
    },
    effects: [
      { type: "show", field: "possui_kit_saibro" }
    ],
    elseEffects: [
      { type: "hide", field: "possui_kit_saibro" },
      { type: "clear", field: "possui_kit_saibro" }
    ]
  },
  {
    id: "variant_grama_fields",
    description: "Grama exibe Tipo de grama.",
    when: {
      field: "variante_quadra_tenis",
      operator: "equals",
      value: "grama"
    },
    effects: [
      { type: "show", field: "tipo_grama" },
      { type: "require", field: "tipo_grama" }
    ],
    elseEffects: [
      { type: "hide", field: "tipo_grama" },
      { type: "clear", field: "tipo_grama" },
      { type: "hide", field: "especificar_tipo_grama" },
      { type: "clear", field: "especificar_tipo_grama" },
      { type: "unrequire", field: "tipo_grama" },
      { type: "unrequire", field: "especificar_tipo_grama" }
    ]
  }
];
```

---

## 7. Regras de campos complementares

```ts
const complementaryFieldRules: ConditionalRule[] = [
  {
    id: "show_especificar_cor",
    description: "Cor Nao Padrao exige especificacao manual.",
    when: {
      field: "cor_piso_asfaltico",
      operator: "equals",
      value: "nao_padrao"
    },
    effects: [
      { type: "show", field: "especificar_cor" },
      { type: "require", field: "especificar_cor" }
    ],
    elseEffects: [
      { type: "hide", field: "especificar_cor" },
      { type: "clear", field: "especificar_cor" },
      { type: "unrequire", field: "especificar_cor" }
    ]
  },
  {
    id: "show_especificar_tipo_grama",
    description: "Tipo de grama Outros exige especificacao manual.",
    when: {
      field: "tipo_grama",
      operator: "equals",
      value: "outros"
    },
    effects: [
      { type: "show", field: "especificar_tipo_grama" },
      { type: "require", field: "especificar_tipo_grama" }
    ],
    elseEffects: [
      { type: "hide", field: "especificar_tipo_grama" },
      { type: "clear", field: "especificar_tipo_grama" },
      { type: "unrequire", field: "especificar_tipo_grama" }
    ]
  },
  {
    id: "show_especificar_potencia_projetores",
    description: "Potencia dos projetores Outro exige especificacao manual.",
    when: {
      field: "potencia_projetores",
      operator: "equals",
      value: "outro"
    },
    effects: [
      { type: "show", field: "especificar_potencia_projetores" },
      { type: "require", field: "especificar_potencia_projetores" }
    ],
    elseEffects: [
      { type: "hide", field: "especificar_potencia_projetores" },
      { type: "clear", field: "especificar_potencia_projetores" },
      { type: "unrequire", field: "especificar_potencia_projetores" }
    ]
  },
  {
    id: "show_especificar_galvanizacao",
    description: "Galvanizacao Outro exige especificacao manual.",
    when: {
      field: "galvanizacao",
      operator: "equals",
      value: "outro"
    },
    effects: [
      { type: "show", field: "especificar_galvanizacao" },
      { type: "require", field: "especificar_galvanizacao" }
    ],
    elseEffects: [
      { type: "hide", field: "especificar_galvanizacao" },
      { type: "clear", field: "especificar_galvanizacao" },
      { type: "unrequire", field: "especificar_galvanizacao" }
    ]
  }
];
```

---

## 8. Regras de iluminacao

```ts
const lightingRules: ConditionalRule[] = [
  {
    id: "show_iluminacao_fields",
    description: "Possui iluminacao exibe campos internos de iluminacao.",
    when: {
      field: "possui_iluminacao",
      operator: "equals",
      value: true
    },
    effects: [
      { type: "show", field: "iluminacao_fixada_alambrado" },
      { type: "show", field: "quantidade_postes_iluminacao" },
      { type: "show", field: "altura_postes_iluminacao" },
      { type: "show", field: "quantidade_projetores" },
      { type: "show", field: "potencia_projetores" },
      { type: "show", field: "quantidade_cruzetas" },
      { type: "show", field: "responsavel_ligacao_eletrica" },
      { type: "require", field: "quantidade_projetores" },
      { type: "require", field: "potencia_projetores" },
      { type: "require", field: "quantidade_cruzetas" }
    ],
    elseEffects: [
      { type: "hide", field: "iluminacao_fixada_alambrado" },
      { type: "clear", field: "iluminacao_fixada_alambrado" },
      { type: "hide", field: "quantidade_postes_iluminacao" },
      { type: "clear", field: "quantidade_postes_iluminacao" },
      { type: "hide", field: "altura_postes_iluminacao" },
      { type: "clear", field: "altura_postes_iluminacao" },
      { type: "hide", field: "quantidade_projetores" },
      { type: "clear", field: "quantidade_projetores" },
      { type: "hide", field: "potencia_projetores" },
      { type: "clear", field: "potencia_projetores" },
      { type: "hide", field: "especificar_potencia_projetores" },
      { type: "clear", field: "especificar_potencia_projetores" },
      { type: "hide", field: "quantidade_cruzetas" },
      { type: "clear", field: "quantidade_cruzetas" },
      { type: "hide", field: "responsavel_ligacao_eletrica" },
      { type: "unrequire", field: "quantidade_postes_iluminacao" },
      { type: "unrequire", field: "altura_postes_iluminacao" },
      { type: "unrequire", field: "quantidade_projetores" },
      { type: "unrequire", field: "potencia_projetores" },
      { type: "unrequire", field: "especificar_potencia_projetores" },
      { type: "unrequire", field: "quantidade_cruzetas" }
    ]
  },
  {
    id: "hide_postes_when_iluminacao_fixada_alambrado",
    description: "Iluminacao fixada em alambrado oculta campos de postes proprios.",
    when: {
      all: [
        {
          field: "possui_iluminacao",
          operator: "equals",
          value: true
        },
        {
          field: "iluminacao_fixada_alambrado",
          operator: "equals",
          value: true
        }
      ]
    },
    effects: [
      { type: "hide", field: "quantidade_postes_iluminacao" },
      { type: "clear", field: "quantidade_postes_iluminacao" },
      { type: "hide", field: "altura_postes_iluminacao" },
      { type: "clear", field: "altura_postes_iluminacao" },
      { type: "unrequire", field: "quantidade_postes_iluminacao" },
      { type: "unrequire", field: "altura_postes_iluminacao" }
    ],
    elseEffects: [
      {
        type: "show",
        field: "quantidade_postes_iluminacao"
      },
      {
        type: "show",
        field: "altura_postes_iluminacao"
      },
      {
        type: "require",
        field: "quantidade_postes_iluminacao"
      },
      {
        type: "require",
        field: "altura_postes_iluminacao"
      }
    ]
  }
];
```

Observacao de avaliacao:

```txt
Os elseEffects desta regra so devem ser aplicados quando possui_iluminacao = true.
Se possui_iluminacao = false, a regra show_iluminacao_fields continua sendo soberana e deve manter campos internos ocultos.
```

Regra importante:

```txt
iluminacao_fixada_alambrado = true nao deve marcar possui_alambrado automaticamente e nao deve obrigar possui_alambrado = true.
```

---

## 9. Regras de fechamentos e protecoes

O planejamento original chama esta area de **Alambrado**. No contrato atual, a secao codavel se chama `fechamentos_protecoes`, pois tambem agrupa tela superior e tela de sombreamento.

```ts
const enclosureRules: ConditionalRule[] = [
  {
    id: "show_alambrado_fields",
    description: "Possui alambrado exibe campos tecnicos de alambrado.",
    when: {
      field: "possui_alambrado",
      operator: "equals",
      value: true
    },
    effects: [
      { type: "show", field: "comprimento_alambrado" },
      { type: "show", field: "altura_alambrado" },
      { type: "show", field: "espacamento_postes_tubos" },
      { type: "show", field: "galvanizacao" },
      { type: "show", field: "possui_trelica" },
      { type: "show", field: "travamento" },
      { type: "require", field: "comprimento_alambrado" },
      { type: "require", field: "altura_alambrado" },
      { type: "require", field: "espacamento_postes_tubos" },
      { type: "require", field: "galvanizacao" },
      { type: "require", field: "travamento" }
    ],
    elseEffects: [
      { type: "hide", field: "comprimento_alambrado" },
      { type: "clear", field: "comprimento_alambrado" },
      { type: "hide", field: "altura_alambrado" },
      { type: "clear", field: "altura_alambrado" },
      { type: "hide", field: "espacamento_postes_tubos" },
      { type: "clear", field: "espacamento_postes_tubos" },
      { type: "hide", field: "galvanizacao" },
      { type: "clear", field: "galvanizacao" },
      { type: "hide", field: "especificar_galvanizacao" },
      { type: "clear", field: "especificar_galvanizacao" },
      { type: "hide", field: "possui_trelica" },
      { type: "clear", field: "possui_trelica" },
      { type: "hide", field: "travamento" },
      { type: "clear", field: "travamento" },
      { type: "unrequire", field: "comprimento_alambrado" },
      { type: "unrequire", field: "altura_alambrado" },
      { type: "unrequire", field: "espacamento_postes_tubos" },
      { type: "unrequire", field: "galvanizacao" },
      { type: "unrequire", field: "especificar_galvanizacao" },
      { type: "unrequire", field: "travamento" }
    ]
  }
];
```

Os campos abaixo devem permanecer visiveis independentemente de `possui_alambrado`:

```txt
- possui_tela_superior
- possui_tela_sombreamento
```

---

## 10. Regras de dados da obra

```ts
const projectRules: ConditionalRule[] = [
  {
    id: "tipo_projeto_reforma_pending",
    description: "Reforma deve exibir campos especificos de reforma quando esses campos forem definidos.",
    when: {
      field: "tipo_projeto",
      operator: "equals",
      value: "reforma"
    },
    effects: []
  }
];
```

Status:

```txt
Os campos especificos de reforma ainda nao estao definidos. Ate que sejam definidos, tipo_projeto nao deve abrir novos campos.
```

---

## 11. Regras globais de payload e validacao

```txt
- Campos ocultos por regra condicional nao devem ser obrigatorios.
- Campos ocultos por regra condicional nao devem exibir erro.
- Campos ocultos por regra condicional nao devem contaminar o payload final.
- Campos ocultos devem ser limpos quando houver efeito clear.
- Acessorios em Quadra de Tenis significa apenas incluir_rede_tenis.
- Nao criar uma secao complexa de acessorios para Quadra de Tenis.
```

---

## 12. Lista consolidada de regras

```ts
const conditionalRules = [
  ...initializationRules,
  ...computationRules,
  ...variantRules,
  ...complementaryFieldRules,
  ...lightingRules,
  ...enclosureRules,
  ...projectRules
];
```
