# Mapa de Placeholders — slides/quadra_tenis/

Auditoria de todas as strings `{{ chave }}` encontradas nos arquivos `.pptx` do produto **Quadra de Tênis** e slides globais, com mapeamento para campos do formulário e registro de gaps.

---

## Slides globais (afetam todos os produtos)

### `slides/head.pptx`

| Placeholder | Campo do formulário | Injetado em `_build_context()`? |
|---|---|---|
| `{{ nome_razao_social }}` | `globalValues.nome_razao_social` | ✅ |
| `{{ nome_contato }}` | `globalValues.nome_contato` | ✅ |
| `{{ endereco_obra }}` | `globalValues.endereco_obra` | ✅ |
| `{{ local_obra }}` | `globalValues.local_obra` | ✅ |
| `{{ telefone }}` | `globalValues.telefone` | ✅ |
| `{{ email }}` | `globalValues.email` | ✅ |
| `{{ sumario }}` | `productGroups[].sumarioText` (joined) | ✅ |

### `slides/global/dados_cliente.pptx`

| Placeholder (conforme no arquivo) | Campo do formulário | Status |
|---|---|---|
| `{{  nome_razao_social}}` | `globalValues.nome_razao_social` | ⚠️ **Typo**: espaço duplo antes de `nome` |
| `{{ endereco_obra }}` | `globalValues.endereco_obra` | ✅ |
| `{{ local_obra }}` | `globalValues.local_obra` | ✅ |
| `{{ nome_contato }}` | `globalValues.nome_contato` | ✅ |
| `{{ telefone }}` | `globalValues.telefone` | ✅ |
| `{{\xa0email }}` | `globalValues.email` | ⚠️ **Typo**: non-breaking space (`\xa0`) após `{{` |

> Os typos impedem a substituição — `_replace_in_paragraph` não encontra a chave com espaços extras.
> Corrigir no PowerPoint: normalizar para `{{ nome_razao_social }}` e `{{ email }}`.

### `slides/global/sumario.pptx`

| Placeholder | Origem | Status |
|---|---|---|
| `{{ sumario }}` | `productGroups[].sumarioText` (joined por `\n`) | ✅ |

---

## Slides de quadra_tenis/

### `alambrado_iluminacao_quadra_tenis.pptx` — único com placeholders

| Placeholder (conforme no arquivo) | Campo do formulário | Injetado? | Observação |
|---|---|---|---|
| `{{ altura_alambrado }}` | `productGroup.values.altura_alambrado` | ❌ | Campo normalizado (`alturaAlambrado`) |
| `{{ galvanizacao }}` | `productGroup.values.galvanizacao` | ❌ | |
| `{{ potencia_projetores }}` | `productGroup.values.potencia_projetores` | ❌ | |
| `{{ quantidade_cruzetas }}` | `productGroup.values.quantidade_cruzetas` | ❌ | |
| `{{ quantidade_portoes }}` | `productGroup.values.quantidade_portoes` | ❌ | **Ausente no `exportMappings.ts` e no formulário** |
| `{{ quantidade_postes_ilumincao }}` | `productGroup.values.quantidade_postes_iluminacao` | ❌ | ⚠️ **Typo no slide**: `ilumincao` (falta `a`) |
| `{{ quantidade_projetores }}` | `productGroup.values.quantidade_projetores` | ❌ | |

Contexto dos textos onde cada placeholder aparece:

```
"Fundos com {{ altura_alambrado }}m de altura de tela e laterais em sistema trapézio com corrimão de 1,00m;"
"{{ quantidade_portoes }} portões de acesso com dimensões de 1,00m x 1,00m;"
"Tubos galvanizados {{ galvanizacao }}, sendo os tubos verticais com diâmetro de 48,30mm..."
"{{ quantidade_projetores }} projetores em módulo de LED {{ potencia_projetores }}W;"
"{{ quantidade_postes_ilumincao }} postes telecônicos metálicos, galvanizados a fogo..."
"{{ quantidade_cruzetas }} cruzetas simples para xx projetores, galvanizadas a fogo..."
```

### Slides estáticos (sem placeholders)

| Arquivo | Tipo de conteúdo | Candidato futuro? |
|---|---|---|
| `acessorio.pptx` | Texto fixo — postes, rede, catraca | Não |
| `cores_piso_asfaltico.pptx` | Paleta de 12 cores fixas | Possível: `{{ cor_quadra }}` para destaque |
| `detalhe_construtivo.pptx` | Diagrama/imagem | Não |
| `detalhe_construtivo_sem_playcushion.pptx` | Diagrama/imagem | Não |
| `hero_piso_asfaltico.pptx` | Imagem hero | Não |
| `playcushion.pptx` | Texto fixo sobre playcushion | Não |
| `specs_piso_asfaltico.pptx` | Lista de especificações fixa (9 itens) | Não |

### `investimento_quadra_tenis.pptx` — tabela com valores hardcoded

A tabela (7 linhas × 4 colunas: Descrição, Qtde., Unid., Valor) não tem placeholders. Valores atuais e candidatos futuros:

| Linha | Descrição | Qtde. atual | Campo candidato |
|---|---|---|---|
| 1 | Piso – Quadra de Tênis – Base Asfáltica | `648,00` m² | `{{ area_total }}` |
| 2 | Acessório Tênis – Postes, catraca, rede | `1,00` Conjunto | fixo |
| 3 | Alambrado | `0,00` m² | `{{ area_alambrado }}` (a calcular) |
| 4 | Iluminação | `0,00` Conjunto | `{{ quantidade_projetores }}` + `{{ potencia_projetores }}` na descrição |
| 5 | Playcushion | `0,00` m² | `{{ area_total }}` condicional (`possui_playcushion`) |
| 6 | VALOR TOTAL | — | calculado externamente |

> Placeholders no slide de investimento estão fora do escopo desta auditoria — requerem decisão sobre cálculo de preços.

---

## Gaps a resolver

### Gap 1 — `slide_merger.py` não injeta valores do produto

`_build_context()` em `slide_merger.py:180-192` só lê `globalValues`. Os 7 placeholders de `alambrado_iluminacao_quadra_tenis.pptx` vêm de `productGroups[].values` e nunca são substituídos.

**Solução necessária:** expandir o contexto com os valores do grupo de produto ao processar slides específicos de produto.

### Gap 2 — `quantidade_portoes` não existe no formulário

O placeholder `{{ quantidade_portoes }}` está no slide mas não aparece em:
- `exportMappings.ts`
- `fieldRegistry.ts`
- Nenhuma seção do formulário

**Ação:** definir se o campo deve ser adicionado ao formulário ou se o valor é fixo.

### Gap 3 — Typos em slides impedem substituição

| Arquivo | Typo | Correção |
|---|---|---|
| `dados_cliente.pptx` | `{{  nome_razao_social}}` | `{{ nome_razao_social }}` |
| `dados_cliente.pptx` | `{{\xa0email }}` | `{{ email }}` |
| `alambrado_iluminacao_quadra_tenis.pptx` | `{{ quantidade_postes_ilumincao }}` | `{{ quantidade_postes_iluminacao }}` |

**Ação:** corrigir diretamente no PowerPoint e re-exportar o `.pptx`.

---

## Referências de código

| Arquivo | Relevância |
|---|---|
| `pptx-generator-service/slide_merger.py:180-192` | `_build_context()` — onde o contexto de substituição é montado |
| `pptx-generator-service/slide_merger.py:195-221` | `_replace_placeholders()` e `_replace_in_paragraph()` |
| `Frontend/src/route/FormPropostaComercial/config/exportMappings.ts` | Mapeamento campo → placeholder para PPTX |
| `Frontend/src/route/FormPropostaComercial/config/fieldRegistry.ts` | Definições de todos os campos do formulário |
