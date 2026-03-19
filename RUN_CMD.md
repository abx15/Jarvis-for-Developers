# Running the AI Developer OS

This guide will help you get the AI Developer OS up and running on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Docker** - [Download Docker](https://www.docker.com/products/docker-desktop)
- **Docker Compose** - Usually included with Docker Desktop
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Node.js 18+** (for local development) - [Download Node.js](https://nodejs.org/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ai-developer-os.git
cd ai-developer-os
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_In3fFgkR5KTa@ep-wandering-night-a4zi29rn-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Redis Configuration
REDIS_URL=redis://redis:6379

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Configuration
JWT_SECRET=supersecret

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 3. Build and Start Services

```bash
# Build all Docker containers
docker compose build

# Start all services
docker compose up
```

### 4. Access the Application

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:8000
- **API Health Check**: http://localhost:8000/health

## Services Overview

The AI Developer OS consists of the following services:

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3001 | Next.js web application |
| API Gateway | 8000 | Main API entry point |
| Agent Service | 8001 | AI agent orchestration |
| Repository Service | 8002 | Code repository management |
| Bug Service | 8003 | Bug detection and tracking |
| DevOps Service | 8004 | CI/CD and deployment tools |
| Billing Service | 8005 | Subscription management |
| Redis | 6379 | Caching and session storage |

## Default Login Credentials

The system comes with pre-configured test users:

| Email | Password | Role |
|-------|----------|------|
| admin@aidev.os | admin123 | Admin |
| john@aidev.os | john123 | Developer |
| alice@aidev.os | alice123 | Designer |
| bob@aidev.os | bob123 | Tester |
| sarah@aidev.os | sarah123 | Manager |

## Development Workflow

### Local Development (Without Docker)

If you prefer to run services locally for development:

```bash
# Install dependencies
pnpm install

# Start database and Redis
docker compose up redis -d

# Run database migrations
python scripts/seed_data.py

# Start backend services (in separate terminals)
cd apps/api
python -m uvicorn gateway:app --reload --host 0.0.0.0 --port 8000

cd services/agent-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

cd services/repo-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8002

cd services/bug-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8003

cd services/devops-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8004

cd services/billing-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8005

# Start frontend
cd apps/web
pnpm dev
```

### Database Management

#### Seed Database with Test Data

```bash
python scripts/seed_data.py
```

#### Run Database Migrations

```bash
# Using Alembic
alembic upgrade head

# Or run schema directly
psql $DATABASE_URL -f database/schema.sql
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts

If you encounter port conflicts, you can change the ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3002:3001"  # Change to 3002
```

#### 2. Database Connection Issues

Ensure your `.env` file has the correct database URL:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### 3. Redis Connection Issues

Make sure Redis is running:

```bash
docker compose up redis -d
```

#### 4. Frontend Build Issues

Clear the cache and rebuild:

```bash
# Clear Docker cache
docker system prune -a

# Rebuild frontend
docker compose build frontend
```

#### 5. Backend Service Not Starting

Check the logs for specific services:

```bash
docker compose logs api-gateway
docker compose logs agent-service
```

### Health Checks

Verify all services are running:

```bash
# Check API Gateway
curl http://localhost:8000/health

# Check individual services
curl http://localhost:8001/health  # Agent Service
curl http://localhost:8002/health  # Repository Service
curl http://localhost:8003/health  # Bug Service
curl http://localhost:8004/health  # DevOps Service
curl http://localhost:8005/health  # Billing Service
```

### Logs

View logs for all services:

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs -f api-gateway
docker compose logs -f frontend
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Services      │
│   (Next.js)     │────│   (FastAPI)     │────│   (FastAPI)     │
│   Port: 3001    │    │   Port: 8000    │    │   Ports: 8001+  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   Port: 6379    │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   (Neon.tech)   │
                       └─────────────────┘
```

## API Documentation

Once the services are running, you can access the API documentation:

- **API Gateway**: http://localhost:8000/docs
- **Agent Service**: http://localhost:8001/docs
- **Repository Service**: http://localhost:8002/docs
- **Bug Service**: http://localhost:8003/docs
- **DevOps Service**: http://localhost:8004/docs
- **Billing Service**: http://localhost:8005/docs

## Production Deployment

For production deployment, refer to the following:

1. **Environment Variables**: Update all production values in `.env`
2. **SSL/TLS**: Configure SSL certificates
3. **Database**: Use production database credentials
4. **Monitoring**: Set up logging and monitoring
5. **Scaling**: Configure Docker Swarm or Kubernetes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the service logs
3. Check the GitHub Issues
4. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 🚀**
