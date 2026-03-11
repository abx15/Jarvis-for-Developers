from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database.connection import get_db
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter(prefix="/api/agents", tags=["agents"])

class AgentRunRequest(BaseModel):
    task: str
    repo_id: Optional[int] = None

class AgentResponse(BaseModel):
    category: str
    response: str

@router.get("/")
async def get_agents():
    """Get available AI agents"""
    return {
        "agents": [
            {"id": 1, "name": "Code Analyzer", "type": "analysis"},
            {"id": 2, "name": "Bug Fixer", "type": "bug_fix"},
            {"id": 3, "name": "Code Generator", "type": "generation"}
        ]
    }

@router.post("/run")
async def run_agent(request: AgentRunRequest, current_user: dict = Depends(get_current_user)):
    """Run an AI agent"""
    logger.info(f"Running agent task: {request.task}")
    return {
        "status": "success",
        "message": "Agent task completed successfully",
        "task": request.task,
        "result": "Task processed successfully"
    }

@router.post("/code")
async def run_code_agent(request: AgentRunRequest):
    return {"response": "Code agent processed task successfully"}

@router.post("/debug")
async def run_debug_agent(request: AgentRunRequest):
    return {"response": "Debug agent processed task successfully"}

@router.post("/refactor")
async def run_refactor_agent(request: AgentRunRequest):
    return {"response": "Refactor agent processed task successfully"}

@router.post("/tests")
async def run_test_agent(request: AgentRunRequest):
    return {"response": "Test agent processed task successfully"}
