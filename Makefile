.PHONY: help install dev db-up db-down db-reset db-migrate db-seed test lint clean

help:
	@echo "Opraxius C2 - Makefile Commands"
	@echo ""
	@echo "  make install       Install all dependencies"
	@echo "  make dev           Start development environment"
	@echo "  make db-up         Start database services (PostgreSQL + Redis)"
	@echo "  make db-down       Stop database services"
	@echo "  make db-reset      Reset database (drop + recreate)"
	@echo "  make db-migrate    Run database migrations"
	@echo "  make db-seed       Seed database with sample data"
	@echo "  make test          Run all tests"
	@echo "  make lint          Run linters"
	@echo "  make clean         Clean build artifacts"

install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development environment..."
	@make db-up
	@echo "Waiting for services to be ready..."
	@sleep 5
	npm run dev

db-up:
	@echo "Starting PostgreSQL + Redis..."
	docker-compose up -d postgres redis

db-down:
	@echo "Stopping database services..."
	docker-compose down

db-reset:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres redis
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@make db-migrate

db-migrate:
	@echo "Running database migrations..."
	cd packages/database && npm run db:push

db-seed:
	@echo "Seeding database..."
	cd packages/database && npm run db:seed

test:
	@echo "Running tests..."
	npm run test

lint:
	@echo "Running linters..."
	npm run lint

clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/.next apps/*/dist packages/*/dist
	rm -rf .turbo
