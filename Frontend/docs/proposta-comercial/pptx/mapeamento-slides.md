# Mapeamento de Slides — Proposta Comercial Playpiso

Inventário derivado da análise das propostas:
- `Proposta Beach Tennis - 2024.pptx.pdf` (20 slides)
- `Proposta Tênis PA_2025.pptx.pdf` (≥ 20 slides)

A fonte de verdade para os registries de implementação é `slideRegistry.ts` (a criar). Este documento descreve o que foi observado nos PDFs e é a base para popular aquele registry.

---

## Inventário por apresentação

### Beach Tennis — 20 slides

| # | slideId proposto | Título/conteúdo observado | Classificação |
|---|-----------------|--------------------------|---------------|
| 1 | `capa` | Logo Playpiso (fundo vermelho) | Global pré-produto |
| 2 | `portfolio` | Collage de fotos de obras | Global pré-produto |
| 3 | `sobre_empresa` | "Com a Playpiso, dá jogo" — texto institucional desde 1987 | Global pré-produto |
| 4 | `pilares` | Vai no detalhe / Joga bonito / Faz acontecer | Global pré-produto |
| 5 | `parceiros` | "Quem joga com a gente" — MONDO, CBAt, CBT, Volleyball | Global pré-produto |
| 6 | `dados_cliente` | Nome, Contato, Endereço, Telefone, E-Mail, Local da obra | Global pré-produto (dinâmico — placeholders) |
| 7 | `sumario` | Sumário com 8 itens (item 1 é texto do produto) | Global pré-produto (dinâmico — gerado por produto) |
| 8 | `hero_beach_tenis` | "QUADRA DE BEACH TENNIS" (foto full-bleed) | Por produto |
| 9 | `areia_rio_beach_tenis` | "Sistema de drenagem, mureta e areia de rio lavada" | Condicional (`tipo_areia = rio`) |
| 10 | `areia_quartzo_beach_tenis` | "Sistema de drenagem, mureta e areia de quartzo especial tratada" | Condicional (`tipo_areia = quartzo`) |
| 11 | `protecao_eva_beach_tenis` | "Proteção EVA" | Condicional (`possui_eva = true`) |
| 12 | `fechamentos_beach_tenis` | "Alambrado" + "Iluminação" (composição dinâmica de seções sobre `fechamentos_base`) | Condicional (`possui_alambrado` ou `possui_iluminacao`) |
| 13 | `acessorio_beach_tenis` | "Acessório — Sem regulagem / Com regulagem" | Por produto |
| 14 | `investimento_beach_tenis` | "2. Investimento" (tabela: quadra, alambrado, iluminação, acessórios, EVA opcional) | Por produto (dinâmico — linhas por componente) |
| 15 | `condicoes_pagamento` | "3. Condições de pagamento" (Faturamento direto + Faturamento Playpiso) | Global pós-produto |
| 16 | `prazos_garantia` | "4. Prazos" + "5. Garantia" | Global pós-produto |
| 17 | `regras_contratada` | "6. Regras do Jogo — Responsabilidades da Contratada" | Global pós-produto |
| 18 | `regras_contratante` | "7. Regras do Jogo — Responsabilidades do Contratante" | Global pós-produto |
| 19 | `consideracoes_gerais` | "8. Regras do Jogo — Considerações Gerais" | Global pós-produto |
| 20 | `encerramento` | "Vem pro jogo" (contatos do comercial) | Global pós-produto |

---

### Quadra de Tênis PA — ≥ 20 slides

| # | slideId proposto | Título/conteúdo observado | Classificação |
|---|-----------------|--------------------------|---------------|
| 1 | `capa` | Logo Playpiso (fundo vermelho) | Global pré-produto |
| 2 | `sobre_empresa` | "Com a Playpiso, dá jogo" | Global pré-produto |
| 3 | `portfolio` | Collage de fotos de obras | Global pré-produto |
| 4 | `pilares` | Vai no detalhe / Joga bonito / Faz acontecer | Global pré-produto |
| 5 | `parceiros` | "Quem joga com a gente" | Global pré-produto |
| 6 | `dados_cliente` | Nome e CNPJ, Contato, Endereço, Telefone, E-Mail, Local da obra | Global pré-produto (dinâmico — placeholders) |
| 7 | `sumario` | Sumário com 8 itens | Global pré-produto (dinâmico) |
| 8 | `hero_quadra_tenis` | "QUADRA DE TÊNIS" (foto full-bleed) | Por produto |
| 9 | `specs_piso_asfaltico` | "Piso Asfáltico" — especificações técnicas detalhadas | Por variante (`quadra_tenis` / `piso_asfaltico`) |
| 10 | `playcushion_alambrado_quadra_tenis` | "Playcushion" + "Alambrado" (mesma página) | Condicional (`possui_playcushion` e/ou `possui_alambrado`) |
| 11 | `iluminacao_acessorio_quadra_tenis` | "Iluminação" + "Acessório" (mesma página) | Condicional (`possui_iluminacao`) + Por produto |
| 12 | `cores_piso_asfaltico` | "Sugestões de cores" (grid de 12 opções) | Por variante (`quadra_tenis` / `piso_asfaltico`) |
| 13 | `detalhe_construtivo_sem_playcushion` | "Detalhe construtivo" (corte transversal sem Playcushion) | Por variante (`quadra_tenis` / `piso_asfaltico`) |
| 14 | `detalhe_construtivo_com_playcushion` | "Detalhe construtivo" (corte transversal com Playcushion) | Condicional (`possui_playcushion = true`) |
| 15 | `investimento_quadra_tenis` | "2. Investimento" (tabela: piso, acessórios, alambrado, iluminação, playcushion) | Por produto (dinâmico — linhas por componente) |
| 18 | `condicoes_pagamento_playpiso` | "3. Condições de pagamento — Faturamento Playpiso" | Global pós-produto |
| 19 | `prazos_garantia` | "4. Prazos" + "5. Garantia" | Global pós-produto |
| 20 | `regras_contratada` | "6. Regras do Jogo — Responsabilidades da Contratada" | Global pós-produto |
| 21+ | `regras_contratante`, `consideracoes_gerais`, `encerramento` | (mesmos do Beach Tennis) | Global pós-produto |

---

## Classificação consolidada

### Globais pré-produto
Aparecem em toda proposta, antes dos blocos de produto, na ordem abaixo.

| slideId | Label | Comportamento |
|---------|-------|---------------|
| `capa` | Capa Playpiso | Estático |
| `portfolio` | Portfólio de obras | Estático |
| `sobre_empresa` | Com a Playpiso, dá jogo | Estático |
| `pilares` | Pilares | Estático |
| `parceiros` | Quem joga com a gente | Estático |
| `dados_cliente` | Dados do cliente | Dinâmico — placeholders do formulário |
| `sumario` | Sumário | Dinâmico — item 1 gerado por produto selecionado |

**Observação sobre `dados_cliente`:** A versão Beach Tennis mostra somente "Nome"; a versão Tênis PA combina "Nome e CNPJ". A diferença pode ser de template ou de versão da proposta. O campo de referência é `nome_razao_social` com `cpf_cnpj` opcional.

**Observação sobre `condicoes_pagamento`:** Beach Tennis usa 1 slide combinado; Tênis PA usa 3 slides separados. Ambas versões devem estar disponíveis como templates distintos. A versão a usar pode ser configurável por produto ou deixada como 3 slides globais (com o slide combinado para casos simples).

### Globais pós-produto
Aparecem em toda proposta, após todos os blocos de produto.

| slideId | Label |
|---------|-------|
| `condicoes_pagamento` ou `condicoes_pagamento_direto_a` + `_b` + `playpiso` | Condições de pagamento |
| `prazos_garantia` | Prazos e Garantia |
| `regras_contratada` | Regras do Jogo — Responsabilidades da Contratada |
| `regras_contratante` | Regras do Jogo — Responsabilidades do Contratante |
| `consideracoes_gerais` | Regras do Jogo — Considerações Gerais |
| `encerramento` | Vem pro jogo |

### Por produto
Aparecem uma vez por produto selecionado na proposta.

| slideId | productId | Label | Comportamento |
|---------|-----------|-------|---------------|
| `hero_beach_tenis` | `beach_tenis` | Hero Beach Tennis | Estático |
| `acessorio_beach_tenis` | `beach_tenis` | Acessório | Estático (sem/com regulagem) |
| `investimento_beach_tenis` | `beach_tenis` | Investimento | Dinâmico — linhas por componente selecionado |
| `hero_quadra_tenis` | `quadra_tenis` | Hero Quadra de Tênis | Estático |
| `investimento_quadra_tenis` | `quadra_tenis` | Investimento | Dinâmico — linhas por componente selecionado |

### Por variante
Aparecem apenas quando a variante correspondente do produto estiver selecionada.

| slideId | productId | variantIds | Label | Status |
|---------|-----------|------------|-------|--------|
| `specs_piso_asfaltico` | `quadra_tenis` | `[piso_asfaltico]` | Piso Asfáltico | Template disponível |
| `cores_piso_asfaltico` | `quadra_tenis` | `[piso_asfaltico]` | Sugestões de cores | Template disponível |
| `detalhe_construtivo_sem_playcushion` | `quadra_tenis` | `[piso_asfaltico]` | Detalhe construtivo | Template disponível |
| `specs_saibro` | `quadra_tenis` | `[saibro]` | Saibro | Template pendente |
| `specs_grama_tenis` | `quadra_tenis` | `[grama]` | Grama | Template pendente |
| *(demais produtos)* | | | | Templates pendentes |

### Condicionais
Aparecem somente quando o campo de controle satisfaz a condição.

| slideId | productId | Condição de exibição | Label | Observação |
|---------|-----------|----------------------|-------|------------|
| `areia_rio_beach_tenis` | `beach_tenis` | `tipo_areia = rio` | Drenagem + areia de rio | Campo `tipo_areia` ainda não existe no formulário |
| `areia_quartzo_beach_tenis` | `beach_tenis` | `tipo_areia = quartzo` | Drenagem + areia de quartzo | Campo `tipo_areia` ainda não existe no formulário |
| `protecao_eva_beach_tenis` | `beach_tenis` | `possui_eva = true` | Proteção EVA | Campo `possui_eva` ainda não existe no formulário |
| `fechamentos_beach_tenis` | `beach_tenis` | `possui_alambrado = true` ou `possui_iluminacao = true` | Alambrado + Iluminação (composição dinâmica) | Campos já existem |
| `playcushion_alambrado_quadra_tenis` | `quadra_tenis` | `possui_playcushion = true` ou `possui_alambrado = true` | Playcushion + Alambrado | Campos já existem |
| `iluminacao_acessorio_quadra_tenis` | `quadra_tenis` | `possui_iluminacao = true` | Iluminação + Acessório | Campo já existe |
| `detalhe_construtivo_com_playcushion` | `quadra_tenis` | `possui_playcushion = true` | Detalhe construtivo c/ Playcushion | Campo já existe |

---

## Comportamentos dinâmicos

### Slide `dados_cliente` — placeholders

| Placeholder no template | fieldId no formulário |
|------------------------|-----------------------|
| `{{cliente_nome}}` | `nome_razao_social` |
| `{{cliente_cnpj}}` | `cpf_cnpj` |
| `{{cliente_contato}}` | `nome_contato` |
| `{{cliente_telefone}}` | `telefone` |
| `{{cliente_email}}` | `email` |
| `{{obra_endereco}}` | `endereco_cliente` + `cidade` + `estado` (concatenação) |
| Solicitação / Envio / Proposta | Metadados externos ao formulário (data e código da proposta) |

### Slide `sumario` — template de texto por produto/variante

O item `1. Projeto` é gerado dinamicamente. Os templates observados:

**Beach Tennis:**
```
{qty} quadra(s) de Beach Tennis {descoberta|coberta}, de {area_total}m²
({largura}m x {comprimento}m), composta pelo sistema de drenagem, mureta
e {tipo_areia}, {?possui_eva: proteção EVA, }{?possui_alambrado: alambrado, }
{?possui_iluminacao: iluminação, }acessório, com acesso {dificuldade_acesso}
executada sobre {tipo_terreno}.
```

**Quadra de Tênis / piso_asfaltico:**
```
{qty} quadra(s) de tênis {descoberta|coberta} de {area_total}m²
({largura}m x {comprimento}m), composta por piso de base asfáltica
{?possui_alambrado: , alambrado}{?possui_iluminacao: , iluminação}
{?possui_playcushion: , playcushion (opcional)}, com acesso {dificuldade_acesso}
executada sobre {tipo_terreno}.
```

Notação usada acima:
- `{campo}` — valor do campo do formulário
- `{?campo: texto}` — texto exibido condicionalmente se o campo for verdadeiro/preenchido
- `{a|b}` — opções alternativas separadas por barra (atualmente manually editado)

Os itens 2–8 do sumário são fixos (Investimento, Condições de Pagamento, Prazos, Garantia, Responsabilidades Contratada, Responsabilidades Contratante, Considerações Gerais).

### Slide `investimento_{productId}` — linhas dinâmicas

A tabela tem uma linha por componente do produto. O conjunto de linhas varia conforme os componentes selecionados:

**Beach Tennis:**
| Linha | Exibida quando |
|-------|----------------|
| Quadra de Beach Tennis + sistema de drenagem + areia | Sempre |
| Alambrado | `possui_alambrado = true` |
| Iluminação | `possui_iluminacao = true` |
| Acessórios | Sempre (para este produto) |
| Proteção EVA — Opcional | `possui_eva = true` |

**Quadra de Tênis / piso_asfaltico:**
| Linha | Exibida quando |
|-------|----------------|
| Piso — Quadra de Tênis — Base Asfáltica | Sempre |
| Acessório Tênis (postes, catraca, rede) | Sempre (1 ou 2 linhas) |
| Alambrado | `possui_alambrado = true` |
| Iluminação | `possui_iluminacao = true` |
| Playcushion — Opcional | `possui_playcushion = true` |

---

## Gaps — campos necessários ainda ausentes no formulário

| Campo | productId | Tipo | Finalidade |
|-------|-----------|------|------------|
| `tipo_areia` | `beach_tenis` | `select` (`rio` \| `quartzo`) | Condicionar slides de especificação da areia |
| `possui_eva` | `beach_tenis` | `checkbox` | Condicionar slide de Proteção EVA |

Slides das variantes `saibro` e `grama` da Quadra de Tênis, e slides de todos os demais produtos (`quadra_poliesportiva`, `campo`, `pickleball`, `padel`, `squash`, `pista`, `garagem_epoxi`, `softplay`) aguardam disponibilização de PDFs de proposta para mapeamento equivalente.

---

## Ordem de composição da proposta

```
[globais pré-produto, na ordem declarada]
  capa
  portfolio
  sobre_empresa
  pilares
  parceiros
  dados_cliente
  sumario

[para cada produto selecionado, na ordem de seleção]
  hero_{productId}
  [slides de variante aplicáveis, em orderWithinProduct]
  [slides condicionais aplicáveis, em orderWithinProduct]
  investimento_{productId}

[globais pós-produto, na ordem declarada]
  condicoes_pagamento_*
  prazos_garantia
  regras_contratada
  regras_contratante
  consideracoes_gerais
  encerramento
```
