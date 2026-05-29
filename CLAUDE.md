# CLAUDE.md — Mapa do Projeto (entrypoint para devs e LLMs)

> **Para que serve este arquivo:** é o ponto de entrada único do repositório. Leia-o
> primeiro. Ele dá o mapa geral e, na seção **"Roteamento por tarefa"**, diz exatamente
> quais arquivos ler/editar para cada tipo de demanda — para você não varrer o repo inteiro.
>
> **Fonte de verdade:** o código sempre vence a documentação. Toda doc citada aqui declara
> no topo a sua própria fonte de verdade. Se uma doc divergir do código, **siga o código** e
> corrija a doc (ver "Disciplina de frescor" no fim).
>
> _Última verificação: 2026-05-29._

---

## 1. O que é o projeto

Sistema interno da Playpiso que **fortalece o fluxo informacional entre Comercial e
Orçamento**. O Comercial preenche **um formulário web** e o sistema produz, a partir dos
mesmos dados, **duas saídas**:

1. **Proposta comercial (`.pptx`)** — gerada e enviada ao cliente.
2. **Dados estruturados para Orçamento** — organizados para que o orçamentista colete e,
   em uma planilha Excel, calcule o custo.

```
                      ┌─────────────► .pptx (proposta p/ cliente)
Formulário web ──────►│
 (1 fonte de dados)   └─────────────► dados estruturados p/ Orçamento (→ .xlsx)
```

> **Estado atual do XLSX:** a *estruturação* dos dados de orçamento já existe
> (`exportMappings.xlsx` no frontend) e a coluna `xlsx_url` existe na tabela `proposals`,
> mas a *geração* do arquivo `.xlsx` ainda não está plugada (`xlsx_url` é gravado como
> `null`). Ver `Frontend/src/pages/FormPropostaComercial/config/exportMappings.ts`.

---

## 2. Arquitetura — 3 componentes

| Componente       | Tecnologia              | Pasta                                      | Porta (dev / docker) |
|------------------|-------------------------|--------------------------------------------|----------------------|
| `frontend`       | React 19 + Vite + MSAL  | `Frontend/`                                | 5173 / 3000          |
| `proposta-api`   | ASP.NET Core 9 + Dapper | `Backend/PlaypisoIntranet/`                | 5204 / 8080          |
| `pptx-generator` | Python 3.12 + FastAPI   | `Backend/services/pptx-generator-service/` | 8000 / 8000          |
| `postgres`       | PostgreSQL 16           | (migrations em `PlaypisoIntranet/Migrations/`) | 5432             |

Auth: **Microsoft Entra ID** (SSO, JWT Bearer). Infra: **Terraform** (`infra/`) + deploy via
**GitHub Actions** (`.github/workflows/deploy.yml`). Como rodar tudo: **`README.md`** (raiz).

### Fluxo de dados (resumo)

```
Frontend  config/*.ts (registries declarativos = fonte de verdade do formulário)
   │
   ├─ generation/buildApiPayload.ts ──► POST /api/proposals (proposta-api) ──► PostgreSQL
   │                                       (proposals + proposal_product_groups, specs JSONB)
   │
   └─ generation/buildPresentation.ts ──► POST /gerar-proposta (pptx-generator)
          + resolveSlideList.ts                │
                                               └─ monta .pptx a partir de templates em slides/
                                                  via substituição de placeholders
```

---

## 3. Roteamento por tarefa  (o que economiza seu contexto)

Encontre sua demanda, leia **só** os arquivos da linha, edite os indicados.

| Quero… | Leia primeiro | Edite (fonte de verdade) |
|---|---|---|
| **Adicionar/ajustar um produto** no formulário | `Frontend/docs/proposta-comercial/system-prompt.md` + `Frontend/docs/proposta-comercial/produtos/quadra-tenis/*` | `Frontend/src/pages/FormPropostaComercial/config/*.ts` |
| **Adicionar/alterar um campo** | `docs/formulario_proposta_comercial/estrutura_formulario_comercial_orcamento.md` | `config/fieldRegistry.ts`, `config/fieldOptionsRegistry.ts`, `config/sectionRegistry.ts` |
| **Regra condicional** (mostrar/ocultar/default de campo) | `Frontend/docs/proposta-comercial/produtos/quadra-tenis/04-conditional-rules.md` | `config/conditionalRules.ts` |
| **Mudar o que vai no `.pptx`** (campo → placeholder) | `docs/formulario_proposta_comercial/placeholder-map-quadra-tenis.md` | `config/slideRegistry.ts` + `pptx-generator-service/placeholder_engine.py` |
| **Adicionar/alterar um slide** do `.pptx` | `docs/formulario_proposta_comercial/slides-roadmap.md` + `Frontend/docs/proposta-comercial/pptx/mapeamento-slides.md` | `config/slideRegistry.ts`, templates em `pptx-generator-service/slides/<produto>/`, `dynamic_composer.py` |
| **Mudar o que sai para o Orçamento (XLSX)** | `docs/formulario_proposta_comercial/estrutura_formulario_comercial_orcamento.md` | `config/exportMappings.ts` (chave `xlsx`) |
| **Linha de investimento / catálogo de preço** no `.pptx` | — | `pptx-generator-service/investimento/builder.py`, `investimento/catalog.py`; `config` → `generation/resolveInvestimentoRows.ts` |
| **Mudar o que é salvo no banco** (payload/contrato) | `docs/contrato-dados-formulario-backend.md` | `generation/buildApiPayload.ts`, `PlaypisoIntranet/DTOs/`, `Repositories/ProposalRepository.cs` |
| **Migração de banco** (nova coluna, renomear) | `Backend/db/README.md` + `docs/contrato-dados-formulario-backend.md` | nova `PlaypisoIntranet/Migrations/Vxxx__*.sql` (DbUp roda no boot) |
| **Endereço / Google Maps** | `docs/integracao-google-maps-enderecos.md` | `FormPropostaComercial/components/maps/*` |
| **Auth / SSO / token** | `README.md` (seção Entra ID) | `Frontend/src/auth/msalConfig.ts`, `PlaypisoIntranet/Program.cs`, `Infrastructure/` |
| **Infra / deploy / Azure** | `infra/README.md` + `docs/infra/azure/*` | `infra/`, `.github/workflows/deploy.yml` |
| **Rodar local / Docker** | `README.md` + `docs/infra/docker-comandos-locais.md` | `compose.yaml`, `Makefile` |

> Detalhamento por subprojeto: ver os `CLAUDE.md` em `Frontend/`,
> `Backend/services/pptx-generator-service/` e `Backend/PlaypisoIntranet/`.

---

## 4. Convenções e armadilhas (leia antes de editar)

- **Registries declarativos são a fonte de verdade do formulário.** Quase toda mudança de
  produto/campo/seção é feita em `Frontend/src/pages/FormPropostaComercial/config/*.ts`,
  **sem** tocar em componentes React. Tipos em `types/proposalForm.ts`.
- **Dois caminhos de dados, dois casings:** salvar no banco usa **camelCase**; gerar PPTX
  usa **snake_case** (Python). Renomear o `id` normalizado de um campo exige **migration**
  no banco. Checklist completo: `docs/contrato-dados-formulario-backend.md`.
- **Campos técnicos** (`value`, `field_id`) em **snake_case**, estáveis, **sem acento**;
  `label` é amigável para a UI.
- **Campo condicional** que precisa de valor inicial deve receber `setDefault` **na regra**
  (`conditionalRules.ts`); `defaultValue` no registry é limpo pelos `elseEffects` no init.
- **Campo `hidden`** some da UI mas continua no payload/auto-fill; campo hidden **não pode
  ser `required`**.
- **Watcher de auto-commit:** a árvore de trabalho é commitada automaticamente (mensagem
  `"."`). **Mantenha a árvore sempre em estado válido** (build/lint passando).
- **Lockfile do Frontend:** `npm ci` falha sem `@emnapi/core` + `@emnapi/runtime` em
  `devDependencies` (bug de pruning do rolldown wasm). **Não remova.**
- Ao adicionar produto: cada produto tem seu próprio seletor de variante
  (`variante_<produto>`); o engine/renderer não pode assumir `variante_quadra_tenis`.

---

## 5. Mapa de documentação (onde mora cada coisa)

| Doc | Cobre | Fonte de verdade |
|---|---|---|
| `README.md` (raiz) | Como rodar (Docker/nativo), variáveis de ambiente, deploy | — (operacional) |
| `docs/contrato-dados-formulario-backend.md` | Contrato formulário → API → DB | `config/`, `DTOs/`, `ProposalRepository.cs` |
| `docs/formulario_proposta_comercial/` | Estrutura do formulário, placeholders, roadmap de slides | `config/*.ts` |
| `docs/integracao-google-maps-enderecos.md` | Autocomplete/geocoding de endereço | `components/maps/*` |
| `docs/infra/` | Azure, Railway, Docker local | `infra/`, `compose.yaml` |
| `Frontend/docs/proposta-comercial/` | Guia de produtos + `system-prompt.md` (prompt p/ LLM modelar produto) | `config/*.ts` |
| `Frontend/docs/frontend/` | Convenções de componente e styling | `Frontend/src/` |
| `Backend/services/pptx-generator-service/ARCHITECTURE.md` | Arquitetura do gerador PPTX | módulos `.py` do serviço |
| `Backend/db/README.md` | Modelo de dados e migrações | `PlaypisoIntranet/Migrations/` |
| `infra/README.md` | Terraform | `infra/` |

> **Doc com deriva conhecida:** `pptx-generator-service/ARCHITECTURE.md` descreve um
> `slide_merger.py` monolítico "a refatorar", mas o serviço **já foi modularizado**
> (`context_builder.py`, `dynamic_composer.py`, `placeholder_engine.py`,
> `presentation_builder.py`, `slide_copier.py`, `slide_registry.py`). Trate a fonte de
> verdade como o código até a doc ser atualizada.

---

## 6. Disciplina de frescor (como esta documentação não apodrece)

Documentação desatualizada custa **mais** tokens que documentação nenhuma — ela manda o
leitor para o lugar errado. Para evitar isso:

1. **Toda doc começa com um cabeçalho de frescor** (copie o padrão abaixo).
2. **A doc morre com o código:** todo PR que altera um arquivo deve atualizar a doc que o
   descreve (use a tabela da seção 5 para achar qual).
3. **Não duplique o que o código já diz.** Se a informação pode viver em tipos/schema/teste,
   ela vive lá e a doc apenas **aponta** para a fonte de verdade. A doc captura o que o
   código não diz: o *porquê*, o *fluxo entre áreas* e o *mapa de navegação*.

**Cabeçalho de frescor padrão** (topo de toda doc `.md`):

```markdown
> **Fonte de verdade:** `caminho/para/o/codigo` (a doc descreve; o código decide).
> **Arquivos-chave:** `a.ts`, `b.cs`, `c.py`
> _Última verificação: AAAA-MM-DD._
```
