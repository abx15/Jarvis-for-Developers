import httpx
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from urllib.parse import urlencode
import secrets
import json

from config import settings
from models.user import User, Account
from services.auth_service import AuthService
from utils.security import get_password_hash
from utils.logger import logger


class OAuthService:
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)

    def get_github_oauth_url(self, state: str) -> str:
        """Generate GitHub OAuth authorization URL"""
        params = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
            "scope": "user:email user:profile repo",
            "state": state,
            "response_type": "code"
        }
        
        base_url = "https://github.com/login/oauth/authorize"
        return f"{base_url}?{urlencode(params)}"

    def generate_oauth_state(self) -> str:
        """Generate a secure OAuth state parameter"""
        return secrets.token_urlsafe(32)

    async def exchange_github_code(self, code: str, state: str) -> Dict[str, Any]:
        """Exchange GitHub authorization code for access token"""
        # Verify state (in production, you'd store this in cache/session)
        if not state:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OAuth state"
            )
        
        # Exchange code for access token
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.GITHUB_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://github.com/login/oauth/access_token",
                    data=token_data,
                    headers={"Accept": "application/json"}
                )
                response.raise_for_status()
                token_result = response.json()
                
                if "error" in token_result:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"GitHub OAuth error: {token_result.get('error_description', 'Unknown error')}"
                    )
                
                access_token = token_result.get("access_token")
                if not access_token:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to obtain access token from GitHub"
                    )
                
                # Get user information from GitHub
                user_info = await self.get_github_user_info(access_token)
                
                # Authenticate or create user
                return await self.authenticate_or_create_github_user(user_info, access_token, token_result)
                
            except httpx.HTTPError as e:
                logger.error(f"HTTP error during GitHub OAuth: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to communicate with GitHub"
                )
            except Exception as e:
                logger.error(f"Unexpected error during GitHub OAuth: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="GitHub authentication failed"
                )

    async def get_github_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from GitHub API"""
        async with httpx.AsyncClient() as client:
            try:
                # Get user profile
                user_response = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"token {access_token}"}
                )
                user_response.raise_for_status()
                user_data = user_response.json()
                
                # Get user emails (GitHub requires separate API call for emails)
                emails_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"token {access_token}"}
                )
                emails_response.raise_for_status()
                emails_data = emails_response.json()
                
                # Find primary email
                primary_email = None
                for email_info in emails_data:
                    if email_info.get("primary", False):
                        primary_email = email_info.get("email")
                        break
                
                if not primary_email:
                    primary_email = emails_data[0].get("email") if emails_data else user_data.get("email")
                
                return {
                    "id": user_data.get("id"),
                    "login": user_data.get("login"),
                    "name": user_data.get("name") or user_data.get("login"),
                    "email": primary_email,
                    "avatar_url": user_data.get("avatar_url"),
                    "bio": user_data.get("bio"),
                    "location": user_data.get("location"),
                    "company": user_data.get("company"),
                    "blog": user_data.get("blog")
                }
                
            except httpx.HTTPError as e:
                logger.error(f"Error fetching GitHub user info: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch user information from GitHub"
                )

    async def authenticate_or_create_github_user(
        self, 
        user_info: Dict[str, Any], 
        access_token: str,
        token_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Authenticate existing user or create new one from GitHub OAuth"""
        github_id = str(user_info["id"])
        email = user_info["email"]
        name = user_info["name"]
        avatar_url = user_info.get("avatar_url")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required from GitHub profile"
            )
        
        try:
            # Check if user already has GitHub account linked
            existing_account = self.db.query(Account).filter(
                Account.provider == "github",
                Account.provider_account_id == github_id
            ).first()
            
            if existing_account:
                # User has GitHub account linked, authenticate them
                user = self.db.query(User).filter(User.id == existing_account.user_id).first()
                if not user or not user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Account not found or inactive"
                    )
                
                # Update GitHub account access token
                existing_account.access_token = access_token
                existing_account.refresh_token = token_result.get("refresh_token")
                self.db.commit()
                
                logger.info(f"User authenticated via GitHub: {email}")
                return await self.auth_service.authenticate_user_by_id(user.id)
            
            # Check if user exists with same email
            existing_user = self.db.query(User).filter(User.email == email).first()
            
            if existing_user:
                # Link GitHub account to existing user
                new_account = Account(
                    user_id=existing_user.id,
                    provider="github",
                    provider_account_id=github_id,
                    access_token=access_token,
                    refresh_token=token_result.get("refresh_token")
                )
                
                self.db.add(new_account)
                self.db.commit()
                
                logger.info(f"GitHub account linked to existing user: {email}")
                return await self.auth_service.authenticate_user_by_id(existing_user.id)
            
            # Create new user
            # Generate a random password for OAuth users
            import secrets
            import string
            temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
            
            new_user = User(
                email=email,
                password_hash=get_password_hash(temp_password),
                name=name,
                avatar=avatar_url
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # Create GitHub account link
            new_account = Account(
                user_id=new_user.id,
                provider="github",
                provider_account_id=github_id,
                access_token=access_token,
                refresh_token=token_result.get("refresh_token")
            )
            
            self.db.add(new_account)
            self.db.commit()
            
            logger.info(f"New user created via GitHub OAuth: {email}")
            return await self.auth_service.authenticate_user_by_id(new_user.id)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during GitHub user authentication: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to authenticate with GitHub"
            )

    async def disconnect_github(self, user_id: int) -> bool:
        """Disconnect GitHub account from user"""
        try:
            account = self.db.query(Account).filter(
                Account.user_id == user_id,
                Account.provider == "github"
            ).first()
            
            if account:
                self.db.delete(account)
                self.db.commit()
                logger.info(f"GitHub account disconnected for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error disconnecting GitHub account: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to disconnect GitHub account"
            )

    async def get_connected_accounts(self, user_id: int) -> list:
        """Get all connected OAuth accounts for user"""
        try:
            accounts = self.db.query(Account).filter(
                Account.user_id == user_id,
                Account.is_active == True
            ).all()
            
            result = []
            for account in accounts:
                result.append({
                    "id": account.id,
                    "provider": account.provider,
                    "provider_account_id": account.provider_account_id,
                    "created_at": account.created_at
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching connected accounts: {e}")
            return []
