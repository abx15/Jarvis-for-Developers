from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import logging
from datetime import datetime
import httpx
import os
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jarvis API Gateway")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SERVICES = {
    "agent-service": os.getenv("AGENT_SERVICE_URL", "http://agent-service:8001"),
    "repo-service": os.getenv("REPO_SERVICE_URL", "http://repo-service:8002"),
    "bug-service": os.getenv("BUG_SERVICE_URL", "http://bug-service:8003"),
    "devops-service": os.getenv("DEVOPS_SERVICE_URL", "http://devops-service:8004"),
    "billing-service": os.getenv("BILLING_SERVICE_URL", "http://billing-service:8005"),
}

# Mock user data for authentication
MOCK_USERS = {
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
    }
}

class LoginData(BaseModel):
    email: str
    password: str

class RegisterData(BaseModel):
    email: str
    password: str
    name: str

def create_token(user_email: str) -> str:
    """Create a simple token"""
    import uuid
    return f"token_{uuid.uuid4().hex}_{user_email.replace('@', '_at_')}"

def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticate user"""
    user = MOCK_USERS.get(email)
    if user and user["password"] == password:
        return user
    return None

@app.get("/")
async def root():
    return {
        "message": "AI Developer OS API Gateway",
        "status": "running",
        "services": list(SERVICES.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    health_status = {}
    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                health_status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                health_status[service_name] = {
                    "status": "unreachable",
                    "error": str(e)
                }
    
    return {
        "status": "gateway_healthy",
        "services": health_status,
        "timestamp": datetime.now().isoformat()
    }

# Authentication endpoints
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
    
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "created_at": user["created_at"]
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "session_token": session_token,
        "token_type": "bearer"
    }

@app.post("/api/v1/auth/register")
async def register(data: RegisterData):
    """Register endpoint"""
    if data.email in MOCK_USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = {
        "id": len(MOCK_USERS) + 1,
        "email": data.email,
        "password": data.password,
        "name": data.name,
        "role": "developer",
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_USERS[data.email] = new_user
    
    # Create tokens
    access_token = create_token(data.email)
    refresh_token = create_token(f"refresh_{data.email}")
    session_token = create_token(f"session_{data.email}")
    
    return {
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "name": new_user["name"],
            "role": new_user["role"],
            "created_at": new_user["created_at"]
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "session_token": session_token,
        "token_type": "bearer"
    }

@app.get("/api/v1/auth/me")
async def get_current_user():
    """Get current user (mock)"""
    # Return a mock user for testing
    return {
        "id": 1,
        "email": "admin@aidev.os",
        "name": "Admin User",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00Z"
    }

@app.post("/api/v1/auth/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logged out successfully"}

# Analytics endpoints
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

# Agent Service Routes
@app.post("/api/v1/agents/orchestrate")
async def orchestrate_agent(task: str, context: Dict[str, Any]):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['agent-service']}/orchestrate",
                json={"task": task, "context": context}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Agent service unavailable: {str(e)}")

@app.post("/api/v1/agents/execute")
async def execute_agent(agent_type: str, prompt: str, context: Dict[str, Any]):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['agent-service']}/execute",
                json={"agent_type": agent_type, "prompt": prompt, "context": context}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Agent service unavailable: {str(e)}")

# Repository Service Routes
@app.post("/api/v1/repos/index")
async def index_repository(repo_url: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['repo-service']}/index",
                json={"repo_url": repo_url}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Repository service unavailable: {str(e)}")

@app.get("/api/v1/repos/search")
async def search_code(query: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICES['repo-service']}/search",
                params={"query": query}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Repository service unavailable: {str(e)}")

@app.get("/api/v1/repos")
async def get_repositories():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['repo-service']}/repositories")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Repository service unavailable: {str(e)}")

# Bug Service Routes
@app.post("/api/v1/bugs/scan")
async def scan_repository(repo_path: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['bug-service']}/scan",
                json={"repo_path": repo_path}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Bug service unavailable: {str(e)}")

@app.get("/api/v1/bugs")
async def get_bugs():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['bug-service']}/bugs")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Bug service unavailable: {str(e)}")

@app.post("/api/v1/bugs/fix")
async def fix_bug(bug_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['bug-service']}/fix",
                json={"bug_id": bug_id}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Bug service unavailable: {str(e)}")

# DevOps Service Routes
@app.post("/api/v1/devops/docker")
async def generate_dockerfile(project_context: Dict[str, Any]):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['devops-service']}/generate-docker",
                json=project_context
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"DevOps service unavailable: {str(e)}")

@app.post("/api/v1/devops/cicd")
async def generate_cicd(pipeline_type: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['devops-service']}/generate-cicd",
                json={"pipeline_type": pipeline_type}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"DevOps service unavailable: {str(e)}")

@app.get("/api/v1/devops/deployments")
async def get_deployments():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['devops-service']}/deployments")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"DevOps service unavailable: {str(e)}")

@app.post("/api/v1/devops/deploy")
async def deploy_application(environment: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['devops-service']}/deploy",
                json={"environment": environment}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"DevOps service unavailable: {str(e)}")

# Billing Service Routes
@app.get("/api/v1/billing/subscription/{user_id}")
async def get_subscription(user_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['billing-service']}/subscription/{user_id}")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Billing service unavailable: {str(e)}")

@app.post("/api/v1/billing/usage")
async def track_usage(user_id: int, tokens: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['billing-service']}/track-usage",
                json={"user_id": user_id, "tokens": tokens}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Billing service unavailable: {str(e)}")

@app.get("/api/v1/billing/usage/{user_id}")
async def get_usage(user_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['billing-service']}/usage/{user_id}")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Billing service unavailable: {str(e)}")

@app.get("/api/v1/billing/plans")
async def get_plans():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['billing-service']}/plans")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Billing service unavailable: {str(e)}")

@app.post("/api/v1/billing/subscribe")
async def create_subscription(user_id: int, plan_id: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICES['billing-service']}/subscribe",
                json={"user_id": user_id, "plan_id": plan_id}
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Billing service unavailable: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting API Gateway on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
