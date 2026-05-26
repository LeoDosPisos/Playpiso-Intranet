# Estrutura do Formulário Comercial e Orçamento

Este documento descreve a estrutura consolidada do formulário `FormPropostaComercial`, responsável por coletar dados comerciais, parametrizar produtos selecionados e preparar as informações necessárias para geração de proposta comercial em `.pptx` e arquivo de orçamento em `.xlsx`.

A fonte de verdade deste documento é o conjunto de registries declarativos em:

```txt
vite-project/src/route/FormPropostaComercial/config
```

Quando houver divergência entre anotações antigas e os registries, prevalece o que estiver em `config`.

## Objetivo

- Reduzir o tempo gasto pelo Comercial na montagem manual de propostas comerciais.
- Reduzir o tempo gasto pelo Orçamento na leitura e transcrição dos dados da proposta.
- Padronizar os dados necessários para cálculo de custo.
- Gerar uma saída estruturada em Excel a partir dos campos preenchidos no formulário.
- Permitir geração de proposta comercial em PowerPoint com base nos placeholders mapeados.

## Arquitetura Declarativa

O formulário é composto por registries TypeScript independentes:

| Arquivo | Responsabilidade |
| --- | --- |
| `fieldRegistry.ts` | Define campos atômicos, tipos, obrigatoriedade base, unidade, `optionsKey`, defaults e chaves de exportação. |
| `fieldOptionsRegistry.ts` | Define opções de campos `select` e `selectWithCustomOption`, incluindo aliases e opções padrão. |
| `sectionRegistry.ts` | Define seções, ordem interna de campos, grupos condicionais e layout declarativo. |
| `productCatalog.ts` | Define produtos, variantes, seções por variante, defaults de produto e regras de seleção. |
| `conditionalRules.ts` | Define regras globais de visibilidade, obrigatoriedade, limpeza, defaults e cálculo. |
| `exportMappings.ts` | Define colunas do `.xlsx` e placeholders do `.pptx`. |

## Fluxo Planejado

1. O Comercial seleciona um ou mais produtos.
2. O sistema cria grupos de formulário por produto, respeitando quantidade, agrupamento e separação de grupos.
3. O Comercial preenche dados do cliente, obra, variante, dimensões e especificações do produto.
4. O motor do formulário aplica defaults, regras condicionais, campos obrigatórios e cálculos.
5. O sistema gera payload estruturado.
6. O payload alimenta exportações em `.xlsx` e, quando houver placeholder mapeado, `.pptx`.

## Modelo de Seleção de Produtos

Todos os produtos seguem a mesma configuração de seleção:

| Propriedade | Valor |
| --- | --- |
| `minQuantity` | `0` |
| `maxQuantity` | `99` |
| `defaultQuantity` | `0` |
| `step` | `1` |
| `allowGrouping` | `true` |
| `allowSplitGroups` | `true` |

Cada produto possui seu próprio campo seletor de variante. O renderer não deve assumir que todo produto usa `variante_quadra_tenis`.

## Campos Compartilhados

### Dados do Cliente

Seção `dados_cliente`, obrigatória.

| Campo | Tipo | Obrigatório base | Exportação |
| --- | --- | --- | --- |
| `nome_razao_social` | `text` | Sim | XLSX e PPTX |
| `cpf_cnpj` | `text` | Não | XLSX e PPTX |
| `nome_contato` | `text` | Não | XLSX e PPTX |
| `telefone` | `text` | Não | XLSX e PPTX |
| `email` | `text` | Não | XLSX e PPTX |

### Dados da Obra

Seção `dados_obra`, obrigatória.

| Campo | Tipo | Obrigatório base | Opções |
| --- | --- | --- | --- |
| `endereco_cliente` | `text` | Sim | - |
| `cidade` | `text` | Sim | - |
| `estado` | `text` | Sim | - |
| `tipo_projeto` | `select` | Sim | `obra_nova`, `reforma` |

### Dimensões

Seção `dimensoes`.

| Campo | Tipo | Unidade | Obrigatório base | Regra |
| --- | --- | --- | --- | --- |
| `largura` | `number` | `m` | Sim | Pode receber default por produto/variante. |
| `comprimento` | `number` | `m` | Sim | Pode receber default por produto/variante. |
| `area_total` | `number` | `m2` | Sim | Calculado por `largura * comprimento`, com sobrescrita manual permitida. |

### Condições da Obra

Seção `condicoes_obra`.

| Campo | Tipo | Obrigatório base | Opções |
| --- | --- | --- | --- |
| `tipo_terreno` | `select` | Sim | `solo_preparado`, `laje_concreto` |
| `dificuldade_acesso` | `select` | Sim | `facil`, `medio`, `dificil` |
| `responsavel_material_pedreira` | `select` | Sim | `playpiso`, `cliente` |

### Observações

Seção `observacoes`.

| Campo | Tipo | Obrigatório base |
| --- | --- | --- |
| `observacoes` | `textarea` | Não |

## Produtos Consolidados

### Quadra de Tênis

`productId`: `quadra_tenis`

Campo seletor de variante: `variante_quadra_tenis`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Piso Asfáltico | `piso_asfaltico` | Sim |
| Saibro | `saibro` | Não |
| Grama Natural | `grama_natural` | Não |

Seções:

```txt
dados_cliente
dados_obra
produto_variante
dimensoes
condicoes_obra
especificacoes_variante
iluminacao
fechamentos_protecoes
acessorios
observacoes
```

Defaults e regras:

- Todas as variantes de Quadra de Tênis iniciam com `largura = 18` e `comprimento = 36`.
- `piso_asfaltico` exibe e obriga `cor_piso_asfaltico`; também exibe `possui_playcushion`.
- `saibro` exibe `possui_kit_saibro`.
- `grama_natural` não exibe campos específicos (nenhum seletor de tipo de grama no formulário).
- `cor_piso_asfaltico = nao_padrao` exibe e obriga `especificar_cor`.
- A seção de acessórios contém apenas `incluir_rede_tenis`.

### Quadra Poliesportiva

`productId`: `quadra_poliesportiva`

Campo seletor de variante: `variante_quadra_poliesportiva`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Piso Asfáltica | `piso_asfaltico` | Sim |
| Assoalho | `assoalho` | Não |
| Epóxi | `epoxi` | Não |
| Poliuretano | `poliuretano` | Não |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_quadra_poliesportiva
dimensoes
condicoes_obra
especificacoes_variante_quadra_poliesportiva
acessorios_quadra_poliesportiva
iluminacao
fechamentos_protecoes
observacoes
```

Defaults e regras:

- `piso_asfaltico` não possui campos condicionais específicos.
- `assoalho` exibe e obriga `tipo_madeira`; o valor é interpolado nos slides PPTX via placeholder `{{tipo_madeira}}` (slides `hero_assoalho.pptx` e `specs_assoalho.pptx`).
- `epoxi` exibe e obriga `condicao_base_piso`.
- `poliuretano` exibe e obriga `tipo_poliuretano`. No PPTX o backend extrai o número puro do tipo (`b7→"7"`, `b9→"9"`, `b11→"11"`) e usa esse valor em dois placeholders: `{{tipo_poliuretano}}` (slides `hero_poliuretano.pptx` e `specs_poliuretano.pptx`) e `{{espessura_poliuretano}}` (slide `detalhe_construtivo_poliuretano.pptx`, valor derivado em `context_builder._build_group_context`).
- `anti_chama` aparece para `assoalho`, `poliuretano` e Squash, sempre opcional.
- `possui_basquete_adulto = true` exibe e obriga `estrutura_basquete_adulto`.

Slides registrados (Frontend + Backend):

- `piso_asfaltico`: `hero_piso_asfaltico_quadra_poliesportiva`, `specs_piso_asfaltico_quadra_poliesportiva`, `cores_piso_asfaltico_quadra_poliesportiva`, `investimento_piso_asfaltico_quadra_poliesportiva` (dynamic: investimento).
- `assoalho`: `hero_assoalho_quadra_poliesportiva`, `specs_assoalho_quadra_poliesportiva`, `detalhe_construtivo_assoalho_quadra_poliesportiva`, `investimento_assoalho_quadra_poliesportiva` (dynamic: investimento).
- `poliuretano`: `hero_poliuretano_quadra_poliesportiva`, `specs_poliuretano_quadra_poliesportiva`, `detalhe_construtivo_poliuretano_quadra_poliesportiva`, `recomendacao_execucao_poliuretano_quadra_poliesportiva` (conditional: `tipo_terreno == "laje_concreto"`), `investimento_poliuretano_quadra_poliesportiva` (dynamic: investimento).
- Compartilhados (todas as variantes): `acessorios_quadra_poliesportiva` (dynamic: acessorios), `fechamentos_quadra_poliesportiva` (dynamic: fechamentos).
- `epoxi`: ainda esqueletizada (sem slides registrados).

Acessórios:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `possui_basquete_adulto` | `checkbox` | Opcional; controla `estrutura_basquete_adulto`. |
| `estrutura_basquete_adulto` | `select` | Obrigatório quando basquete adulto estiver selecionado. |
| `possui_basquete_juvenil` | `checkbox` | Opcional. |
| `possui_volei` | `checkbox` | Opcional. |
| `possui_futebol_futsal` | `checkbox` | Opcional. |

### Beach Tênis

`productId`: `beach_tenis`

Campo seletor de variante: `variante_beach_tenis`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Padrão | `padrao` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_beach_tenis
dimensoes
condicoes_obra
especificacoes_beach_tenis
acessorios_beach_tenis
iluminacao
fechamentos_protecoes_beach_tenis
observacoes
```

Campos específicos:

| Campo | Tipo | Unidade | Obrigatório base |
| --- | --- | --- | --- |
| `espessura_areia` | `number` | `cm` | Sim |

Acessórios:

| Campo | Tipo |
| --- | --- |
| `possui_volei` | `checkbox` |

### Campo

`productId`: `campo`

Campo seletor de variante: `variante_campo`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Natural | `natural` | Sim |
| Sintético | `sintetico` | Não |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_campo
dimensoes
condicoes_obra
especificacoes_variante_campo
acessorios_campo
iluminacao
fechamentos_protecoes
observacoes
```

Regras:

- `natural` exibe e obriga `tipo_grama_natural`.
- `tipo_grama_natural = outros` exibe e obriga `especificar_tipo_grama_natural`.
- `sintetico` exibe e obriga `tipo_grama_sintetica`, `altura_grama_sintetica` e `base_drenante`.
- `sintetico` exibe `possui_shockpad`, mas o campo permanece opcional.
- `tipo_grama_sintetica = outros` exibe e obriga `especificar_tipo_grama_sintetica`.

Acessórios:

| Campo | Tipo |
| --- | --- |
| `possui_trave_3x2` | `checkbox` |
| `possui_trave_4x2` | `checkbox` |
| `possui_trave_5x2` | `checkbox` |
| `possui_trave_oficial` | `checkbox` |

### Pickleball

`productId`: `pickleball`

Campo seletor de variante: `variante_pickleball`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Padrão | `padrao` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_pickleball
dimensoes
condicoes_obra
especificacoes_pickleball
acessorios_pickleball
iluminacao
fechamentos_protecoes
observacoes
```

Regras:

- `cor_pickleball = nao_padrao` exibe e obriga `especificar_cor_pickleball`.
- `possui_rede_pickleball = true` exibe e obriga `tipo_rede_pickleball`.

### Padel

`productId`: `padel`

Campo seletor de variante: `variante_padel`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Grama Sintética | `grama_sintetica` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_padel
dimensoes
condicoes_obra
especificacoes_padel
fechamentos_padel
observacoes
```

Defaults:

- `largura = 10`
- `comprimento = 20`

Campos específicos:

| Campo | Tipo | Obrigatório base | Opções |
| --- | --- | --- | --- |
| `tipo_grama_padel` | `select` | Sim | `super_txt`, `txt`, `mondo` |
| `tipo_estrutura_alambrado_padel` | `select` | Sim | `estrutura_vidro`, `estrutura_especial` |

Padel não usa as seções genéricas `iluminacao` e `fechamentos_protecoes` no estado consolidado atual.

### Squash

`productId`: `squash`

Campo seletor de variante: `variante_squash`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Padrão | `padrao` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_squash
dimensoes
condicoes_obra
especificacoes_squash
iluminacao
observacoes
```

Defaults:

- `largura = 6.4`
- `comprimento = 9.75`

Regras:

- `tipo_madeira` é exibido e obrigatório para Squash padrão.
- `anti_chama` é exibido e permanece opcional.

### Pista

`productId`: `pista`

Campo seletor de variante: `variante_pista`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Mondo | `mondo` | Sim |
| PU 500 | `pu_500` | Não |
| PU 300 | `pu_300` | Não |
| PU 250 | `pu_250` | Não |
| PU 200 B | `pu_200_b` | Não |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_pista
dimensoes
condicoes_obra
especificacoes_pista
observacoes
```

Campos específicos:

| Campo | Tipo | Unidade | Obrigatório base | Regra |
| --- | --- | --- | --- | --- |
| `numero_raias` | `number` | `un` | Sim | Sempre presente na seção. |
| `opcao_pu_200_b_pista` | `select` | - | Sim quando visível | Exibido e obrigatório apenas quando `variante_pista = pu_200_b`. |

### Garagem Epóxi

`productId`: `garagem_epoxi`

Campo seletor de variante: `variante_garagem_epoxi`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Padrão | `padrao` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_garagem_epoxi
dimensoes_garagem_epoxi
especificacoes_garagem_epoxi
vagas_garagem_epoxi
observacoes
```

Dimensões específicas:

| Campo | Tipo | Unidade | Obrigatório base |
| --- | --- | --- | --- |
| `largura_piso_liso` | `number` | `m` | Sim |
| `comprimento_piso_liso` | `number` | `m` | Sim |
| `area_piso_liso` | `number` | `m2` | Sim |
| `largura_piso_derrapante` | `number` | `m` | Sim |
| `comprimento_piso_derrapante` | `number` | `m` | Sim |
| `area_piso_derrapante` | `number` | `m2` | Sim |

Especificações:

| Campo | Tipo | Unidade | Obrigatório base |
| --- | --- | --- | --- |
| `possui_multilayer_garagem_epoxi` | `checkbox` | - | Não |
| `condicao_base_piso_garagem_epoxi` | `select` | - | Sim |
| `metro_linear_faixa` | `number` | `m` | Sim |

Vagas:

| Gatilho | Campos exibidos e obrigatórios quando o gatilho for verdadeiro |
| --- | --- |
| `possui_vagas_carro` | `quantidade_vagas_carro`, `largura_vaga_carro`, `comprimento_vaga_carro` |
| `possui_vagas_moto` | `quantidade_vagas_moto`, `largura_vaga_moto`, `comprimento_vaga_moto` |
| `possui_vagas_bicicleta` | `quantidade_vagas_bicicleta`, `largura_vaga_bicicleta`, `comprimento_vaga_bicicleta` |
| `possui_vagas_pne` | `quantidade_vagas_pne`, `largura_vaga_pne`, `comprimento_vaga_pne` |

### Softplay Playground

`productId`: `softplay`

Campo seletor de variante: `variante_softplay`

| Variante | `variantId` | Default |
| --- | --- | --- |
| Padrão | `padrao` | Sim |

Seções:

```txt
dados_cliente
dados_obra
produto_variante_softplay
dimensoes
especificacoes_softplay
observacoes
```

Defaults:

- `espessura_epdm = 1`

Campos específicos:

| Campo | Tipo | Unidade | Obrigatório base |
| --- | --- | --- | --- |
| `espessura_sbr` | `number` | `cm` | Sim |
| `espessura_epdm` | `number` | `cm` | Sim |

Softplay não usa `condicoes_obra`, `iluminacao`, `fechamentos_protecoes` ou acessórios no estado consolidado atual.

## Componentes Reutilizáveis

### Iluminação

Seção `iluminacao`.

Campos:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `possui_iluminacao` | `checkbox` | Sempre visível quando a seção existir. |
| `iluminacao_fixada_alambrado` | `checkbox` | Visível quando `possui_iluminacao = true`. |
| `quantidade_postes_iluminacao` | `number` | Visível quando há iluminação, exceto quando a iluminação estiver fixada em alambrado. |
| `altura_postes_iluminacao` | `number` | Visível quando há iluminação, exceto quando a iluminação estiver fixada em alambrado. |
| `quantidade_projetores` | `number` | Obrigatório quando há iluminação. |
| `potencia_projetores` | `selectWithCustomOption` | Obrigatório quando há iluminação. |
| `especificar_potencia_projetores` | `text` | Obrigatório quando `potencia_projetores = outro`. |
| `quantidade_cruzetas` | `number` | Obrigatório quando há iluminação. |
| `responsavel_ligacao_eletrica` | `readonly` | Default sempre `cliente`. |
| `tipo_coligacao` | `select` | Obrigatório quando há iluminação. |

Regras:

- `possui_iluminacao = false` oculta, limpa e desobriga os campos internos.
- `iluminacao_fixada_alambrado = true` oculta, limpa e desobriga campos de postes próprios.
- `responsavel_ligacao_eletrica` tem valor padrão `cliente` e não é editável.

### Fechamentos e Proteções

Seção `fechamentos_protecoes` (compartilhada). Beach Tênis usa a variante `fechamentos_protecoes_beach_tenis`, que acrescenta o campo `sistema_alambrado_beach_tenis` ao grupo de dados do alambrado.

Campos:

| Campo | Tipo | Regra | Produtos |
| --- | --- | --- | --- |
| `possui_alambrado` | `checkbox` | Controla os campos técnicos de alambrado. | Todos |
| `sistema_alambrado_beach_tenis` | `select` | Obrigatório quando `possui_alambrado = true`. | Somente Beach Tênis |
| `comprimento_alambrado` | `number` | Obrigatório quando `possui_alambrado = true`. | Todos |
| `altura_alambrado` | `number` | Obrigatório quando `possui_alambrado = true`. | Todos |
| `espacamento_postes_tubos` | `number` | Obrigatório quando `possui_alambrado = true`. | Todos |
| `galvanizacao` | `selectWithCustomOption` | Obrigatório quando `possui_alambrado = true`. | Todos |
| `especificar_galvanizacao` | `text` | Obrigatório quando `galvanizacao = outro`. | Todos |
| `possui_trelica` | `checkbox` | Opcional quando `possui_alambrado = true`. | Todos |
| `travamento` | `multiselect` | Obrigatório quando `possui_alambrado = true`. Permite múltiplos valores simultâneos. | Todos |
| `possui_tela_superior` | `checkbox` | Independente de `possui_alambrado`. | Todos |
| `possui_tela_sombreamento` | `checkbox` | Independente de `possui_alambrado`. | Todos |
| `largura_sombreamento` | `number` | Obrigatório quando `possui_tela_sombreamento = true`. | Todos |
| `comprimento_sombreamento` | `number` | Obrigatório quando `possui_tela_sombreamento = true`. | Todos |

## Opções Consolidadas

| `optionsKey` | Valores |
| --- | --- |
| `variante_quadra_tenis` | `piso_asfaltico`, `saibro`, `grama_natural` |
| `variante_quadra_poliesportiva` | `piso_asfaltico`, `assoalho`, `epoxi`, `poliuretano` |
| `variante_beach_tenis` | `padrao` |
| `variante_campo` | `natural`, `sintetico` |
| `variante_pickleball` | `padrao` |
| `variante_padel` | `grama_sintetica` |
| `variante_squash` | `padrao` |
| `variante_pista` | `mondo`, `pu_500`, `pu_300`, `pu_250`, `pu_200_b` |
| `variante_garagem_epoxi` | `padrao` |
| `variante_softplay` | `padrao` |
| `tipo_projeto` | `obra_nova`, `reforma` |
| `tipo_terreno` | `solo_preparado`, `laje_concreto` |
| `dificuldade_acesso` | `facil`, `medio`, `dificil` |
| `responsavel_material_pedreira` | `playpiso`, `cliente` |
| `cor_piso_asfaltico` | `padrao`, `nao_padrao`, `azul` |
| `cor_pickleball` | `padrao`, `nao_padrao`, `azul` |
| `tipo_grama_natural` | `esmeralda`, `bermuda`, `bermuda_celebration`, `outros` |
| `tipo_grama_sintetica` | `soccer_pro`, `tturf`, `hero_shape`, `outros` |
| `tipo_grama_padel` | `super_txt`, `txt`, `mondo` |
| `altura_grama_sintetica` | `50_mm`, `60_mm` |
| `base_drenante` | `com_drenagem`, `sem_drenagem` |
| `tipo_madeira` | `grapia`, `cumaru`, `tauari` |
| `condicao_base_piso` | `boa`, `ruim` |
| `tipo_poliuretano` | `b7`, `b9`, `b11` |
| `estrutura_basquete` | `metalica`, `hidraulica`, `comum` |
| `tipo_rede_pickleball` | `fixo`, `removivel` |
| `tipo_coligacao` | `sem_coligacao`, `lateral`, `fundo` |
| `potencia_projetores` | `200`, `250`, `300`, `400`, `outro` |
| `galvanizacao` | `fogo`, `eletrolitico`, `outro` |
| `travamento` | `sem_travamento`, `travamento_inferior`, `travamento_intermediario`, `travamento_superior` (multiselect) |
| `sistema_alambrado_beach_tenis` | `gaiola`, `trapezio` |
| `tipo_estrutura_alambrado_padel` | `estrutura_vidro`, `estrutura_especial` |
| `opcao_pu_200_b_pista` | `b7`, `b9`, `b11` |

## Exportação

### XLSX

O mapeamento `xlsx.columns` contém colunas para dados do cliente, obra, variantes, dimensões, condições da obra, especificações por produto, iluminação, alambrado, acessórios, campos selecionados de Garagem Epóxi, Softplay e observações.

No estado atual, a exportação de Garagem Epóxi em `exportMappings.ts` inclui variante, áreas de piso liso e derrapante, multilayer, condição da base/piso e metro linear de faixa. Os campos detalhados de largura, comprimento e vagas existem no `fieldRegistry`, mas ainda não possuem colunas explícitas em `xlsx.columns`.

Campos que não estiverem visíveis ou forem limpos pelas regras condicionais não devem ser considerados como dados ativos do produto no payload final.

### PPTX

O mapeamento `pptx.placeholders` cobre o estado atual de placeholders disponíveis. Ele é mais seletivo que o XLSX e inclui principalmente:

- cliente;
- variantes de produto;
- campos principais de dimensões;
- campos de Pista;
- campos de Softplay;
- campos principais de condições da obra;
- campos específicos de Padel;
- campos específicos de Quadra Poliesportiva Assoalho (`tipo_madeira`);
- campos específicos de Quadra Poliesportiva Poliuretano (`tipo_poliuretano` e `espessura_poliuretano` — ambos renderizam o número puro extraído do tipo selecionado; `espessura_poliuretano` é derivado no backend, não existe como campo do formulário);
- observações.

Novos placeholders de PowerPoint devem ser adicionados explicitamente em `exportMappings.ts` quando o template `.pptx` passar a esperá-los.

## Regras Globais de Implementação

- Os registries em `config` são a fonte de verdade funcional.
- Campos técnicos usam `snake_case`.
- Valores de opções usam identificadores técnicos, estáveis e sem acento.
- Labels e documentação devem seguir português do Brasil.
- Seções compartilhadas devem ser reutilizadas quando a composição de campos for compatível.
- Produtos com campos divergentes devem usar seções específicas.
- Campos ocultos por regra condicional devem ser limpos e desobrigados quando houver `clear` e `unrequire`.
- Defaults de variante devem ser definidos no `productCatalog` ou em `conditionalRules`, conforme o padrão existente.
- O renderer deve montar o formulário a partir de `productCatalog`, `sectionRegistry`, `fieldRegistry`, `fieldOptionsRegistry` e `conditionalRules`, sem hardcode de produto específico.

## Pendências Reais

As pendências antigas que divergiam do `config` foram removidas. No estado atual, as únicas pendências documentáveis são evoluções futuras:

- Expandir `pptx.placeholders` conforme novos templates de PowerPoint forem definidos.
- Completar `xlsx.columns` para campos detalhados de Garagem Epóxi, caso o orçamento precise receber largura, comprimento e dados de vagas.
- Revisar labels dos arquivos TypeScript para acentuação na UI, caso a equipe decida normalizar também o código além da documentação.
- Adicionar novas opções técnicas apenas quando houver definição de negócio aprovada e refletida em `fieldOptionsRegistry.ts`.
