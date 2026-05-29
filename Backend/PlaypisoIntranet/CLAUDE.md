# CLAUDE.md — proposta-api (ASP.NET Core 9 + Dapper)

> **Fonte de verdade:** os arquivos `.cs` deste diretório e as migrações SQL em
> `Migrations/`. Contrato com o frontend: `../../docs/contrato-dados-formulario-backend.md`.
> **Mapa geral do repo:** ver `../../CLAUDE.md` (raiz).
> _Última verificação: 2026-05-29._

REST API que persiste propostas no PostgreSQL e valida o JWT do Entra ID. Usa **Dapper**
(SQL direto, sem ORM) e **DbUp** para migrações (rodam automaticamente no boot).

## Estrutura

```
Program.cs                       # bootstrap, auth (Azure AD), DI, DbUp
appsettings.json                 # produção (sem secrets)
appsettings.Development.json     # dev local: auth desativada, localhost:5432
Controllers/ProposalsController.cs   # endpoints /api/proposals (CRUD)
DTOs/                            # CreateProposalDto, ProposalResponse
Models/                          # Proposal, ProposalProductGroup
Repositories/                    # IProposalRepository, ProposalRepository (SQL Dapper)
Services/PptxGeneratorClient.cs  # chama o pptx-generator
Infrastructure/                  # AllowedUsersOptions, DateOnlyTypeHandler,
                                 # UserClaimsLoggingMiddleware
Migrations/Vxxx__*.sql           # DbUp — ver "Migrações" abaixo
```

## Modelo de dados (2 tabelas)

- **`proposals`** — campos globais da proposta (cliente, obra, URLs pptx/xlsx, tracking de
  quem gerou). `xlsx_url` existe mas hoje é gravado como `null` (geração de XLSX ainda não
  plugada).
- **`proposal_product_groups`** — um por grupo de produto. Campos normalizados viram colunas
  individuais; o restante vai em **`specs` (JSONB)** via `[JsonExtensionData]`.

Fluxo do payload (frontend camelCase → colunas / JSONB): ver
`../../docs/contrato-dados-formulario-backend.md` e `Backend/db/README.md`.

## Migrações (DbUp)

- Adicionar coluna / renomear → criar **novo** arquivo `Migrations/Vxxx__descricao.sql`
  (numeração sequencial; nunca edite uma migração já aplicada). Roda no próximo boot.
- Renomear um `field_id` no frontend que vira coluna normalizada **exige** migração aqui.
  Histórico recente: V007 (email/endereço), V009 (alambrado), V010–V012 (portões, cor).

## Auth (Azure AD)

- Tokens chegam em **v1.0** (`upn`/`unique_name`), não v2.0; há fallback chain de 4 claims
  no `UserEmail`. Migração para v2.0 pendente.
- Em `Development` a autenticação é desativada (`AllowedUsers` retorna `true` para todos).

## Comandos

```bash
dotnet run        # http://localhost:5204 (dev); migrações aplicam no boot
dotnet build
```
