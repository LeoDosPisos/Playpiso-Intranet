variable "project_name" {
  description = "Prefixo usado em todos os recursos Azure"
  default     = "playpiso-proposta"
}

variable "environment" {
  description = "Nome do ambiente: dev, staging ou prod"
  default     = "dev"
}

variable "location" {
  description = "Região Azure principal. Container Apps e PostgreSQL são criados aqui."
  default     = "brazilsouth"
}

variable "db_admin_username" {
  description = "Usuário administrador do PostgreSQL Flexible Server"
  default     = "pgadmin"
}

variable "db_admin_password" {
  description = "Senha do administrador PostgreSQL. Passar via TF_VAR_db_admin_password."
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Tenant ID do Azure AD. Passar via TF_VAR_azure_tenant_id."
  sensitive   = true
}

variable "azure_client_id" {
  description = "Client ID do App Registration Azure AD. Passar via TF_VAR_azure_client_id."
  sensitive   = true
}

variable "db_sku" {
  description = "SKU do PostgreSQL Flexible Server"
  default     = "B_Standard_B1ms"
}

variable "db_storage_mb" {
  description = "Tamanho do storage do PostgreSQL em MB"
  default     = 32768
}

variable "db_backup_retention_days" {
  description = "Dias de retenção de backup do PostgreSQL"
  default     = 7
}

variable "backend_min_replicas" {
  description = "Mínimo de réplicas dos Container Apps. Use 0 para escalar a zero em dev."
  default     = 0
}

variable "backend_max_replicas" {
  description = "Máximo de réplicas dos Container Apps"
  default     = 3
}
