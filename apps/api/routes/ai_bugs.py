from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.user import Repo
from models.bugs import Bug
from services.bug_detection_service import BugDetectionService
from services.auto_fix_service import AutoFixService
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

class ScanRequest(BaseModel):
    repo_id: int

class FixRequest(BaseModel):
    bug_id: int

@router.post("/scan-repo")
async def scan_repository(
    request: ScanRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan an entire repository for bugs"""
    repo = db.query(Repo).filter(Repo.id == request.repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    service = BugDetectionService(db)
    result = await service.scan_repository(request.repo_id)
    return result

@router.get("/bugs/{repo_id}")
async def list_bugs(
    repo_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all detected bugs for a repository"""
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    bugs = db.query(Bug).filter(Bug.repo_id == repo_id).order_by(Bug.created_at.desc()).all()
    return {"success": True, "bugs": bugs}

@router.get("/bug/{bug_id}")
async def get_bug_details(
    bug_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific bug and its fix if available"""
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    return {"success": True, "bug": bug, "fixes": bug.fixes}

@router.post("/auto-fix")
async def generate_auto_fix(
    request: FixRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an AI fix suggestion for a bug"""
    service = AutoFixService(db)
    fix_result = await service.generate_fix_for_bug(request.bug_id)
    
    if not fix_result:
        raise HTTPException(status_code=500, detail="Failed to generate AI fix")
        
    return {"success": True, "fix": fix_result}
