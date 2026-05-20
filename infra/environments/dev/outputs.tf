output "frontend_url" {
  description = "URL do Static Web App (frontend)"
  value       = module.static_web_app.default_host_name
}

output "backend_fqdn" {
  description = "FQDN da C# API (Container App com ingress externo)"
  value       = module.container_apps.backend_fqdn
}

output "microservice_fqdn" {
  description = "FQDN do PPTX Generator (Container App com ingress externo)"
  value       = module.container_apps.microservice_fqdn
}

output "acr_login_server" {
  description = "Login server do Azure Container Registry"
  value       = module.container_registry.login_server
}

output "db_fqdn" {
  description = "FQDN do PostgreSQL Flexible Server"
  value       = module.database.fqdn
}

output "static_web_app_token" {
  description = "Token de deploy do Static Web App — usar no GitHub Actions"
  value       = module.static_web_app.api_key
  sensitive   = true
}

output "resource_group_name" {
  description = "Nome do Resource Group criado"
  value       = module.resource_group.name
}
