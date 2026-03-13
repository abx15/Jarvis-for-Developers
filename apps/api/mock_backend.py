"""
Mock Backend for AI Developer OS - No Database Required
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from datetime import datetime
import uuid

app = FastAPI(
    title="AI Developer OS API",
    description="Mock API for development without database",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Mock data storage
users = {
    "admin@aidev.os": {
        "id": 1,
        "email": "admin@aidev.os",
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "john@aidev.os": {
        "id": 2,
        "email": "john@aidev.os",
        "password": "john123",
        "name": "John Developer",
        "role": "developer",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "alice@aidev.os": {
        "id": 3,
        "email": "alice@aidev.os",
        "password": "alice123",
        "name": "Alice Designer",
        "role": "designer",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "bob@aidev.os": {
        "id": 4,
        "email": "bob@aidev.os",
        "password": "bob123",
        "name": "Bob Tester",
        "role": "tester",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "sarah@aidev.os": {
        "id": 5,
        "email": "sarah@aidev.os",
        "password": "sarah123",
        "name": "Sarah Manager",
        "role": "manager",
        "created_at": "2024-01-01T00:00:00Z"
    }
}

# Pydantic models
class LoginData(BaseModel):
    email: str
    password: str

class RegisterData(BaseModel):
    email: str
    password: str
    name: str

class User(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: str

class AuthResponse(BaseModel):
    user: User
    access_token: str
    refresh_token: str
    session_token: str
    token_type: str

# Helper functions
def create_token(user_email: str) -> str:
    """Create a simple token (in production, use JWT)"""
    # Replace @ with _at_ to avoid parsing issues
    safe_email = user_email.replace("@", "_at_")
    return f"token_{uuid.uuid4().hex}_{safe_email}"

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    return users.get(email)

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user"""
    user = get_user_by_email(email)
    if user and user["password"] == password:
        return user
    return None

def extract_email_from_token(token: str) -> Optional[str]:
    """Extract email from token"""
    try:
        if "token_" in token:
            # Extract email from token format: token_hash_email
            parts = token.split("_")
            if len(parts) >= 3:
                safe_email = parts[-1]
                # Convert back from safe_email to actual email
                return safe_email.replace("_at_", "@")
    except:
        pass
    return None

# Routes
@app.get("/")
async def root():
    return {"message": "AI Developer OS API - Mock Version", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/v1/auth/login")
async def login(data: LoginData):
    """Login endpoint"""
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create tokens
    access_token = create_token(data.email)
    refresh_token = create_token(f"refresh_{data.email}")
    session_token = create_token(f"session_{data.email}")
    
    return AuthResponse(
        user=User(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        ),
        access_token=access_token,
        refresh_token=refresh_token,
        session_token=session_token,
        token_type="bearer"
    )

@app.post("/api/v1/auth/register")
async def register(data: RegisterData):
    """Register endpoint"""
    if data.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = {
        "id": len(users) + 1,
        "email": data.email,
        "password": data.password,
        "name": data.name,
        "role": "developer",
        "created_at": datetime.now().isoformat()
    }
    
    users[data.email] = new_user
    
    # Create tokens
    access_token = create_token(data.email)
    refresh_token = create_token(f"refresh_{data.email}")
    session_token = create_token(f"session_{data.email}")
    
    return AuthResponse(
        user=User(
            id=new_user["id"],
            email=new_user["email"],
            name=new_user["name"],
            role=new_user["role"],
            created_at=new_user["created_at"]
        ),
        access_token=access_token,
        refresh_token=refresh_token,
        session_token=session_token,
        token_type="bearer"
    )

@app.get("/api/v1/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user"""
    token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Simple token validation (in production, use proper JWT validation)
    email = extract_email_from_token(token)
    
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"]
    )

@app.post("/api/v1/auth/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logged out successfully"}

@app.get("/api/v1/analytics/overview")
async def get_analytics_overview():
    """Get analytics overview"""
    return {
        "stats": {
            "ai_tasks_completed": 247,
            "bugs_fixed": 89,
            "code_generated": "12.5K",
            "team_members": 12
        },
        "chart_data": [
            {"day": "Mon", "tasks": 12, "bugs": 3, "users": 45},
            {"day": "Tue", "tasks": 19, "bugs": 5, "users": 52},
            {"day": "Wed", "tasks": 15, "bugs": 2, "users": 48},
            {"day": "Thu", "tasks": 25, "bugs": 8, "users": 61},
            {"day": "Fri", "tasks": 22, "bugs": 6, "users": 55},
            {"day": "Sat", "tasks": 18, "bugs": 4, "users": 43},
            {"day": "Sun", "tasks": 14, "bugs": 1, "users": 38}
        ]
    }

@app.post("/api/v1/agents/run")
async def run_agent(request: Dict[str, Any]):
    """Run AI agent"""
    return {
        "task_id": str(uuid.uuid4()),
        "status": "completed",
        "result": "AI agent completed the task successfully"
    }

@app.post("/api/v1/ai/scan-repo")
async def scan_repo(request: Dict[str, Any]):
    """Scan repository for bugs"""
    return {
        "scan_id": str(uuid.uuid4()),
        "bugs_found": 5,
        "issues": [
            {
                "id": 1,
                "title": "Memory leak detected",
                "severity": "high",
                "file": "src/main.py",
                "line": 42
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Developer OS Mock Backend")
    print("📊 Available endpoints:")
    print("  - POST /api/v1/auth/login")
    print("  - POST /api/v1/auth/register")
    print("  - GET /api/v1/auth/me")
    print("  - POST /api/v1/auth/logout")
    print("  - GET /api/v1/analytics/overview")
    print("  - POST /api/v1/agents/run")
    print("  - POST /api/v1/ai/scan-repo")
    print("🔑 Test users available:")
    for email, user in users.items():
        print(f"  - {email} ({user['password']})")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
