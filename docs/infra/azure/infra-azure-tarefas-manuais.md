# Tarefas Manuais — Infraestrutura Azure

Estas tarefas precisam ser realizadas **manualmente** (portal Azure, CLI ou e-mail) antes ou junto com a execução do Terraform. Estão ordenadas por dependência.

---

## 0. Ferramentas locais necessárias

Antes de qualquer comando, garantir que estas ferramentas estão instaladas e funcionando na máquina:

| Ferramenta | Versão | Para que serve | Verificação |
|---|---|---|---|
| **Azure CLI** (`az`) | qualquer recente | Autenticar, gerenciar recursos, registrar providers, extrair credenciais ACR | `az --version` |
| **Terraform** | `>= 1.7` | Provisionar a infra a partir de `infra/environments/dev/` | `terraform version` |
| **Docker** | qualquer recente | Build inicial das imagens (primeiro provisionamento — ver seção 5) | `docker ps` |
| **GitHub CLI** (`gh`) | `>= 2.0` | Cadastrar os secrets do GitHub Actions sem usar o portal web | `gh --version && gh auth status` |
| **Gerenciador de senhas local** | KeePassXC ou equivalente | Guardar senha do PostgreSQL e JSON do Service Principal | `keepassxc --version` |

### Instalação no Ubuntu

**Azure CLI:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

**Terraform** (repositório oficial HashiCorp — sempre atualizado, integra com `apt upgrade`):
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install -y terraform
```

> Evitar `snap install terraform` — versão pode ficar desatualizada e o sandbox do snap pode bloquear leitura de módulos locais.

**Docker:**
```bash
sudo apt install -y docker.io
sudo usermod -aG docker $USER
# Reiniciar sessão (logout/login) para o grupo valer; depois:
docker ps  # deve listar sem erro de permissão
```

**GitHub CLI** (repositório oficial GitHub):
```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
gh auth login  # escolher GitHub.com → HTTPS → Login with a web browser
```

**KeePassXC:**
```bash
sudo apt install -y keepassxc
mkdir -p ~/Vaults && chmod 700 ~/Vaults
# Criar cofre via GUI: keepassxc & → Database → New Database → salvar em ~/Vaults/playpiso-infra.kdbx
```

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

## 2.1 Registrar Resource Providers

Subscriptions Azure novas vêm com pouquíssimos resource providers registrados. Sem registro, o Azure recusa criações com mensagens enganosas — por exemplo `SubscriptionNotFound` mesmo quando a subscription existe (sintoma real visto no primeiro provisionamento: erro era na verdade `Microsoft.Storage` não registrado).

Registre **uma vez** todos os providers que o Terraform vai usar:

```bash
for p in Microsoft.Storage Microsoft.ContainerRegistry Microsoft.App \
         Microsoft.OperationalInsights Microsoft.Insights Microsoft.DBforPostgreSQL \
         Microsoft.KeyVault Microsoft.Web Microsoft.ManagedIdentity; do
  az provider register --namespace "$p" --wait
done
```

`--wait` deixa o `az` bloquear até o provider estar `Registered` (1-2 min cada). Sem `--wait`, o registro é assíncrono.

Confirmar que ficou tudo OK:

```bash
az provider list --query "[?registrationState=='Registered'].namespace" -o tsv | sort
```

Esperado: lista contendo todos os 9 namespaces acima (além de outros pré-registrados como `Microsoft.Resources` e `Microsoft.Authorization`).

> Resource Provider é o componente Azure que sabe criar um tipo específico de recurso. Cada Subscription tem uma allowlist; antes do registro o provider está "desligado". Registro é permanente até `az provider unregister`. Não confundir com "provider" do Terraform (`azurerm`, `azuread`) — esses são plugins cliente, conceito diferente.

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

Após `terraform apply`, são **13 secrets** que precisam estar configurados em **Settings → Secrets and variables → Actions**. O `.github/workflows/deploy.yml` falha sem qualquer um deles.

### Tabela de origem (referência)

| Secret | Origem |
|---|---|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac` (JSON `--sdk-auth`) |
| `ACR_LOGIN_SERVER` | `terraform output -raw acr_login_server` |
| `ACR_USERNAME` | `az acr credential show --query username -o tsv` |
| `ACR_PASSWORD` | `az acr credential show --query 'passwords[0].value' -o tsv` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `terraform output -raw static_web_app_token` (sensível) |
| `AZURE_RESOURCE_GROUP` | `terraform output -raw resource_group_name` |
| `ACA_PPTX_NAME` | Nome fixo: `playpiso-proposta-dev-pptx` |
| `ACA_API_NAME` | Nome fixo: `playpiso-proposta-dev-api` |
| `VITE_API_URL` | `https://` + `terraform output -raw microservice_fqdn` |
| `VITE_PROPOSTA_API_URL` | `https://` + `terraform output -raw backend_fqdn` |
| `VITE_API_SCOPE` | Fixo: `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` |
| `VITE_AZURE_CLIENT_ID` | Fixo: `d59319c0-6b41-497f-b233-447c78d9d391` |
| `VITE_AZURE_TENANT_ID` | Fixo: `a75f3ed1-64d2-4473-b836-0b7cb2db1542` |

### Pré-requisitos antes de cadastrar

1. **Service Principal criado** — `AZURE_CREDENTIALS` precisa do JSON do SP:
   ```bash
   az ad sp create-for-rbac \
     --name "playpiso-github-actions" \
     --role contributor \
     --scopes "/subscriptions/<SUB_ID>/resourceGroups/playpiso-proposta-dev-rg" \
     --sdk-auth
   ```
   Copiar o JSON inteiro (das chaves `{` até `}`) para uma entrada do KeePassXC chamada `Playpiso — Service Principal GitHub Actions`. O `clientSecret` **não aparece de novo** — perda dele exige regenerar.

   > Pode aparecer warning `Option '--sdk-auth' has been deprecated` — ignorar; o `azure/login@v2` ainda lê esse formato.

2. **Credenciais do ACR anotadas no KeePassXC:**
   ```bash
   az acr credential show --name playpisopropostadevacr --query "username" -o tsv
   az acr credential show --name playpisopropostadevacr --query "passwords[0].value" -o tsv
   ```

3. **`gh` autenticado** no repo certo:
   ```bash
   cd ~/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado
   gh repo view --json nameWithOwner --jq '.nameWithOwner'  # deve mostrar LeoDosPisos/Playpiso-Intranet
   ```

### Cadastro em 3 blocos

#### Bloco A — 5 secrets derivados do Terraform

```bash
cd ~/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado/infra/environments/dev

gh secret set AZURE_RESOURCE_GROUP --body "$(terraform output -raw resource_group_name)"
gh secret set ACR_LOGIN_SERVER --body "$(terraform output -raw acr_login_server)"
gh secret set VITE_PROPOSTA_API_URL --body "https://$(terraform output -raw backend_fqdn)"
gh secret set VITE_API_URL --body "https://$(terraform output -raw microservice_fqdn)"
terraform output -raw static_web_app_token | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
```

#### Bloco B — 5 secrets fixos

```bash
gh secret set ACA_API_NAME --body "playpiso-proposta-dev-api"
gh secret set ACA_PPTX_NAME --body "playpiso-proposta-dev-pptx"
gh secret set VITE_API_SCOPE --body "api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user"
gh secret set VITE_AZURE_CLIENT_ID --body "d59319c0-6b41-497f-b233-447c78d9d391"
gh secret set VITE_AZURE_TENANT_ID --body "a75f3ed1-64d2-4473-b836-0b7cb2db1542"
```

#### Bloco C — 3 secrets sensíveis do KeePassXC

**C1 — ACR_USERNAME e ACR_PASSWORD** (uma linha cada, `read -s` esconde o que é colado):

```bash
read -srp "Cole o ACR_USERNAME e pressione Enter: " ACR_USER && echo
printf "%s" "$ACR_USER" | gh secret set ACR_USERNAME
unset ACR_USER

read -srp "Cole o ACR_PASSWORD e pressione Enter: " ACR_PASS && echo
printf "%s" "$ACR_PASS" | gh secret set ACR_PASSWORD
unset ACR_PASS
```

`printf "%s"` evita o newline que o Enter adicionaria — a senha do ACR não pode ter trailing newline.

**C2 — AZURE_CREDENTIALS** (JSON multi-linha; `read -s` não serve):

```bash
SP_FILE=$(mktemp) && chmod 600 "$SP_FILE"
echo "Cole o JSON COMPLETO do Service Principal e pressione Ctrl+D quando terminar:"
cat > "$SP_FILE"

# Validar JSON antes de enviar
python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$SP_FILE" && echo "JSON válido"

# Enviar via stdin (compatível com gh < 2.30; versões mais recentes aceitam --body-file)
gh secret set AZURE_CREDENTIALS < "$SP_FILE"

# Destruir o arquivo
shred -u "$SP_FILE" 2>/dev/null || rm -f "$SP_FILE"
```

> Versões antigas do `gh` (testado em algumas distros Ubuntu) não têm `--body-file`. Usar `< $FILE` é a forma compatível.

### Verificação final

```bash
gh secret list
```

Esperado: tabela com exatamente **13 nomes**, todos com `Updated` recente. Se faltar algum, refazer só o ausente.

Explicação detalhada de cada job que consome esses secrets: [`infra-azure-cicd.md`](./infra-azure-cicd.md). Mapeamento e comandos de extração também em [`infra-azure-outputs-dev.md`](./infra-azure-outputs-dev.md).

---

## 7. Domínio customizado (futuro)

Não implementado por decisão (custo evitado de ~$12/ano). O sistema é acessado pela URL genérica do Static Web App. Passos completos para quando quiser implementar: [`infra-azure-dominio-customizado.md`](./infra-azure-dominio-customizado.md).

---

## Checklist de primeiro deploy

- [ ] Ferramentas locais instaladas (seção 0): `az`, `terraform >= 1.7`, `docker`, `gh >= 2.0`, KeePassXC
- [ ] Cofre KeePassXC criado em `~/Vaults/playpiso-infra.kdbx`
- [ ] Subscription Azure ativa com Contributor (ou Owner) access (seção 1)
- [ ] Storage Account para tfstate criado (seção 2)
- [ ] Resource Providers registrados (seção 2.1)
- [ ] `infra/environments/dev/backend.tf` preenchido com nome da storage account
- [ ] `infra/environments/dev/terraform.tfvars` criado a partir do `.example`
- [ ] Senha do PostgreSQL gerada e armazenada no KeePassXC
- [ ] Variáveis sensíveis exportadas no shell: `TF_VAR_db_admin_password`, `TF_VAR_azure_tenant_id`, `TF_VAR_azure_client_id`
- [ ] Azure AD Expose an API configurado (seção 3)
- [ ] `terraform init && terraform plan -out=tfplan` executados sem erros
- [ ] `terraform apply tfplan` executado — recursos criados no portal
- [ ] Primeiras imagens Docker buildadas e pushed para o ACR (necessário no primeiro provisionamento — ver [`infra-azure-terraform-plan.md`](./infra-azure-terraform-plan.md) seção "Erros conhecidos")
- [ ] `terraform apply` re-executado após push das imagens — Container Apps criados com sucesso
- [ ] OIDs de usuários autorizados em `AllowedUsers__ObjectIds__*` (seção 4)
- [ ] Service Principal criado e JSON armazenado no KeePassXC
- [ ] Credenciais ACR (`username` + `password`) armazenadas no KeePassXC
- [ ] GitHub Secrets configurados — todos os 13 (seção 6); confirmado via `gh secret list`
- [ ] Redirect URI no App Registration aponta para a URL do Static Web App
- [ ] `package-lock.json` versionado no repo (não pode estar no `.gitignore` — `npm ci` exige)
- [ ] Workflow disparado via `gh workflow run deploy.yml` ou push em `main` — 5 jobs verdes
- [ ] Smoke test: login Microsoft → preencher formulário → gerar proposta → download `.pptx`
