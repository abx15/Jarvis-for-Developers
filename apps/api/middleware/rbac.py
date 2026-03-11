from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database.connection import get_db
from models.user import User
from models.organization import OrganizationMember, Project, ProjectPermission
from routes.auth import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, org_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
        # Check if user is a member of the organization with an appropriate role
        member = db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this organization"
            )

        if member.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{member.role}' does not have permission to perform this action"
            )

        return member

async def check_project_access(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a user has access to a specific project.
    Owners and Admins have access to all projects in their org.
    Others need explicit project permissions.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check org membership first
    member = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == project.organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="No access to this organization's projects")

    # Owners and Admins can access all projects
    if member.role in ["owner", "admin"]:
        return project

    # Check for explicit project permissions
    permission = db.query(ProjectPermission).filter(
        ProjectPermission.project_id == project_id,
        ProjectPermission.user_id == current_user.id
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="No permission to access this project")

    return project

# Dependency factor for roles
def require_role(roles: List[str]):
    return RoleChecker(roles)
