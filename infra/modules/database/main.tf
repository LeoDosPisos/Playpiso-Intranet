resource "azurerm_postgresql_flexible_server" "this" {
  name                = "${var.prefix}-db"
  resource_group_name = var.resource_group_name
  location            = var.location
  version             = "17"

  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  sku_name               = var.sku_name
  storage_mb             = var.storage_mb
  backup_retention_days  = var.backup_retention_days
  geo_redundant_backup_enabled = false

  # Sem VNet integration no MVP — acesso controlado por firewall rules
  public_network_access_enabled = true

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "proposta_comercial"
  server_id = azurerm_postgresql_flexible_server.this.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# Permite acesso de todos os serviços Azure (equivalente a "Allow Azure services" no portal)
# Para produção, substituir por Private Endpoint e remover esta regra
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.this.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
