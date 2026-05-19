resource "azurerm_container_app_environment" "this" {
  name                       = "${var.prefix}-cae"
  resource_group_name        = var.resource_group_name
  location                   = var.location
  log_analytics_workspace_id = var.log_analytics_workspace_id
  tags                       = var.tags
}

# Managed Identity para a C# API acessar Key Vault sem credenciais estáticas
resource "azurerm_user_assigned_identity" "backend" {
  name                = "${var.prefix}-api-identity"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

data "azurerm_client_config" "current" {}

# Permite que a C# API leia secrets do Key Vault usando a Managed Identity
resource "azurerm_key_vault_access_policy" "backend" {
  key_vault_id = var.key_vault_id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.backend.principal_id
  secret_permissions = ["Get"]
}

# Python PPTX Generator — ingress interno (não exposto à internet)
# Criado antes do backend para que o FQDN esteja disponível
resource "azurerm_container_app" "microservice" {
  name                         = "${var.prefix}-pptx"
  container_app_environment_id = azurerm_container_app_environment.this.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }

  ingress {
    external_enabled = false
    target_port      = 8000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "pptx-generator"
      image  = "${var.acr_login_server}/pptx-generator:latest"
      cpu    = 0.5
      memory = "1Gi"
    }
  }
}

# C# API — ingress externo HTTPS
resource "azurerm_container_app" "backend" {
  depends_on = [azurerm_key_vault_access_policy.backend]

  name                         = "${var.prefix}-api"
  container_app_environment_id = azurerm_container_app_environment.this.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend.id]
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_admin_password
  }

  # Connection string via Key Vault reference — a identidade gerenciada faz o fetch
  secret {
    name                = "db-connection-string"
    key_vault_secret_id = var.db_connection_string_secret_uri
    identity            = azurerm_user_assigned_identity.backend.id
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "proposta-api"
      image  = "${var.acr_login_server}/proposta-api:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Production"
      }
      env {
        name  = "ASPNETCORE_URLS"
        value = "http://+:8080"
      }
      env {
        name        = "ConnectionStrings__Default"
        secret_name = "db-connection-string"
      }
      env {
        name  = "PptxGeneratorUrl"
        value = "https://${azurerm_container_app.microservice.ingress[0].fqdn}"
      }
      env {
        name  = "AzureAd__TenantId"
        value = var.azure_tenant_id
      }
      env {
        name  = "AzureAd__ClientId"
        value = var.azure_client_id
      }
      env {
        name  = "AzureAd__Instance"
        value = "https://login.microsoftonline.com/"
      }
      env {
        name  = "AzureAd__Audience"
        value = "api://${var.azure_client_id}"
      }
    }
  }
}
