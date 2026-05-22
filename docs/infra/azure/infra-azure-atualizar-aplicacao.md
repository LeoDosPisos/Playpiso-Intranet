# Atualizar a Aplicação Após Mudanças

Guia operacional do dia-a-dia: você fez alterações no código e precisa refletir na infra Azure. Diferente de [`infra-azure-cicd.md`](./infra-azure-cicd.md) (que explica **como** o pipeline funciona por dentro), aqui o foco é **o que você precisa fazer**.

## Princípio central

O pipeline [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) faz **tudo automaticamente** em qualquer `push` para a branch `main`: build das imagens Docker, push pro ACR, update dos Container Apps, deploy do frontend. Para a maioria das mudanças (~90% — qualquer alteração apenas em código de aplicação), o procedimento é literalmente `git push`.

## 1. Fluxo padrão (caso comum)

```bash
# Da raiz do projeto
git add <arquivos modificados>
git commit -m "<mensagem descritiva>"
git push                    # direto em main ou via PR + merge
gh run watch                # acompanha o run em tempo real
```

**Tempo total esperado:** ~2-3 min do push até "Apply complete" nos 5 jobs (`build-pptx-generator`, `build-proposta-api`, `deploy-frontend`, `deploy-pptx-generator`, `deploy-proposta-api`).

**Validação:** smoke test end-to-end documentado em [`infra-azure-outputs-dev.md`](./infra-azure-outputs-dev.md).

## 2. Pré-requisitos antes do push

Checklist rápido antes de empurrar:

- **Postgres não pausado.** Se você rodou `make pause`, faça `make resume` antes — o C# API falha conexão no startup se o DB estiver parado, e a primeira revisão fica unhealthy.
- **Lock files atualizados:**
  - `Frontend/package-lock.json` precisa refletir mudanças em `Frontend/package.json`. Rode `npm install` localmente; o lock atualiza sozinho.
  - `Backend/services/pptx-generator-service/requirements.txt` não tem lock real (Python aqui usa `requirements.txt` sem `pip-tools`). Validar com `pip install -r requirements.txt` localmente.
  - `Backend/*.csproj` — validar com `dotnet restore`. `.NET` não exige lock file separado.
- **Testes locais passando.** Para validar end-to-end antes de empurrar:
  ```bash
  docker compose up --build
  # Acessa http://localhost:3000 e testa o fluxo (sem login MSAL local)
  ```

## 3. Cenários que exigem passos extras

| O que mudou | Passo extra antes do push |
|---|---|
| **Apenas código de aplicação** (`*.cs`, `*.py`, `*.tsx`, etc.) | Nenhum — só push |
| `Frontend/package.json` (dependências novas) | `npm install` local, commitar `package-lock.json` junto |
| `requirements.txt` (deps Python) | Validar com `pip install -r requirements.txt` |
| `*.csproj` (deps .NET) | Validar com `dotnet restore` |
| **Schema do banco** (novo `.sql` em pasta de migrations) | Nenhum — DbUp aplica no startup do C# API. Se falhar, Container App fica unhealthy e mantém revisão antiga. Confira logs |
| **`Dockerfile`** de qualquer serviço | Nenhum — pipeline rebuilda automaticamente |
| **Variáveis VITE_*** (build-time do frontend) | Atualizar o secret correspondente: `gh secret set VITE_X --body "..."`. Depois push (build vai pegar o novo valor) |
| **Env vars de runtime dos Container Apps** (env vars no `infra/modules/container-apps/main.tf`) | Editar o módulo, depois `make deploy` (`terraform apply`). **Não basta push** porque env vars são definidas pelo Terraform, não pelo pipeline |
| **CORS allowlist** | Mesmo que acima — env var do Container App via Terraform |
| **`AllowedUsers__ObjectIds__*`** (nova pessoa autorizada) | Mesmo que acima — env var do Container App via Terraform |
| **Recursos Azure novos** (Storage extra, novo Container App, etc.) | Editar módulos em `infra/modules/`, depois `make deploy` |

> **Mental model:** o pipeline atualiza só o **conteúdo** (código + imagens). A **infra** (recursos e suas configurações) é responsabilidade do Terraform via `make deploy`. Se sua mudança altera configuração de recurso Azure, use Terraform; se altera só código, use push.

## 4. Trigger manual sem commit

Útil para re-executar o pipeline depois de mudar um secret ou para testar sem criar commit:

```bash
gh workflow run deploy.yml
gh run list --workflow=deploy.yml --limit 3
gh run watch                    # acompanha o último run
```

## 5. Verificação pós-deploy

1. **Status do workflow:**
   ```bash
   gh run view                   # último run
   ```
   Esperado: 5 jobs com check verde.
2. **Smoke test end-to-end** — ver [`infra-azure-outputs-dev.md`](./infra-azure-outputs-dev.md) seção "Smoke test end-to-end".
3. **Cold start** de até 30s na primeira request a cada Container App após o deploy (porque `min_replicas = 0`).
4. **Logs em caso de erro:**
   - Portal Azure → Container App `playpiso-proposta-dev-api` ou `playpiso-proposta-dev-pptx` → **Log stream** (live tail).
   - Ou Application Insights → Transaction search.
   - Erros de migration aparecem no log do startup do C# API.

## 6. Reverter rapidamente

Se o deploy quebrou produção, três opções em ordem de simplicidade:

### A. Roll back via Git (mais comum)

```bash
git revert HEAD               # cria commit de reversão do último
git push                      # pipeline roda de novo com versão anterior
```

Tempo: mesmo do deploy padrão (~2-3 min).

### B. Ativar uma revisão antiga do Container App diretamente

Cada update do Container App cria uma revisão nova; as antigas ficam disponíveis para reativação.

```bash
# Listar revisions disponíveis
az containerapp revision list \
  --name playpiso-proposta-dev-api \
  --resource-group playpiso-proposta-dev-rg \
  -o table

# Ativar uma revisão antiga (substitui a atual)
az containerapp revision activate \
  --name playpiso-proposta-dev-api \
  --resource-group playpiso-proposta-dev-rg \
  --revision <REVISION_NAME>
```

Tempo: ~30s. Útil quando você quer voltar imediatamente sem esperar o pipeline.

### C. Apontar pra uma tag específica de SHA do ACR

Cada job de build do `deploy.yml` empurra duas tags: `:latest` e `:$SHA` (SHA do commit). Por isso versões antigas continuam no ACR.

```bash
az containerapp update \
  --name playpiso-proposta-dev-api \
  --resource-group playpiso-proposta-dev-rg \
  --image playpisopropostadevacr.azurecr.io/proposta-api:<SHA_ANTERIOR>
```

Útil quando você sabe exatamente qual commit estava funcionando.

## Resumo visual

```
mudança em código de aplicação
    ↓
git push origin main
    ↓
deploy.yml dispara (5 jobs, ~2-3 min)
    ↓
gh run watch
    ↓
smoke test
```

```
mudança em IaC / env vars de Container App
    ↓
editar infra/modules/...
    ↓
make deploy   (terraform plan + apply)
    ↓
status: make status   (confere)
```

```
deploy quebrou
    ↓
git revert HEAD && git push           (caminho A — mais limpo)
    ou
az containerapp revision activate ...  (caminho B — mais rápido)
```
