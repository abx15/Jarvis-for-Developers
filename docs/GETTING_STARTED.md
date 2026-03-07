# Getting Started with AI Developer OS

## Overview

AI Developer OS is a production-grade monorepo that provides intelligent development assistance with AI agents, voice control, vision understanding, and advanced analytics.

## Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Python** 3.11+ with **Poetry**
- **Docker** and **Docker Compose**
- **PostgreSQL** with **pgvector** extension
- **Redis** (for caching)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-dev-os

# Install root dependencies
pnpm install

# Install all workspace dependencies
pnpm install --recursive
```

### 2. Environment Setup

Create environment files:

```bash
# Root environment
cp .env.example .env

# Frontend environment
cp apps/web/.env.example apps/web/.env.local

# Backend environment
cp apps/api/.env.example apps/api/.env
```

Configure your environment variables:

```env
# .env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_dev_os
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker run --name ai-dev-os-postgres \
  -e POSTGRES_DB=ai_dev_os \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16

# Run database migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 4. Development Servers

Start all services with Docker Compose:

```bash
cd infrastructure/docker
docker-compose up -d
```

Or start services individually:

```bash
# Terminal 1: Start frontend
cd apps/web
pnpm dev

# Terminal 2: Start backend
cd apps/api
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Start repo analyzer
cd services/repo-analyzer
pip install -r requirements.txt
python main.py

# Terminal 4: Start voice engine
cd services/voice-engine
pip install -r requirements.txt
python main.py

# Terminal 5: Start vision engine
cd services/vision-engine
pip install -r requirements.txt
python main.py

# Terminal 6: Start embedding engine
cd services/embedding-engine
pip install -r requirements.txt
python main.py
```

### 5. Access the Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Repo Analyzer**: http://localhost:8001/docs
- **Voice Engine**: http://localhost:8002/docs
- **Vision Engine**: http://localhost:8003/docs
- **Embedding Engine**: http://localhost:8004/docs

## Development Workflow

### Code Structure

```
ai-dev-os/
├── apps/                    # Main applications
│   ├── web/                # Next.js frontend
│   └── api/                # FastAPI backend
├── packages/               # Shared packages
│   ├── ui/                 # UI components
│   ├── database/           # Database schema & client
│   ├── ai-agents/          # AI agent logic
│   ├── analytics/          # Analytics logic
│   └── config/             # Shared configurations
├── services/               # Microservices
│   ├── repo-analyzer/      # Repository analysis
│   ├── voice-engine/       # Voice processing
│   ├── vision-engine/      # Computer vision
│   └── embedding-engine/   # Vector embeddings
└── infrastructure/         # DevOps & deployment
    ├── docker/            # Docker configurations
    ├── terraform/         # Infrastructure as code
    └── ci-cd/             # CI/CD pipelines
```

### Common Commands

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Clean all build artifacts
pnpm clean

# Format code
pnpm format
```

### Adding New Features

1. **Frontend Components**: Add to `packages/ui` and import in `apps/web`
2. **Backend Services**: Add to `apps/api` or create new microservice in `services/`
3. **Database Changes**: Update schema in `packages/database` and run migrations
4. **AI Features**: Extend agents in `packages/ai-agents`

## Testing

### Running Tests

```bash
# Frontend tests
cd apps/web
pnpm test

# Backend tests
cd apps/api
poetry run pytest

# Service tests
cd services/<service-name>
python -m pytest
```

### Test Coverage

```bash
# Generate coverage report
pnpm test:coverage
```

## Deployment

### Docker Deployment

```bash
# Build and deploy with Docker Compose
cd infrastructure/docker
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Deployment

```bash
# Deploy to staging
cd infrastructure/terraform
terraform workspace select staging
terraform apply -var-file="staging.tfvars"

# Deploy to production
terraform workspace select production
terraform apply -var-file="production.tfvars"
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8000-8004 are available
2. **Database connection**: Verify PostgreSQL is running and pgvector is enabled
3. **Missing dependencies**: Run `pnpm install --recursive` to install all workspace dependencies
4. **Environment variables**: Check that all required environment variables are set

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
LOG_LEVEL=debug
```

### Health Checks

All services expose a `/health` endpoint for monitoring:

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
# ... etc
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

- **Documentation**: Check the `docs/` directory for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join our community discussions for questions and ideas

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
