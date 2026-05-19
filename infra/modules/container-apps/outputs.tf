output "backend_fqdn" {
  description = "FQDN público da C# API"
  value       = azurerm_container_app.backend.ingress[0].fqdn
}

output "microservice_fqdn" {
  description = "FQDN interno do PPTX Generator (acessível apenas dentro do Container Apps Environment)"
  value       = azurerm_container_app.microservice.ingress[0].fqdn
}

output "backend_identity_principal_id" {
  description = "Principal ID da Managed Identity da C# API (para Key Vault access policy)"
  value       = azurerm_user_assigned_identity.backend.principal_id
}

output "environment_id" {
  value = azurerm_container_app_environment.this.id
}
