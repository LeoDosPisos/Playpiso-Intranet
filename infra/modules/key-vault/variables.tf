variable "resource_group_name" {}
variable "location"            {}
variable "prefix"              {}
variable "tags"                { type = map(string) }

variable "secrets" {
  description = "Map de nome → valor dos secrets a criar no Key Vault"
  type        = map(string)
  sensitive   = true
  default     = {}
}

