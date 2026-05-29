# CLAUDE.md — Frontend (React 19 + Vite + MSAL)

> **Fonte de verdade:** os registries declarativos em
> `src/pages/FormPropostaComercial/config/*.ts` e os tipos em
> `src/pages/FormPropostaComercial/types/proposalForm.ts`.
> **Mapa geral do repo:** ver `../CLAUDE.md` (raiz).
> _Última verificação: 2026-05-29._

UI do formulário de proposta comercial. O formulário é **declarativo**: você modela
produtos/campos/seções editando registries de configuração, **sem** escrever componentes
React novos (salvo se explicitamente necessário).

## Estrutura

```
src/
├── main.tsx                       # entry
├── api/proposalsApi.ts            # cliente HTTP da proposta-api (CRUD + URLs pptx/xlsx)
├── auth/msalConfig.ts             # config SSO Entra ID (MSAL)
├── styles/                        # global.css, reset.css, tokens.css, utilities.css
└── pages/FormPropostaComercial/
    ├── config/                    # ⭐ FONTE DE VERDADE do formulário
    │   ├── fieldRegistry.ts          # campos atômicos (tipo, required, unidade, defaults)
    │   ├── fieldOptionsRegistry.ts   # opções de select + aliases + default
    │   ├── sectionRegistry.ts        # seções, ordem de campos, grupos condicionais
    │   ├── productCatalog.ts         # produtos, variantes, seções por variante
    │   ├── conditionalRules.ts       # regras globais (mostrar/ocultar/setDefault/clear)
    │   ├── exportMappings.ts         # campo → coluna XLSX (Orçamento) e PPTX
    │   └── slideRegistry.ts          # quais slides .pptx e em que ordem
    ├── types/proposalForm.ts      # tipos: FieldType, ConditionalPredicate, efeitos…
    ├── formEngine.ts              # avalia regras condicionais e estado do formulário
    ├── generation/                # monta payloads de saída
    │   ├── buildApiPayload.ts        # form → payload p/ POST /api/proposals (camelCase)
    │   ├── buildPresentation.ts      # form → chamada ao pptx-generator
    │   ├── resolveSlideList.ts       # decide a lista de slides ativos
    │   ├── resolveInvestimentoRows.ts# linhas de investimento
    │   └── renderSumarioText.ts      # texto do sumário (convenção de plural — ver abaixo)
    ├── components/                # FormRenderer, SectionRenderer, ProductCarousel,
    │   │                          # ProductGroupWorkspace, SplitGroupDialog
    │   └── maps/                   # autocomplete/geocoding de endereço (Google Maps)
    ├── domain/                    # cpfCnpj.ts, proposalStructure.ts
    └── history/proposalHistory.ts # histórico de propostas
```

## Regras (ver detalhes em `../CLAUDE.md` §4)

- Mudança de produto/campo → edite `config/*.ts`, não componentes.
- `field_id`/`value` em **snake_case**, sem acento; `label` amigável.
- Default de campo condicional → `setDefault` na regra, não `defaultValue` no registry.
- Campo `hidden` permanece no payload mas não na UI; não pode ser `required`.
- Convenção de plural do sumário: marcador `(s)` em `sumarioTemplate` é expandido por
  quantidade em `renderSumarioText.ts` — marque toda palavra que varia, com gênero correto.
- Novos campos que precisam sair em XLSX/PPTX → atualize `exportMappings.ts`.
- **Lockfile:** não remova `@emnapi/core`/`@emnapi/runtime` de `devDependencies`.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173 (SSO funciona)
npm run build      # valide ao final de uma mudança
npm run lint
```

## Guias de apoio
- Modelar um produto novo: `docs/proposta-comercial/system-prompt.md`
- Exemplo completo de produto: `docs/proposta-comercial/produtos/quadra-tenis/01..08`
- Convenções de componente/estilo: `docs/frontend/`
