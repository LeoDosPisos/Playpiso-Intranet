locals {
  prefix = "${var.project_name}-${var.environment}"
  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

module "resource_group" {
  source   = "../../modules/resource-group"
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

module "monitoring" {
  source              = "../../modules/monitoring"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  prefix              = local.prefix
  tags                = local.tags
}

module "container_registry" {
  source              = "../../modules/container-registry"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  prefix              = local.prefix
  tags                = local.tags
}

module "database" {
  source                   = "../../modules/database"
  resource_group_name      = module.resource_group.name
  location                 = module.resource_group.location
  prefix                   = local.prefix
  tags                     = local.tags
  admin_username           = var.db_admin_username
  admin_password           = var.db_admin_password
  sku_name                 = var.db_sku
  storage_mb               = var.db_storage_mb
  backup_retention_days    = var.db_backup_retention_days
}

module "key_vault" {
  source              = "../../modules/key-vault"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  prefix              = local.prefix
  tags                = local.tags
  secrets = {
    "db-connection-string" = "Host=${module.database.fqdn};Port=5432;Database=proposta_comercial;Username=${var.db_admin_username};Password=${var.db_admin_password};SSL Mode=Require;Trust Server Certificate=true"
    "azure-tenant-id"      = var.azure_tenant_id
    "azure-client-id"      = var.azure_client_id
  }
}

module "container_apps" {
  source                              = "../../modules/container-apps"
  resource_group_name                 = module.resource_group.name
  location                            = module.resource_group.location
  prefix                              = local.prefix
  tags                                = local.tags
  log_analytics_workspace_id          = module.monitoring.log_analytics_workspace_id
  acr_login_server                    = module.container_registry.login_server
  acr_admin_username                  = module.container_registry.admin_username
  acr_admin_password                  = module.container_registry.admin_password
  key_vault_id                        = module.key_vault.id
  db_connection_string_secret_uri     = module.key_vault.secret_versionless_uris["db-connection-string"]
  azure_tenant_id                     = var.azure_tenant_id
  azure_client_id                     = var.azure_client_id
  min_replicas                        = var.backend_min_replicas
  max_replicas                        = var.backend_max_replicas
  frontend_url                        = "https://${module.static_web_app.default_host_name}"
}

module "static_web_app" {
  source              = "../../modules/static-web-app"
  resource_group_name = module.resource_group.name
  prefix              = local.prefix
  tags                = local.tags
}
