from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from agents.code_agent import CodeAgent
from agents.debug_agent import DebugAgent
from agents.devops_agent import DevOpsAgent
from agents.doc_agent import DocumentationAgent
from utils.logger import logger

router = APIRouter()

# Initialize agents
code_agent = CodeAgent()
debug_agent = DebugAgent()
devops_agent = DevOpsAgent()
doc_agent = DocumentationAgent()


@router.post("/code/generate")
async def generate_code(
    prompt: str,
    language: str = "python",
    db: Session = Depends(get_db)
):
    """Generate code using AI agent"""
    try:
        result = await code_agent.generate_code(prompt, language)
        return {"success": True, "code": result}
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/code/review")
async def review_code(
    code: str,
    language: str = "python",
    db: Session = Depends(get_db)
):
    """Review code using AI agent"""
    try:
        result = await code_agent.review_code(code, language)
        return {"success": True, "review": result}
    except Exception as e:
        logger.error(f"Code review error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/debug/analyze")
async def analyze_error(
    error_message: str,
    code_context: str = "",
    db: Session = Depends(get_db)
):
    """Analyze and suggest fixes for errors"""
    try:
        result = await debug_agent.analyze_error(error_message, code_context)
        return {"success": True, "analysis": result}
    except Exception as e:
        logger.error(f"Debug analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/devops/deploy")
async def deploy_application(
    config: dict,
    db: Session = Depends(get_db)
):
    """Deploy application using DevOps agent"""
    try:
        result = await devops_agent.deploy(config)
        return {"success": True, "deployment": result}
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/docs/generate")
async def generate_documentation(
    code: str,
    doc_type: str = "api",
    db: Session = Depends(get_db)
):
    """Generate documentation for code"""
    try:
        result = await doc_agent.generate_docs(code, doc_type)
        return {"success": True, "documentation": result}
    except Exception as e:
        logger.error(f"Documentation generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
