# Domínio Customizado para o Frontend

## Status atual

**Não implementado por decisão consciente.** O frontend é acessado pela URL genérica do Static Web App (`*.azurestaticapps.net`), que já é HTTPS e gratuita. Custo evitado: ~$12/ano do domínio. Quando essa URL deixar de ser aceitável (apresentações comerciais, marca, e-mail de divulgação), seguir os passos abaixo.

URL atual: ver [`infra-azure-cicd.md`](./infra-azure-cicd.md#como-descobrir-a-url-pública-do-sistema).

## Escopo definido

- **Apenas o frontend** ganha domínio próprio. As duas APIs (C# e Python) continuam em `*.azurecontainerapps.io` — não há motivo comercial para expor URLs amigáveis das APIs.
- Aquisição via **Azure App Service Domain** (compra integrada à subscription, DNS Zone criada automaticamente). Evita dependência de TI/Registro.br/Cloudflare.
- Toda a infra via **Terraform**, exceto a compra do domínio (que exige aceite manual de termos no portal).

## Pré-requisitos antes de aplicar

1. **Comprar domínio no portal Azure** (única ação fora do Terraform):
   - Portal Azure → **App Service Domains** → **Create**.
   - Escolher Resource Group **separado** dos ambientes (ex.: `playpiso-shared-rg`) — assim um `terraform destroy` no dev não derruba o domínio.
   - Aceitar termos legais, pagar (~$12/ano cobrado na mesma subscription).
   - A Azure cria automaticamente uma DNS Zone (`azurerm_dns_zone`) com o nome do domínio dentro do mesmo Resource Group.

2. **Anotar para usar no Terraform:**
   - Nome completo do domínio (ex.: `playpiso-proposta.com`).
   - Subdomínio escolhido para o frontend (ex.: `app.playpiso-proposta.com`).
   - Nome do Resource Group da DNS Zone.

## Mudanças de código necessárias

### 1. Novo arquivo: `infra/modules/static-web-app/custom-domain.tf`

```hcl
variable "custom_domain" {
  description = "Subdomínio completo do frontend (ex.: app.playpiso-proposta.com). Vazio = não configura."
  type        = string
  default     = ""
}

variable "dns_zone_name" {
  description = "Nome da DNS Zone que hospeda o domínio (ex.: playpiso-proposta.com)"
  type        = string
  default     = ""
}

variable "dns_zone_resource_group" {
  description = "Resource Group onde a DNS Zone vive"
  type        = string
  default     = ""
}

data "azurerm_dns_zone" "this" {
  count               = var.custom_domain != "" ? 1 : 0
  name                = var.dns_zone_name
  resource_group_name = var.dns_zone_resource_group
}

resource "azurerm_dns_cname_record" "swa" {
  count               = var.custom_domain != "" ? 1 : 0
  name                = split(".", var.custom_domain)[0]
  zone_name           = data.azurerm_dns_zone.this[0].name
  resource_group_name = var.dns_zone_resource_group
  ttl                 = 300
  record              = azurerm_static_web_app.this.default_host_name
}

resource "azurerm_static_web_app_custom_domain" "this" {
  count             = var.custom_domain != "" ? 1 : 0
  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"

  depends_on = [azurerm_dns_cname_record.swa]
}
```

### 2. Atualizar `infra/modules/static-web-app/outputs.tf`

Fazer o output `frontend_url` preferir o domínio customizado quando setado:

```hcl
output "frontend_url" {
  value = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${azurerm_static_web_app.this.default_host_name}"
}
```

(Confirmar que o output atual já se chama `frontend_url`; se não, ajustar.)

### 3. Atualizar `infra/modules/container-apps/main.tf` — CORS dinâmico

Linhas atuais [159-161](../../../infra/modules/container-apps/main.tf#L159-L161):

```hcl
env {
  name  = "Cors__AllowedOrigins__0"
  value = var.frontend_url
}
```

Trocar por bloco dinâmico:

```hcl
dynamic "env" {
  for_each = var.allowed_origins
  content {
    name  = "Cors__AllowedOrigins__${env.key}"
    value = env.value
  }
}
```

E adicionar em `infra/modules/container-apps/variables.tf`:

```hcl
variable "allowed_origins" {
  description = "Lista de origens permitidas para CORS da C# API"
  type        = list(string)
}
```

### 4. Atualizar `infra/environments/dev/main.tf`

Passar as novas variáveis para o módulo `static_web_app` e atualizar `allowed_origins` do `container_apps` para incluir tanto o domínio customizado quanto o default (transição segura):

```hcl
module "static_web_app" {
  # ...
  custom_domain           = var.custom_domain
  dns_zone_name           = var.dns_zone_name
  dns_zone_resource_group = var.dns_zone_resource_group
}

module "container_apps" {
  # ...
  allowed_origins = [
    module.static_web_app.frontend_url,
    "https://${module.static_web_app.default_host_name}",
  ]
}
```

### 5. Adicionar variáveis em `infra/environments/dev/variables.tf`

Definir `custom_domain`, `dns_zone_name`, `dns_zone_resource_group` (com `default = ""` para não quebrar quem não usar). Setar valores reais em `terraform.tfvars` (não versionado).

### 6. Azure AD App Registration — atualização manual

Portal → **Azure Active Directory → App registrations → `d59319c0-6b41-497f-b233-447c78d9d391`** → **Authentication → Redirect URIs**.

Adicionar `https://app.playpiso-proposta.com` (ou o subdomínio escolhido) **ao lado** dos URIs existentes. Manter os antigos durante a transição. Pode ser automatizado depois via `azuread_application` no Terraform — opcional.

## Aplicar

```bash
cd infra/environments/dev
terraform plan    # esperado: criar 2 recursos novos (cname + custom_domain), atualizar env do api
terraform apply
```

Propagação DNS no Azure DNS é quase instantânea (~30s). HTTPS é provisionado automaticamente pelo SWA em alguns minutos.

## Verificação end-to-end

1. `terraform plan` mostra exatamente os recursos esperados (sem destruir nada existente).
2. `dig app.playpiso-proposta.com CNAME` retorna o `default_host_name` do SWA.
3. `curl -I https://app.playpiso-proposta.com` retorna `200 OK` com cert válido emitido pela Azure (sujeito `app.playpiso-proposta.com`).
4. Abrir a URL no browser → login Microsoft funciona (redirect URI bate).
5. Após login, criar uma proposta de teste → C# API responde (CORS OK).
6. Gerar PPTX de uma proposta → microserviço Python responde.
7. Logs do Container App `proposta-api` (Log stream): nenhum erro `CORS policy` na janela do teste.

## Não objetivos

- **Domínio customizado para Container Apps** (`api.dominio`, `pptx.dominio`). Exige workload profile no Container Apps Environment e certificado gerenciado — esforço desproporcional à demanda atual.
- **OIDC federado no GitHub Actions** (substituir `AZURE_CREDENTIALS` JSON por federação). Melhoria de segurança independente desta tarefa.
- **Azure Front Door / CDN**. Faz sentido só com múltiplas regiões ou necessidade de WAF.

## Próximos passos (resumo executivo)

1. Comprar domínio via portal (App Service Domains) em Resource Group separado.
2. Anotar nome do domínio, da DNS Zone e do RG dela.
3. Criar `infra/modules/static-web-app/custom-domain.tf` conforme bloco acima.
4. Atualizar `infra/modules/container-apps/main.tf` para CORS dinâmico.
5. Setar `custom_domain` etc. em `terraform.tfvars`.
6. `terraform apply`.
7. Adicionar redirect URI no Azure AD App Registration.
8. Verificar acesso pelo novo domínio + login + chamadas de API.
