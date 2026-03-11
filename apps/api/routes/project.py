from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from database.connection import get_db
from models.user import User
from services.org_service import ProjectService
from middleware.rbac import require_role, check_project_access
from routes.auth import get_current_user

router = APIRouter()

class ProjectCreate(BaseModel):
    org_id: int
    name: str
    description: str = None
    repo_id: int = None

class PermissionGrant(BaseModel):
    user_id: int
    permission: str = "read"

@router.post("/create", response_model=Dict[str, Any])
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    # Check if user has admin/owner role in the org
    member_info: Any = Depends(lambda p=Depends(lambda proj: proj.org_id): require_role(["owner", "admin"])(p)),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    new_project = await service.create_project(
        project.org_id, 
        project.name, 
        project.description, 
        project.repo_id
    )
    return {
        "id": new_project.id,
        "org_id": new_project.organization_id,
        "name": new_project.name,
        "description": new_project.description,
        "created_at": new_project.created_at.isoformat()
    }

@router.get("/list", response_model=List[Dict[str, Any]])
async def list_org_projects(
    org_id: int,
    current_user: User = Depends(get_current_user),
    member_info: Any = Depends(require_role(["owner", "admin", "developer", "viewer"])),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    projects = await service.get_org_projects(org_id)
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "repo_id": p.repo_id,
            "created_at": p.created_at.isoformat()
        }
        for p in projects
    ]

@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project_details(
    project_id: int,
    project: Any = Depends(check_project_access),
    db: Session = Depends(get_db)
):
    return {
        "id": project.id,
        "org_id": project.organization_id,
        "name": project.name,
        "description": project.description,
        "repo_id": project.repo_id,
        "created_at": project.created_at.isoformat()
    }

@router.post("/{project_id}/grant", response_model=Dict[str, Any])
async def grant_permission(
    project_id: int,
    grant: PermissionGrant,
    current_user: User = Depends(get_current_user),
    # Only org owners/admins can grant project permissions
    # We need to find the org_id from project_id
    db: Session = Depends(get_db)
):
    from models.organization import Project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check org role
    await require_role(["owner", "admin"])(project.organization_id, current_user, db)
    
    service = ProjectService(db)
    await service.grant_project_permission(project_id, grant.user_id, grant.permission)
    return {"status": "success"}
