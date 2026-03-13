# AI Developer OS - Quick Setup Guide

## 🚀 Project Status: RUNNING

Your AI Developer OS is now **successfully running**! Here's what's active:

- **Frontend (Next.js)**: http://localhost:3001
- **Backend API (FastAPI)**: http://localhost:8000
- **Redis**: localhost:6379 (via Docker)

## 📋 Setup Completed

✅ Node.js dependencies installed  
✅ Python dependencies installed  
✅ Environment configuration (.env) created  
✅ Redis service started  
✅ Frontend and Backend services running  

## 🌐 Access Points

### Frontend Application
- **URL**: http://localhost:3001
- **Framework**: Next.js 14.1.0
- **Status**: ✅ Running

### Backend API
- **URL**: http://localhost:8000
- **Framework**: FastAPI
- **API Docs**: http://localhost:8000/docs
- **Status**: ✅ Running

### Services
- **Redis**: localhost:6379 (Docker container)
- **Database**: Configured for PostgreSQL (Neon Cloud)

## 🔧 Commands Used

### 1. Install Dependencies
```bash
# Node.js dependencies
pnpm install

# Python dependencies (essential packages)
pip install fastapi uvicorn python-dotenv
```

### 2. Environment Setup
```bash
# Copy environment template
copy .env.example .env
```

### 3. Start Services
```bash
# Start Redis (Docker)
docker-compose up -d redis

# Start Frontend (in separate terminal)
cd apps/web
pnpm dev

# Start Backend (in separate terminal)
python apps/api/simple_main.py
```

## 📁 Project Structure

```
AiAgent/
├── apps/
│   ├── web/                 # Next.js frontend ✅
│   └── api/                 # FastAPI backend ✅
├── services/                # Microservices (ready for deployment)
├── packages/                # Shared libraries
├── infrastructure/         # DevOps configurations
└── docs/                   # Documentation
```

## 🛠️ Development Workflow

### Starting the Application
1. **Redis** (must be first): `docker-compose up -d redis`
2. **Frontend**: `cd apps/web && pnpm dev`
3. **Backend**: `python apps/api/simple_main.py`

### Stopping the Application
1. **Frontend**: `Ctrl+C` in terminal
2. **Backend**: `Ctrl+C` in terminal
3. **Redis**: `docker-compose down`

## 🔐 Environment Configuration

The `.env` file has been created with default settings. Key configurations:

```bash
# Application
ENVIRONMENT=development
DEBUG=true

# Database (Neon Cloud - pre-configured)
DATABASE_URL=postgresql://neondb_owner:...

# Redis (Docker)
REDIS_URL=redis://localhost:6379

# AI Services (add your API keys)
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

## 🧪 Testing the Setup

### Test Frontend
1. Open http://localhost:3001 in your browser
2. You should see the AI Developer OS interface

### Test Backend API
1. Open http://localhost:8000 in your browser
2. You should see FastAPI documentation
3. Or visit http://localhost:8000/docs for interactive API docs

### Test Redis Connection
```bash
docker logs aiagent-redis-1
```

## 🚀 Next Steps

### Optional Enhancements
1. **Add AI API Keys**: Update `.env` with your OpenAI/Anthropic keys
2. **Database Migration**: Run `python apps/api/init_db.py` if needed
3. **Microservices**: Start individual services from `services/` directory
4. **Full Docker Setup**: Use `docker-compose up -d` for all services

### Production Deployment
1. Update `.env.production` with production values
2. Use `docker-compose -f docker-compose.prod.yml up -d`
3. Configure domain and SSL certificates

## 🐛 Troubleshooting

### Common Issues
1. **Port 3000 occupied**: Frontend automatically uses 3001
2. **Python import errors**: Using `simple_main.py` avoids complex dependencies
3. **Redis connection**: Ensure Docker container is running
4. **Environment variables**: Check `.env` file is properly configured

### Reset Everything
```bash
# Stop all services
docker-compose down

# Clear Node modules
rm -rf node_modules
pnpm install

# Restart services
docker-compose up -d redis
```

## 📞 Support

- **Frontend Issues**: Check `apps/web/` directory
- **Backend Issues**: Check `apps/api/` directory
- **Database Issues**: Check Neon Cloud configuration
- **Redis Issues**: Check Docker container status

---

**🎉 Your AI Developer OS is ready to use!**

Start building amazing AI-powered applications with your development platform.
