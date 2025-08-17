# Makefile para TappyOne CRM

.PHONY: help build run dev clean docker-build docker-run docker-stop test

# Variáveis
DOCKER_COMPOSE = docker-compose
GO_CMD = go
PNPM_CMD = pnpm

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Desenvolvimento local
dev: ## Inicia ambiente de desenvolvimento
	$(DOCKER_COMPOSE) up -d postgres redis
	@echo "Aguardando banco de dados inicializar..."
	@sleep 5
	cd backend && $(GO_CMD) run cmd/server/main.go &
	$(PNPM_CMD) dev

build-backend: ## Compila o backend Go
	cd backend && $(GO_CMD) build -o bin/server cmd/server/main.go

build-frontend: ## Compila o frontend Next.js
	$(PNPM_CMD) build

build: build-backend build-frontend ## Compila backend e frontend

run-backend: ## Executa o backend
	cd backend && ./bin/server

run-frontend: ## Executa o frontend
	$(PNPM_CMD) start

# Docker
docker-build: ## Constrói as imagens Docker
	$(DOCKER_COMPOSE) build

docker-run: ## Inicia todos os serviços com Docker
	$(DOCKER_COMPOSE) up -d

docker-stop: ## Para todos os serviços Docker
	$(DOCKER_COMPOSE) down

docker-logs: ## Mostra logs dos containers
	$(DOCKER_COMPOSE) logs -f

docker-clean: ## Remove containers, volumes e imagens
	$(DOCKER_COMPOSE) down -v --rmi all

# Banco de dados
db-up: ## Inicia apenas o banco de dados
	$(DOCKER_COMPOSE) up -d postgres redis

db-migrate: ## Executa migrações do banco
	cd backend && $(GO_CMD) run cmd/migrate/main.go

db-seed: ## Popula o banco com dados iniciais
	$(PNPM_CMD) db:seed

db-studio: ## Abre o Prisma Studio
	$(PNPM_CMD) db:studio

# Dependências
install-backend: ## Instala dependências do backend
	cd backend && $(GO_CMD) mod download

install-frontend: ## Instala dependências do frontend
	$(PNPM_CMD) install

install: install-backend install-frontend ## Instala todas as dependências

# Limpeza
clean: ## Limpa arquivos de build
	cd backend && rm -rf bin/
	rm -rf .next/
	rm -rf node_modules/.cache/

# Testes
test-backend: ## Executa testes do backend
	cd backend && $(GO_CMD) test ./...

test-frontend: ## Executa testes do frontend
	$(PNPM_CMD) test

test: test-backend test-frontend ## Executa todos os testes

# Produção
prod-build: ## Build para produção
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml build

prod-run: ## Executa em produção
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d

# Utilitários
format-backend: ## Formata código Go
	cd backend && $(GO_CMD) fmt ./...

format-frontend: ## Formata código TypeScript/JavaScript
	$(PNPM_CMD) format

lint-backend: ## Executa linter no backend
	cd backend && golangci-lint run

lint-frontend: ## Executa linter no frontend
	$(PNPM_CMD) lint

format: format-backend format-frontend ## Formata todo o código
lint: lint-backend lint-frontend ## Executa linters
