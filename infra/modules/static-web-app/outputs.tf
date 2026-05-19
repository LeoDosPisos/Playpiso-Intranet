output "default_host_name" {
  description = "URL padrão do Static Web App"
  value       = azurerm_static_web_app.this.default_host_name
}

output "api_key" {
  description = "Token de deploy — usar como secret no GitHub Actions"
  value       = azurerm_static_web_app.this.api_key
  sensitive   = true
}

output "id" { value = azurerm_static_web_app.this.id }
