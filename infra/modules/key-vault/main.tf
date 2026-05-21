data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "this" {
  name                = "${var.prefix}-kv"
  resource_group_name = var.resource_group_name
  location            = var.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Permite que o principal do Terraform gerencie os secrets
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    secret_permissions = ["Get", "Set", "Delete", "Purge", "List"]
  }

  tags = var.tags
}

resource "azurerm_key_vault_secret" "secrets" {
  for_each     = nonsensitive(toset(keys(var.secrets)))
  name         = each.value
  value        = var.secrets[each.value]
  key_vault_id = azurerm_key_vault.this.id
}

