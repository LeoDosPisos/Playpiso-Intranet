# Outputs do Ambiente Dev

Valores reais gerados pelo `terraform apply` em `infra/environments/dev/`. Atualizar este arquivo se houver `taint` + `apply`, recriação de recurso, ou troca de região. Para staging/prod, criar arquivos análogos (`infra-azure-outputs-staging.md`, `infra-azure-outputs-prod.md`).

**Provisionado em:** 2026-05-20
**Subscription:** Azure subscription 1 (`8d4dbd3f-2b7f-49b0-a7f6-4fdcec72830f`)
**Tenant:** PLAYPISO (`a75f3ed1-64d2-4473-b836-0b7cb2db1542`)
**Resource Group:** `playpiso-proposta-dev-rg`
**Região:** `brazilsouth` (exceto Static Web App em `eastus2`)

## Endpoints públicos

| Recurso | URL | Onde é usado |
|---|---|---|
| **Frontend (Static Web App)** | `https://zealous-plant-00461080f.7.azurestaticapps.net` | URL pública do sistema para usuários finais. CORS allowlist da C# API já inclui essa origem |
| **C# API (Container App)** | `https://playpiso-proposta-dev-api.icysea-c186dd6e.brazilsouth.azurecontainerapps.io` | Frontend chama essa URL com Bearer token. Vira o secret `VITE_PROPOSTA_API_URL` no GitHub |
| **PPTX Generator (Container App)** | `https://playpiso-proposta-dev-pptx.icysea-c186dd6e.brazilsouth.azurecontainerapps.io` | Chamado tanto pelo frontend (`/slides-disponiveis`) quanto pela C# API (`/gerar-proposta`). Vira o secret `VITE_API_URL` no GitHub |

## Recursos de infraestrutura

| Recurso | Identificador | Observação |
|---|---|---|
| **Container Registry** | `playpisopropostadevacr.azurecr.io` | Login server. Imagens: `pptx-generator:latest`, `proposta-api:latest` |
| **PostgreSQL Flexible Server** | `playpiso-proposta-dev-db.postgres.database.azure.com` | Banco `proposta_comercial`. Conexão via connection string no Key Vault |
| **Key Vault** | `playpiso-proposta-dev-kv` (URI: `https://playpiso-proposta-dev-kv.vault.azure.net/`) | Secrets: `db-connection-string`, `azure-client-id`, `azure-tenant-id` |
| **Container App Environment** | `playpiso-proposta-dev-cae` | Default domain: `icysea-c186dd6e.brazilsouth.azurecontainerapps.io` |
| **Log Analytics Workspace** | `playpiso-proposta-dev-logs` | Retenção 30 dias |
| **Application Insights** | `playpiso-proposta-dev-appinsights` | Conectado ao Log Analytics acima |
| **User Assigned Identity (C# API)** | `playpiso-proposta-dev-api-identity` | Principal ID: `fc03b19c-c496-445b-b21d-1ab5bc546ac2` (Object ID, usado nos access policies do Key Vault) |

## Output sensível (NÃO versionar)

Um output do Terraform é sensível e **não** deve ser colado neste arquivo nem em commits:

| Output | Como obter | Para onde vai |
|---|---|---|
| `static_web_app_token` | `cd infra/environments/dev && terraform output -raw static_web_app_token` | Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` no GitHub Actions |

Tratá-lo como senha: ler diretamente para o clipboard ou variável temporária, transferir para o GitHub Secrets, e nunca persistir em arquivo.

## Mapeamento direto: outputs Terraform → GitHub Secrets

Da raiz do projeto, com `cd infra/environments/dev`:

```bash
# Comandos para extrair cada valor:
terraform output -raw acr_login_server                    # → ACR_LOGIN_SERVER
terraform output -raw resource_group_name                 # → AZURE_RESOURCE_GROUP
terraform output -raw static_web_app_token                # → AZURE_STATIC_WEB_APPS_API_TOKEN (sensível)

# Os FQDNs precisam ser prefixados com https:// para virar URLs:
echo "https://$(terraform output -raw backend_fqdn)"      # → VITE_PROPOSTA_API_URL
echo "https://$(terraform output -raw microservice_fqdn)" # → VITE_API_URL
```

Valores fixos (não vêm do Terraform):

| Secret | Valor |
|---|---|
| `ACA_API_NAME` | `playpiso-proposta-dev-api` |
| `ACA_PPTX_NAME` | `playpiso-proposta-dev-pptx` |
| `VITE_API_SCOPE` | `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` |
| `VITE_AZURE_CLIENT_ID` | `d59319c0-6b41-497f-b233-447c78d9d391` |
| `VITE_AZURE_TENANT_ID` | `a75f3ed1-64d2-4473-b836-0b7cb2db1542` |

Os três últimos secrets (`AZURE_CREDENTIALS`, `ACR_USERNAME`, `ACR_PASSWORD`) vêm de comandos `az`, não do Terraform — ver [`infra-azure-tarefas-manuais.md`](./infra-azure-tarefas-manuais.md) seção 6.

## Smoke test pós-apply

Confirma que os endpoints estão de pé (Container Apps sobem em ~30s na primeira request por causa do `min_replicas = 0`):

```bash
# PPTX Generator — endpoint /health deve retornar {"status":"ok"}
curl -i https://playpiso-proposta-dev-pptx.icysea-c186dd6e.brazilsouth.azurecontainerapps.io/health

# C# API — provavelmente retorna 401 sem Bearer token, mas deve responder
curl -i https://playpiso-proposta-dev-api.icysea-c186dd6e.brazilsouth.azurecontainerapps.io/

# Frontend — deve carregar a SPA (HTML do Vite)
curl -I https://zealous-plant-00461080f.7.azurestaticapps.net
```

Se algum retornar 503/504 timeout na primeira vez, espere ~1 min e tente de novo (cold start do Container App). 502/500 persistente indica problema com a imagem ou a aplicação — checar logs em Portal → Container App → Log stream.
