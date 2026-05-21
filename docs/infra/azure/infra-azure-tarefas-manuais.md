# Tarefas Manuais — Infraestrutura Azure

Estas tarefas precisam ser realizadas **manualmente** (portal Azure, CLI ou e-mail) antes ou junto com a execução do Terraform. Estão ordenadas por dependência.

---

## 1. Pré-requisitos de acesso

### 1.1 Subscription Azure ativa
- Confirmar que existe uma Subscription ativa no tenant `a75f3ed1-64d2-4473-b836-0b7cb2db1542`
- Obter o `Subscription ID` via: `az account list --output table`
- O usuário que rodar o Terraform precisa da role **Contributor** na Subscription (ou nos Resource Groups criados)

### 1.2 Permissão para criar App Registrations
- Para configurar autenticação Azure AD em produção (seção 3), é necessário a role **Application Administrator** ou **Global Administrator** no tenant
- Verificar com administrador do tenant Playpiso

---

## 2. Estado remoto do Terraform (uma vez por projeto)

O estado do Terraform deve ser armazenado remotamente para que múltiplos desenvolvedores e a CI/CD possam compartilhá-lo com segurança.

### Criar Storage Account para tfstate (CLI)

```bash
# Autenticar
az login
az account set --subscription "<SUBSCRIPTION_ID>"

# Criar Resource Group dedicado ao tfstate (separado do app)
az group create \
  --name playpiso-tfstate-rg \
  --location brazilsouth

# Criar Storage Account (nome deve ser globalmente único, sem hífens, 3-24 chars)
az storage account create \
  --name playpisotfstate \
  --resource-group playpiso-tfstate-rg \
  --location brazilsouth \
  --sku Standard_LRS \
  --kind StorageV2

# Criar container para os arquivos de estado
az storage container create \
  --name tfstate \
  --account-name playpisotfstate
```

Após criar, preencher `infra/environments/dev/backend.tf` com o nome da storage account.

---

## 3. Azure AD — Expor API (necessário para autenticação em produção)

O frontend usa MSAL para obter um Bearer token e enviá-lo para a C# API. Para isso funcionar em produção, o App Registration precisa ter a API exposta.

**App Registration:** `d59319c0-6b41-497f-b233-447c78d9d391`
**Tenant:** `a75f3ed1-64d2-4473-b836-0b7cb2db1542`

### Passos no portal Azure (https://portal.azure.com)

1. Acesse **Azure Active Directory** → **App registrations**
2. Localize o app `d59319c0-6b41-497f-b233-447c78d9d391` (buscar pelo Client ID ou nome)
3. **Expose an API** → *Set Application ID URI*
   - Valor: `api://d59319c0-6b41-497f-b233-447c78d9d391`
   - Clicar **Save**
4. **+ Add a scope**
   - Scope name: `access_as_user`
   - Who can consent: `Admins and users`
   - Admin consent display name: `Access Proposta Comercial API`
   - Admin consent description: `Permite acesso à API de propostas comerciais`
   - State: **Enabled**
   - Clicar **Add scope**
5. **API permissions** → **+ Add a permission**
   - Aba **My APIs** → selecionar o próprio app
   - Selecionar `access_as_user`
   - Clicar **Add permissions**
6. **Grant admin consent for Playpiso** → confirmar

### Verificação

Após configurar, a variável de ambiente de produção deve ser:
```
VITE_API_SCOPE=api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user
```

> **Nota de desenvolvimento local:** `VITE_API_SCOPE` está vazio em `.env.development` intencionalmente — a C# API aceita requests sem token em modo `Development`. Ver `proposta-api/PlaypisoIntranet/Program.cs`.

---

## 4. AllowedUsers — Adicionar usuários autorizados

A C# API valida se o OID (Object ID) do usuário Azure AD está na lista `AllowedUsers.ObjectIds` em `appsettings.json`. Novos usuários precisam ser adicionados manualmente.

### Obter o OID de um usuário

```bash
# Via CLI (requer permissão de leitura no Azure AD)
az ad user show --id "email@playpiso.com.br" --query id -o tsv
```

Ou via portal: **Azure AD** → **Users** → clicar no usuário → campo **Object ID**

### Atualizar appsettings.json (produção)

Em `Backend/PlaypisoIntranet/appsettings.json`:
```json
"AllowedUsers": {
  "ObjectIds": ["<OID_usuario_1>", "<OID_usuario_2>"],
  "AdminObjectIds": ["<OID_admin_1>"]
}
```

**Ou via Key Vault** (preferível em produção): armazenar como secret e referenciar via env var no Container App:
```
AllowedUsers__ObjectIds__0=<OID>
AllowedUsers__AdminObjectIds__0=<OID>
```

---

## 5. Dockerfiles (já existentes — apenas validar)

Os Dockerfiles já existem no repositório:

- `Backend/Dockerfile` — C# .NET 9 (multi-stage SDK → ASP.NET runtime, porta 8080)
- `Backend/services/pptx-generator-service/Dockerfile` — Python 3.12 slim + FastAPI/Uvicorn (porta 8000)
- `Frontend/Dockerfile` — multi-stage Node 22 → Nginx (porta 80, usado apenas pelo `compose.yaml` em dev local; em produção o frontend vai pro Static Web App, não como container)

### Validar build local antes do primeiro push

```bash
# C# API
docker build -t proposta-api:local Backend
docker run --rm -p 8080:8080 -e ConnectionStrings__Default="<conn>" proposta-api:local

# Python service
docker build -t pptx-generator:local Backend/services/pptx-generator-service
docker run --rm -p 8000:8000 pptx-generator:local
```

Mais simples: usar `docker compose up --build` na raiz do projeto, que builda os três e sobe junto com Postgres local.

---

## 6. Configurar GitHub Actions (após Terraform)

Após `terraform apply`, os seguintes valores precisam ser configurados como **Secrets no GitHub** (Settings → Secrets and variables → Actions). O `.github/workflows/deploy.yml` falha sem qualquer um deles.

| Secret | Como obter |
|---|---|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --name "playpiso-github-actions" --role contributor --scopes /subscriptions/<SUB_ID>/resourceGroups/playpiso-proposta-dev-rg --sdk-auth` — copiar o JSON inteiro |
| `ACR_LOGIN_SERVER` | `terraform output -raw acr_login_server` |
| `ACR_USERNAME` | `az acr credential show -n <acr-name> --query username -o tsv` |
| `ACR_PASSWORD` | `az acr credential show -n <acr-name> --query 'passwords[0].value' -o tsv` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `terraform output -raw static_web_app_token` |
| `AZURE_RESOURCE_GROUP` | Nome do RG criado pelo Terraform (ex.: `playpiso-proposta-dev-rg`) |
| `ACA_PPTX_NAME` | Nome do Container App PPTX (ex.: `playpiso-proposta-dev-pptx`) |
| `ACA_API_NAME` | Nome do Container App C# (ex.: `playpiso-proposta-dev-api`) |
| `VITE_API_URL` | `https://` + `terraform output -raw microservice_fqdn` |
| `VITE_PROPOSTA_API_URL` | `https://` + `terraform output -raw backend_fqdn` |
| `VITE_API_SCOPE` | Fixo: `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` |
| `VITE_AZURE_CLIENT_ID` | Fixo: `d59319c0-6b41-497f-b233-447c78d9d391` |
| `VITE_AZURE_TENANT_ID` | Fixo: `a75f3ed1-64d2-4473-b836-0b7cb2db1542` |

Explicação detalhada de cada job que consome esses secrets: [`infra-azure-cicd.md`](./infra-azure-cicd.md).

---

## 7. Domínio customizado (futuro)

Não implementado por decisão (custo evitado de ~$12/ano). O sistema é acessado pela URL genérica do Static Web App. Passos completos para quando quiser implementar: [`infra-azure-dominio-customizado.md`](./infra-azure-dominio-customizado.md).

---

## Checklist de primeiro deploy

- [ ] Subscription Azure ativa com Contributor access (seção 1)
- [ ] Storage Account para tfstate criado (seção 2)
- [ ] `infra/environments/dev/backend.tf` preenchido com nome da storage account
- [ ] `infra/environments/dev/terraform.tfvars` criado a partir do `.example`
- [ ] Variáveis sensíveis exportadas: `TF_VAR_db_admin_password`, `TF_VAR_azure_tenant_id`, `TF_VAR_azure_client_id`
- [ ] Azure AD Expose an API configurado (seção 3) — **fazer antes do `terraform apply` se possível, mas pode ser depois**
- [ ] `terraform init && terraform validate && terraform plan` executados sem erros
- [ ] `terraform apply` executado — recursos criados no portal
- [ ] Dockerfiles validados localmente (seção 5)
- [ ] OIDs de usuários adicionados em `AllowedUsers__ObjectIds__*` no Container App (seção 4)
- [ ] GitHub Secrets configurados — todos os 13 (seção 6)
- [ ] Redirect URI do App Registration aponta para a URL do Static Web App
- [ ] `git push main` (ou workflow_dispatch) executa o pipeline com sucesso
- [ ] Smoke test: login Microsoft → preencher formulário → gerar proposta → download .pptx
