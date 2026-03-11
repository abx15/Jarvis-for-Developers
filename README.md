# AI Developer OS - Jarvis for Developers

A comprehensive AI-powered development platform that provides intelligent assistance for coding, debugging, deployment, and project management.

## 🚀 Features

- **AI Code Assistant**: Intelligent code completion and generation
- **Automated Bug Detection**: AI-powered bug identification and fixing
- **CI/CD Pipeline Generation**: Automated deployment pipeline creation
- **Multi-service Architecture**: Microservices-based scalable platform
- **Real-time Collaboration**: Live code sharing and collaboration
- **Voice Commands**: Voice-controlled development environment
- **Billing & Subscriptions**: Integrated payment system with Stripe
- **Docker Support**: Containerized deployment

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Python** >= 3.8
- **PostgreSQL** >= 13
- **Redis** >= 6.0
- **Docker** & **Docker Compose** (optional)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abx15/Jarvis-for-Developers.git
cd Jarvis-for-Developers
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install -r apps/api/requirements.txt
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Required: Database URL, Redis URL, API keys for AI services
```

### 4. Database Setup

```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run database migrations
cd apps/api
python init_db.py

# Seed database with initial data
python seed_db.py
```

## 🚀 Running the Application

### Option 1: Development Mode (Recommended)

```bash
# Start all services in development mode
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000 (Next.js)
- **API Gateway**: http://localhost:8000 (FastAPI)
- **Agent Service**: http://localhost:8001
- **Billing Service**: http://localhost:8002
- **Bug Service**: http://localhost:8003
- **DevOps Service**: http://localhost:8004
- **Repo Service**: http://localhost:8005

### Option 2: Individual Services

#### Frontend (Next.js)
```bash
cd apps/web
pnpm dev
# Access: http://localhost:3000
```

#### Backend API (FastAPI)
```bash
cd apps/api
python main.py
# Access: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Microservices
```bash
# Agent Service
cd services/agent-service
python main.py

# Billing Service
cd services/billing-service
python main.py

# Bug Service
cd services/bug-service
python main.py

# DevOps Service
cd services/devops-service
python main.py

# Repo Service
cd services/repo-service
python main.py
```

### Option 3: Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
AiAgent/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── api/                 # FastAPI backend gateway
├── services/                # Microservices
│   ├── agent-service/       # AI agent management
│   ├── billing-service/     # Payment processing
│   ├── bug-service/         # Bug detection & fixing
│   ├── devops-service/      # CI/CD pipeline generation
│   └── repo-service/       # Repository management
├── packages/                # Shared packages
│   ├── ai-agents/          # AI agent implementations
│   ├── analytics/          # Analytics utilities
│   ├── config/             # Configuration management
│   └── database/           # Database schemas
├── infrastructure/         # Infrastructure as code
│   ├── ci-cd/              # GitHub Actions workflows
│   ├── docker/             # Docker configurations
│   └── terraform/          # Terraform configurations
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── utils/                  # Shared utilities
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_developer_os

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Stripe Billing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# GitHub Integration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Database Configuration

The application uses PostgreSQL as the primary database. Make sure to:

1. Create a database named `ai_developer_os`
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations to create tables
4. Seed the database with initial data

## 🧪 Testing

```bash
# Run frontend tests
cd apps/web
pnpm test

# Run backend tests
cd apps/api
pytest

# Run all tests
pnpm test
```

## 📊 Monitoring & Logging

- **Frontend**: Integrated with React Query DevTools
- **Backend**: Structured logging with `structlog`
- **Services**: Prometheus metrics available
- **Error Tracking**: Sentry integration (configure with `SENTRY_DSN`)

## 🔐 Security

- JWT-based authentication
- API rate limiting
- CORS configuration
- Environment-based configuration
- Secure password hashing with bcrypt

## 💳 Billing & Subscriptions

The platform includes integrated billing with Stripe:

- **Free Tier**: Basic features with limitations
- **Pro Tier**: Advanced features and higher limits
- **Team Tier**: Collaboration features and priority support

Configure Stripe in your `.env` file with your test keys for development.

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   cp .env.example .env.production
   # Configure production values
   ```

2. **Database Migration**:
   ```bash
   cd apps/api
   alembic upgrade head
   ```

3. **Build & Deploy**:
   ```bash
   # Build all services
   pnpm build
   
   # Deploy with Docker
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f infrastructure/kubernetes/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Find and kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Verify database exists

3. **Python Dependencies**:
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r apps/api/requirements.txt
   ```

4. **Node Modules Issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

## 📞 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: Open an issue on GitHub
- **Discussions**: Join our GitHub Discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- Next.js team for the framework
- FastAPI for the backend framework
- Stripe for payment processing

---

**Built with ❤️ by the AI Developer OS Team**
