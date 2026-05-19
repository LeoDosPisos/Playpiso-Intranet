variable "resource_group_name"    {}
variable "location"               {}
variable "prefix"                 {}
variable "tags"                   { type = map(string) }
variable "admin_username"         {}
variable "admin_password"         { sensitive = true }
variable "sku_name"               { default = "B_Standard_B1ms" }
variable "storage_mb"             { default = 32768 }
variable "backup_retention_days"  { default = 7 }
