from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from models.user import User, Session, Account
from utils.security import (
    get_password_hash, 
    verify_password, 
    is_strong_password, 
    is_valid_email,
    generate_session_token,
    calculate_token_expiry
)
from utils.jwt import create_access_token, create_refresh_token, verify_token
from utils.logger import logger


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    async def register_user(
        self, 
        email: str, 
        password: str, 
        name: str
    ) -> Dict[str, Any]:
        """Register a new user"""
        # Validate input
        if not is_valid_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        if not is_strong_password(password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet security requirements"
            )
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        try:
            # Create new user
            hashed_password = get_password_hash(password)
            new_user = User(
                email=email,
                password_hash=hashed_password,
                name=name
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # Create session
            session_token = generate_session_token()
            expires_at = calculate_token_expiry()
            
            new_session = Session(
                user_id=new_user.id,
                token=session_token,
                expires_at=expires_at
            )
            
            self.db.add(new_session)
            self.db.commit()
            
            # Generate JWT tokens
            access_token = create_access_token(data={"sub": str(new_user.id)})
            refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
            
            logger.info(f"New user registered: {email}")
            
            return {
                "user": {
                    "id": new_user.id,
                    "email": new_user.email,
                    "name": new_user.name,
                    "avatar": new_user.avatar,
                    "created_at": new_user.created_at
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "session_token": session_token,
                "token_type": "bearer"
            }
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Database error during registration: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to database error"
            )
        except Exception as e:
            self.db.rollback()
            logger.error(f"Unexpected error during registration: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed"
            )

    async def authenticate_user(
        self, 
        email: str, 
        password: str
    ) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        # Find user by email
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        try:
            # Create new session
            session_token = generate_session_token()
            expires_at = calculate_token_expiry()
            
            new_session = Session(
                user_id=user.id,
                token=session_token,
                expires_at=expires_at
            )
            
            self.db.add(new_session)
            self.db.commit()
            
            # Generate JWT tokens
            access_token = create_access_token(data={"sub": str(user.id)})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            logger.info(f"User authenticated: {email}")
            
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "avatar": user.avatar,
                    "created_at": user.created_at
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "session_token": session_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during authentication: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed"
            )

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token"""
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Find user
        user = self.db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    async def logout_user(self, session_token: str) -> bool:
        """Logout user by invalidating session"""
        try:
            # Find and delete session
            session = self.db.query(Session).filter(
                Session.token == session_token,
                Session.is_active == True
            ).first()
            
            if session:
                session.is_active = False
                self.db.commit()
                logger.info(f"User logged out: session {session_token[:10]}...")
                return True
            
            return False
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during logout: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed"
            )

    async def get_current_user(self, user_id: int) -> Optional[User]:
        """Get current user by ID"""
        return self.db.query(User).filter(
            User.id == user_id,
            User.is_active == True
        ).first()

    async def update_user_profile(
        self, 
        user_id: int, 
        name: Optional[str] = None,
        avatar: Optional[str] = None
    ) -> User:
        """Update user profile"""
        user = await self.get_current_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        try:
            if name:
                user.name = name
            if avatar:
                user.avatar = avatar
            
            self.db.commit()
            self.db.refresh(user)
            
            logger.info(f"User profile updated: {user.email}")
            return user
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Profile update failed"
            )

    async def authenticate_user_by_id(self, user_id: int) -> Dict[str, Any]:
        """Authenticate user by ID and return tokens"""
        # Find user by ID
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        try:
            # Create new session
            session_token = generate_session_token()
            expires_at = calculate_token_expiry()
            
            new_session = Session(
                user_id=user.id,
                token=session_token,
                expires_at=expires_at
            )
            
            self.db.add(new_session)
            self.db.commit()
            
            # Generate JWT tokens
            access_token = create_access_token(data={"sub": str(user.id)})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            logger.info(f"User authenticated by ID: {user.email}")
            
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "avatar": user.avatar,
                    "created_at": user.created_at
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "session_token": session_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during authentication by ID: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed"
            )

    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions (utility function)"""
        try:
            expired_count = self.db.query(Session).filter(
                Session.expires_at < datetime.utcnow()
            ).delete()
            
            self.db.commit()
            logger.info(f"Cleaned up {expired_count} expired sessions")
            return expired_count
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error cleaning up sessions: {e}")
            return 0
