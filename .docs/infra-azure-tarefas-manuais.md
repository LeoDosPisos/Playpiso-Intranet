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

> **Nota de desenvolvimento local:** `VITE_API_SCOPE` está vazio em `.env.development` intencionalmente — a C# API aceita requests sem token em modo `Development`. Ver `proposta-api/PropostaComercialApi/Program.cs`.

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

Em `Backend/PropostaComercialApi/appsettings.json`:
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

## 5. Criar Dockerfiles (pré-requisito para Container Apps)

Os Dockerfiles não existem ainda. Precisam ser criados antes do primeiro deploy.

### `Backend/PropostaComercialApi/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY PropostaComercialApi.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "PropostaComercialApi.dll"]
```

### `pptx-generator-service/Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Testar as imagens localmente antes de fazer push para ACR

```bash
# C# API
cd Backend/PropostaComercialApi
docker build -t proposta-api:local .
docker run -p 8080:8080 -e ConnectionStrings__Default="<conn>" proposta-api:local

# Python service
cd pptx-generator-service
docker build -t pptx-generator:local .
docker run -p 8000:8000 pptx-generator:local
```

---

## 6. Configurar GitHub Actions (após Terraform)

Após `terraform apply`, os seguintes valores precisam ser configurados como **Secrets no GitHub** do repositório:

| Secret | Como obter |
|---|---|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --name "playpiso-github-actions" --role contributor --scopes /subscriptions/<SUB_ID>/resourceGroups/playpiso-proposta-dev-rg --sdk-auth` |
| `ACR_LOGIN_SERVER` | Output do Terraform: `acr_login_server` |
| `ACR_USERNAME` | Output do Terraform (ou `az acr credential show`) |
| `ACR_PASSWORD` | Output do Terraform (sensível) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Output do Terraform: `static_web_app_token` |
| `TF_VAR_DB_ADMIN_PASSWORD` | Senha escolhida para o PostgreSQL |

---

## 7. Domínio customizado (futuro)

Quando houver um domínio customizado (ex: `propostas.playpiso.com.br`):

1. **Static Web App** → *Custom domains* → adicionar domínio → validar via CNAME no DNS
2. **Container App** → *Custom domain* → certificado TLS (Azure Managed ou próprio)
3. Atualizar `AllowedOrigins` na C# API para o novo domínio
4. Atualizar `VITE_PROPOSTA_API_URL` no GitHub Actions para o novo FQDN

---

## Checklist de primeiro deploy

- [ ] Subscription Azure ativa com Contributor access
- [ ] Storage Account para tfstate criado (seção 2)
- [ ] `infra/environments/dev/backend.tf` preenchido com nome da storage account
- [ ] `infra/environments/dev/terraform.tfvars` criado a partir do `.example`
- [ ] Variáveis sensíveis exportadas: `TF_VAR_db_admin_password`, `TF_VAR_azure_tenant_id`, `TF_VAR_azure_client_id`
- [ ] `terraform init && terraform validate && terraform plan` executados sem erros
- [ ] `terraform apply` executado — recursos criados no portal
- [ ] Dockerfiles criados e testados localmente (seção 5)
- [ ] Imagens buildadas e pushed para ACR
- [ ] Container Apps atualizados com as novas imagens
- [ ] Azure AD Expose an API configurado (seção 3)
- [ ] Usuários adicionados em `AllowedUsers` (seção 4)
- [ ] GitHub Secrets configurados (seção 6)
- [ ] Frontend buildado e deployed via GitHub Actions
- [ ] Smoke test: login → preencher formulário → gerar proposta → download .pptx
