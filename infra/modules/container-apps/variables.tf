variable "resource_group_name"             {}
variable "location"                        {}
variable "prefix"                          {}
variable "tags"                            { type = map(string) }
variable "log_analytics_workspace_id"      {}
variable "acr_login_server"               {}
variable "acr_admin_username"             {}
variable "acr_admin_password"             { sensitive = true }
variable "key_vault_id"                   {}
variable "db_connection_string_secret_uri" { sensitive = true }
variable "azure_tenant_id"                { sensitive = true }
variable "azure_client_id"               {}
variable "min_replicas"                   { default = 0 }
variable "max_replicas"                   { default = 3 }
