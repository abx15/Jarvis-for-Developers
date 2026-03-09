from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.agents import AgentTask
from agents.orchestrator import Orchestrator
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

class AgentTaskRequest(BaseModel):
    task: str
    repo_id: int

@router.post("/task")
async def run_agent_task(
    request: AgentTaskRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Route a complex task through the Multi-Agent Orchestrator"""
    try:
        orchestrator = Orchestrator()
        result = await orchestrator.run_complex_task(request.task, request.repo_id)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error"))
        return result
    except Exception as e:
        logger.error(f"Agent task error: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute agent task")

@router.get("/history")
async def get_agent_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve history of agent tasks"""
    tasks = db.query(AgentTask).order_by(AgentTask.created_at.desc()).limit(50).all()
    return {"success": True, "history": tasks}
