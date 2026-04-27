.PHONY: setup install env db-up db-down prisma dev users

API_DIR := apps/api
API_ENV := $(API_DIR)/.env
API_ENV_EXAMPLE := $(API_DIR)/.env.example

setup: install env db-up prisma
	@echo "Setup finished. Lance ensuite: pnpm dev"

install:
	pnpm install

env:
	@if [ ! -f "$(API_ENV)" ]; then \
		cp "$(API_ENV_EXAMPLE)" "$(API_ENV)"; \
		echo "$(API_ENV) cree depuis $(API_ENV_EXAMPLE)"; \
	else \
		echo "$(API_ENV) existe deja"; \
	fi

db-up:
	cd $(API_DIR) && docker compose up -d

db-down:
	cd $(API_DIR) && docker compose down

prisma:
	pnpm --filter @workspace/api exec prisma generate
	pnpm --filter @workspace/api exec prisma migrate deploy
	pnpm --filter @workspace/api exec prisma db seed

dev:
	pnpm dev

users:
	@echo "Utilisateur seed disponible:"
	@echo "- email: admin@orus.com"
	@echo "- mot de passe: admin"
