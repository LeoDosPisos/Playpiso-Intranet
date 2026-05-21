# CI/CD — GitHub Actions para Azure

Como o sistema é hospedado na Azure a partir de `git push`. Workflow único: [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml).

## Triggers

- `push` na branch `main` (deploy automático).
- `workflow_dispatch` (disparo manual via aba Actions do GitHub).

## Diagrama de jobs

```
push main
  ├─ build-pptx-generator ──► deploy-pptx-generator
  ├─ build-proposta-api   ──► deploy-proposta-api
  └─ deploy-frontend (independente)
```

Cinco jobs no total. Os dois pares `build → deploy` são sequenciais entre si mas paralelos com o outro par. O `deploy-frontend` não depende de nada e roda em paralelo com tudo.

## Jobs em detalhe

| Job | Contexto Docker / Diretório | Ação principal | Tags geradas | Autenticação |
|---|---|---|---|---|
| `build-pptx-generator` | `Backend/services/pptx-generator-service` | `docker/build-push-action@v5` → push ACR | `pptx-generator:$SHA` e `:latest` | `ACR_USERNAME` + `ACR_PASSWORD` |
| `build-proposta-api` | `Backend` (C# .NET 9) | `docker/build-push-action@v5` → push ACR | `proposta-api:$SHA` e `:latest` | `ACR_USERNAME` + `ACR_PASSWORD` |
| `deploy-frontend` | `Frontend` | `npm ci && npm run build` (injetando `VITE_*` no build) → `azure/static-web-apps-deploy@v1` com `app_location: Frontend/dist` e `skip_app_build: true` | — | `AZURE_STATIC_WEB_APPS_API_TOKEN` |
| `deploy-pptx-generator` | — | `az containerapp update --image $ACR/pptx-generator:$SHA` | — | Service Principal via `AZURE_CREDENTIALS` |
| `deploy-proposta-api` | — | `az containerapp update --image $ACR/proposta-api:$SHA` | — | Service Principal via `AZURE_CREDENTIALS` |

**Modelo mental:** build & push imagem, depois `az containerapp update` aponta o Container App para a nova tag. O Container App faz rolling update sozinho, zero downtime. O frontend é estático: build local no runner, upload do `dist/` para o Static Web App.

## Secrets do repositório

Configurados em **Settings → Secrets and variables → Actions**.

| Secret | Origem | Quem usa |
|---|---|---|
| `AZURE_CREDENTIALS` | Output de `az ad sp create-for-rbac ... --sdk-auth` (JSON com `clientId`, `clientSecret`, `subscriptionId`, `tenantId`) | `azure/login@v2` nos jobs de deploy |
| `ACR_LOGIN_SERVER` | Terraform output `acr_login_server` | Login Docker + tags das imagens |
| `ACR_USERNAME` | `az acr credential show` ou Terraform | Login Docker |
| `ACR_PASSWORD` | `az acr credential show` ou Terraform | Login Docker |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Terraform output `static_web_app_token` (sensível) | Deploy do frontend |
| `AZURE_RESOURCE_GROUP` | Nome fixo: `playpiso-proposta-dev-rg` | Comandos `az containerapp update` |
| `ACA_PPTX_NAME` | Nome do Container App: `playpiso-proposta-dev-pptx` | `az containerapp update --name` |
| `ACA_API_NAME` | Nome do Container App: `playpiso-proposta-dev-api` | `az containerapp update --name` |
| `VITE_API_URL` | Terraform output `microservice_fqdn` (com `https://`) | Build do frontend |
| `VITE_PROPOSTA_API_URL` | Terraform output `backend_fqdn` (com `https://`) | Build do frontend |
| `VITE_API_SCOPE` | Fixo: `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` | Build do frontend |
| `VITE_AZURE_CLIENT_ID` | Fixo: `d59319c0-6b41-497f-b233-447c78d9d391` | Build do frontend |
| `VITE_AZURE_TENANT_ID` | Fixo: `a75f3ed1-64d2-4473-b836-0b7cb2db1542` | Build do frontend |

Procedimento de geração do Service Principal está em [`infra-azure-tarefas-manuais.md`](./infra-azure-tarefas-manuais.md).

## Banco de dados está fora do pipeline (de propósito)

PostgreSQL **não aparece** no `deploy.yml`, e isso é intencional:

- O `infra/modules/database/main.tf` cria um **Azure Database for PostgreSQL Flexible Server** — serviço gerenciado pela Azure (backup automático, alta disponibilidade, patches). Containerizar Postgres em produção perde tudo isso.
- Banco é **infraestrutura** (provisionado uma única vez via `terraform apply`); aplicação é **código** (deploy a cada push). Ciclos de vida separados → pipelines separados.
- O Postgres no [`compose.yaml`](../../../compose.yaml) existe **apenas para desenvolvimento local**, não tem nada a ver com produção.
- **Migrations** rodam automaticamente no startup da C# API via **DbUp**. Quando o job `deploy-proposta-api` faz `az containerapp update`, o novo container sobe, DbUp conecta no banco, aplica scripts SQL pendentes e só então a API começa a aceitar tráfego. Se uma migration falhar, o container não fica `Healthy` e o Container App mantém a revisão antiga servindo.

## Como descobrir a URL pública do sistema

Três formas equivalentes:

```bash
# Via Terraform (mais rápido se você está em infra/environments/dev)
cd infra/environments/dev
terraform output frontend_url

# Via Azure CLI
az staticwebapp show \
  --name playpiso-proposta-dev-swa \
  --resource-group playpiso-proposta-dev-rg \
  --query defaultHostname -o tsv
```

Ou no Portal Azure: Resource Group `playpiso-proposta-dev-rg` → Static Web App `playpiso-proposta-dev-swa` → campo **URL** no overview.

A URL é algo como `playpiso-proposta-dev-swa-<random>.azurestaticapps.net`, com HTTPS e certificado gerenciado pela Azure. É essa que você compartilha com usuários enquanto não houver domínio customizado (ver [`infra-azure-dominio-customizado.md`](./infra-azure-dominio-customizado.md)).

## Troubleshooting comum

**Build falha em `docker/login-action`:**
- Confira `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` no GitHub. Senha pode ter sido regenerada — refaça `az acr credential show -n <acr-name>`.

**Build sobe pro ACR mas Container App não atualiza:**
- Veja o output do `az containerapp update` na aba Actions. Erros comuns: nome errado em `ACA_*_NAME`, Service Principal sem role `Contributor` no Resource Group, imagem com tag `$SHA` ainda não disponível (job de build deveria ter `needs:` correto).

**Container App atualiza mas fica unhealthy:**
- Logs em Portal → Container App → **Log stream**, ou via Application Insights. Causas comuns: migration falhou no startup (DbUp), connection string do Key Vault inacessível (Managed Identity perdeu acesso), variável de ambiente faltando.

**Frontend builda mas não consegue chamar a API (CORS):**
- C# API precisa ter o domínio do frontend em `Cors__AllowedOrigins__0` (env var configurada via Terraform em `infra/modules/container-apps/main.tf`). Quando trocar o domínio do frontend, atualize ali e refaça `terraform apply`.

**Login Microsoft falha após mudar URL do frontend:**
- O App Registration `d59319c0-...` tem uma allowlist de redirect URIs. Adicione a nova URL em Azure Portal → Azure Active Directory → App registrations → Authentication → Redirect URIs.

**`npm ci` falha com "lockfileVersion >= 1" no `deploy-frontend`:**
- Sintoma: `npm error The npm ci command can only install with an existing package-lock.json or npm-shrinkwrap.json with lockfileVersion >= 1`.
- Causa: `Frontend/package-lock.json` está no `.gitignore` raiz, então não foi commitado. `npm ci` exige o lock file no repositório para garantir build determinístico — sem ele, falha.
- Solução: remover a linha `package-lock.json` do `.gitignore` raiz, commitar tanto o `.gitignore` quanto o `Frontend/package-lock.json` (já gerado localmente por `npm install`) e fazer push em `main`. Lockfiles devem ser versionados — é o padrão de mercado para JS, Python (`poetry.lock`, `Pipfile.lock`), Ruby (`Gemfile.lock`), etc.
