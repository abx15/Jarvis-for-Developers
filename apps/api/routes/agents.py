from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import os
import sys

# Inject packages path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../packages/ai-agents"))

from router.agent_router import AgentRouter
from tools.file_reader import FileReaderTool
from tools.file_writer import FileWriterTool
from tools.shell_executor import ShellTool
from tools.repo_search import RepoSearchTool

from database.connection import get_db
from sqlalchemy.orm import Session
from services.search_service import SearchService
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

class AgentRunRequest(BaseModel):
    task: str
    repo_id: Optional[int] = None

class AgentResponse(BaseModel):
    category: str
    response: str

def get_agent_router(db: Session = Depends(get_db)):
    # Initialize tools with repo root
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    
    tools = {
        "file_reader": FileReaderTool(repo_root),
        "file_writer": FileWriterTool(repo_root),
        "shell_executor": ShellTool(repo_root),
        "repo_search": RepoSearchTool(lambda: SearchService(db))
    }
    return AgentRouter(tools)

@router.post("/run", response_model=AgentResponse)
async def run_agent(
    request: AgentRunRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    router: AgentRouter = Depends(get_agent_router)
):
    """Route a task to the appropriate AI agent"""
    try:
        # Classify and run
        category = await router._classify_task(request.task)
        response = await router.route(request.task, request.repo_id)
        
        return {
            "category": category,
            "response": response
        }
    except Exception as e:
        logger.error(f"Agent execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code")
async def run_code_agent(request: AgentRunRequest, r: AgentRouter = Depends(get_agent_router)):
    res = await r.agents["code"].run(request.task, request.repo_id)
    return {"response": res}

@router.post("/debug")
async def run_debug_agent(request: AgentRunRequest, r: AgentRouter = Depends(get_agent_router)):
    res = await r.agents["debug"].run(request.task, request.repo_id)
    return {"response": res}

@router.post("/refactor")
async def run_refactor_agent(request: AgentRunRequest, r: AgentRouter = Depends(get_agent_router)):
    res = await r.agents["refactor"].run(request.task, request.repo_id)
    return {"response": res}

@router.post("/tests")
async def run_test_agent(request: AgentRunRequest, r: AgentRouter = Depends(get_agent_router)):
    res = await r.agents["test"].run(request.task, request.repo_id)
    return {"response": res}
