from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
import secrets
from datetime import datetime, timedelta

from models.organization import Organization, OrganizationMember, Project, ProjectPermission
from models.user import User
from utils.logger import logger

class OrganizationService:
    def __init__(self, db: Session):
        self.db = db

    async def create_organization(self, name: str, owner_id: int, description: str = None) -> Organization:
        """Create a new organization and add the owner as a member."""
        try:
            org = Organization(name=name, owner_id=owner_id, description=description)
            self.db.add(org)
            self.db.flush()  # Get org ID

            # Add owner as member with 'owner' role
            member = OrganizationMember(
                organization_id=org.id,
                user_id=owner_id,
                role="owner"
            )
            self.db.add(member)
            self.db.commit()
            return org
        except Exception as e:
            logger.error(f"Error creating organization: {str(e)}")
            self.db.rollback()
            raise

    async def invite_user(self, org_id: int, user_email: str, role: str = "developer") -> str:
        """
        Generate an invite token for a user.
        In a real app, this would send an email. For now, we return the token.
        """
        # Check if user exists
        user = self.db.query(User).filter(User.email == user_email).first()
        if not user:
            raise ValueError(f"User with email {user_email} not found")

        # Check if already a member
        existing = self.db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user.id
        ).first()
        if existing:
            raise ValueError("User is already a member of this organization")

        # Create a simple invite token (in-memory or short-lived table would be better)
        # For this prototype, we'll just use a mock token system
        invite_token = secrets.token_urlsafe(32)
        # In a real system, you'd store this in an 'invites' table
        return invite_token

    async def add_member(self, org_id: int, user_id: int, role: str = "developer") -> OrganizationMember:
        """Add a user as a member of an organization."""
        try:
            member = OrganizationMember(
                organization_id=org_id,
                user_id=user_id,
                role=role
            )
            self.db.add(member)
            self.db.commit()
            return member
        except Exception as e:
            logger.error(f"Error adding member to org {org_id}: {str(e)}")
            self.db.rollback()
            raise

    async def get_org_members(self, org_id: int) -> List[Dict[str, Any]]:
        """Get all members of an organization with their user details."""
        members = self.db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id
        ).all()
        
        return [
            {
                "id": m.id,
                "user_id": m.user_id,
                "name": m.user.name,
                "email": m.user.email,
                "role": m.role,
                "joined_at": m.joined_at.isoformat()
            }
            for m in members
        ]

    async def remove_member(self, org_id: int, user_id: int):
        """Remove a member from an organization."""
        member = self.db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user_id
        ).first()
        
        if member:
            if member.role == "owner":
                raise ValueError("Cannot remove the organization owner")
            self.db.delete(member)
            self.db.commit()

    async def update_member_role(self, org_id: int, user_id: int, new_role: str):
        """Update a member's role."""
        member = self.db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user_id
        ).first()
        
        if member:
            if member.role == "owner":
                raise ValueError("Cannot change the role of the organization owner")
            member.role = new_role
            self.db.commit()

    async def get_user_organizations(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all organizations a user belongs to."""
        memberships = self.db.query(OrganizationMember).filter(
            OrganizationMember.user_id == user_id
        ).all()
        
        return [
            {
                "id": m.organization.id,
                "name": m.organization.name,
                "description": m.organization.description,
                "role": m.role,
                "created_at": m.organization.created_at.isoformat()
            }
            for m in memberships
        ]

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    async def create_project(self, org_id: int, name: str, description: str = None, repo_id: int = None) -> Project:
        """Create a new project within an organization."""
        try:
            project = Project(
                organization_id=org_id,
                name=name,
                description=description,
                repo_id=repo_id
            )
            self.db.add(project)
            self.db.commit()
            return project
        except Exception as e:
            logger.error(f"Error creating project: {str(e)}")
            self.db.rollback()
            raise

    async def get_org_projects(self, org_id: int) -> List[Project]:
        """Get all projects in an organization."""
        return self.db.query(Project).filter(Project.organization_id == org_id).all()

    async def grant_project_permission(self, project_id: int, user_id: int, permission: str = "read"):
        """Grant a user permission to a specific project."""
        existing = self.db.query(ProjectPermission).filter(
            ProjectPermission.project_id == project_id,
            ProjectPermission.user_id == user_id
        ).first()
        
        if existing:
            existing.permission_type = permission
        else:
            new_perm = ProjectPermission(
                project_id=project_id,
                user_id=user_id,
                permission_type=permission
            )
            self.db.add(new_perm)
        self.db.commit()
