output "id"   { value = azurerm_key_vault.this.id }
output "name" { value = azurerm_key_vault.this.name }
output "uri"  { value = azurerm_key_vault.this.vault_uri }

output "secret_versionless_uris" {
  description = "Map de nome → URI sem versão dos secrets (para Container App Key Vault refs)"
  value       = { for k, v in azurerm_key_vault_secret.secrets : k => v.versionless_id }
  sensitive   = true
}
