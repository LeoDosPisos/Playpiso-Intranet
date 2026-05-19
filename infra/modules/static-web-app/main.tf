resource "azurerm_static_web_app" "this" {
  name                = "${var.prefix}-swa"
  resource_group_name = var.resource_group_name
  # Static Web Apps tem disponibilidade de região limitada.
  # Use "eastus2" ou "westeurope" se "brazilsouth" não for suportado.
  location = var.location
  sku_tier = "Free"
  sku_size = "Free"
  tags     = var.tags
}
