# GitHub Setup Guide for AI Developer OS

## 🚀 Repository Overview

**Repository**: [abx15/Jarvis-for-Developers](https://github.com/abx15/Jarvis-for-Developers)

**Current Branch**: `feature/authentication-system`

**Pull Request**: Create PR from `feature/authentication-system` to `main`

---

## 📋 What's Been Implemented

### 🔐 **Authentication System (Phase 2 Complete)**

#### Backend (FastAPI)
- ✅ User authentication with JWT tokens
- ✅ Secure password hashing with bcrypt
- ✅ GitHub OAuth 2.0 integration
- ✅ Session management
- ✅ Protected API routes
- ✅ Database models for users, sessions, repos, accounts
- ✅ Security utilities and JWT helpers

#### Frontend (Next.js)
- ✅ Beautiful login/register pages
- ✅ GitHub one-click authentication
- ✅ Protected dashboard with user profile
- ✅ React Context for auth state management
- ✅ Route protection middleware
- ✅ TypeScript API client with auto-refresh

#### Database
- ✅ Complete PostgreSQL schema
- ✅ Proper indexes and constraints
- ✅ User accounts and OAuth integrations
- ✅ Session and repository management

---

## 🔧 **Setup Instructions**

### 1. Clone the Repository
```bash
git clone https://github.com/abx15/Jarvis-for-Developers.git
cd Jarvis-for-Developers
```

### 2. Switch to Authentication Branch
```bash
git checkout feature/authentication-system
```

### 3. Backend Setup
```bash
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt  # or use poetry
poetry install

# Environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### Required Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_dev_os

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/github/callback

# CORS
ALLOWED_HOSTS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb ai_dev_os

# Run schema
psql -d ai_dev_os -f database/schema.sql

# Or run with connection string
psql "postgresql://username:password@localhost:5432/ai_dev_os" -f database/schema.sql
```

### 5. Frontend Setup
```bash
cd apps/web

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 6. Start Development Servers

#### Backend (FastAPI)
```bash
cd apps/api
python main.py
# Server runs on: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Frontend (Next.js)
```bash
cd apps/web
npm run dev
# Server runs on: http://localhost:3000
```

---

## 🔗 **GitHub OAuth Setup**

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Developer OS
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/api/v1/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Update Environment Variables
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## 🧪 **Testing the Authentication System**

### 1. Test Registration
- Navigate to `http://localhost:3000/register`
- Fill in the registration form
- Verify strong password requirements:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character

### 2. Test Login
- Navigate to `http://localhost:3000/login`
- Use registered credentials
- Verify successful login redirects to dashboard

### 3. Test GitHub OAuth
- Click "Continue with GitHub" on login/register pages
- Complete GitHub authorization
- Verify successful login and account creation

### 4. Test Protected Routes
- Try accessing `http://localhost:3000/dashboard` without authentication
- Should redirect to login page
- After login, should access dashboard successfully

---

## 📊 **API Endpoints**

### Authentication Routes
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/logout       # User logout
GET  /api/v1/auth/me          # Current user info
POST /api/v1/auth/refresh      # Refresh access token

# GitHub OAuth
GET  /api/v1/auth/github/login     # Get GitHub OAuth URL
POST /api/v1/auth/github/callback # Handle GitHub callback
DELETE /api/v1/auth/github/disconnect # Disconnect GitHub
GET  /api/v1/auth/accounts       # Get connected accounts
```

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🔒 **Security Features**

### Implemented Security Measures
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration and refresh
- ✅ OAuth state verification
- ✅ Input sanitization and validation
- ✅ CORS protection
- ✅ Route protection (client and server-side)
- ✅ Session management
- ✅ SQL injection prevention (SQLAlchemy ORM)

### Security Headers
```python
# FastAPI automatically includes:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
```

---

## 🏗️ **Project Structure**

```
AiAgent/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   └── config.py          # Configuration
│   └── web/                     # Next.js frontend
│       ├── app/               # App Router pages
│       ├── components/        # Reusable components
│       ├── contexts/          # React contexts
│       └── lib/               # Utilities and API client
├── database/
│   └── schema.sql            # Database schema
├── docs/                     # Documentation
└── infrastructure/           # DevOps configs
```

---

## 🚀 **Deployment Considerations**

### Production Environment Variables
```env
# Production Database
DATABASE_URL=postgresql://user:pass@prod-host:5432/ai_dev_os_prod

# Production Security
SECRET_KEY=your-production-secret-key-256-bits
ENVIRONMENT=production
DEBUG=false

# Production OAuth
GITHUB_CLIENT_ID=prod_github_client_id
GITHUB_CLIENT_SECRET=prod_github_client_secret
GITHUB_REDIRECT_URI=https://yourdomain.com/api/v1/auth/github/callback

# Production CORS
ALLOWED_HOSTS=["https://yourdomain.com"]
```

### Database Migration
```bash
# Use Alembic for production migrations
cd apps/api
alembic upgrade head
```

---

## 🐛 **Troubleshooting**

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL is running
pg_ctl status

# Test connection
psql "postgresql://username:password@localhost:5432/ai_dev_os"
```

#### 2. GitHub OAuth Redirect Error
- Verify callback URL matches GitHub OAuth app settings
- Check environment variables are set correctly
- Ensure backend is running on correct port

#### 3. Frontend Build Errors
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Issues
- Verify `ALLOWED_HOSTS` includes frontend URL
- Check backend CORS configuration

---

## 📝 **Next Steps (Phase 3)**

### Planned Features
- 🤖 AI Agent Integration
- 📁 Repository Management
- 📊 Analytics Dashboard
- 🎤 Voice Assistant
- 👁️ Vision Tools
- 🔄 Real-time Updates

### Development Guidelines
1. Follow the established authentication patterns
2. Use TypeScript for all new code
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation

---

## 🤝 **Contributing**

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📞 **Support**

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/abx15/Jarvis-for-Developers/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abx15/Jarvis-for-Developers/discussions)
- **Email**: support@aidevos.com

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Happy Coding! Welcome to the AI Developer OS!**
