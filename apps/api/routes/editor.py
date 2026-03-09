from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from routes.auth import get_current_user
from services.ai_agents import AgentOrchestrator
from services.search_service import SearchService
from utils.logger import logger

router = APIRouter()

class EditorAIRequest(BaseModel):
    file_path: str
    content: str
    selection: str = ""
    language: str = "javascript"
    prompt: str = ""

@router.post("/suggest")
async def get_editor_suggestions(
    request: EditorAIRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI suggestions for code completion"""
    try:
        orchestrator = AgentOrchestrator(db)
        # Simplified: in a real system, this would call a specialized completion agent
        result = await orchestrator.execute_task(
            f"Suggest next lines of code for this file: {request.file_path}. Content: {request.content}",
            user_id=current_user.id
        )
        return {"success": True, "suggestion": result.get("output", "")}
    except Exception as e:
        logger.error(f"Editor suggestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")

@router.post("/refactor")
async def refactor_code(
    request: EditorAIRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI refactoring for selected code"""
    try:
        orchestrator = AgentOrchestrator(db)
        query = f"Refactor this {request.language} code in {request.file_path}: {request.selection}. "
        if request.prompt:
            query += f"Instructions: {request.prompt}"
        
        result = await orchestrator.execute_task(query, user_id=current_user.id)
        return {"success": True, "refactored_code": result.get("output", "")}
    except Exception as e:
        logger.error(f"Editor refactor error: {e}")
        raise HTTPException(status_code=500, detail="Refactoring failed")

@router.post("/explain")
async def explain_code(
    request: EditorAIRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI explanation for code snippets"""
    try:
        # Use SearchService to get context if it's a file path
        searcher = SearchService(db)
        # Mocking explanation for now, integrating with agents is preferred
        orchestrator = AgentOrchestrator(db)
        result = await orchestrator.execute_task(
            f"Explain this code snippet from {request.file_path}: {request.selection or request.content}",
            user_id=current_user.id
        )
        return {"success": True, "explanation": result.get("output", "")}
    except Exception as e:
        logger.error(f"Editor explanation error: {e}")
        raise HTTPException(status_code=500, detail="Explanation failed")
