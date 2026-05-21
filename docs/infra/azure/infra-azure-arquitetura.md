# Arquitetura Azure — Playpiso Proposta Comercial

## Decisão Arquitetural

**Opção escolhida: Container Apps + ACR + Static Web Apps**

| Critério | Container Apps (escolhida) | App Service |
|---|---|---|
| Paridade dev/prod | ✅ mesmo container local e produção | ⚠️ runtime diferente do local |
| Custo em dev/staging | ✅ escala a zero | ⚠️ plano ativo 24h |
| Microservice isolado | ✅ ingress interno nativo | ❌ precisa de plano separado |
| Complexidade inicial | ✅ um Environment para dois serviços | ⚠️ dois planos (Windows/.NET + Linux/Python) |
| Escalabilidade | ✅ auto-scale por HTTP traffic | ⚠️ scale-out manual no B1 |

AKS foi descartado — overhead operacional desproporcional para dois serviços.

---

## Diagrama de Componentes

```
Internet
    │ HTTPS
    ▼
┌───────────────────────────────┐
│  Azure Static Web Apps (SWA)  │  ← Frontend Vite/React
│  https://<prefix>.azurestaticapps.net │
└───────────────┬───────────────┘
                │ HTTPS (Bearer JWT)
                ▼
┌───────────────────────────────────────────────┐
│            Azure Container Apps               │
│  ┌─────────────────────────────────────────┐  │
│  │  Container App: proposta-api (C# .NET)  │  │  ← ingress externo
│  │  - Autentica Bearer via Azure AD        │  │
│  │  - Persiste propostas no PostgreSQL     │  │
│  │  - Chama pptx-generator internamente    │  │
│  └──────────────────┬──────────────────────┘  │
│                     │ HTTP interno             │
│  ┌──────────────────▼──────────────────────┐  │
│  │  Container App: pptx-generator (Python) │  │  ← ingress interno apenas
│  │  - Gera arquivo .pptx a partir de JSON  │  │
│  │  - Não exposto à internet               │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
                │
                │ TLS (porta 5432)
                ▼
┌───────────────────────────────────────────────┐
│  Azure Database for PostgreSQL Flexible Server │
│  - Banco: proposta_comercial                  │
│  - Acesso restrito por IP do Container Apps   │
└───────────────────────────────────────────────┘

Serviços transversais:
- Azure Container Registry (ACR Basic) — armazena imagens Docker
- Azure Key Vault — connection string DB, Azure AD config
- Log Analytics + Application Insights — logs e traces
- Managed Identity — C# API acessa Key Vault sem credenciais estáticas
```

---

## Onde mora cada dado

A infra **não tem** Azure Blob Storage, File Share ou Data Lake para a aplicação. Cada categoria de dado mora num lugar específico:

| Tipo de dado | Localização | Observação |
|---|---|---|
| **Templates `.pptx`** (~64 arquivos, ~47 MB) | Embutidos **dentro da imagem Docker** do `pptx-generator-service`, em `Backend/services/pptx-generator-service/slides/`. O `Dockerfile` faz `COPY . .` e leva todos os arquivos para `/app/slides/` no container | Versionados no Git. Editar = commit + push + rebuild da imagem |
| **Metadados de propostas** (formulário, specs do cliente, JSON de inputs) | **PostgreSQL Flexible Server** `playpiso-proposta-dev-db`, database `proposta_comercial`, em colunas JSONB | Persistente. Backup automático configurado pelo Azure |
| **PPTX gerado final** (output do `/gerar-proposta`) | **Não persiste** — `main.py` retorna bytes em memória via HTTP `Content-Disposition: attachment`; browser baixa, fim | Sem audit log de "qual cliente recebeu qual deck" |
| **Secrets** (connection string DB, IDs Azure AD) | **Key Vault** `playpiso-proposta-dev-kv` | C# API lê via Managed Identity |
| **Imagens Docker** (proposta-api, pptx-generator) | **Container Registry** `playpisopropostadevacr` | Replicação na própria região (sem geo-replicação no SKU Basic) |
| **Estado do Terraform** | Storage Account `playpisotfstate` em RG separado (`playpiso-tfstate-rg`) | Não confundir com armazenamento da aplicação |

### Quando migrar templates para Blob Storage

Avaliar quando alguma destas necessidades aparecer:
- **Comercial precisa editar templates** sem depender de dev (requer PR e re-deploy hoje).
- **Auditoria** de qual template foi usado em qual proposta gerada.
- **Imagem Docker passar de ~500 MB**, impactando tempo de pull no Container App.
- **A/B test ou templates por cliente** em runtime.

Migração futura envolveria: criar `azurerm_storage_account` + container `templates`, mover arquivos pra lá, ajustar `slide_merger.py` para baixar via Blob SDK (`azure-storage-blob`), conceder acesso à Managed Identity do pptx-generator. Não há demanda atual.

---

## Recursos a criar por Terraform

| Recurso | Nome (dev) | Propósito |
|---|---|---|
| Resource Group | `playpiso-proposta-dev-rg` | Contêiner lógico de todos os recursos |
| Container Registry | `playpisoPropostaDevAcr` | Armazena imagens Docker (Basic, ~$5/mês) |
| Container Apps Environment | `playpiso-proposta-dev-cae` | Ambiente compartilhado dos dois serviços |
| Container App (C# API) | `playpiso-proposta-dev-api` | Backend principal, ingress externo HTTPS |
| Container App (Python) | `playpiso-proposta-dev-pptx` | Microservice gerador PPTX, ingress interno |
| PostgreSQL Flexible Server | `playpiso-proposta-dev-db` | Banco relacional, SKU B1ms em dev |
| Database | `proposta_comercial` | Banco de dados da aplicação |
| Key Vault | `playpiso-proposta-dev-kv` | Segredos: connection string, Azure AD |
| Log Analytics Workspace | `playpiso-proposta-dev-logs` | Agregação de logs dos Container Apps |
| Application Insights | `playpiso-proposta-dev-appinsights` | APM, rastreamento de requests |
| Static Web App | `playpiso-proposta-dev-swa` | Hospeda build estático do frontend |
| User Assigned Identity | `playpiso-proposta-dev-api-identity` | Identidade gerenciada para Key Vault access |

**Não incluso no MVP** (pode ser adicionado sem quebrar estrutura):
- Private Endpoint para PostgreSQL (adiciona ~$7/mês mas elimina IPs públicos)
- Virtual Network customizada (Container Apps Environment cria a própria VNet)
- CDN / Azure Front Door (adicionar quando houver domínio customizado)

---

## Estrutura do Projeto Terraform

```
infra/
├── README.md
├── environments/
│   ├── dev/
│   │   ├── providers.tf           ← azurerm ~4.0, azuread, random
│   │   ├── backend.tf.example     ← estado remoto no Azure Storage
│   │   ├── variables.tf
│   │   ├── main.tf                ← chama módulos com variáveis de dev
│   │   ├── outputs.tf             ← URLs e FQDNs dos recursos criados
│   │   ├── terraform.tfvars.example
│   │   └── terraform.tfvars       ← valores reais (no .gitignore)
│   ├── staging/                   ← mesma estrutura, criado quando necessário
│   └── prod/
└── modules/
    ├── resource-group/
    ├── monitoring/                ← Log Analytics + Application Insights
    ├── container-registry/        ← ACR Basic
    ├── key-vault/                 ← Key Vault + secrets + access policies
    ├── database/                  ← PostgreSQL Flexible Server + firewall rules
    ├── container-apps/            ← Environment + Container Apps + Managed Identity
    └── static-web-app/            ← Azure SWA
```

---

## Variáveis Terraform por categoria

### Obrigatórias (sem default)
- `db_admin_username` — usuário admin do PostgreSQL
- `db_admin_password` — **sensível** — passar via `TF_VAR_db_admin_password`
- `azure_tenant_id` — **sensível** — `a75f3ed1-...` (não versionar)
- `azure_client_id` — **sensível** — `d59319c0-...` (não versionar)

### Com default por ambiente
- `project_name` = `"playpiso-proposta"`
- `environment` = `"dev"` / `"staging"` / `"prod"`
- `location` = `"brazilsouth"`
- `db_sku` = `"B_Standard_B1ms"` em dev, `"GP_Standard_D2s_v3"` em prod
- `backend_min_replicas` = `0` em dev (escala a zero), `1` em prod
- `backend_max_replicas` = `3`

---

## Variáveis de Ambiente por serviço em produção

### Frontend (Static Web App — configuradas no GitHub Actions)
```
VITE_PROPOSTA_API_URL=https://<backend_fqdn>
VITE_API_SCOPE=api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user
VITE_AZURE_CLIENT_ID=d59319c0-6b41-497f-b233-447c78d9d391
VITE_AZURE_TENANT_ID=a75f3ed1-64d2-4473-b836-0b7cb2db1542
```

### C# API (Container App — via Key Vault refs e env vars)
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__Default=<via Key Vault>
PptxGeneratorUrl=https://<pptx_internal_fqdn>
AzureAd__TenantId=<via Key Vault>
AzureAd__ClientId=<via Key Vault>
```

### Python PPTX Generator (Container App — sem vars adicionais no MVP)
```
# Sem variáveis externas necessárias no MVP
# PORT=8000 (default no Dockerfile)
```

---

## Fluxo de CI/CD (pós-Terraform)

```
git push → GitHub Actions
    │
    ├─ 1. Build e push imagens → ACR
    │       docker build → docker push <acr>/proposta-api:$SHA
    │       docker build → docker push <acr>/pptx-generator:$SHA
    │
    ├─ 2. Update Container Apps (rolling, zero downtime)
    │       az containerapp update --image <acr>/proposta-api:$SHA
    │       az containerapp update --image <acr>/pptx-generator:$SHA
    │
    ├─ 3. Migrations (DbUp roda no startup da C# API automaticamente)
    │
    └─ 4. Deploy Frontend
            npm run build → Azure Static Web Apps Action (token do Terraform output)
```

---

## Custo estimado (dev/staging)

| Recurso | SKU | Custo mensal estimado |
|---|---|---|
| Container Apps (2 serviços, ~20h/mês uso real) | Consumption | ~$2–5 |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| Static Web Apps | Free | $0 |
| Key Vault | Standard (< 10k operações) | ~$0 |
| Log Analytics | Pay-per-GB (< 1 GB/mês) | ~$0 |
| **Total estimado dev** | | **~$20–25/mês** |

Em prod (réplica mínima ativa, PostgreSQL GP): ~$80–120/mês.
