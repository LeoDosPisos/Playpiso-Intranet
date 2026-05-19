resource "azurerm_container_registry" "this" {
  # ACR name: sem hífens, 5-50 chars, globalmente único
  name                = replace("${var.prefix}acr", "-", "")
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = var.tags
}
