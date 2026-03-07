from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import sys
import json

# Path injection for ai-agents package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/ai-agents")))

from planner.task_planner import TaskPlanner
from router.agent_router import AgentRouter
from tools.file_reader import FileReaderTool
from tools.file_writer import FileWriterTool
from tools.folder_creator import FolderCreatorTool
from tools.repo_search import RepoSearchTool

from database.connection import get_db
from sqlalchemy.orm import Session
from services.search_service import SearchService
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

# Schema
class AutocodeRequest(BaseModel):
    prompt: str
    repo_id: Optional[int] = None

class PlanStep(BaseModel):
    id: int
    action: str
    path: str
    description: str
    expected_content_summary: Optional[str] = None

class PlanResponse(BaseModel):
    plan: List[PlanStep]

# Dependencies
def get_planner():
    return TaskPlanner()

def get_coder(db: Session = Depends(get_db)):
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    tools = {
        "file_reader": FileReaderTool(repo_root),
        "file_writer": FileWriterTool(repo_root),
        "folder_creator": FolderCreatorTool(repo_root),
        "repo_search": RepoSearchTool(lambda: SearchService(db))
    }
    return AgentRouter(tools) # Reusing AgentRouter as the coder for now

# Endpoints
@router.post("/plan", response_model=PlanResponse)
async def generate_coding_plan(
    request: AutocodeRequest,
    planner: TaskPlanner = Depends(get_planner),
    db: Session = Depends(get_db)
):
    """Generate a step-by-step coding plan for a user prompt"""
    try:
        # Search for context if repo_id is provided
        context = ""
        if request.repo_id:
            search_service = SearchService(db)
            search_results = await search_service.search_repository(request.repo_id, request.prompt, limit=5)
            if search_results and "results" in search_results:
                context = json.dumps(search_results["results"])

        plan = await planner.plan_task(request.prompt, context)
        return plan
    except Exception as e:
        logger.error(f"Autocode planning error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Planning failed: {str(e)}")

@router.post("/execute")
async def execute_coding_step(
    step: PlanStep,
    repo_id: Optional[int] = None,
    current_user = Depends(get_current_user),
    coder: AgentRouter = Depends(get_coder)
):
    """Execute a single coding step (generate content)"""
    try:
        if step.action == "create_folder":
            result = coder.tools["folder_creator"].run(step.path)
            return {"status": "success", "result": result}
        
        # Use CodeAgent to generate content for file actions
        prompt = f"Executing step '{step.description}' for path '{step.path}'. Expected content: {step.expected_content_summary}"
        
        # We tell the agent to only return the code block for this specific file
        # We might need a more specialized 'Coder' but AgentRouter.code can work
        response = await coder.agents["code"].run(prompt, repo_id)
        
        return {
            "status": "success",
            "path": step.path,
            "generated_code": response
        }
    except Exception as e:
        logger.error(f"Execution error for step {step.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply")
async def apply_coding_changes(
    changes: List[Dict[str, str]], # List of {path, content}
    current_user = Depends(get_current_user),
    coder: AgentRouter = Depends(get_coder)
):
    """Physically apply the generated code to the repository"""
    results = []
    for change in changes:
        path = change.get("path")
        content = change.get("content")
        if path and content:
            # We strip markdown code blocks if the agent wrapped it
            if "```" in content:
                # Basic markdown extraction logic
                lines = content.splitlines()
                extracted = []
                in_block = False
                for line in lines:
                    if line.startswith("```"):
                        in_block = not in_block
                        continue
                    if in_block:
                        extracted.append(line)
                content = "\n".join(extracted) if extracted else content

            res = coder.tools["file_writer"].run(path, content)
            results.append({"path": path, "result": res})
            
    return {"results": results}
