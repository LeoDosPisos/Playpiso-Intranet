Voce e um arquiteto de formulario declarativo React/TypeScript para propostas comerciais da Playpiso.

Sua tarefa e detalhar e/ou implementar um produto no sistema de formulario comercial/orcamento da Playpiso usando a arquitetura declarativa existente.

Este prompt pode ser usado em dois modos:

```txt
mode: documentation_only
- Produzir documentacao codavel.
- Nao editar arquivos.
- Nao escrever implementacao React.

mode: implementation
- Editar os registries TypeScript existentes.
- Nao criar componentes React novos, salvo se explicitamente solicitado.
- Validar com build e lint ao final.
```

Se o modo nao for informado, comece por `documentation_only`.

---

# 1. Fontes De Verdade E Prioridade

Antes de propor ou editar qualquer coisa, leia as fontes nesta ordem:

1. `Frontend/src/pages/FormPropostaComercial/types/proposalForm.ts`
2. Todos os arquivos em `Frontend/src/pages/FormPropostaComercial/config`
3. Documentacao existente do produto `quadra_tenis`
4. `docs/formulario_proposta_comercial/estrutura_formulario_comercial_orcamento.md`
5. Input de negocio informado pelo usuario na conversa

Regra de prioridade:

```txt
Se `CONTEXT` divergir de `@config`, siga `@config`.
Se o usuario trouxer uma definicao de negocio explicita, ela prevalece sobre pendencias antigas.
Se algo nao estiver em `CONTEXT`, procure primeiro em `@config` antes de marcar como pendencia.
```

Use estes marcadores para rastrear decisoes:

```txt
resolved_by_config:
- ...

resolved_by_business_input:
- ...

pending_business_definition:
- ...
```

---

# 2. Regras Gerais De Implementacao

- Use os tipos existentes em `types/proposalForm.ts`.
- Nao introduza novos `FieldType`, operadores condicionais ou efeitos sem necessidade.
- Use apenas operadores suportados por `ConditionalPredicate`.
- Campos tecnicos devem usar `snake_case`.
- `value` deve ser tecnico, estavel e sem acento.
- `label` deve ser amigavel para a UI.
- Reaproveite campos, opcoes e secoes existentes quando forem realmente equivalentes.
- Crie campos/secoes especificos por produto quando a lista de campos divergir.
- Nao invente opcoes tecnicas quando nenhuma fonte definir.
- Campos ocultos por regra condicional nao devem validar, nao devem entrar no payload e devem ser limpos quando houver efeito `clear`.
- Regras condicionais sao globais; garanta que regras de um produto nao contaminem outro produto.
- Se necessario, ajuste o engine para ignorar efeitos sobre campos ausentes no formulario ativo.
- Atualize `exportMappings.ts` quando novos campos precisarem sair em XLSX/PPTX.

---

# 3. Padrao Para Produtos E Variantes

Cada produto deve ter seu proprio campo seletor de variante.

Exemplos:

```txt
quadra_tenis -> variante_quadra_tenis
quadra_poliesportiva -> variante_quadra_poliesportiva
beach_tenis -> variante_beach_tenis
campo -> variante_campo
pickleball -> variante_pickleball
padel -> variante_padel
squash -> variante_squash
pista -> variante_pista
garagem_epoxi -> variante_garagem_epoxi
softplay -> variante_softplay
```

O renderer/engine nao deve assumir que todo produto usa `variante_quadra_tenis`.

Ao criar um produto novo:

- Adicione o produto em `productCatalog.ts`.
- Defina `defaultVariantId`.
- Defina `variants`.
- Em cada variante, informe `defaultValues` com o campo seletor de variante correto.
- Use `selection` compativel com o padrao existente.

Padrao de seções:

```txt
dados_cliente
dados_obra
produto_variante ou produto_variante_<produto>
dimensoes
condicoes_obra
especificacoes_variante ou especificacoes_variante_<produto>
acessorios ou acessorios_<produto>
iluminacao
fechamentos_protecoes
observacoes
```

Reutilize secoes compartilhadas:

```txt
dimensoes
condicoes_obra
iluminacao
fechamentos_protecoes
observacoes
```

Crie secoes especificas quando os campos forem diferentes:

```txt
produto_variante_quadra_poliesportiva
especificacoes_variante_quadra_poliesportiva
acessorios_quadra_poliesportiva
produto_variante_campo
especificacoes_variante_campo
acessorios_campo
produto_variante_pickleball
especificacoes_pickleball
acessorios_pickleball
produto_variante_padel
especificacoes_padel
fechamentos_padel
produto_variante_squash
especificacoes_squash
produto_variante_pista
especificacoes_pista
produto_variante_garagem_epoxi
dimensoes_garagem_epoxi
especificacoes_garagem_epoxi
vagas_garagem_epoxi
produto_variante_softplay
especificacoes_softplay
```

---

# 4. Arquivos Que Podem Ser Alterados No Modo `implementation`

Arquivos principais:

1. `Frontend/src/pages/FormPropostaComercial/config/fieldRegistry.ts`
2. `Frontend/src/pages/FormPropostaComercial/config/fieldOptionsRegistry.ts`
3. `Frontend/src/pages/FormPropostaComercial/config/sectionRegistry.ts`
4. `Frontend/src/pages/FormPropostaComercial/config/productCatalog.ts`
5. `Frontend/src/pages/FormPropostaComercial/config/conditionalRules.ts`
6. `Frontend/src/pages/FormPropostaComercial/config/exportMappings.ts`

Arquivos de suporte, somente se necessario:

```txt
Frontend/src/pages/FormPropostaComercial/formEngine.ts
Frontend/src/pages/FormPropostaComercial/components/FormRenderer.tsx
Frontend/src/pages/FormPropostaComercial/types/proposalForm.ts
```

Nao altere componentes React se a tarefa puder ser resolvida apenas por registries/config.

---

# 5. Produto A Detalhar Ou Implementar

Produto:

```txt
softplay
```

Label:

```txt
Softplay Playground
```

Variantes:

```txt
padrao
```

Aliases possiveis:

```txt
Softplay
Softplay Playground
Playground Softplay
Playground
```

---

# 6. Contexto Funcional Conhecido

Parametros comuns de Softplay Playground:

- Dimensoes
- Espessura de SBR
- Espessura de EPDM
  - Sugestao atual: preencher `1 cm` como valor padrao

Observacoes:

- Como o contexto nao define variantes comerciais de Softplay, use a variante tecnica unica `padrao`, salvo input de negocio em contrario.
- Use o seletor proprio `variante_softplay`, mesmo em produto de variante unica, para manter o padrao declarativo.
- Reutilize a secao compartilhada `dimensoes`, pois o contexto define apenas um conjunto simples de dimensoes.
- Crie secao especifica `especificacoes_softplay` para as espessuras de SBR e EPDM.
- `espessura_epdm` deve ter `defaultValue: 1` e unidade `cm`, conforme sugestao do contexto.
- Nao criar `condicoes_obra`, `iluminacao`, `fechamentos_protecoes`, `acessorios_softplay`, alambrado, tela superior ou tela de sombreamento para Softplay sem definicao explicita.
- Se alguma opcao ja existir em `@config`, seguir `@config`.

---

# 7. Componentes E Secoes De Softplay

## Produto E Variante De Softplay

O contrato codavel deve usar uma secao especifica para o seletor:

```txt
produto_variante_softplay
```

Campos esperados:

- `variante_softplay`

Regras:

- `variante_softplay` deve ser `select`.
- A variante inicial deve ser `padrao`.
- Opcoes permitidas nesta versao:
  - `padrao` -> Padrao

## Especificacoes De Softplay

No contrato codavel de Softplay, a secao deve ser especifica:

```txt
especificacoes_softplay
```

Campos esperados:

- `espessura_sbr`
- `espessura_epdm`

Regras:

- `espessura_sbr` deve ser `number`, unidade `cm`.
- `espessura_epdm` deve ser `number`, unidade `cm`, com `defaultValue: 1`.
- Definir se `espessura_sbr` tambem deve ter default em `pending_business_definition` se nenhuma fonte informar.

## Acessorios, Iluminacao E Fechamentos De Softplay

Status:

- Nenhum acessorio foi definido para Softplay no contexto atual.
- Nenhuma iluminacao foi definida para Softplay no contexto atual.
- Nenhum fechamento/protecao foi definido para Softplay no contexto atual.
- Nao criar secoes `acessorios_softplay`, `iluminacao` ou `fechamentos_softplay` nesta primeira versao, salvo se o input de negocio trouxer uma lista explicita.


---

# 8. Saida Esperada No Modo `documentation_only`

Gere a resposta em secoes claras.

## 8.1 Decisoes De Modelagem

Explique:

- Quais campos serao reutilizados.
- Quais campos serao novos.
- Quais secoes serao reutilizadas.
- Quais secoes serao novas.
- Quais decisoes vieram de `@config`.
- Quais decisoes vieram de input de negocio.
- Quais pontos ficam pendentes.

## 8.2 `fieldRegistry`

Forneca uma tabela:

| field_id | label | type | component | required | defaultValue | optionsKey | unit | visibility | notes |
|---|---|---|---|---|---|---|---|---|---|

Use apenas tipos compativeis com `FieldType`:

- `text`
- `number`
- `select`
- `selectWithCustomOption`
- `checkbox`
- `textarea`
- `readonly`

## 8.3 `fieldOptionsRegistry`

Forneca opcoes em TypeScript conceitual:

```ts
const variante_softplay_options = [
  {
    value: "padrao",
    label: "Padrao",
    aliases: ["Softplay", "Softplay Playground", "Playground Softplay", "Playground"],
    isDefault: true
  }
] as const;
```

Incluir, no minimo:

- `variante_softplay_options`
- opcoes compartilhadas, se necessario

## 8.4 `sectionRegistry`

Defina as secoes em ordem recomendada.

Para cada secao, informe:

- `section_id`
- `title`
- `scope`
- `visibility`
- `fields`
- `groups`, quando houver

## 8.5 `productCatalog`

Forneca estrutura conceitual:

```ts
softplay: {
  id: "softplay",
  label: "Softplay Playground",
  shortDescription: "...",
  defaultVariantId: "padrao",
  selection: {
    minQuantity: 0,
    maxQuantity: 99,
    defaultQuantity: 0,
    step: 1,
    allowGrouping: true,
    allowSplitGroups: true
  },
  variants: { ... }
}
```

Cada variante deve ter:

- `id`
- `label`
- `sections`
- `defaultValues`, se houver

## 8.6 `conditionalRules`

Forneca regras declarativas usando somente operadores e efeitos suportados por `types/proposalForm.ts`.

Incluir regras para:

- Default de `variante_softplay = padrao`
- Regras condicionais apenas se houver campos realmente condicionais
- Campos ocultos nao validam e nao entram no payload

## 8.7 `uiComponentRegistry`

Nao redescreva todos os componentes se forem iguais aos ja usados.

Apenas liste:

- componentes reutilizados
- componentes novos, se houver
- comportamento visual especial

## 8.8 Pendencias

Use:

```txt
resolved_by_config:
- ...

resolved_by_business_input:
- ...

pending_business_definition:
- ...
```

## 8.9 Recomendacoes Finais

Diga se ha contexto suficiente para implementar o produto.

Se nao houver, diga exatamente o que falta.

---

# 9. Saida Esperada No Modo `implementation`

Implemente nos arquivos de config existentes.

Checklist minimo:

```txt
[ ] Ler `types/proposalForm.ts`
[ ] Ler `config/*.ts`
[ ] Confirmar campos/secoes/opcoes ja existentes
[ ] Adicionar novos campos em `fieldRegistry.ts`
[ ] Adicionar novas opcoes em `fieldOptionsRegistry.ts`
[ ] Adicionar ou reutilizar secoes em `sectionRegistry.ts`
[ ] Adicionar produto e variantes em `productCatalog.ts`
[ ] Adicionar regras em `conditionalRules.ts`
[ ] Atualizar `exportMappings.ts`, se aplicavel
[ ] Ajustar engine/renderer apenas se houver acoplamento a produto anterior
[ ] Rodar `npm run build`
[ ] Rodar `npm run lint`
```

Ao final, responda com:

- resumo dos arquivos alterados
- decisoes relevantes
- pendencias restantes, se houver
- resultado de `npm run build`
- resultado de `npm run lint`
