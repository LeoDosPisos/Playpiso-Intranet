# Makefile — atalhos de operação da infra Azure (ambiente dev)
#
# Padrão de uso:
#   make help           — lista todos os targets
#   make status         — mostra estado atual dos recursos
#   make pause          — pausa PostgreSQL (economia ~$12/mês)
#   make resume         — retoma PostgreSQL
#
# Documentação completa: docs/infra/azure/infra-azure-pausar-destruir.md

RG           := playpiso-proposta-dev-rg
DB_SERVER    := playpiso-proposta-dev-db
ACR_NAME     := playpisopropostadevacr
ACR_SERVER   := $(ACR_NAME).azurecr.io
PPTX_IMAGE   := $(ACR_SERVER)/pptx-generator:latest
API_IMAGE    := $(ACR_SERVER)/proposta-api:latest
TF_DIR       := infra/environments/dev

# Cores no terminal (só pra mensagens humanas)
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

.DEFAULT_GOAL := help
.PHONY: help status pause resume deploy build-push destroy

help: ## Lista todos os targets disponíveis
	@echo "Atalhos de operação da infra Azure — ambiente dev"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-14s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "Detalhes: docs/infra/azure/infra-azure-pausar-destruir.md"

status: ## Mostra estado atual dos recursos (Postgres, Container Apps, ACR)
	@echo "$(YELLOW)=== PostgreSQL Flexible Server ===$(NC)"
	@az postgres flexible-server show --name $(DB_SERVER) --resource-group $(RG) \
		--query "{name:name, state:state, sku:sku.name, version:version}" -o table 2>/dev/null \
		|| echo "  (não encontrado — talvez destruído ou RG diferente)"
	@echo ""
	@echo "$(YELLOW)=== Container Apps ===$(NC)"
	@az containerapp list -g $(RG) \
		--query "[].{name:name, runningStatus:properties.runningStatus, fqdn:properties.configuration.ingress.fqdn}" \
		-o table 2>/dev/null || echo "  (nenhum encontrado)"
	@echo ""
	@echo "$(YELLOW)=== ACR images ===$(NC)"
	@az acr repository list --name $(ACR_NAME) -o table 2>/dev/null \
		|| echo "  (ACR vazio ou não encontrado)"

pause: ## Pausa PostgreSQL (Container Apps já escalam a zero) — economia ~$12/mês
	@echo "$(YELLOW)Pausando PostgreSQL $(DB_SERVER)...$(NC)"
	az postgres flexible-server stop --name $(DB_SERVER) --resource-group $(RG)
	@echo "$(GREEN)✓ Pausa concluída.$(NC) Container Apps continuam disponíveis mas só sobem com tráfego."
	@echo "  Para retomar: make resume"

resume: ## Retoma PostgreSQL pausado (leva 1-2 min)
	@echo "$(YELLOW)Retomando PostgreSQL $(DB_SERVER) (pode levar 1-2 min)...$(NC)"
	az postgres flexible-server start --name $(DB_SERVER) --resource-group $(RG)
	@echo "$(GREEN)✓ Retomado.$(NC) Container Apps voltam a responder normalmente com tráfego."

deploy: ## Aplica mudanças do Terraform (re-deploys após primeiro setup)
	@echo "$(YELLOW)Rodando terraform plan + apply em $(TF_DIR)...$(NC)"
	cd $(TF_DIR) && terraform plan -out=tfplan && terraform apply tfplan
	@echo "$(GREEN)✓ Apply concluído.$(NC) Confirme outputs com: cd $(TF_DIR) && terraform output"

build-push: ## Build e push das imagens Docker pro ACR (útil após destroy/recriar ou no primeiro setup)
	@echo "$(YELLOW)Autenticando Docker no ACR $(ACR_NAME)...$(NC)"
	az acr login --name $(ACR_NAME)
	@echo "$(YELLOW)Building & pushing pptx-generator...$(NC)"
	docker build -t $(PPTX_IMAGE) Backend/services/pptx-generator-service
	docker push $(PPTX_IMAGE)
	@echo "$(YELLOW)Building & pushing proposta-api...$(NC)"
	docker build -t $(API_IMAGE) Backend
	docker push $(API_IMAGE)
	@echo "$(GREEN)✓ Imagens publicadas.$(NC) Container Apps puxam :latest automaticamente em rolling update."

destroy: ## ATENÇÃO: destrói TODOS os 17 recursos (requer confirmação 'DESTRUIR')
	@echo "$(RED)⚠  ATENÇÃO: isso vai destruir TODOS os recursos do RG $(RG).$(NC)"
	@echo ""
	@echo "Implicações:"
	@echo "  • PostgreSQL apagado — dados perdidos (soft-delete 7 dias)"
	@echo "  • Key Vault apagado — soft-delete 90 dias; recriar com mesmo nome pode falhar"
	@echo "  • URL do Static Web App vai MUDAR — Redirect URI e GitHub Secret precisam refazer"
	@echo "  • ACR fica vazio — 'make build-push' será necessário antes de Container Apps subirem"
	@echo "  • Service Principal e cofre KeePassXC sobrevivem"
	@echo ""
	@printf "Digite $(RED)DESTRUIR$(NC) para confirmar: "
	@read confirm && [ "$$confirm" = "DESTRUIR" ] || (echo "Abortado." && exit 1)
	cd $(TF_DIR) && terraform destroy
	@echo "$(GREEN)✓ Recursos destruídos.$(NC) Para recriar do zero, veja docs/infra/azure/infra-azure-pausar-destruir.md"
