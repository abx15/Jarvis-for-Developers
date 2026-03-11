from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from database.connection import get_db
from models.user import User
from services.org_service import OrganizationService
from middleware.rbac import require_role
from routes.auth import get_current_user

router = APIRouter()

class OrgCreate(BaseModel):
    name: str
    description: str = None

class OrgInvite(BaseModel):
    email: str
    role: str = "developer"

class MemberUpdate(BaseModel):
    role: str

@router.post("/create", response_model=Dict[str, Any])
async def create_organization(
    org: OrgCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    new_org = await service.create_organization(org.name, current_user.id, org.description)
    return {
        "id": new_org.id,
        "name": new_org.name,
        "description": new_org.description,
        "created_at": new_org.created_at.isoformat()
    }

@router.get("/list", response_model=List[Dict[str, Any]])
async def list_user_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    return await service.get_user_organizations(current_user.id)

@router.post("/{org_id}/invite", response_model=Dict[str, Any])
async def invite_user(
    org_id: int,
    invite: OrgInvite,
    current_user: User = Depends(get_current_user),
    member_info: Any = Depends(require_role(["owner", "admin"])), # org_id comes from path
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    try:
        token = await service.invite_user(org_id, invite.email, invite.role)
        return {"status": "success", "invite_token": token, "message": f"Invitation created for {invite.email}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{org_id}/members", response_model=List[Dict[str, Any]])
async def get_org_members(
    org_id: int,
    current_user: User = Depends(get_current_user),
    member_info: Any = Depends(require_role(["owner", "admin", "developer", "viewer"])),
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    return await service.get_org_members(org_id)

@router.delete("/{org_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    org_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    member_info: Any = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    try:
        await service.remove_member(org_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{org_id}/members/{user_id}/role", response_model=Dict[str, Any])
async def update_member_role(
    org_id: int,
    user_id: int,
    update: MemberUpdate,
    current_user: User = Depends(get_current_user),
    member_info: Any = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    service = OrganizationService(db)
    try:
        await service.update_member_role(org_id, user_id, update.role)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
