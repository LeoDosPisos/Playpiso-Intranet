# Payload — Quadra de Tênis: Piso Asfáltico

Descreve a estrutura de dados enviada pelo frontend ao endpoint `POST /api/proposals/{id}/generate` quando o produto selecionado é **quadra_tenis** na variante **piso_asfaltico**.

---

## Fluxo de chamadas

```
Frontend → POST /api/proposals          (C# — salva rascunho no banco)
         → POST /api/proposals/{id}/generate  (C# → Python — gera o PPTX)
```

O corpo de `/generate` é o objeto `pptxRequest` descrito abaixo.

---

## Estrutura completa do payload

```jsonc
{
  // IDs dos slides que compõem a apresentação, na ordem de montagem.
  // Gerados por resolveSlideList() com base nos valores do formulário.
  "slideIds": [
    // ── pré-produto (sempre presentes) ──────────────────────────
    "capa",
    "portfolio",
    "sobre_empresa",
    "pilares",
    "parceiros",
    "dados_cliente",
    "sumario",

    // ── produto: quadra_tenis / piso_asfaltico ───────────────────
    "hero_piso_asfaltico_quadra_tenis",   // sempre
    "specs_piso_asfaltico",               // sempre
    "playcushion_quadra_tenis",           // se possui_playcushion == true
    "alambrado_iluminacao_quadra_tenis",  // se possui_alambrado OR possui_iluminacao
    "cores_piso_asfaltico",               // sempre
    "detalhe_construtivo_sem_playcushion",// sempre (templateFile: detalhe_construtivo.pptx)
    "detalhe_construtivo_com_playcushion",// se possui_playcushion == true
    "investimento_piso_asfaltico_quadra_tenis", // sempre (slide dinâmico, variante piso_asfaltico)

    // ── pós-produto (sempre presentes) ──────────────────────────
    "condicoes_pagamento_direto_a",
    "condicoes_pagamento_direto_b",
    "condicoes_pagamento_playpiso",
    "prazos_garantia",
    "regras_contratada",
    "regras_contratante",
    "consideracoes_gerais",
    "encerramento"
  ],

  // Valores globais (seções compartilhadas entre todos os produtos)
  "globalValues": {
    // seção: dados_proposta
    "numero_proposta": "string",          // ex: "P001"
    "data_solicitacao": "string",         // formato ISO date, ex: "2026-05-19"
    "data_envio": "string",               // formato ISO date

    // seção: dados_cliente
    "nome_razao_social": "string",        // placeholder {{cliente_nome}} no slide dados_cliente
    "cpf_cnpj": "string",                 // placeholder {{cliente_cnpj}}
    "nome_contato": "string",             // placeholder {{cliente_contato}}
    "telefone": "string",                 // placeholder {{cliente_telefone}}
    "email": "string",                    // placeholder {{cliente_email}}

    // seção: dados_obra
    "endereco_obra": "string",            // placeholder {{obra_local}} no slide dados_cliente
    "local_obra": "string",               // coletado, sem placeholder mapeado em slides
    "cidade": "string",
    "estado": "string",                   // ex: "SP"
    "tipo_projeto": "obra_nova" | "reforma"
  },

  // Um item por grupo de produto adicionado à proposta
  "productGroups": [
    {
      "productId": "quadra_tenis",
      "quantity": 1,                      // número de quadras neste grupo
      "variantId": "piso_asfaltico",

      // Apenas campos visíveis no formulário no momento do envio.
      // Campos condicionais que não foram ativados são omitidos ou null.
      "values": {

        // ── produto/variante ──────────────────────────────────────
        "variante_quadra_tenis": "piso_asfaltico",

        // ── dimensões ─────────────────────────────────────────────
        "largura": 18,                    // número (m), default 18
        "comprimento": 36,                // número (m), default 36
        "area_total": 648,                // número (m²), calculado: largura × comprimento
                                          // pode ser sobrescrito manualmente

        // ── condições da obra ─────────────────────────────────────
        "tipo_terreno": "solo_preparado" | "laje_concreto",
        "dificuldade_acesso": "facil" | "dificil" | "muito_dificil",
        "responsavel_material_pedreira": "playpiso" | "cliente",

        // ── especificações (piso asfáltico) ───────────────────────
        "cor_piso_asfaltico": "padrao" | "nao_padrao" | "azul",
        // presente apenas quando cor_piso_asfaltico == "nao_padrao":
        "especificar_cor": "string",

        "possui_playcushion": false,      // boolean, default false
                                          // → ativa slides playcushion e detalhe_construtivo_com_playcushion

        // ── iluminação ────────────────────────────────────────────
        "possui_iluminacao": false,       // boolean, default false

        // Campos abaixo presentes apenas quando possui_iluminacao == true:
        "iluminacao_fixada_alambrado": false,      // boolean
        // Presentes apenas quando iluminacao_fixada_alambrado == false:
        "quantidade_postes_iluminacao": 4,         // número (un)
        "altura_postes_iluminacao": 6,             // número (m)
        // Presentes quando possui_iluminacao == true:
        "quantidade_projetores": 8,               // número (un), obrigatório
        "potencia_projetores": "200" | "250" | "300" | "400" | "outro",
        // Presente apenas quando potencia_projetores == "outro":
        "especificar_potencia_projetores": "200 W",
        "quantidade_cruzetas": 4,                 // número (un), obrigatório
        "responsavel_ligacao_eletrica": "cliente",// readonly, sempre "cliente"
        "tipo_coligacao": "sem_coligacao" | "lateral" | "fundo",  // obrigatório quando possui_iluminacao

        // ── fechamentos e proteções ───────────────────────────────
        "possui_alambrado": false,                // boolean, default false

        // Campos abaixo presentes apenas quando possui_alambrado == true:
        "comprimento_alambrado": 108,             // número (m)
        "altura_alambrado": 4,                    // número (m)
        "espacamento_postes_tubos": 2.5,          // número (m)
        "galvanizacao": "fogo" | "eletrolitico" | "outro",
        // Presente apenas quando galvanizacao == "outro":
        "especificar_galvanizacao": "string",
        "possui_trelica": false,                  // boolean
        "travamento": ["sem_travamento" | "travamento_inferior" | "travamento_intermediario" | "travamento_superior"],
                                          // multiselect — array com um ou mais valores; serializado como string separada por vírgula no banco
        "quantidade_portoes": 2,                  // número, default 0
        // Presentes apenas quando quantidade_portoes > 0:
        "altura_portoes": 2,                      // número (m)
        "largura_portoes": 1.5,                   // número (m)

        // Independentes de possui_alambrado:
        "possui_tela_superior": false,            // boolean
        "possui_tela_sombreamento": false,        // boolean
        // Presentes apenas quando possui_tela_sombreamento == true:
        "largura_sombreamento": 18,               // número (m)
        "comprimento_sombreamento": 36,           // número (m)

        // ── acessórios ────────────────────────────────────────────
        "incluir_rede_tenis": false,              // boolean, default false

        // ── observações ───────────────────────────────────────────
        "observacoes": "string | null"
      },

      // Texto de sumário gerado pelo template da variante piso_asfaltico.
      // Template: "{quantity} quadra(s) de tênis de {area_total}m² ({largura}m x {comprimento}m),
      //            composta por piso de base asfáltica
      //            [, alambrado][, iluminação][, playcushion (opcional)],
      //            com acesso {dificuldade_acesso} executada sobre {tipo_terreno}."
      "sumarioText": "string",

      // Rótulos das linhas de investimento a serem exibidos no slide investimento_quadra_tenis.
      // Resolvidos por resolveInvestimentoRows() de acordo com os valores do grupo.
      "investimentoRows": ["string", "..."]
    }
  ]
}
```

---

## Slides da variante e suas condições de inclusão

| slideId | templateFile | Condição de inclusão |
|---|---|---|
| `hero_piso_asfaltico_quadra_tenis` | `hero_piso_asfaltico.pptx` | Sempre (variant: piso_asfaltico) |
| `specs_piso_asfaltico` | `specs_piso_asfaltico.pptx` | Sempre (variant: piso_asfaltico) |
| `playcushion_quadra_tenis` | `playcushion.pptx` | `possui_playcushion == true` |
| `alambrado_iluminacao_quadra_tenis` | `alambrado_iluminacao_quadra_tenis.pptx` | `possui_alambrado OR possui_iluminacao` |
| `cores_piso_asfaltico` | `cores_piso_asfaltico.pptx` | Sempre (variant: piso_asfaltico) |
| `detalhe_construtivo_sem_playcushion` | `detalhe_construtivo.pptx` | Sempre (variant: piso_asfaltico) |
| `detalhe_construtivo_com_playcushion` | `detalhe_construtivo_playcushion.pptx` | `possui_playcushion == true` |
| `investimento_quadra_tenis` | `investimento_quadra_tenis.pptx` | Sempre (product: quadra_tenis) |

> **Nota:** `acessorio.pptx` existe na pasta mas ainda não tem entrada no `slideRegistry` — não é incluído na apresentação gerada no momento.

---

## Placeholders mapeados no slideRegistry

O slide `dados_cliente` (global) usa os seguintes placeholders mapeados a partir de `globalValues`:

| Placeholder no .pptx | Campo do formulário |
|---|---|
| `{{cliente_nome}}` | `nome_razao_social` |
| `{{cliente_cnpj}}` | `cpf_cnpj` |
| `{{cliente_contato}}` | `nome_contato` |
| `{{cliente_telefone}}` | `telefone` |
| `{{cliente_email}}` | `email` |
| `{{obra_local}}` | `endereco_obra` |

Os demais slides de produto recebem o objeto `values` completo do grupo via `productGroups[n].values` — o serviço Python é responsável por localizar e substituir os placeholders em cada `.pptx`.

---

## Valores padrão aplicados automaticamente

| Campo | Valor padrão | Origem |
|---|---|---|
| `variante_quadra_tenis` | `"piso_asfaltico"` | `productCatalog` defaultVariantId |
| `largura` | `18` | `conditionalRules` setDefault |
| `comprimento` | `36` | `conditionalRules` setDefault |
| `area_total` | `largura × comprimento` | `conditionalRules` compute (sobrescrevível) |
| `possui_playcushion` | `false` | `fieldRegistry` defaultValue |
| `possui_iluminacao` | `false` | `fieldRegistry` defaultValue |
| `possui_alambrado` | `false` | `fieldRegistry` defaultValue |
| `possui_tela_superior` | `false` | `fieldRegistry` defaultValue |
| `possui_tela_sombreamento` | `false` | `fieldRegistry` defaultValue |
| `incluir_rede_tenis` | `false` | `fieldRegistry` defaultValue |
| `responsavel_ligacao_eletrica` | `"cliente"` | `conditionalRules` setDefault (readonly) |
