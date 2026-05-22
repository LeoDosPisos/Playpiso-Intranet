# Pausar e Desprovisionar Infra Azure

Como reduzir custos quando o ambiente não estiver em uso. Três modos, do mais leve ao mais agressivo. Todos comandados pelo [`Makefile`](../../../Makefile) na raiz do projeto.

## Termo técnico

**Desprovisionar** (ou em inglês "tear down" / "destroy") = desfazer o provisionamento. O Terraform faz isso com `terraform destroy`. Não confundir com "pausar" (não destrói nada — só interrompe compute).

## Os 3 modos

| Modo | Comando | Economia | Tempo desligar | Tempo religar | Dados |
|---|---|---|---|---|---|
| **A. Escala a zero (automática)** | nenhum — já configurado | ~$2-5/mês | imediato | imediato | mantém |
| **B. Pausar PostgreSQL** | `make pause` / `make resume` | ~$12/mês | 30s | 1-2 min | mantém |
| **C. Destruir tudo** | `make destroy` | ~$20-25/mês (~100%) | 5-10 min | 15-20 min + reconfig | **perde banco** |

### Composição do custo mensal em dev (~$20-25 total)

| Recurso | Custo | Para 24/7 ou sob demanda? |
|---|---|---|
| PostgreSQL Flexible B_Standard_B1ms | ~$12 | 24/7 |
| Container Registry Basic | ~$5 | 24/7 (cobrança fixa) |
| Container Apps (Consumption) | ~$2-5 | sob demanda — escala a zero |
| Log Analytics + App Insights | ~$0-1 | pay-per-GB |
| Static Web App Free | $0 | grátis |
| Key Vault Standard | ~$0 | < 10k operações grátis |

**Insight:** o Postgres sozinho representa ~50% do custo. Por isso o **modo B** é o melhor balanço esforço × economia.

---

## Modo A — Escala a zero (default, já ativo)

Container Apps estão com `min_replicas = 0` em `infra/modules/container-apps/main.tf`. Quando não há requests por ~5 min, as instâncias desligam e param de cobrar. Primeiro request após a pausa demora ~30s (cold start).

Nada a fazer — funciona sozinho. Verificar estado:

```bash
make status
```

A coluna `runningStatus` dos Container Apps mostra `Running` (com tráfego ativo) ou `Idle`/`Stopped` (parado).

---

## Modo B — Pausar PostgreSQL (recomendado para uso intermitente)

**Quando usar:** vai ficar dias ou poucas semanas sem usar o sistema (ex.: fim de semana, viagem, sprint sem desenvolvimento).

```bash
make pause   # ~30s — para o Postgres
# ...tempo passa...
make resume  # ~1-2 min — religa o Postgres
```

**O que pausa:** apenas o `azurerm_postgresql_flexible_server`. O compute deixa de cobrar; só o storage (~32 GiB × $0.115/GiB ≈ $3.70) continua. Comparado aos $12 do servidor ligado, economia líquida ~$8/mês.

**O que mantém intacto** (importante):
- Banco e schema (`proposta_comercial`) — nada perdido.
- URLs dos Container Apps e Static Web App — não muda.
- Secrets do GitHub Actions — continuam válidos.
- Redirect URI no Azure AD — continua válido.
- Imagens no ACR — continuam lá.

**Limite:** Azure auto-religa o Postgres Flexible Server após **7 dias** parado (proteção contra esquecimento). Depois desse prazo, você precisa fazer `make resume` ou ele volta sozinho cobrando normalmente. Para pausas longas, use modo C.

---

## Modo C — Destruir tudo (`terraform destroy`)

**Quando usar:** vai ficar semanas/meses sem usar, ou está descontinuando o ambiente dev definitivamente.

```bash
make destroy   # pede confirmação digitando 'DESTRUIR'
```

**Implicações que tornam o re-setup chato:**

1. **PostgreSQL apagado** — dados perdidos. Soft-delete de 7 dias permite restore via portal se errar.
2. **Key Vault apagado** — soft-delete de **90 dias**. Recriar com o mesmo nome `playpiso-proposta-dev-kv` dentro desse prazo falha com `vault already exists in soft-deleted state`. Workaround:
   ```bash
   az keyvault purge --name playpiso-proposta-dev-kv
   ```
3. **URL do Static Web App muda.** O sufixo random (`zealous-plant-00461080f`) é regerado. Precisa:
   - Atualizar Redirect URI no App Registration `d59319c0-...` no portal Azure AD.
   - Refazer secret `AZURE_STATIC_WEB_APPS_API_TOKEN` no GitHub:
     ```bash
     cd infra/environments/dev
     terraform output -raw static_web_app_token | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
     ```
4. **ACR fica vazio.** Container Apps recém-criados vão falhar com `MANIFEST_UNKNOWN` (mesmo problema do primeiro deploy). Workaround:
   ```bash
   make build-push   # builda e empurra as duas imagens
   make deploy       # terraform apply de novo cria os Container Apps
   ```
5. **FQDNs dos Container Apps mudam.** O Container Apps Environment recebe um novo sufixo (`icysea-c186dd6e` → outro random). Precisa atualizar:
   ```bash
   cd infra/environments/dev
   gh secret set VITE_PROPOSTA_API_URL --body "https://$(terraform output -raw backend_fqdn)"
   gh secret set VITE_API_URL --body "https://$(terraform output -raw microservice_fqdn)"
   ```
6. **Sobrevive:** Service Principal (`AZURE_CREDENTIALS`), cofre KeePassXC, estado do Terraform no Storage Account.

### Sequência completa de "destruir e recriar do zero"

Estimativa: ~20-25 min total.

```bash
# 1. Destruir
make destroy   # digite 'DESTRUIR'

# 2. (Se necessário) purgar Key Vault soft-deleted
az keyvault purge --name playpiso-proposta-dev-kv

# 3. Garantir as 3 env vars sensíveis no shell atual
export TF_VAR_db_admin_password='<senha do KeePassXC>'
export TF_VAR_azure_tenant_id="a75f3ed1-64d2-4473-b836-0b7cb2db1542"
export TF_VAR_azure_client_id="d59319c0-6b41-497f-b233-447c78d9d391"

# 4. Provisionar (vai falhar nos Container Apps)
make deploy

# 5. Build & push das imagens
make build-push

# 6. Re-deploy (agora completa)
make deploy

# 7. Atualizar 3 secrets do GitHub que mudaram
cd infra/environments/dev
terraform output -raw static_web_app_token | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
gh secret set VITE_PROPOSTA_API_URL --body "https://$(terraform output -raw backend_fqdn)"
gh secret set VITE_API_URL --body "https://$(terraform output -raw microservice_fqdn)"

# 8. Atualizar Redirect URI no Azure AD App Registration (manual no portal)
#    Pegar nova URL com: terraform output -raw frontend_url

# 9. Dispatch do workflow para testar
gh workflow run deploy.yml
```

---

## Fluxo recomendado de uso diário

```
trabalhando ─→ make status  (confere tudo de pé)
              ↓
            usar
              ↓
saindo  ─→ make pause       (fim de expediente / fim de semana)
              ↓
voltando ─→ make resume     (próximo dia útil)
              ↓
            usar
              ↓
sumiço longo ─→ make destroy  (férias > 7 dias, ou pausa indefinida)
```

## Cuidados gerais

- Os comandos do Makefile esperam que você esteja **autenticado no Azure CLI** (`az login`) e — para `make destroy`/`make deploy` — com as três env vars `TF_VAR_*` exportadas no shell.
- O Makefile usa nomes de recursos **hardcoded** (`playpiso-proposta-dev-*`). Se mudar prefixo/ambiente, edite a seção de variáveis no topo do `Makefile`.
- Para staging/prod no futuro: criar `Makefile.staging` / `Makefile.prod` ou parametrizar via variáveis de ambiente (`ENV=prod make pause`).
