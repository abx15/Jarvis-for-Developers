from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from database.connection import get_db
from services.auth_service import AuthService
from services.oauth_service import OAuthService
from utils.jwt import verify_token, extract_user_id_from_token
from utils.logger import logger

# Create router
router = APIRouter()

# Security scheme
security = HTTPBearer()


# Pydantic models for request/response
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar: Optional[str] = None
    created_at: str


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    session_token: str
    token_type: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class GitHubOAuthCallback(BaseModel):
    code: str
    state: str


# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    token = credentials.credentials
    user_id = extract_user_id_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(int(user_id))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


# Routes
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        auth_service = AuthService(db)
        result = await auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in register: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return tokens"""
    try:
        auth_service = AuthService(db)
        result = await auth_service.authenticate_user(
            email=user_data.email,
            password=user_data.password
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        auth_service = AuthService(db)
        result = await auth_service.refresh_access_token(token_data.refresh_token)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in refresh: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout user by invalidating session"""
    try:
        # For now, we'll use the access token as session identifier
        # In a real implementation, you'd want to track this better
        session_token = credentials.credentials
        auth_service = AuthService(db)
        success = await auth_service.logout_user(session_token)
        
        if success:
            return {"message": "Successfully logged out"}
        else:
            return {"message": "Session not found"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        created_at=current_user.created_at.isoformat()
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    try:
        auth_service = AuthService(db)
        updated_user = await auth_service.update_user_profile(
            user_id=current_user.id,
            name=user_update.name,
            avatar=user_update.avatar
        )
        
        return UserResponse(
            id=updated_user.id,
            email=updated_user.email,
            name=updated_user.name,
            avatar=updated_user.avatar,
            created_at=updated_user.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in update profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )


@router.post("/verify-token")
async def verify_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Verify if token is valid"""
    try:
        token = credentials.credentials
        payload = verify_token(token)
        
        if payload:
            return {"valid": True, "user_id": payload.get("sub")}
        else:
            return {"valid": False}
            
    except Exception as e:
        logger.error(f"Error in token verification: {e}")
        return {"valid": False}


# GitHub OAuth Routes
@router.get("/github/login")
async def github_login():
    """Get GitHub OAuth authorization URL"""
    try:
        oauth_service = OAuthService(None)  # We don't need DB for this
        state = oauth_service.generate_oauth_state()
        auth_url = oauth_service.get_github_oauth_url(state)
        
        return {
            "authorization_url": auth_url,
            "state": state
        }
        
    except Exception as e:
        logger.error(f"Error generating GitHub OAuth URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate GitHub OAuth URL"
        )


@router.post("/github/callback", response_model=AuthResponse)
async def github_callback(
    callback_data: GitHubOAuthCallback,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback"""
    try:
        oauth_service = OAuthService(db)
        result = await oauth_service.exchange_github_code(
            code=callback_data.code,
            state=callback_data.state
        )
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in GitHub callback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub authentication failed"
        )


@router.delete("/github/disconnect")
async def disconnect_github(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect GitHub account from user"""
    try:
        oauth_service = OAuthService(db)
        success = await oauth_service.disconnect_github(current_user.id)
        
        if success:
            return {"message": "GitHub account disconnected successfully"}
        else:
            return {"message": "No GitHub account connected"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disconnecting GitHub: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disconnect GitHub account"
        )


@router.get("/accounts")
async def get_connected_accounts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connected OAuth accounts"""
    try:
        oauth_service = OAuthService(db)
        accounts = await oauth_service.get_connected_accounts(current_user.id)
        return {"accounts": accounts}
        
    except Exception as e:
        logger.error(f"Error fetching connected accounts: {e}")
        return {"accounts": []}
