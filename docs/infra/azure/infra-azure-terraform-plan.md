# Plano Terraform e Variáveis Esperadas

Referência do que o `terraform plan` em `infra/environments/dev/` deve produzir, e quais variáveis precisam estar setadas para o plan ser bem-sucedido.

## Variáveis de entrada

### Em `infra/environments/dev/terraform.tfvars` (não sensíveis, podem ficar em texto puro)

Arquivo está no `.gitignore` por convenção — não versionado, mas conteúdo não é segredo. Modelo em `terraform.tfvars.example`.

| Variável | Valor recomendado em dev | Descrição |
|---|---|---|
| `project_name` | `playpiso-proposta` | Compõe o prefixo de todos os recursos |
| `environment` | `dev` | Sufixo ambiente |
| `location` | `brazilsouth` | Região Azure padrão dos recursos (SWA é forçado para `eastus2` no módulo, por falta de suporte em `brazilsouth`) |
| `db_admin_username` | `pgadmin` | Username admin do PostgreSQL Flexible Server |
| `db_sku` | `B_Standard_B1ms` | SKU mais barato (~$12/mês). Em prod usar `GP_Standard_D2s_v3` |
| `db_storage_mb` | `32768` | 32 GiB |
| `db_backup_retention_days` | `7` | Retenção de backup automático |
| `backend_min_replicas` | `0` | Escala a zero quando ocioso (gratuito). Em prod usar `1` |
| `backend_max_replicas` | `3` | Limite de auto-scale |

### Via variáveis de ambiente `TF_VAR_*` (sensíveis — não colocar em arquivos)

O Terraform lê automaticamente qualquer env var prefixada com `TF_VAR_` e mapeia para a variável de mesmo nome.

| Env var | Origem | Onde é usado |
|---|---|---|
| `TF_VAR_db_admin_password` | Gerado localmente, guardado em gerenciador de senhas (ex.: KeePassXC) | Senha do admin do PostgreSQL. Requisitos: 8–128 chars, 3 das 4 categorias (maiúscula/minúscula/número/símbolo), não pode conter o username |
| `TF_VAR_azure_tenant_id` | Tenant PLAYPISO: `a75f3ed1-64d2-4473-b836-0b7cb2db1542` | Configurado nos Container Apps e gravado no Key Vault como `azure-tenant-id` |
| `TF_VAR_azure_client_id` | App Registration: `d59319c0-6b41-497f-b233-447c78d9d391` | Configurado nos Container Apps e gravado no Key Vault como `azure-client-id` |

**Como exportar:**

```bash
export TF_VAR_db_admin_password='<SENHA_DO_COFRE>'
export TF_VAR_azure_tenant_id="a75f3ed1-64d2-4473-b836-0b7cb2db1542"
export TF_VAR_azure_client_id="d59319c0-6b41-497f-b233-447c78d9d391"
```

Validar que estão setadas (sem expor valores):

```bash
for v in TF_VAR_db_admin_password TF_VAR_azure_tenant_id TF_VAR_azure_client_id; do
  [ -n "${!v}" ] && echo "$v: OK (len=${#:-0})" || echo "$v: FALTANDO"
done
```

## Plano esperado no primeiro apply

`terraform plan -out=tfplan` em ambiente vazio deve produzir:

```
Plan: 17 to add, 0 to change, 0 to destroy.
```

Qualquer linha `change` ou `destroy` no primeiro apply é vermelho — interromper e investigar.

### Recursos criados (17)

Agrupados por módulo, na ordem em que aparecem no plan:

| # | Módulo | Tipo | Nome resultante | Propósito |
|---|---|---|---|---|
| 1 | `resource_group` | `azurerm_resource_group.this` | `playpiso-proposta-dev-rg` | Container lógico de todos os recursos |
| 2 | `monitoring` | `azurerm_log_analytics_workspace.this` | `playpiso-proposta-dev-logs` | Agregação de logs dos Container Apps (retenção 30 dias) |
| 3 | `monitoring` | `azurerm_application_insights.this` | `playpiso-proposta-dev-appinsights` | APM e tracing de requests |
| 4 | `container_registry` | `azurerm_container_registry.this` | `playpisopropostadevacr` | ACR Basic (sem hífens — regra Azure). Admin habilitado para auth do GitHub Actions |
| 5 | `key_vault` | `azurerm_key_vault.this` | `playpiso-proposta-dev-kv` | Cofre de secrets, SKU `standard`, retenção soft-delete 90 dias |
| 6–8 | `key_vault` | `azurerm_key_vault_secret.secrets["..."]` | `db-connection-string`, `azure-tenant-id`, `azure-client-id` | Secrets que o Container App da API lê via Managed Identity |
| 9 | `database` | `azurerm_postgresql_flexible_server.this` | `playpiso-proposta-dev-db` | PostgreSQL 17, SKU `B_Standard_B1ms`, 32 GiB |
| 10 | `database` | `azurerm_postgresql_flexible_server_database.app` | `proposta_comercial` | Database de aplicação, UTF-8 / `en_US.utf8` |
| 11 | `database` | `azurerm_postgresql_flexible_server_firewall_rule.allow_azure_services` | `allow-azure-services` | Regra `0.0.0.0 → 0.0.0.0` (convenção Azure para "permitir serviços Azure") |
| 12 | `container_apps` | `azurerm_container_app_environment.this` | `playpiso-proposta-dev-cae` | Environment compartilhado dos dois Container Apps |
| 13 | `container_apps` | `azurerm_user_assigned_identity.backend` | `playpiso-proposta-dev-api-identity` | Identidade gerenciada para a C# API acessar Key Vault |
| 14 | `container_apps` | `azurerm_key_vault_access_policy.backend` | (sem nome — policy) | Concede `Get` em secrets para a Managed Identity acima |
| 15 | `container_apps` | `azurerm_container_app.backend` | `playpiso-proposta-dev-api` | C# API, ingress externo HTTPS na porta 8080, escala 0–3 |
| 16 | `container_apps` | `azurerm_container_app.microservice` | `playpiso-proposta-dev-pptx` | Python PPTX Generator, ingress externo HTTPS na porta 8000, escala 0–3 |
| 17 | `static_web_app` | `azurerm_static_web_app.this` | `playpiso-proposta-dev-swa` | Static Web App Free em `eastus2` (SWA não disponível em `brazilsouth`) |

### Outputs gerados (7)

Todos `(known after apply)` no plan; preenchidos após `terraform apply`. Esses outputs alimentam os secrets do GitHub Actions:

| Output | Tipo | Vira qual secret do GitHub | Como obter depois do apply |
|---|---|---|---|
| `resource_group_name` | string | `AZURE_RESOURCE_GROUP` | `terraform output -raw resource_group_name` |
| `acr_login_server` | string | `ACR_LOGIN_SERVER` | `terraform output -raw acr_login_server` |
| `frontend_url` | string | (referência — sem domínio custom é o `default_host_name` do SWA) | `terraform output -raw frontend_url` |
| `backend_fqdn` | string | `VITE_PROPOSTA_API_URL` (prefixado com `https://`) | `terraform output -raw backend_fqdn` |
| `microservice_fqdn` | string | `VITE_API_URL` (prefixado com `https://`) | `terraform output -raw microservice_fqdn` |
| `db_fqdn` | string | — | `terraform output -raw db_fqdn` |
| `static_web_app_token` | string (sensível) | `AZURE_STATIC_WEB_APPS_API_TOKEN` | `terraform output -raw static_web_app_token` |

> Os secrets do GitHub que **não** vêm do Terraform: `AZURE_CREDENTIALS` (criar via `az ad sp create-for-rbac`), `ACR_USERNAME` / `ACR_PASSWORD` (via `az acr credential show`), `ACA_PPTX_NAME` / `ACA_API_NAME` (nomes fixos), `VITE_API_SCOPE` / `VITE_AZURE_CLIENT_ID` / `VITE_AZURE_TENANT_ID` (valores fixos do App Registration). Detalhes em [`infra-azure-tarefas-manuais.md`](./infra-azure-tarefas-manuais.md) seção 6.

## Como reproduzir

```bash
# 1. Estar logado na Azure
az login
az account set --subscription "<SUBSCRIPTION_ID>"

# 2. Garantir os exports no shell atual
export TF_VAR_db_admin_password='<SENHA_DO_COFRE>'
export TF_VAR_azure_tenant_id="a75f3ed1-64d2-4473-b836-0b7cb2db1542"
export TF_VAR_azure_client_id="d59319c0-6b41-497f-b233-447c78d9d391"

# 3. Plan
cd infra/environments/dev
terraform plan -out=tfplan
```

Esperado no final do output: `Plan: 17 to add, 0 to change, 0 to destroy.`

## Tempos de criação esperados no apply

| Recurso | Tempo aproximado |
|---|---|
| PostgreSQL Flexible Server | 5–8 min (gargalo) |
| Container Apps Environment | 3–5 min |
| Key Vault | 30–60 s |
| ACR, SWA, Log Analytics, App Insights | 10–30 s cada |
| Container Apps, secrets, firewall rule | < 30 s cada |

**Total esperado:** 10–15 min para o primeiro apply.

## Warnings e nuances aceitáveis

- **`custom_domain_verification_id = (sensitive value)`** nos Container Apps — normal, não exige ação.
- **`administrator_password_wo = (write-only attribute)`** no PostgreSQL — apenas indica que o atributo só pode ser escrito, não lido depois (segurança).
- **SWA em `eastus2`** apesar de `location = "brazilsouth"` no `tfvars` — comportamento intencional do módulo (`infra/modules/static-web-app/main.tf`).

## Erros conhecidos e como resolver

### `MANIFEST_UNKNOWN: manifest tagged by "latest" is not found` nos Container Apps

**Sintoma:** No primeiro apply, todos os recursos são criados até a etapa dos Container Apps, e aí dá erro semelhante a:

```
Error: creating Container App ... Container App Name: "playpiso-proposta-dev-pptx"
Code: "ContainerAppOperationError"
Message: "... Field 'template.containers.pptx-generator.image' is invalid with details:
'Invalid value: "playpisopropostadevacr.azurecr.io/pptx-generator:latest":
MANIFEST_UNKNOWN: manifest tagged by "latest" is not found'"
```

**Causa:** ovo-e-galinha entre ACR e Container Apps no primeiro provisionamento. O Terraform cria o ACR vazio, depois tenta criar Container Apps apontando para `<acr>/pptx-generator:latest` e `<acr>/proposta-api:latest` — tags que ainda não existem porque nenhum `docker push` aconteceu. A criação de Container App valida que a imagem existe antes de marcar a primeira revisão como saudável.

**Resolução (uma vez):**

```bash
# Da raiz do projeto, autenticar Docker no ACR recém-criado
az acr login --name playpisopropostadevacr

# Build + push das duas imagens
docker build -t playpisopropostadevacr.azurecr.io/pptx-generator:latest Backend/services/pptx-generator-service
docker push playpisopropostadevacr.azurecr.io/pptx-generator:latest

docker build -t playpisopropostadevacr.azurecr.io/proposta-api:latest Backend
docker push playpisopropostadevacr.azurecr.io/proposta-api:latest

# Re-aplicar o Terraform — vai criar só os 2 Container Apps que faltaram
cd infra/environments/dev
terraform plan -out=tfplan
terraform apply tfplan
```

Pré-requisitos: Docker daemon rodando localmente (`docker ps` precisa funcionar).

**Por que não automatizar:** o pipeline regular (`.github/workflows/deploy.yml`) já faz build+push em todo push para `main`. Após o primeiro provisionamento, atualizações subsequentes funcionam sozinhas. Esse passo manual só é necessário no **primeiro** `terraform apply` quando o ACR ainda está vazio.

**Alternativas de longo prazo (não implementadas):**
- Imagem placeholder pública (ex.: `mcr.microsoft.com/k8se/quickstart`) como bootstrap, substituída pelo pipeline depois.
- Two-phase Terraform: `infra-base/` (RG + ACR + KV + DB) → push manual → `infra-apps/` (Container Apps).
- `null_resource` com `local-exec` rodando `docker build && docker push` antes da criação dos Container Apps — acopla Terraform a Docker local, evitado.

### Container App fantasma após primeiro apply falhar

**Sintoma:** no segundo `terraform apply` (depois do erro `MANIFEST_UNKNOWN`), aparece:

```
Error: a resource with the ID ".../containerApps/playpiso-proposta-dev-pptx" already exists -
to be managed via Terraform this resource needs to be imported into the State.
```

**Causa:** quando a primeira revisão de um Container App falha em provisionar, o Azure mantém o registro do recurso (com revisão em estado "Failed"), mas o Terraform descarta-o do state local. No próximo apply, o Terraform tenta criar de novo e bate com o "já existe".

**Resolução:** deletar o recurso fantasma e deixar o Terraform recriar do zero:

```bash
az containerapp delete \
  --name playpiso-proposta-dev-pptx \
  --resource-group playpiso-proposta-dev-rg \
  --yes
```

Alternativa (preservar o registro): `terraform import 'module.container_apps.azurerm_container_app.microservice' '<resource-id>'`. Menos recomendado porque o estado importado vai conter atributos que divergem do que o módulo espera, gerando ruído no próximo plan.

### Drift de `zone` no PostgreSQL Flexible Server

**Sintoma:**

```
Error: `zone` can only be changed when exchanged with the zone specified in
`high_availability.0.standby_availability_zone`
```

**Causa:** o Azure escolhe automaticamente uma availability zone (ex.: `"1"`) no momento da criação do Postgres Flexible. O módulo não declara `zone`, então o Terraform interpreta como `null` e tenta "limpar" o campo. O Azure recusa porque só permite mudar zone trocando com a standby (que exige `high_availability` configurado).

**Resolução:** já aplicada no módulo `infra/modules/database/main.tf` via `lifecycle { ignore_changes = [zone] }`. Se o erro voltar, conferir se esse bloco continua presente no recurso `azurerm_postgresql_flexible_server.this`.
