variable "name"     { description = "Nome do Resource Group" }
variable "location" { description = "Região Azure" }
variable "tags"     { description = "Tags do recurso"; type = map(string) }
