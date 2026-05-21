# Infraestrutura Azure — Playpiso Proposta Comercial

Terraform para provisionamento da infraestrutura Azure. Arquitetura: **Container Apps + ACR + Static Web Apps**.

Documentação arquitetural completa: [`../docs/infra/azure/infra-azure-arquitetura.md`](../docs/infra/azure/infra-azure-arquitetura.md)
Tarefas manuais necessárias: [`../docs/infra/azure/infra-azure-tarefas-manuais.md`](../docs/infra/azure/infra-azure-tarefas-manuais.md)
Plano Terraform e variáveis esperadas: [`../docs/infra/azure/infra-azure-terraform-plan.md`](../docs/infra/azure/infra-azure-terraform-plan.md)
Outputs reais do ambiente dev: [`../docs/infra/azure/infra-azure-outputs-dev.md`](../docs/infra/azure/infra-azure-outputs-dev.md)
Pipeline CI/CD (GitHub Actions): [`../docs/infra/azure/infra-azure-cicd.md`](../docs/infra/azure/infra-azure-cicd.md)
Pausar e desprovisionar (economizar custos): [`../docs/infra/azure/infra-azure-pausar-destruir.md`](../docs/infra/azure/infra-azure-pausar-destruir.md)
Domínio customizado (não implementado): [`../docs/infra/azure/infra-azure-dominio-customizado.md`](../docs/infra/azure/infra-azure-dominio-customizado.md)

## Pré-requisitos

- [Terraform >= 1.7](https://developer.hashicorp.com/terraform/install)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- Subscription Azure com role **Contributor**
- Storage Account para estado remoto (ver tarefas manuais)

## Primeiros passos

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"

cd infra/environments/dev
cp backend.tf.example backend.tf          # preencher storage account name
cp terraform.tfvars.example terraform.tfvars  # preencher valores

export TF_VAR_db_admin_password="<SENHA>"
export TF_VAR_azure_tenant_id="a75f3ed1-64d2-4473-b836-0b7cb2db1542"
export TF_VAR_azure_client_id="d59319c0-6b41-497f-b233-447c78d9d391"

terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

## Estrutura

```
infra/
├── environments/dev/    ← variáveis e composição de módulos para dev
└── modules/             ← módulos reutilizáveis por ambiente
    ├── resource-group/
    ├── monitoring/      ← Log Analytics + Application Insights
    ├── container-registry/
    ├── key-vault/
    ├── database/        ← PostgreSQL Flexible Server
    ├── container-apps/  ← Environment + C# API + Python PPTX Generator
    └── static-web-app/  ← Frontend Vite/React
```

## Outputs úteis após apply

| Output | Descrição |
|---|---|
| `frontend_url` | URL do Static Web App (frontend) |
| `backend_fqdn` | FQDN da C# API (Container App) |
| `acr_login_server` | Login server do Container Registry |
| `db_fqdn` | FQDN do PostgreSQL Flexible Server |

## URL pública atual

Sem domínio customizado, o sistema é acessado pela URL genérica do Static Web App (HTTPS + cert gerenciado, gratuito):

```bash
cd infra/environments/dev
terraform output frontend_url
```

Detalhes do pipeline que mantém esse endpoint atualizado em [`../docs/infra/azure/infra-azure-cicd.md`](../docs/infra/azure/infra-azure-cicd.md). Para plugar um domínio próprio no futuro, ver [`../docs/infra/azure/infra-azure-dominio-customizado.md`](../docs/infra/azure/infra-azure-dominio-customizado.md).
