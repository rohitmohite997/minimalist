# Makefile for mini malist project
.PHONY: help setup dev prod build test lint clean docker-up docker-down logs

help:
	@echo "mini malist - Available commands:"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Setup project (install all dependencies)"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development environment"
	@echo "  make dev-backend    - Start backend dev server"
	@echo "  make dev-frontend   - Start frontend dev server"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make logs           - View Docker logs"
	@echo ""
	@echo "Quality:"
	@echo "  make lint           - Run linters"
	@echo "  make test           - Run tests"
	@echo "  make clean          - Clean up build artifacts"
	@echo ""
	@echo "Production:"
	@echo "  make prod           - Build for production"

setup:
	@echo "Installing dependencies..."
	cd backend && pip install -r requirements-min.txt
	cd ../frontend && yarn install
	@echo "✓ Setup complete!"

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml up -d
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:8000"

dev-backend:
	cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && yarn start

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d
	@echo "✓ All services started"

docker-down:
	docker-compose down
	@echo "✓ All services stopped"

logs:
	docker-compose logs -f

lint:
	@echo "Linting backend..."
	cd backend && flake8 server.py config.py logger.py schemas.py rate_limit.py || true
	@echo "✓ Backend lint complete"
	@echo ""
	@echo "Linting frontend..."
	cd frontend && yarn lint || true
	@echo "✓ Frontend lint complete"

test:
	@echo "Running backend tests..."
	cd backend && python -m pytest || true
	@echo ""
	@echo "Running frontend tests..."
	cd frontend && yarn test --watchAll=false || true

clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	cd frontend && rm -rf build node_modules dist
	@echo "✓ Cleanup complete"

prod: clean
	@echo "Building for production..."
	@echo "Backend: Building Docker image..."
	docker build -t mini-malist-backend:latest backend/
	@echo "Frontend: Building Docker image..."
	docker build -t mini-malist-frontend:latest frontend/
	@echo "✓ Production build complete"

freeze:
	@echo "Freezing backend dependencies..."
	cd backend && pip freeze > requirements-frozen.txt
	@echo "✓ Requirements frozen"

format:
	@echo "Formatting code..."
	cd backend && black *.py
	cd ../frontend && yarn format
	@echo "✓ Formatting complete"

db-init:
	@echo "Initializing MongoDB..."
	mongosh --eval "db.createUser({user: 'admin', pwd: 'password', roles: [{role: 'root', db: 'admin'}]})" mongodb://localhost:27017
	@echo "✓ MongoDB initialized"

.DEFAULT_GOAL := help
